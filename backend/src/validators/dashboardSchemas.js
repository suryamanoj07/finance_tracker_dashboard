import { z } from "zod";
import { RECORD_TYPES } from "../models/Record.js";

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

export const summarySchema = z.object({
  query: z.object({
    from: isoDate.optional(),
    to: isoDate.optional(),
  }),
  body: z.any().optional(),
  params: z.any().optional(),
});

export const trendsSchema = z.object({
  query: z.object({
    period: z.enum(["monthly", "weekly"]).default("monthly"),
    from: isoDate.optional(),
    to: isoDate.optional(),
    type: z.enum(RECORD_TYPES).optional(),
  }),
  body: z.any().optional(),
  params: z.any().optional(),
});

