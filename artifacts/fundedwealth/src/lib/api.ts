/**
 * api.ts — Thin fetch wrapper for the FundedWealth backend API.
 *
 * All calls use getApiBase() which strips dead domains and falls back to
 * relative /api/* URLs (proxied by Vercel → Railway). Never hard-code
 * api.fundedwealth.com here — that domain is dead (Vercel 404).
 */
import { getApiBase } from "./api-base";

function getApiPrefix(): string {
  const base = getApiBase(); // "" | "https://fundedwealth-api-production.up.railway.app"
  return base ? `${base}/api` : "/api";
}

async function apiFetch(path: string, options?: RequestInit) {
  const prefix = getApiPrefix();
  const res = await fetch(`${prefix}${path}`, {
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
