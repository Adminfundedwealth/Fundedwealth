import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT || "5200";
const rawPortNum = Number(rawPort);
// On Vercel / CI PORT may not be set — fall back to 5200 instead of throwing
const port = Number.isNaN(rawPortNum) || rawPortNum <= 0 ? 5200 : rawPortNum;

const basePath = process.env.BASE_PATH || "/";
const host = "0.0.0.0";

export default defineConfig({
  base: basePath,
  envDir: path.resolve(import.meta.dirname, "..", ".."),
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer({
            root: path.resolve(import.meta.dirname, ".."),
          }),
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) =>
          m.devBanner(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      react: path.resolve(import.meta.dirname, "node_modules", "react"),
      "react-dom": path.resolve(import.meta.dirname, "node_modules", "react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "wouter",
      "framer-motion",
      "recharts",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-toast",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-slot",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-accordion",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "react-helmet-async",
      "i18next",
      "react-i18next",
      "zod",
      "lightweight-charts",
    ],
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          radix: ["@radix-ui/react-dialog", "@radix-ui/react-tooltip"],
          supabase: ["@supabase/supabase-js"],
          icons: ["lucide-react"],
        },
      },
    },
  },
  server: {
    port,
    host,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:9010",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:9010",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    port,
    host,
    allowedHosts: true,
  },
});
