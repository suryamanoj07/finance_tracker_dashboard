import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

export default function Dashboard() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const params = useMemo(() => {
    const p = {};
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [from, to]);

  async function load() {
    setErr("");
    setBusy(true);
    try {
      const res = await api.dashboardSummary(params);
      setData(res);
    } catch (e) {
      setErr(e.message || "Failed to load summary");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="grid">
        <div className="col-12 card hoverable sectionAccent">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "end" }}>
            <div>
              <h2 style={{ margin: 0 }}>Dashboard</h2>
              <div className="mutedText" style={{ marginTop: 6 }}>
                Quick totals + category breakdown + recent activity.
              </div>
            </div>
            <div className="row" style={{ alignItems: "end" }}>
              <div style={{ width: 160 }}>
                <label>From (YYYY-MM-DD)</label>
                <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-01-01" />
              </div>
              <div style={{ width: 160 }}>
                <label>To (YYYY-MM-DD)</label>
                <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-12-31" />
              </div>
              <button className="btn primary" onClick={load} disabled={busy}>
                {busy ? "Loading..." : "Apply"}
              </button>
            </div>
          </div>
        </div>

        {err ? (
          <div className="col-12 card" style={{ borderColor: "rgba(239,68,68,0.35)", color: "rgba(254,202,202,0.95)" }}>
            {err}
          </div>
        ) : null}

        <div className="col-4 card metricCard income">
          <div className="mutedText">Total income</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>{money(data?.totals?.income)}</div>
        </div>
        <div className="col-4 card metricCard expense">
          <div className="mutedText">Total expenses</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>{money(data?.totals?.expenses)}</div>
        </div>
        <div className="col-4 card metricCard net">
          <div className="mutedText">Net</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>{money(data?.totals?.net)}</div>
        </div>

        <div className="col-6 card hoverable sectionAccent">
          <h3 style={{ marginTop: 0 }}>Category totals</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Income</th>
                <th>Expense</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {(data?.categoryTotals || []).slice(0, 10).map((c) => (
                <tr key={c.category}>
                  <td>{c.category}</td>
                  <td>{money(c.income)}</td>
                  <td>{money(c.expense)}</td>
                  <td>{money(c.net)}</td>
                </tr>
              ))}
              {!data?.categoryTotals?.length ? (
                <tr>
                  <td colSpan={4} className="mutedText">
                    No data yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="col-6 card hoverable sectionAccent">
          <h3 style={{ marginTop: 0 }}>Recent activity</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentActivity || []).map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className={`pill ${r.type === "income" ? "good" : "bad"}`}>{r.type}</span>
                  </td>
                  <td>{r.category}</td>
                  <td>{money(r.amount)}</td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {!data?.recentActivity?.length ? (
                <tr>
                  <td colSpan={4} className="mutedText">
                    No activity yet.
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

