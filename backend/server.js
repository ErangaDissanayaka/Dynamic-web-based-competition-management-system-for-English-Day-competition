import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import crypto from "node:crypto";
import {
  calculateWeightedTotal,
  getCategoryGradeBand,
  getMaxSlotsForCategory,
  isDramaCategory,
  isGradeAllowedForCategory,
} from "./category-rules.js";
import { toSafeUser } from "./data.js";
import { connectDatabase } from "./database.js";
import {
  sendEventCreatedNotifications,
  sendRegistrationDecisionNotification,
  sendRegistrationReviewNotification,
} from "./mailer.js";
import {
  EventModel,
  SchoolModel,
  ScoreModel,
  StudentModel,
  UserModel,
} from "./models.js";
import { seedDatabase } from "./seed.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);
const APPROVAL_REQUIRED_ROLES = new Set([
  "admin",
  "school",
  "student",
  "judge",
]);
const REVIEW_DECISIONS = new Set(["approve", "reject"]);
const REVIEW_SECRET =
  process.env.ADMIN_REVIEW_SECRET || "development-review-secret";

const nextId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const normalizeCategory = (category) => String(category || "").trim();

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const getApprovalStatus = (user) => user?.approvalStatus || "approved";
const normalizeComparableText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getAppBaseUrl = (req) => {
  const configuredBase = process.env.APP_BASE_URL;
  if (configuredBase) {
    return trimTrailingSlash(configuredBase);
  }

  const origin = req.get("origin");
  if (origin) {
    return trimTrailingSlash(origin);
  }

  const referer = req.get("referer");
  if (referer) {
    try {
      return trimTrailingSlash(new URL(referer).origin);
    } catch {}
  }

  return trimTrailingSlash(configuredBase || `http://localhost:${PORT}`);
};

const getServerBaseUrl = (req) => {
  if (process.env.SERVER_PUBLIC_URL) {
    return trimTrailingSlash(process.env.SERVER_PUBLIC_URL);
  }

  const forwardedProto = req.get("x-forwarded-proto");
  const forwardedHost = req.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return trimTrailingSlash(`${forwardedProto}://${forwardedHost}`);
  }

  const host = req.get("host");
  if (host) {
    return trimTrailingSlash(`${req.protocol}://${host}`);
  }

  return `http://localhost:${PORT}`;
};

const buildReviewToken = (userId, decision) =>
  crypto
    .createHmac("sha256", REVIEW_SECRET)
    .update(`${userId}:${decision}`)
    .digest("hex");

