import { setToken, getToken } from "./api.js";

const KEY = "session_user";

export function getSession() {
  const token = getToken();
  const raw = localStorage.getItem(KEY);
  const user = raw ? JSON.parse(raw) : null;
  return { token, user };
}

export function setSession({ token, user }) {
  setToken(token);
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearSession() {
  setToken(null);
  localStorage.removeItem(KEY);
}

