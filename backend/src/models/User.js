import mongoose from "mongoose";

const ROLES = ["viewer", "analyst", "admin"];
const STATUSES = ["active", "inactive"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, default: "viewer" },
    status: { type: String, enum: STATUSES, required: true, default: "active" },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
export const USER_ROLES = ROLES;
export const USER_STATUSES = STATUSES;

