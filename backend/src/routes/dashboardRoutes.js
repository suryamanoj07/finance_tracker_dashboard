import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireRole } from "../middleware/auth.js";
import { summarySchema, trendsSchema } from "../validators/dashboardSchemas.js";
import { getSummary, getTrends } from "../services/dashboardService.js";

export function dashboardRoutes() {
  const router = Router();

  // Viewer/Analyst/Admin can view dashboard summaries
  router.get("/summary", requireRole("viewer", "analyst", "admin"), validate(summarySchema), async (req, res, next) => {
    try {
      res.json(await getSummary(req.validated.query));
    } catch (err) {
      next(err);
    }
  });

  router.get("/trends", requireRole("viewer", "analyst", "admin"), validate(trendsSchema), async (req, res, next) => {
    try {
      res.json(await getTrends(req.validated.query));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

