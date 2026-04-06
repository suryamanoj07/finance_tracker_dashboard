import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Users() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
    status: "active",
  });

  async function load() {
    setErr("");
    setBusy(true);
    try {
      const res = await api.listUsers();
      setItems(res.items || []);
    } catch (e) {
      setErr(e.message || "Failed to load users");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        status: form.status,
      });
      setForm({ name: "", email: "", password: "", role: "viewer", status: "active" });
      await load();
    } catch (e2) {
      setErr(e2.message || "Failed to create user");
    }
  }

  async function toggleStatus(u) {
    setErr("");
    try {
      const next = u.status === "active" ? "inactive" : "active";
      await api.patchUser(u.id, { status: next });
      await load();
    } catch (e2) {
      setErr(e2.message || "Failed to update");
    }
  }

  async function setRole(u, role) {
    setErr("");
    try {
      await api.patchUser(u.id, { role });
      await load();
    } catch (e2) {
      setErr(e2.message || "Failed to update");
    }
  }

  return (
    <div className="container">
      <div className="grid">
        <div className="col-12 card sectionAccent">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "end" }}>
            <div>
              <h2 style={{ margin: 0 }}>Users</h2>
              <div className="mutedText" style={{ marginTop: 6 }}>
                Admin-only. Create users and control role/status.
              </div>
            </div>
            <button className="btn primary" onClick={load} disabled={busy}>
              {busy ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {err ? (
          <div className="col-12 card" style={{ borderColor: "rgba(220,38,38,0.3)", color: "#b91c1c" }}>
            {err}
          </div>
        ) : null}

        <div className="col-12 card sectionAccent">
          <h3 style={{ marginTop: 0 }}>Create user</h3>
          <form className="grid" onSubmit={create}>
            <div className="col-4">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="col-4">
              <label>Email</label>
              <input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div className="col-4">
              <label>Password</label>
              <input
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                type="password"
              />
            </div>
            <div className="col-6">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}>
                <option value="viewer">viewer</option>
                <option value="analyst">analyst</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div className="col-6">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <div className="col-12 row" style={{ justifyContent: "flex-end" }}>
              <button className="btn primary">Create</button>
            </div>
          </form>
        </div>

        <div className="col-12 card sectionAccent">
          <h3 style={{ marginTop: 0 }}>List</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <div className="row">
                      {["viewer", "analyst", "admin"].map((r) => (
                        <button
                          key={r}
                          className="btn"
                          style={{ opacity: u.role === r ? 1 : 0.72, borderColor: u.role === r ? "rgba(124,58,237,0.55)" : undefined }}
                          onClick={() => setRole(u, r)}
                          type="button"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${u.status === "active" ? "good" : "bad"}`}>{u.status}</span>
                  </td>
                  <td>
                    <button className="btn" onClick={() => toggleStatus(u)} type="button">
                      Toggle status
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={5} className="mutedText">
                    No users found.
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

