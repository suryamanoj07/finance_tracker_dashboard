import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { badRequest, unauthorized } from "../utils/httpError.js";

export async function login({ email, password, jwtSecret }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw unauthorized("Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw unauthorized("Invalid email or password");
  if (user.status !== "active") throw badRequest("User is inactive");

  const token = jwt.sign(
    { role: user.role, email: user.email },
    jwtSecret,
    { subject: String(user._id), expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
}

