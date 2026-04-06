import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { setSession } from "../lib/auth.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin12345!");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => email.trim() && password.trim() && !busy, [email, password, busy]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await api.login(email, password);
      setSession(res);
      nav("/");
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container loginPage">
      <div className="card loginPanel" style={{ maxWidth: 560, margin: "48px auto" }}>
        <h2 style={{ marginTop: 0 }}>Sign in</h2>
        <p className="mutedText" style={{ marginTop: 6 }}>
          Use the bootstrap admin to get started, then create other users from the Users page.
        </p>

        <form onSubmit={onSubmit} className="grid">
          <div className="col-12">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="col-12">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
            />
          </div>

          {err ? (
            <div className="col-12">
              <div className="loginErrorCard">
                {err}
              </div>
            </div>
          ) : null}

          <div className="col-12 row" style={{ justifyContent: "flex-end" }}>
            <button className="btn primary" disabled={!canSubmit}>
              {busy ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

