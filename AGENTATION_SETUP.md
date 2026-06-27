# Agentation Setup

Agentation is a visual feedback tool for AI coding agents. It lets you annotate UI elements, leave comments, and send structured feedback to an AI agent while browsing the running app.

**Package:** `agentation@3.0.2`  
**Only loads in development — zero impact on production.**

---

## How It Works

The widget is mounted in `artifacts/fundedwealth/src/main.tsx` using a Vite-native dev guard:

```tsx
const AgentationWidget = import.meta.env.DEV
  ? lazy(() => import("agentation").then((m) => ({ default: m.Agentation })))
  : null;
```

- `import.meta.env.DEV` is `true` during `pnpm dev` and `false` during `pnpm build`
- Vite replaces `import.meta.env.DEV` with the literal `false` at build time
- The `null` branch means the dynamic `import("agentation")` call is never emitted into the production bundle — Rollup tree-shakes it entirely

---

## Running Locally

```bash
# From workspace root
pnpm --filter @workspace/api-server dev   # start backend on :9000
pnpm --filter @workspace/fundedwealth dev # start frontend on :5200
```

Open `http://localhost:5200` — the Agentation toolbar appears at the bottom of the page.

---

## Verifying Production Bundle Is Clean

After `pnpm --filter @workspace/fundedwealth build`, confirm agentation code is absent:

```powershell
Select-String -Path "artifacts\fundedwealth\dist\assets\*.js" -Pattern "agentation" -SimpleMatch
```

Expected output: nothing (no matches).

---

## Package Location

Installed as a `devDependency` in `artifacts/fundedwealth/package.json`:

```json
"devDependencies": {
  "agentation": "^3.0.2",
  ...
}
```

Since it is a `devDependency`, it is excluded from production installs (`pnpm install --prod`).

---

## Updating

```bash
pnpm --filter @workspace/fundedwealth update agentation
```
