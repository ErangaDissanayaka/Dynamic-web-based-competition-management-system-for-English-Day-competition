import nodemailer from "nodemailer";

function normalizeSmtpPassword(rawPassword, host) {
  if (typeof rawPassword !== "string") {
    return rawPassword;
  }

  const trimmedPassword = rawPassword.trim();
  const isGmailHost = /(^|\.)smtp\.gmail\.com$/i.test(String(host || ""));
  const looksLikeSpacedAppPassword = /^[a-z0-9]{4}(\s+[a-z0-9]{4}){3}$/i.test(
    trimmedPassword,
  );

  if (isGmailHost && looksLikeSpacedAppPassword) {
    return trimmedPassword.replace(/\s+/g, "");
  }

  return rawPassword;
}

function getErrorMessage(error) {
  if (!error) {
    return "Unknown email transport error.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  return "Unknown email transport error.";
}

function normalizeRecipients(recipients = []) {
  const deduped = new Map();

  for (const recipient of recipients) {
    const normalizedEmail =
      typeof recipient?.email === "string"
        ? recipient.email.trim().toLowerCase()
        : "";

    if (!normalizedEmail) {
      continue;
    }

    deduped.set(normalizedEmail, {
      ...recipient,
      email: normalizedEmail,
    });
  }

  return [...deduped.values()];
}

async function verifyTransport(transport, label) {
  try {
    await transport.verify();
    return { ok: true, transport, label };
  } catch (error) {
    return {
      ok: false,
      label,
      error: getErrorMessage(error),
    };
  }
}

function createGmailFallbackTransport() {
  const host = String(process.env.SMTP_HOST || "")
    .trim()
    .toLowerCase();
  const port = Number(process.env.SMTP_PORT || 0);

  if (
    host !== "smtp.gmail.com" ||
    port !== 465 ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    return null;
  }

  const pass = normalizeSmtpPassword(process.env.SMTP_PASS, host);

  return nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass,
    },
  });
}

async function resolveReadyTransport(primaryTransport) {
  const attempts = [{ transport: primaryTransport, label: "primary" }];
  const fallbackTransport = createGmailFallbackTransport();

  if (fallbackTransport) {
    attempts.push({
      transport: fallbackTransport,
      label: "gmail-fallback-587-starttls",
    });
  }

  const errors = [];

  for (const attempt of attempts) {
    const verification = await verifyTransport(
      attempt.transport,
      attempt.label,
    );

    if (verification.ok) {
      return {
        transport: verification.transport,
        label: verification.label,
        error: null,
      };
    }

    errors.push(`${verification.label}: ${verification.error}`);
  }

  return {
    transport: null,
    label: null,
    error: errors.join(" | "),
  };
}

function getFirstDeliveryFailureReason(results) {
  const firstFailed = results.find((result) => result.status === "rejected");
  if (!firstFailed || firstFailed.status !== "rejected") {
    return null;
  }

  return getErrorMessage(firstFailed.reason);
}

function createTransport() {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }

  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const pass = normalizeSmtpPassword(process.env.SMTP_PASS, host);

    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass,
      },
    });
  }

  return null;
}

