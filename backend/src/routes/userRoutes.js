import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireRole } from "../middleware/auth.js";
import { createUserSchema, updateUserSchema } from "../validators/userSchemas.js";
import { createUser, getUser, listUsers, updateUser } from "../services/userService.js";

export function userRoutes() {
  const router = Router();

  router.get("/", requireRole("admin"), async (_req, res, next) => {
    try {
      res.json({ items: await listUsers() });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", requireRole("admin"), validate(createUserSchema), async (req, res, next) => {
    try {
      const created = await createUser(req.validated.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:userId", requireRole("admin"), async (req, res, next) => {
    try {
      res.json(await getUser(req.params.userId));
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:userId", requireRole("admin"), validate(updateUserSchema), async (req, res, next) => {
    try {
      res.json(await updateUser(req.validated.params.userId, req.validated.body));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

