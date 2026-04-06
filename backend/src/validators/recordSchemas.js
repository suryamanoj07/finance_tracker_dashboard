import { z } from "zod";
import { RECORD_TYPES } from "../models/Record.js";

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().nonnegative(),
    type: z.enum(RECORD_TYPES),
    category: z.string().min(1).max(50),
    date: isoDate,
    notes: z.string().max(400).optional().default(""),
  }),
  query: z.any().optional(),
  params: z.any().optional(),
});

export const updateRecordSchema = z.object({
  body: z
    .object({
      amount: z.number().nonnegative().optional(),
      type: z.enum(RECORD_TYPES).optional(),
      category: z.string().min(1).max(50).optional(),
      date: isoDate.optional(),
      notes: z.string().max(400).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: "Provide at least one field" }),
  params: z.object({
    recordId: z.string().min(1),
  }),
  query: z.any().optional(),
});

export const listRecordsSchema = z.object({
  query: z.object({
    type: z.enum(RECORD_TYPES).optional(),
    category: z.string().min(1).max(50).optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    includeDeleted: z.string().optional(),
    limit: z.string().optional(),
    offset: z.string().optional(),
  }),
  body: z.any().optional(),
  params: z.any().optional(),
});

