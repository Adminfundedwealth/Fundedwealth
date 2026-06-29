import { createRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
import { lazy, Suspense, Component, type ReactNode } from "react";

// Agentation removed — dev-only tool, not for production.

// ── Error Boundary — catches any render crash and shows a recovery UI ──────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0D0020] flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-white font-bold text-xl">Something went wrong</h2>
          <p className="text-white/50 text-sm max-w-md">{(this.state.error as Error).message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}
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
const App = lazy(() => import("./App"));

const Loading = () => (
  <div className="min-h-screen bg-[#0D0020] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#4A00E0] border-t-transparent rounded-full animate-spin" />
  </div>
);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
    {/* Agentation removed — dev-only tool, not for production */}
  </ErrorBoundary>
);
