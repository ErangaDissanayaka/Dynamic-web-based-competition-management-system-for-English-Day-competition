import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "school", "student", "judge", "guest"],
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    schoolId: { type: String },
    judgeCategory: { type: String },
  },
  { versionKey: false },
);

// Note: uniqueness for non-judge roles is enforced in application logic
// to avoid partial-index compatibility issues across deployment targets.

const schoolSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    logo: { type: String, required: true, default: "S" },
    color: { type: String, required: true, default: "#475569" },
    approved: { type: Boolean, required: true, default: false },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { versionKey: false },
);

const eventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    date: { type: String, required: true },
    venue: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "upcoming",
        "registration_open",
        "registration_closed",
        "judging_live",
        "results_published",
      ],
    },
    registrationDeadline: { type: String, required: true },
    categories: {
      type: [{ type: String }],
      required: true,
      default: [],
    },
  },
  { versionKey: false },
);

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    schoolId: { type: String, required: true, index: true },
    category: {
      type: String,
      required: true,
      index: true,
    },
    eventId: { type: String, required: true, index: true },
    grade: { type: String, required: true },
  },
  { versionKey: false },
);

const scoreSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    judgeId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    category: {
      type: String,
      required: true,
      index: true,
    },
    delivery: { type: Number, required: true },
    content: { type: Number, required: true },
    language: { type: Number, required: true },
    presentation: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { versionKey: false },
);

scoreSchema.index({ studentId: 1, judgeId: 1, eventId: 1 }, { unique: true });

export const UserModel = mongoose.model("User", userSchema);
export const SchoolModel = mongoose.model("School", schoolSchema);
export const EventModel = mongoose.model("Event", eventSchema);
export const StudentModel = mongoose.model("Student", studentSchema);
export const ScoreModel = mongoose.model("Score", scoreSchema);
