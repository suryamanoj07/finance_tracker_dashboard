import mongoose from "mongoose";
import { Record } from "../models/Record.js";
import { badRequest, notFound } from "../utils/httpError.js";

function parseDateMaybe(value) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw badRequest("Invalid date");
  return d;
}

export async function createRecord({ userId, amount, type, category, date, notes }) {
  const record = await Record.create({
    amount,
    type,
    category: category.trim(),
    date: new Date(date),
    notes: (notes ?? "").trim(),
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  return toDto(record);
}

export async function listRecords(query) {
  const includeDeleted = query.includeDeleted === "true";
  const limit = Math.min(Number(query.limit || 50), 200);
  const offset = Math.max(Number(query.offset || 0), 0);

  const filter = {};
  if (!includeDeleted) filter.deletedAt = null;
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;

  const from = parseDateMaybe(query.from);
  const to = parseDateMaybe(query.to);
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const [items, total] = await Promise.all([
    Record.find(filter).sort({ date: -1, createdAt: -1 }).skip(offset).limit(limit).lean(),
    Record.countDocuments(filter),
  ]);

  return {
    items: items.map((r) => toDto(r)),
    total,
    limit,
    offset,
  };
}

export async function getRecord(recordId) {
  const r = await Record.findById(recordId).lean();
  if (!r) throw notFound("Record not found");
  return toDto(r);
}

export async function updateRecord(recordId, patch) {
  const update = {};
  if (patch.amount != null) update.amount = patch.amount;
  if (patch.type != null) update.type = patch.type;
  if (patch.category != null) update.category = patch.category.trim();
  if (patch.date != null) update.date = new Date(patch.date);
  if (patch.notes != null) update.notes = patch.notes.trim();

  const r = await Record.findByIdAndUpdate(recordId, update, { new: true }).lean();
  if (!r) throw notFound("Record not found");
  return toDto(r);
}

export async function deleteRecord(recordId) {
  const r = await Record.findById(recordId).lean();
  if (!r) throw notFound("Record not found");

  if (r.deletedAt) return { ok: true };
  await Record.findByIdAndUpdate(recordId, { deletedAt: new Date() });
  return { ok: true };
}

function toDto(r) {
  return {
    id: String(r._id),
    amount: r.amount,
    type: r.type,
    category: r.category,
    date: r.date,
    notes: r.notes || "",
    createdBy: String(r.createdBy),
    deletedAt: r.deletedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

