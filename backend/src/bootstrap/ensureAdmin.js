import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export async function ensureBootstrapAdmin({ email, password, name }) {
  if (!email || !password) return { created: false, reason: "bootstrap admin not configured" };

  const existing = await User.findOne({ email: email.toLowerCase().trim() }).lean();
  if (existing) return { created: false, reason: "already exists" };

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name: name || "Admin",
    email: email.toLowerCase().trim(),
    passwordHash,
    role: "admin",
    status: "active",
  });

  return { created: true, email };
}

