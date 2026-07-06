/**
 * api.ts — Thin fetch wrapper for the FundedWealth backend API.
 *
 * Routing:
 * - In production: VITE_API_URL points to the Render backend (e.g. https://fundedwealth-api.onrender.com)
 *   All calls go to VITE_API_URL/api/*
 * - In development: relative /api/* (Vite proxy forwards to localhost:9000 or Render)
 */

const API_PREFIX = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : "https://fundedwealth-api-production.up.railway.app/api";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export const api = {
  get: (path: string, options?: RequestInit) => apiFetch(path, options),
  post: (path: string, body: unknown) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) =>
    apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch(path, { method: "DELETE" }),
};
