import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Records from "./pages/Records.jsx";
import Users from "./pages/Users.jsx";
import { getSession } from "./lib/auth.js";

function RequireAuth({ children }) {
  const { token } = getSession();
  const loc = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

function RequireRole({ allow, children }) {
  const { user } = getSession();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { token } = getSession();

  return (
    <div>
      <Nav />
      <div className="page">
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/records"
          element={
            <RequireAuth>
              <RequireRole allow={["analyst", "admin"]}>
                <Records />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <RequireRole allow={["admin"]}>
                <Users />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </div>
  );
}

