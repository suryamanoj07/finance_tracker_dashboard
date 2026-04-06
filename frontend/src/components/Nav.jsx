import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../lib/auth.js";

export default function Nav() {
  const loc = useLocation();
  const nav = useNavigate();
  const { user } = getSession();

  function logout() {
    clearSession();
    nav("/login");
  }

  const role = user?.role;
  const links = [
    { to: "/", label: "Dashboard", show: !!user },
    { to: "/records", label: "Records", show: role === "analyst" || role === "admin" },
    { to: "/users", label: "Users", show: role === "admin" },
  ].filter((l) => l.show);

  return (
    <div className="card" style={{ padding: 14, marginBottom: 16 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="row" style={{ alignItems: "center" }}>
          <div style={{ fontWeight: 800, letterSpacing: 0.3 }}>Finance Dashboard</div>
          {user ? <span className="pill">{user.email} • {user.role}</span> : <span className="pill">not logged in</span>}
        </div>

        <div className="row" style={{ alignItems: "center" }}>
          {links.map((l) => {
            const active = loc.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className="btn"
                style={{ opacity: active ? 1 : 0.82, borderColor: active ? "rgba(124, 58, 237, 0.55)" : undefined }}
              >
                {l.label}
              </Link>
            );
          })}
          {user ? (
            <button className="btn danger" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

