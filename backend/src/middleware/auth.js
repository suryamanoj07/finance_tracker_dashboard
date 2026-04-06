import jwt from "jsonwebtoken";
import { unauthorized, forbidden } from "../utils/httpError.js";
import { User } from "../models/User.js";

export function requireAuth(jwtSecret) {
  return async (req, _res, next) => {
    try {
      const auth = req.headers.authorization || "";
      const [scheme, token] = auth.split(" ");
      if (scheme !== "Bearer" || !token) throw unauthorized("Missing token");

      let payload;
      try {
        payload = jwt.verify(token, jwtSecret);
      } catch {
        throw unauthorized("Invalid token");
      }

      const user = await User.findById(payload.sub).lean();
      if (!user) throw unauthorized("User not found");
      if (user.status !== "active") throw forbidden("User is inactive");

      req.user = {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRole(...allowed) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role) return next(unauthorized());
    if (!allowed.includes(role)) return next(forbidden("Insufficient permissions"));
    next();
  };
}

