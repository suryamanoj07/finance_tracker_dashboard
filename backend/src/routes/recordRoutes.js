import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireRole } from "../middleware/auth.js";
import { createRecordSchema, listRecordsSchema, updateRecordSchema } from "../validators/recordSchemas.js";
import { createRecord, deleteRecord, getRecord, listRecords, updateRecord } from "../services/recordService.js";

export function recordRoutes() {
  const router = Router();

  // Analyst/Admin can view records
  router.get("/", requireRole("analyst", "admin"), validate(listRecordsSchema), async (req, res, next) => {
    try {
      res.json(await listRecords(req.validated.query));
    } catch (err) {
      next(err);
    }
  });

  router.get("/:recordId", requireRole("analyst", "admin"), async (req, res, next) => {
    try {
      res.json(await getRecord(req.params.recordId));
    } catch (err) {
      next(err);
    }
  });

  // Admin can manage records
  router.post("/", requireRole("admin"), validate(createRecordSchema), async (req, res, next) => {
    try {
      const b = req.validated.body;
      const created = await createRecord({ userId: req.user.id, ...b });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:recordId", requireRole("admin"), validate(updateRecordSchema), async (req, res, next) => {
    try {
      res.json(await updateRecord(req.validated.params.recordId, req.validated.body));
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:recordId", requireRole("admin"), async (req, res, next) => {
    try {
      res.json(await deleteRecord(req.params.recordId));
    } catch (err) {
      next(err);
    }
  });

  return router;
}

