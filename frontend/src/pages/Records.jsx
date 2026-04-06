import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { getSession } from "../lib/auth.js";

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

export default function Records() {
  const { user } = getSession();
  const isAdmin = user?.role === "admin";

  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    category: "",
    date: "",
    notes: "",
  });

  const params = useMemo(() => {
    const p = {};
    if (type) p.type = type;
    if (category) p.category = category;
    return p;
  }, [type, category]);

  async function load() {
    setErr("");
    setBusy(true);
    try {
      const res = await api.listRecords(params);
      setItems(res.items || []);
    } catch (e) {
      setErr(e.message || "Failed to load records");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(e) {
    e.preventDefault();
    setErr("");
    try {
      const payload = {
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        notes: form.notes,
      };
      await api.createRecord(payload);
      setForm({ amount: "", type: "expense", category: "", date: "", notes: "" });
      await load();
    } catch (e2) {
      setErr(e2.message || "Failed to create record");
    }
  }

  async function remove(id) {
    setErr("");
    try {
      await api.deleteRecord(id);
      await load();
    } catch (e2) {
      setErr(e2.message || "Failed to delete");
    }
  }

  return (
    <div className="container">
      <div className="grid">
        <div className="col-12 card sectionAccent">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "end" }}>
            <div>
              <h2 style={{ margin: 0 }}>Records</h2>
              <div className="mutedText" style={{ marginTop: 6 }}>
                Analysts can view. Admins can add/delete.
              </div>
            </div>
            <div className="row" style={{ alignItems: "end" }}>
              <div style={{ width: 160 }}>
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div style={{ width: 220 }}>
                <label>Category</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Food" />
              </div>
              <button className="btn primary" onClick={load} disabled={busy}>
                {busy ? "Loading..." : "Filter"}
              </button>
            </div>
          </div>
        </div>

        {err ? (
          <div className="col-12 card" style={{ borderColor: "rgba(220,38,38,0.3)", color: "#b91c1c" }}>
            {err}
          </div>
        ) : null}

        {isAdmin ? (
          <div className="col-12 card sectionAccent">
            <h3 style={{ marginTop: 0 }}>Add record</h3>
            <form className="grid" onSubmit={create}>
              <div className="col-4">
                <label>Amount</label>
                <input
                  value={form.amount}
                  onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
                  placeholder="1200"
                />
              </div>
              <div className="col-4">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="col-4">
                <label>Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                  placeholder="Salary / Rent / Food"
                />
              </div>
              <div className="col-4">
                <label>Date (YYYY-MM-DD)</label>
                <input value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} placeholder="2026-04-06" />
              </div>
              <div className="col-8">
                <label>Notes</label>
                <input value={form.notes} onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} placeholder="optional" />
              </div>
              <div className="col-12 row" style={{ justifyContent: "flex-end" }}>
                <button className="btn primary">Create</button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="col-12 card sectionAccent">
          <h3 style={{ marginTop: 0 }}>List</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                {isAdmin ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className={`pill ${r.type === "income" ? "good" : "bad"}`}>{r.type}</span>
                  </td>
                  <td>{r.category}</td>
                  <td>{money(r.amount)}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  {isAdmin ? (
                    <td>
                      <button className="btn danger" onClick={() => remove(r.id)}>
                        Delete
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="mutedText">
                    No records found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

