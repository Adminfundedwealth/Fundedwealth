import { lazy, type ComponentType } from "react";

const CHUNK_RETRY_KEY = "fw_dynamic_import_retry";

/**
 * Detects if an error is a dynamic-import / chunk-load failure.
 */
function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || "";
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Unable to preload CSS") ||
    (msg.includes("Loading chunk") && msg.includes("failed"))
  );
}

/**
 * A drop-in replacement for React.lazy that handles chunk-load failures
 * by attempting one automatic page reload.
 *
 * Usage:
 *   const Home = lazyWithRetry(() => import("@/pages/home"));
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err) => {
      if (isChunkLoadError(err)) {
        try {
          const alreadyRetried = sessionStorage.getItem(CHUNK_RETRY_KEY);
          if (!alreadyRetried) {
            sessionStorage.setItem(CHUNK_RETRY_KEY, Date.now().toString());
            window.location.reload();
            // Return a never-resolving promise to prevent React from rendering
            // while the page reloads
            return new Promise<never>(() => {});
          }
        } catch {
          // sessionStorage unavailable — fall through to throw
        }
      }
      throw err;
    })
  );
}
