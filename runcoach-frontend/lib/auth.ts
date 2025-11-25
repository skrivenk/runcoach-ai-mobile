import { api, setAuth } from "./api";

const KEY = "rc_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}
export function setToken(t: string) {
  localStorage.setItem(KEY, t);
  setAuth(t);
}
export function clearToken() {
  localStorage.removeItem(KEY);
  setAuth(null);
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  setToken(data.access_token);
  return data;
}
export async function register(email: string, password: string) {
  const { data } = await api.post("/auth/register", { email, password });
  setToken(data.access_token);
  return data;
}

// initialize axios with any existing token on first import (client-side)
if (typeof window !== "undefined") {
  const t = getToken();
  if (t) setAuth(t);
}
