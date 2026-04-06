import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { badRequest, notFound } from "../utils/httpError.js";

export async function createUser({ name, email, password, role, status }) {
  const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (existing) throw badRequest("Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    status,
  });

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export async function listUsers() {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));
}

export async function getUser(userId) {
  const u = await User.findById(userId).lean();
  if (!u) throw notFound("User not found");
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function updateUser(userId, patch) {
  const update = {};
  if (patch.name != null) update.name = patch.name.trim();
  if (patch.role != null) update.role = patch.role;
  if (patch.status != null) update.status = patch.status;
  if (patch.password != null) update.passwordHash = await bcrypt.hash(patch.password, 10);

  const u = await User.findByIdAndUpdate(userId, update, { new: true }).lean();
  if (!u) throw notFound("User not found");
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

