import mongoose from "mongoose";

const TYPES = ["income", "expense"];

const recordSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: TYPES, required: true },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    date: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 400, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

recordSchema.index({ date: -1 });
recordSchema.index({ type: 1, category: 1, date: -1 });

export const Record = mongoose.model("Record", recordSchema);
export const RECORD_TYPES = TYPES;

