import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validators/authSchemas.js";
import { login } from "../services/authService.js";

export function authRoutes({ jwtSecret }) {
  const router = Router();

  router.post("/login", validate(loginSchema), async (req, res, next) => {
    try {
      const { email, password } = req.validated.body;
      const result = await login({ email, password, jwtSecret });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

