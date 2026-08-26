import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./i18n";
import "./index.css";
import { lazy, Suspense, Component, type ReactNode } from "react";

// Agentation removed — dev-only tool, not for production.

// ── Chunk-load error detection ────────────────────────────────────────────────
const CHUNK_RETRY_KEY = "fw_dynamic_import_retry";

/**
 * Returns true if the error is specifically a dynamic-import / chunk-load failure
 * (not a general application error).
 */
function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || "";
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("ChunkLoadError") ||
    // Vite-specific: "Unable to preload CSS" can happen for the same reason
    msg.includes("Unable to preload CSS") ||
    // Generic fetch failure on a .js asset
    (msg.includes("Loading chunk") && msg.includes("failed"))
  );
}

/**
 * Attempt one automatic recovery by forcing a fresh page load.
 * Returns true if a reload was triggered (callers should bail out).
 */
function attemptChunkRecovery(): boolean {
  try {
    const alreadyRetried = sessionStorage.getItem(CHUNK_RETRY_KEY);
    if (alreadyRetried) {
      // Already retried once this session — don't loop
      return false;
    }
    // Mark that we're retrying so next failure won't loop
    sessionStorage.setItem(CHUNK_RETRY_KEY, Date.now().toString());
    // Force a clean reload bypassing browser cache
    window.location.reload();
    return true;
  } catch {
    // sessionStorage may be unavailable (private browsing edge cases)
    return false;
  }
}

// ── Error Boundary — catches any render crash and shows a recovery UI ──────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info);

    // If this is a chunk-load error, attempt automatic recovery (one reload)
    if (isChunkLoadError(error)) {
      const reloading = attemptChunkRecovery();
      if (reloading) return; // page is reloading — don't render error UI
    }
  }

  render() {
    if (this.state.error) {
      // For chunk-load errors that already retried, show a more specific message
      const isChunkError = isChunkLoadError(this.state.error);

      return (
        <div className="min-h-screen bg-[#0D0020] flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-white font-bold text-xl">Something went wrong</h2>
          <p className="text-white/50 text-sm max-w-md">
            {isChunkError
              ? "A new version of the app is available. Please refresh the page to continue."
              : (this.state.error as Error).message}
          </p>
          <button
            onClick={() => {
              // Clear the retry flag so a manual refresh gets a clean slate
              try { sessionStorage.removeItem(CHUNK_RETRY_KEY); } catch {}
              this.setState({ error: null });
              window.location.href = "/";
            }}
            className="mt-2 px-6 py-2 bg-[#4A00E0] text-white rounded-xl text-sm font-semibold hover:bg-[#5a10f0]"
          >
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * NOTE: SupabaseAuthProvider is owned by App.tsx.
 * This file is intentionally kept minimal.
 */
const App = lazy(() =>
  import("./App").catch((err) => {
    // If the initial App chunk fails to load, attempt recovery
    if (isChunkLoadError(err)) {
      attemptChunkRecovery();
    }
    // Re-throw so ErrorBoundary picks it up if recovery fails
    throw err;
  })
);

const Loading = () => (
  <div className="min-h-screen bg-[#0D0020] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#4A00E0] border-t-transparent rounded-full animate-spin" />
  </div>
);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
      {/* Agentation removed — dev-only tool, not for production */}
    </ErrorBoundary>
  </HelmetProvider>
);
