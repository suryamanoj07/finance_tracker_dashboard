const API_BASE =  import.meta.env.VITE_API_BASE_URL  || "http://localhost:8080";

export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}

export const api = {
  login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password }, auth: false }),
  meHealth: () => request("/health", { auth: false }),

  dashboardSummary: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/dashboard/summary${q ? `?${q}` : ""}`);
  },
  dashboardTrends: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/dashboard/trends${q ? `?${q}` : ""}`);
  },

  listRecords: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/records${q ? `?${q}` : ""}`);
  },
  createRecord: (payload) => request("/api/records", { method: "POST", body: payload }),
  deleteRecord: (id) => request(`/api/records/${id}`, { method: "DELETE" }),

  listUsers: () => request("/api/users"),
  createUser: (payload) => request("/api/users", { method: "POST", body: payload }),
  patchUser: (id, payload) => request(`/api/users/${id}`, { method: "PATCH", body: payload }),
};