function formatEventDate(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getFromAddress() {
  return (
    process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatRoleLabel(role) {
  switch (role) {
    case "school":
      return "school";
    case "student":
      return "student";
    case "judge":
      return "judge";
    case "admin":
      return "admin";
    default:
      return "user";
  }
}

export async function sendRegistrationReviewNotification({
  registration,
  recipients,
  links,
  schoolName,
  schoolShortName,
}) {
  const transport = createTransport();
  const recipientList = normalizeRecipients(recipients);

  if (recipientList.length === 0) {
    return {
      status: "skipped",
      recipientCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      message: "No admin email recipients are configured.",
    };
  }

  if (!transport) {
    return {
      status: "skipped",
      recipientCount: recipientList.length,
      deliveredCount: 0,
      failedCount: 0,
      message:
        "Registration saved, but email sending is not configured. Set SMTP credentials in .env.",
    };
  }

  const from = getFromAddress();

  if (!from) {
    return {
      status: "skipped",
      recipientCount: recipientList.length,
      deliveredCount: 0,
      failedCount: 0,
      message: "Registration saved, but EMAIL_FROM or SMTP_USER is missing.",
    };
  }

  const readyTransport = await resolveReadyTransport(transport);
  if (!readyTransport.transport) {
    return {
      status: "failed",
      recipientCount: recipientList.length,
      deliveredCount: 0,
      failedCount: recipientList.length,
      message: `Registration saved, but SMTP verification failed: ${readyTransport.error}`,
    };
  }

  const activeTransport = readyTransport.transport;

  const roleLabel = formatRoleLabel(registration.role);
  const details = [
    `<li><strong>Name:</strong> ${escapeHtml(registration.name)}</li>`,
    `<li><strong>Email:</strong> ${escapeHtml(registration.email)}</li>`,
    `<li><strong>Role:</strong> ${escapeHtml(roleLabel)}</li>`,
  ];

  if (schoolName) {
    details.push(`<li><strong>School:</strong> ${escapeHtml(schoolName)}</li>`);
  }

  if (schoolShortName) {
    details.push(
      `<li><strong>School short name:</strong> ${escapeHtml(schoolShortName)}</li>`,
    );
  }

  if (registration.judgeCategory) {
    details.push(
      `<li><strong>Judging category:</strong> ${escapeHtml(registration.judgeCategory)}</li>`,
    );
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172554;">
      <h2 style="margin-bottom: 12px;">New ${escapeHtml(roleLabel)} registration pending review</h2>
      <p>A new account is waiting for admin review.</p>
      <ul style="padding-left: 18px;">
        ${details.join("\n")}
      </ul>
      <div style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${escapeHtml(links.approveUrl)}" style="display: inline-block; background: #166534; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">Approve</a>
        <a href="${escapeHtml(links.rejectUrl)}" style="display: inline-block; background: #b91c1c; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reject</a>
        <a href="${escapeHtml(links.signInUrl)}" style="display: inline-block; background: #1d4ed8; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open Admin Sign In</a>
      </div>
    </div>
  `;

  const text = [
    `New ${roleLabel} registration pending review`,
    "",
    `Name: ${registration.name}`,
    `Email: ${registration.email}`,
    `Role: ${roleLabel}`,
    schoolName ? `School: ${schoolName}` : null,
    schoolShortName ? `School short name: ${schoolShortName}` : null,
    registration.judgeCategory
      ? `Judging category: ${registration.judgeCategory}`
      : null,
    "",
    `Approve: ${links.approveUrl}`,
    `Reject: ${links.rejectUrl}`,
    `Admin sign in: ${links.signInUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const results = await Promise.allSettled(
    recipientList.map((recipient) =>
      activeTransport.sendMail({
        from,
        to: recipient.email,
        subject: `Review ${roleLabel} registration: ${registration.name}`,
        text,
        html,
      }),
    ),
  );

  const deliveredCount = results.filter(
    (result) => result.status === "fulfilled",
  ).length;
  const failedCount = recipientList.length - deliveredCount;
  const failureReason = getFirstDeliveryFailureReason(results);

  return {
    status:
      failedCount === 0 ? "sent" : deliveredCount > 0 ? "partial" : "failed",
    recipientCount: recipientList.length,
    deliveredCount,
    failedCount,
    message:
      failedCount === 0
        ? `Admin review email sent to ${deliveredCount} recipient(s).`
        : `Admin review email delivery finished with ${deliveredCount} sent and ${failedCount} failed.${failureReason ? ` First error: ${failureReason}` : ""}`,
  };
}

export async function sendRegistrationDecisionNotification({
  registration,
  decision,
  signInUrl,
}) {
  const transport = createTransport();
  const recipientEmail =
    typeof registration?.email === "string"
      ? registration.email.trim().toLowerCase()
      : "";

  if (!recipientEmail) {
    return {
      status: "skipped",
      recipientCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      message:
        "Registration decision email skipped because user email is missing.",
    };
  }

  if (!transport) {
    return {
      status: "skipped",
      recipientCount: 1,
      deliveredCount: 0,
      failedCount: 0,
      message:
        "Registration decision saved, but email sending is not configured. Set SMTP credentials in .env.",
    };
  }

  const from = getFromAddress();

  if (!from) {
    return {
      status: "skipped",
      recipientCount: 1,
      deliveredCount: 0,
      failedCount: 0,
      message:
        "Registration decision saved, but EMAIL_FROM or SMTP_USER is missing.",
    };
  }

  const readyTransport = await resolveReadyTransport(transport);
  if (!readyTransport.transport) {
    return {
      status: "failed",
      recipientCount: 1,
      deliveredCount: 0,
      failedCount: 1,
      message: `Registration decision saved, but SMTP verification failed: ${readyTransport.error}`,
    };
  }

  const activeTransport = readyTransport.transport;

  const isApproved = decision === "approve";
  const roleLabel = formatRoleLabel(registration.role);
  const subject = isApproved
    ? "Your registration was approved"
    : "Your registration was rejected";
  const decisionTitle = isApproved
    ? "Registration Approved"
    : "Registration Rejected";
  const decisionMessage = isApproved
    ? "Your account is now approved. You can sign in and continue using the platform."
    : "Your registration was not approved at this time. Please contact the administrator for details.";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172554;">
      <h2 style="margin-bottom: 12px;">${escapeHtml(decisionTitle)}</h2>
      <p>Hello ${escapeHtml(registration.name || "there")},</p>
      <p>${escapeHtml(decisionMessage)}</p>
      <ul style="padding-left: 18px;">
        <li><strong>Email:</strong> ${escapeHtml(recipientEmail)}</li>
        <li><strong>Role:</strong> ${escapeHtml(roleLabel)}</li>
      </ul>
      ${
        isApproved
          ? `<a href="${escapeHtml(signInUrl)}" style="display: inline-block; margin-top: 18px; background: #1d4ed8; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open Sign In</a>`
          : ""
      }
    </div>
  `;

  const text = [
    decisionTitle,
    "",
    `Hello ${registration.name || "there"},`,
    decisionMessage,
    "",
    `Email: ${recipientEmail}`,
    `Role: ${roleLabel}`,
    isApproved ? `Sign in: ${signInUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await activeTransport.sendMail({
      from,
      to: recipientEmail,
      subject,
      text,
      html,
    });
  } catch (error) {
    return {
      status: "failed",
      recipientCount: 1,
      deliveredCount: 0,
      failedCount: 1,
      message: `Registration decision email failed: ${getErrorMessage(error)}`,
    };
  }

  return {
    status: "sent",
    recipientCount: 1,
    deliveredCount: 1,
    failedCount: 0,
    message: `Registration decision email sent to ${recipientEmail}.`,
  };
}

export async function sendEventCreatedNotifications(event, recipients) {
  const transport = createTransport();
  const recipientList = normalizeRecipients(recipients);

  if (recipientList.length === 0) {
    return {
      status: "skipped",
      recipientCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      message:
        "No registered school, student, or judge accounts have email addresses.",
    };
  }

  if (!transport) {
    return {
      status: "skipped",
      recipientCount: recipientList.length,
      deliveredCount: 0,
      failedCount: 0,
      message:
        "Event created, but email sending is not configured. Set SMTP credentials in .env.",
    };
  }

  const from = getFromAddress();

  if (!from) {
    return {
      status: "skipped",
      recipientCount: recipientList.length,
      deliveredCount: 0,
      failedCount: 0,
      message:
        "Event created, but EMAIL_FROM or SMTP_USER is missing from .env.",
    };
  }

  const readyTransport = await resolveReadyTransport(transport);
  if (!readyTransport.transport) {
    return {
      status: "failed",
      recipientCount: recipientList.length,
      deliveredCount: 0,
      failedCount: recipientList.length,
      message: `Event created, but SMTP verification failed: ${readyTransport.error}`,
    };
  }

  const activeTransport = readyTransport.transport;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172554;">
      <h2 style="margin-bottom: 12px;">New English Day Event Created</h2>
      <p>A new event has been added to the system.</p>
      <ul style="padding-left: 18px;">
        <li><strong>Event:</strong> ${event.name}</li>
        <li><strong>Year:</strong> ${event.year}</li>
        <li><strong>Date:</strong> ${formatEventDate(event.date)}</li>
        <li><strong>Venue:</strong> ${event.venue}</li>
        <li><strong>Registration deadline:</strong> ${formatEventDate(event.registrationDeadline)}</li>
      </ul>
      <p>Please sign in to the platform for the latest details.</p>
    </div>
  `;

  const text = [
    "New English Day Event Created",
    "",
    `Event: ${event.name}`,
    `Year: ${event.year}`,
    `Date: ${formatEventDate(event.date)}`,
    `Venue: ${event.venue}`,
    `Registration deadline: ${formatEventDate(event.registrationDeadline)}`,
    "",
    "Please sign in to the platform for the latest details.",
  ].join("\n");

  const results = await Promise.allSettled(
    recipientList.map((recipient) =>
      activeTransport.sendMail({
        from,
        to: recipient.email,
        subject: `New Event: ${event.name}`,
        text,
        html,
      }),
    ),
  );

  const deliveredCount = results.filter(
    (result) => result.status === "fulfilled",
  ).length;
  const failedCount = recipientList.length - deliveredCount;
  const failureReason = getFirstDeliveryFailureReason(results);

  return {
    status:
      failedCount === 0 ? "sent" : deliveredCount > 0 ? "partial" : "failed",
    recipientCount: recipientList.length,
    deliveredCount,
    failedCount,
    message:
      failedCount === 0
        ? `Notification emails sent to ${deliveredCount} users.`
        : `Email delivery finished with ${deliveredCount} sent and ${failedCount} failed.${failureReason ? ` First error: ${failureReason}` : ""}`,
  };
}
