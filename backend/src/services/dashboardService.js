import { Record } from "../models/Record.js";

function parseDateMaybe(value) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export async function getSummary({ from, to }) {
  const match = { deletedAt: null };
  const fromD = parseDateMaybe(from);
  const toD = parseDateMaybe(to);
  if (fromD || toD) {
    match.date = {};
    if (fromD) match.date.$gte = fromD;
    if (toD) match.date.$lte = toD;
  }

  const totals = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const grouped = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const recent = await Record.find(match).sort({ date: -1, createdAt: -1 }).limit(8).lean();

  const income = (totals || [])
    .filter((t) => t._id === "income")
    .reduce((acc, t) => acc + t.total, 0);
  const expenses = (totals || [])
    .filter((t) => t._id === "expense")
    .reduce((acc, t) => acc + t.total, 0);

  const categories = {};
  for (const row of grouped) {
    const key = row._id.category;
    if (!categories[key]) categories[key] = { income: 0, expense: 0 };
    categories[key][row._id.type] = row.total;
  }

  return {
    range: { from: fromD ?? null, to: toD ?? null },
    totals: {
      income,
      expenses,
      net: income - expenses,
    },
    categoryTotals: Object.entries(categories).map(([category, t]) => ({
      category,
      income: t.income,
      expense: t.expense,
      net: t.income - t.expense,
    })),
    recentActivity: recent.map((r) => ({
      id: String(r._id),
      type: r.type,
      category: r.category,
      amount: r.amount,
      date: r.date,
      notes: r.notes || "",
    })),
  };
}

export async function getTrends({ period = "monthly", from, to, type }) {
  const match = { deletedAt: null };
  const fromD = parseDateMaybe(from);
  const toD = parseDateMaybe(to);
  if (fromD || toD) {
    match.date = {};
    if (fromD) match.date.$gte = fromD;
    if (toD) match.date.$lte = toD;
  }
  if (type) match.type = type;

  const groupId =
    period === "weekly"
      ? {
          year: { $isoWeekYear: "$date" },
          week: { $isoWeek: "$date" },
          type: "$type",
        }
      : {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        };

  const rows = await Record.aggregate([
    { $match: match },
    { $group: { _id: groupId, total: { $sum: "$amount" } } },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
  ]);

  return {
    period,
    range: { from: fromD ?? null, to: toD ?? null },
    points: rows.map((r) => ({
      bucket: r._id,
      total: r.total,
    })),
  };
}

