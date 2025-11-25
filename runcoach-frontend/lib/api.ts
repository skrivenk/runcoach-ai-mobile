import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api",
});

// attach token on every request in the browser
if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    const t = localStorage.getItem("rc_token");
    if (t) {
      (config.headers ??= {});
      config.headers["Authorization"] = `Bearer ${t}`;
    }
    return config;
  });
}

export function setAuth(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}