const isValidReviewToken = (userId, decision, token) => {
  if (typeof token !== "string" || !REVIEW_DECISIONS.has(decision)) {
    return false;
  }

  const expected = buildReviewToken(userId, decision);
  if (expected.length !== token.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
};

const renderReviewResultPage = ({
  title,
  message,
  signInUrl,
  tone = "info",
}) => {
  const accent =
    tone === "success" ? "#166534" : tone === "error" ? "#b91c1c" : "#1d4ed8";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#172554;">
        <div style="max-width:640px;margin:48px auto;padding:32px;background:white;border-radius:20px;box-shadow:0 20px 40px rgba(15,23,42,0.08);">
          <div style="width:56px;height:56px;border-radius:16px;background:${accent};opacity:0.9;"></div>
          <h1 style="margin:20px 0 12px;font-size:28px;">${title}</h1>
          <p style="margin:0 0 24px;line-height:1.7;color:#475569;">${message}</p>
          <a href="${signInUrl}" style="display:inline-block;background:#172554;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600;">Open Admin Sign In</a>
        </div>
      </body>
    </html>
  `;
};

async function listAdminNotificationRecipients() {
  const recipients = new Map();

  const addRecipient = (email, name) => {
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail) {
      return;
    }

    recipients.set(normalizedEmail, {
      email: normalizedEmail,
      name: name || "Admin",
    });
  };

  addRecipient(process.env.ADMIN_EMAIL, "Admin");
  addRecipient(process.env.SMTP_USER, "Admin");

  const admins = await UserModel.find({
    role: "admin",
    $or: [
      { approvalStatus: "approved" },
      { approvalStatus: { $exists: false } },
    ],
  })
    .select("email name -_id")
    .lean();

  for (const admin of admins) {
    addRecipient(admin.email, admin.name);
  }

  return [...recipients.values()];
}

async function approveSchoolRegistration(schoolId) {
  const school = await SchoolModel.findOneAndUpdate(
    { id: schoolId },
    { approved: true, reviewStatus: "approved" },
    { new: true },
  )
    .select("-_id")
    .lean();

  if (!school) {
    return null;
  }

  await UserModel.updateMany(
    { role: "school", schoolId },
    { $set: { approvalStatus: "approved" } },
  );

  return school;
}

async function rejectSchoolRegistration(schoolId) {
  const school = await SchoolModel.findOneAndUpdate(
    { id: schoolId },
    { approved: false, reviewStatus: "rejected" },
    { new: true },
  )
    .select("-_id")
    .lean();

  if (!school) {
    return null;
  }

  await UserModel.updateMany(
    { role: "school", schoolId },
    { $set: { approvalStatus: "rejected" } },
  );

  return school;
}

async function notifySchoolUsersOfDecision(schoolId, decision, signInUrl) {
  const schoolUsers = await UserModel.find({ role: "school", schoolId })
    .select("-password -_id")
    .lean();

  for (const schoolUser of schoolUsers) {
    try {
      const notification = await sendRegistrationDecisionNotification({
        registration: schoolUser,
        decision,
        signInUrl,
      });

      if (notification.status !== "sent") {
        // eslint-disable-next-line no-console
        console.warn(
          "School decision email was not fully delivered",
          notification,
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to send school decision notification", error);
    }
  }
}

async function applyRegistrationDecision(userId, decision, options = {}) {
  const signInUrl =
    options.signInUrl ||
    `${process.env.APP_BASE_URL || `http://localhost:${PORT}`}/signin`;
  const user = await UserModel.findOne({ id: userId }).select("-_id").lean();

  if (!user) {
    return {
      httpStatus: 404,
      title: "Registration Not Found",
      message: "This review link no longer matches a registration record.",
      tone: "error",
    };
  }

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  const approvalStatus = getApprovalStatus(user);

  if (approvalStatus === "approved") {
    return {
      httpStatus: 200,
      title: "Already Approved",
      message: `${roleLabel} account for ${user.name} has already been approved.`,
      tone: "info",
    };
  }

  if (approvalStatus === "rejected") {
    return {
      httpStatus: 200,
      title: "Already Rejected",
      message: `${roleLabel} account for ${user.name} has already been rejected.`,
      tone: "info",
    };
  }

  if (decision === "approve") {
    if (user.role === "school" && user.schoolId) {
      await approveSchoolRegistration(user.schoolId);
    } else {
      await UserModel.updateOne(
        { id: user.id },
        { $set: { approvalStatus: "approved" } },
      );
    }

    void sendRegistrationDecisionNotification({
      registration: user,
      decision: "approve",
      signInUrl,
    })
      .then((notification) => {
        if (notification.status !== "sent") {
          // eslint-disable-next-line no-console
          console.warn("Approval notification was not fully delivered", {
            userId: user.id,
            notification,
          });
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Failed to send approval notification", error);
      });

    return {
      httpStatus: 200,
      title: "Registration Approved",
      message: `${roleLabel} account for ${user.name} is now approved and can sign in.`,
      tone: "success",
    };
  }

  if (user.role === "school" && user.schoolId) {
    await rejectSchoolRegistration(user.schoolId);
  } else {
    await UserModel.updateOne(
      { id: user.id },
      { $set: { approvalStatus: "rejected" } },
    );
  }

  void sendRegistrationDecisionNotification({
    registration: user,
    decision: "reject",
    signInUrl,
  })
    .then((notification) => {
      if (notification.status !== "sent") {
        // eslint-disable-next-line no-console
        console.warn("Rejection notification was not fully delivered", {
          userId: user.id,
          notification,
        });
      }
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send rejection notification", error);
    });

  return {
    httpStatus: 200,
    title: "Registration Rejected",
    message: `${roleLabel} account for ${user.name} has been rejected.`,
    tone: "error",
  };
}

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "English Day Competition backend is running.",
    health: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.json({
    ok: true,
    service: "English Day Competition System",
    dbState: states[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    const { email, password, role } = req.body ?? {};

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password and role are required." });
    }

    let user = await UserModel.findOne({ email: String(email).toLowerCase() })
      .select("-_id")
      .lean();

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.role !== role) {
      return res
        .status(403)
        .json({ message: "Selected role does not match this account." });
    }

    const approvalStatus = getApprovalStatus(user);
    if (approvalStatus === "pending") {
      return res.status(403).json({
        message: "Your registration is pending admin approval.",
      });
    }

    if (approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Your registration was rejected. Contact the administrator.",
      });
    }

    if (user.role === "school") {
      const schoolId = String(user.schoolId || "").trim();
      let linkedSchool = schoolId
        ? await SchoolModel.findOne({ id: schoolId })
            .select("id name shortName reviewStatus -_id")
            .lean()
        : null;

      if (!linkedSchool) {
        const accountName = normalizeComparableText(user.name);
        if (accountName) {
          const availableSchools = await SchoolModel.find({
            reviewStatus: { $ne: "rejected" },
          })
            .select("id name shortName reviewStatus -_id")
            .lean();

          linkedSchool =
            availableSchools.find((school) => {
              const schoolName = normalizeComparableText(school.name);
              const schoolShortName = normalizeComparableText(school.shortName);
              return (
                schoolName === accountName || schoolShortName === accountName
              );
            }) || null;
        }
      }

      if (!linkedSchool) {
        return res.status(403).json({
          message:
            "Your account is approved, but it is not linked to a registered school profile yet. Ask an admin to relink this school account.",
        });
      }

      if (linkedSchool.reviewStatus === "pending") {
        return res.status(403).json({
          message: "Your school registration is pending admin approval.",
        });
      }

      if (linkedSchool.reviewStatus === "rejected") {
        return res.status(403).json({
          message:
            "Your school registration was rejected. Contact the administrator.",
        });
      }

      if (user.schoolId !== linkedSchool.id) {
        await UserModel.updateOne(
          { id: user.id },
          { $set: { schoolId: linkedSchool.id } },
        );
        user = { ...user, schoolId: linkedSchool.id };
      }
    }

    return res.json({
      message: "Login successful",
      user: toSafeUser(user),
      token: `dev-token-${user.id}`,
    });
  }),
);

app.post(
  "/api/auth/register",
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      password,
      role,
      schoolId: requestedSchoolId,
      schoolName,
      schoolShortName,
      judgeCategory,
    } = req.body ?? {};

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password and role are required." });
    }

    const normalizedEmail = String(email).toLowerCase();
    const existing = await UserModel.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ message: "Email already exists." });
    }

    let resolvedSchoolId;
    let resolvedName = typeof name === "string" ? name.trim() : "";
    let relatedSchoolName;
    let relatedSchoolShortName;
    if (role === "school") {
      if (!schoolName || !schoolShortName) {
        return res.status(400).json({
          message: "School name and short name are required for school role.",
        });
      }

      resolvedName =
        String(schoolName).trim() || String(schoolShortName).trim();

      const newSchool = await SchoolModel.create({
        id: nextId("school"),
        name: schoolName,
        shortName: schoolShortName,
        logo: schoolShortName,
        color: "#475569",
        approved: false,
        reviewStatus: "pending",
      });
      resolvedSchoolId = newSchool.id;
      relatedSchoolName = newSchool.name;
      relatedSchoolShortName = newSchool.shortName;
    }

    if (role === "student") {
      if (!requestedSchoolId) {
        return res.status(400).json({
          message: "Students must select a school.",
        });
      }

      const school = await SchoolModel.findOne({
        id: String(requestedSchoolId),
      })
        .select("id name shortName")
        .lean();

      if (!school) {
        return res.status(400).json({
          message: "Select a valid registered school.",
        });
      }

      resolvedSchoolId = String(requestedSchoolId);
      relatedSchoolName = school.name;
      relatedSchoolShortName = school.shortName;
    }

    if (!resolvedName) {
      return res
        .status(400)
        .json({ message: "Name is required for this role." });
    }

    const approvalStatus = APPROVAL_REQUIRED_ROLES.has(role)
      ? "pending"
      : "approved";

    const user = await UserModel.create({
      id: nextId("user"),
      name: resolvedName,
      email: normalizedEmail,
      password,
      role,
      approvalStatus,
      schoolId: resolvedSchoolId,
      judgeCategory: role === "judge" ? judgeCategory || "all" : undefined,
    });

    if (APPROVAL_REQUIRED_ROLES.has(role)) {
      try {
        const appBaseUrl = getAppBaseUrl(req);
        const serverBaseUrl = getServerBaseUrl(req);
        const signInUrl = `${appBaseUrl}/signin`;
        const recipients = await listAdminNotificationRecipients();

        const notification = await sendRegistrationReviewNotification({
          registration: user.toObject(),
          recipients,
          links: {
            approveUrl: `${serverBaseUrl}/api/admin/registrations/${user.id}/approve?token=${buildReviewToken(user.id, "approve")}`,
            rejectUrl: `${serverBaseUrl}/api/admin/registrations/${user.id}/reject?token=${buildReviewToken(user.id, "reject")}`,
            signInUrl,
          },
          schoolName: relatedSchoolName,
          schoolShortName: relatedSchoolShortName,
        });

        if (notification.status !== "sent") {
          // eslint-disable-next-line no-console
          console.warn("Registration review email was not fully delivered", {
            userId: user.id,
            notification,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to send registration review email", error);
      }
    }

    return res.status(201).json({
      message: APPROVAL_REQUIRED_ROLES.has(role)
        ? "Registration submitted. An administrator will review your account before you can sign in."
        : "Registration successful.",
      user: toSafeUser(user.toObject()),
    });
  }),
);

app.get(
  "/api/admin/registrations/:userId/:decision",
  asyncHandler(async (req, res) => {
    const { userId, decision } = req.params;
    const wantsJson = req.headers.accept?.includes("application/json");
    const signInUrl = `${getAppBaseUrl(req)}/signin`;

    if (!REVIEW_DECISIONS.has(decision)) {
      if (wantsJson) {
        return res.status(400).json({
          title: "Invalid Review Action",
          message: "This review link is not valid.",
          tone: "error",
        });
      }

      return res
        .status(400)
        .type("html")
        .send(
          renderReviewResultPage({
            title: "Invalid Review Action",
            message: "This review link is not valid.",
            signInUrl,
            tone: "error",
          }),
        );
    }

    if (!isValidReviewToken(userId, decision, req.query.token)) {
      if (wantsJson) {
        return res.status(403).json({
          title: "Review Link Expired",
          message:
            "This approve or reject link is invalid or has been changed.",
          tone: "error",
        });
      }

      return res
        .status(403)
        .type("html")
        .send(
          renderReviewResultPage({
            title: "Review Link Expired",
            message:
              "This approve or reject link is invalid or has been changed.",
            signInUrl,
            tone: "error",
          }),
        );
    }

    const result = await applyRegistrationDecision(userId, decision, {
      signInUrl,
    });

    if (wantsJson) {
      return res.status(result.httpStatus).json({
        title: result.title,
        message: result.message,
        tone: result.tone,
      });
    }

    return res
      .status(result.httpStatus)
      .type("html")
      .send(
        renderReviewResultPage({
          title: result.title,
          message: result.message,
          signInUrl,
          tone: result.tone,
        }),
      );
  }),
);

app.get(
  "/api/schools",
  asyncHandler(async (_req, res) => {
    const schools = await SchoolModel.find({
      reviewStatus: { $ne: "rejected" },
    })
      .sort({ name: 1 })
      .select("-_id")
      .lean();
    res.json(schools);
  }),
);

app.patch(
  "/api/schools/:schoolId/approve",
  asyncHandler(async (req, res) => {
    const school = await approveSchoolRegistration(req.params.schoolId);

    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    void notifySchoolUsersOfDecision(
      req.params.schoolId,
      "approve",
      `${getAppBaseUrl(req)}/signin`,
    ).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send school approval notifications", error);
    });

    return res.json(school);
  }),
);

app.delete(
  "/api/schools/:schoolId",
  asyncHandler(async (req, res) => {
    const removed = await rejectSchoolRegistration(req.params.schoolId);

    if (!removed) {
      return res.status(404).json({ message: "School not found." });
    }

    void notifySchoolUsersOfDecision(
      req.params.schoolId,
      "reject",
      `${getAppBaseUrl(req)}/signin`,
    ).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send school rejection notifications", error);
    });

    return res.json(removed);
  }),
);

app.get(
  "/api/events",
  asyncHandler(async (_req, res) => {
    const events = await EventModel.find()
      .sort({ year: 1, date: 1 })
      .select("-_id")
      .lean();
    res.json(events);
  }),
);

app.post(
  "/api/events",
  asyncHandler(async (req, res) => {
    const {
      name,
      year,
      date,
      venue,
      status,
      registrationDeadline,
      categories,
    } = req.body ?? {};

    if (
      !name ||
      !year ||
      !date ||
      !venue ||
      !status ||
      !registrationDeadline ||
      !Array.isArray(categories)
    ) {
      return res
        .status(400)
        .json({ message: "Missing required event fields." });
    }

    const event = await EventModel.create({
      id: nextId("e"),
      name,
      year: Number(year),
      date,
      venue,
      status,
      registrationDeadline,
      categories,
    });

    const eventPayload = event.toObject({
      versionKey: false,
      transform: (_d, ret) => {
        delete ret._id;
        return ret;
      },
    });

    const recipients = await UserModel.find({
      role: { $in: ["school", "student", "judge"] },
      $or: [
        { approvalStatus: "approved" },
        { approvalStatus: { $exists: false } },
      ],
    })
      .select("email name role -_id")
      .lean();

    const notifications = await sendEventCreatedNotifications(
      eventPayload,
      recipients,
    );

    return res.status(201).json({
      event: eventPayload,
      notifications,
    });
  }),
);

app.patch(
  "/api/events/:eventId",
  asyncHandler(async (req, res) => {
    const { name, year, date, venue, registrationDeadline, categories } =
      req.body ?? {};

    if (
      !name ||
      !year ||
      !date ||
      !venue ||
      !registrationDeadline ||
      !Array.isArray(categories)
    ) {
      return res
        .status(400)
        .json({ message: "Missing required event fields." });
    }

    const event = await EventModel.findOneAndUpdate(
      { id: req.params.eventId },
      {
        name,
        year: Number(year),
        date,
        venue,
        registrationDeadline,
        categories,
      },
      { new: true },
    )
      .select("-_id")
      .lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json(event);
  }),
);

app.patch(
  "/api/events/:eventId/status",
  asyncHandler(async (req, res) => {
    const { status } = req.body ?? {};

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    const event = await EventModel.findOneAndUpdate(
      { id: req.params.eventId },
      { status },
      { new: true },
    )
      .select("-_id")
      .lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    return res.json(event);
  }),
);

app.get(
  "/api/students",
  asyncHandler(async (req, res) => {
    const { eventId, schoolId, category } = req.query;
    const filter = {};

    if (eventId) filter.eventId = String(eventId);
    if (schoolId) filter.schoolId = String(schoolId);
    if (category) filter.category = String(category);

    const students = await StudentModel.find(filter)
      .sort({ name: 1 })
      .select("-_id")
      .lean();
    res.json(students);
  }),
);

app.post(
  "/api/students",
  asyncHandler(async (req, res) => {
    const { name, schoolId, category, eventId, grade } = req.body ?? {};

    if (!name || !schoolId || !category || !eventId || !grade) {
      return res
        .status(400)
        .json({ message: "Missing required student fields." });
    }

    const normalizedCategory = normalizeCategory(category);
    const trimmedName = String(name).trim();

    const [school, event] = await Promise.all([
      SchoolModel.findOne({ id: String(schoolId) })
        .select("id name -_id")
        .lean(),
      EventModel.findOne({ id: String(eventId) })
        .select("id categories registrationDeadline status -_id")
        .lean(),
    ]);

    if (!trimmedName) {
      return res.status(400).json({ message: "Student name is required." });
    }

    if (!school) {
      return res.status(400).json({ message: "Select a valid school." });
    }

    if (!event) {
      return res.status(400).json({ message: "Select a valid event." });
    }

    // Check if registration deadline has passed
    const deadlineDate = new Date(event.registrationDeadline);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize to start of day for fair comparison
    if (currentDate > deadlineDate) {
      return res.status(410).json({
        message: `Registration for this event closed on ${new Date(event.registrationDeadline).toLocaleDateString()}. No new registrations are accepted.`,
      });
    }

    if (!event.categories.includes(normalizedCategory)) {
      return res.status(400).json({
        message: "This category is not available for the selected event.",
      });
    }

    if (!isGradeAllowedForCategory(normalizedCategory, grade)) {
      return res.status(400).json({
        message: `${grade} is not eligible for ${normalizedCategory.replace(/_/g, " ")}. Allowed range: ${getCategoryGradeBand(normalizedCategory)}.`,
      });
    }

    const categoryCount = await StudentModel.countDocuments({
      schoolId: String(schoolId),
      eventId: String(eventId),
      category: normalizedCategory,
    });

    const maxSlots = getMaxSlotsForCategory(normalizedCategory);

    if (categoryCount >= maxSlots) {
      return res.status(409).json({
        message: `Maximum ${maxSlots} students per category are allowed for each school.`,
      });
    }

    // Check drama event limit (max 10 students total across all drama categories)
    if (isDramaCategory(normalizedCategory)) {
      const dramaCount = await StudentModel.countDocuments({
        schoolId: String(schoolId),
        eventId: String(eventId),
        category: { $in: ["drama_primary", "drama_junior", "drama_senior"] },
      });

      if (dramaCount >= 10) {
        return res.status(409).json({
          message:
            "Maximum 10 students for drama events are allowed for each school.",
        });
      }
    }

    const student = await StudentModel.create({
      id: nextId("st"),
      name: trimmedName,
      schoolId,
      category: normalizedCategory,
      eventId,
      grade,
    });

    return res.status(201).json(
      student.toObject({
        versionKey: false,
        transform: (_d, ret) => {
          delete ret._id;
          return ret;
        },
      }),
    );
  }),
);

app.delete(
  "/api/students/:studentId",
  asyncHandler(async (req, res) => {
    const removed = await StudentModel.findOneAndDelete({
      id: req.params.studentId,
    })
      .select("-_id")
      .lean();

    if (!removed) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.json(removed);
  }),
);

app.get(
  "/api/scores",
  asyncHandler(async (req, res) => {
    const { eventId, category } = req.query;
    const filter = {};

    if (eventId) filter.eventId = String(eventId);
    if (category) filter.category = String(category);

    const scores = await ScoreModel.find(filter).select("-_id").lean();
    res.json(scores);
  }),
);

app.post(
  "/api/scores",
  asyncHandler(async (req, res) => {
    const {
      studentId,
      judgeId,
      eventId,
      category,
      delivery,
      content,
      language,
      presentation,
    } = req.body ?? {};

    if (!studentId || !judgeId || !eventId || !category) {
      return res
        .status(400)
        .json({ message: "Missing required score fields." });
    }

    const numericScores = {
      delivery: Number(delivery),
      content: Number(content),
      language: Number(language),
      presentation: Number(presentation),
    };

    if (Object.values(numericScores).some((value) => Number.isNaN(value))) {
      return res.status(400).json({ message: "Score values must be numbers." });
    }

    if (
      Object.values(numericScores).some((value) => value < 0 || value > 100)
    ) {
      return res.status(400).json({
        message: "Each score must be between 0 and 100.",
      });
    }

    const normalizedCategory = normalizeCategory(category);
    const [student, judge] = await Promise.all([
      StudentModel.findOne({ id: String(studentId) })
        .select("id eventId category name -_id")
        .lean(),
      UserModel.findOne({ id: String(judgeId) })
        .select("id role judgeCategory -_id")
        .lean(),
    ]);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.eventId !== String(eventId)) {
      return res.status(400).json({
        message: "Score event does not match the selected student.",
      });
    }

    if (student.category !== normalizedCategory) {
      return res.status(400).json({
        message: "Score category does not match the selected student.",
      });
    }

    if (
      judge &&
      judge.role === "judge" &&
      judge.judgeCategory &&
      judge.judgeCategory !== "all" &&
      judge.judgeCategory !== normalizedCategory
    ) {
      return res.status(403).json({
        message: "This judge is not assigned to score that category.",
      });
    }

    const total = calculateWeightedTotal(numericScores, normalizedCategory);

    const score = await ScoreModel.findOneAndUpdate(
      {
        studentId: String(studentId),
        judgeId: String(judgeId),
        eventId: String(eventId),
      },
      {
        $setOnInsert: { id: nextId("sc") },
        $set: {
          category: normalizedCategory,
          delivery: numericScores.delivery,
          content: numericScores.content,
          language: numericScores.language,
          presentation: numericScores.presentation,
          total,
        },
      },
      { upsert: true, new: true },
    )
      .select("-_id")
      .lean();

    return res.status(201).json(score);
  }),
);

app.get(
  "/api/leaderboard",
  asyncHandler(async (req, res) => {
    const { eventId, category } = req.query;

    if (!eventId) {
      return res
        .status(400)
        .json({ message: "eventId query param is required." });
    }

    const scoreFilter = { eventId: String(eventId) };
    if (category) {
      scoreFilter.category = String(category);
    }

    const eventScores = await ScoreModel.find(scoreFilter)
      .select("-_id")
      .lean();
    if (eventScores.length === 0) {
      return res.json([]);
    }

    const studentIds = [
      ...new Set(eventScores.map((score) => score.studentId)),
    ];
    const allStudents = await StudentModel.find({ id: { $in: studentIds } })
      .select("-_id")
      .lean();
    const schoolIds = [
      ...new Set(allStudents.map((student) => student.schoolId)),
    ];
    const allSchools = await SchoolModel.find({ id: { $in: schoolIds } })
      .select("-_id")
      .lean();

    const studentById = new Map(
      allStudents.map((student) => [student.id, student]),
    );
    const schoolById = new Map(allSchools.map((school) => [school.id, school]));

    const rows = eventScores
      .map((score) => {
        const student = studentById.get(score.studentId);
        const school = schoolById.get(student?.schoolId);

        if (!student || !school) {
          return null;
        }

        return {
          rank: 0,
          studentName: student.name,
          schoolName: school.shortName,
          schoolColor: school.color,
          category: score.category,
          avgScore: score.total,
          scores: {
            delivery: score.delivery,
            content: score.content,
            language: score.language,
            presentation: score.presentation,
          },
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.avgScore - a.avgScore)
      .map((row, index) => ({ ...row, rank: index + 1 }));

    return res.json(rows);
  }),
);

app.use((error, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

async function startServer() {
  await connectDatabase();
  await seedDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend", error);
  process.exit(1);
});
