# PermitFlow — Zero-Cost Production Deployment

> **Deploying to Cloudflare Pages?** Follow
> [`docs/CLOUDFLARE_DEPLOYMENT.md`](./CLOUDFLARE_DEPLOYMENT.md) instead. This
> document describes the Vercel deployment, which remains supported as an
> alternative. Both platforms share validation/response logic in
> `server/roadmapCore.ts`.

PermitFlow deploys to a **fully free** architecture: static frontend hosting with
automatic HTTPS, plus one serverless edge function for the AI feature. No paid
database, no paid infrastructure, no always-on server.

- Frontend: **Vercel static hosting** (free tier, 100 GB bandwidth/mo, SSL by default)
- AI: **`api/roadmap.ts`** — a Vercel **edge function** proxying a single Gemini call
- Secrets: **Vercel environment variables**, server-side only
- Data: **`localStorage`** on the user's device — there is no backend database

```
                         ┌─────────────────────────────────────────────┐
                         │                 Vercel (free)               │
   ┌──────────┐          │                                             │
   │  User     │──HTTPS──▶  Static build (dist/)           ┌─────────┐ │
   │  browser  │          │  *.vercel.app or custom domain │  CDN    │ │
   │           │          │                                └────┬────┘ │
   └──────────┘          │                                     │      │
        │                │   POST /api/roadmap ─────────────────▶      │
        │  localStorage  │        │ edge function (api/roadmap.ts)     │
        │  (no DB)       │        │ reads process.env.GEMINI_API_KEY   │
        │                │        ▼                                    │
        │                │   Google Gemini API                         │
        └────────────────┴─────────────────────────────────────────────┘
```

---

## 1. Prerequisites

- [Node.js](https://nodejs.org) **18+** (the project builds with Vite 6)
- A [Vercel](https://vercel.com) account (free) — OAuth with GitHub/GitLab works
- A [Gemini API key](https://aistudio.google.com/apikey) (free tier)
- Git repository of this project pushed to GitHub (recommended so Vercel can
  auto-deploy on push)

---

## 2. Local verification before deploy

Run these exactly as CI would:

```bash
npm install
npx tsc --noEmit        # type check — must exit clean
npm test                # vitest — 145 tests, all passing
npm run build           # Vite production build → dist/
npm run preview         # serve the production build locally (dev only for API)
```

- Local AI feature: `npx vercel dev` (runs both the frontend and the edge function).
- Without a Gemini key, AI degrades gracefully to the deterministic fallback
  roadmap — the API returns a generic error that the client maps to a fallback.

---

## 3. Deploy to Vercel (GitHub import — recommended)

1. Commit and push: `git push origin main`
2. Go to **https://vercel.com/new**
3. Import the repository. Vercel auto-detects the **Vite** framework and fills:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
   - Node version: 20.x (or latest LTS)
4. **Settings → Environment Variables**: add `GEMINI_API_KEY`
   (see `docs/ENVIRONMENT_VARIABLES.md`) and apply to **Production** (+ Preview
   if desired).
5. Click **Deploy**. Vercel runs the build, publishes `dist/`, and provisions
   **HTTPS automatically** on `https://<project>.vercel.app`.
6. Every subsequent `git push` to the production branch auto-deploys.

### CLI alternative

```bash
npx vercel --prod
# Environment variables via dashboard (or `npx vercel env add`)
```

### Custom domain (optional, free to add, DNS on your end)

1. Settings → Domains → add `permitflow.example`
2. Add the CNAME record Vercel shows on your DNS provider
3. HTTPS is issued and renewed automatically (Let's Encrypt via Vercel)

---

## 4. SPA routing (this app uses HashRouter)

- The router is `HashRouter` (`App.tsx` → `HashRouter`), so every route lives
  under `/#/...` (e.g. `https://site.vercel.app/#/dashboard`). The browser only
  ever requests the root document, and deep links/project tabs survive reloads.
- As a safety net for any non-hash path or a future switch to `BrowserRouter`,
  `vercel.json` rewrites all non-`/api` paths to `/index.html`:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- `/api/*` is intentionally excluded so the edge function keeps its own route.
- Unknown routes render the styled `NotFound` 404 page.

### API routing

- `api/roadmap.ts` declares its own edge runtime inline
  (`export const config = { runtime: 'edge' }`), so no `functions` block in
  `vercel.json` is needed. The old legacy `functions` block and the redundant
  `/api/$1` passthrough were removed.
- Client calls are **same-origin** (`fetch('/api/roadmap')` in
  `services/geminiService.ts`) — no CORS required.

---

## 5. Environment variables (server-side)

Exactly one variable exists; see `docs/ENVIRONMENT_VARIABLES.md`:

| Variable | Where it's read | Browser exposure |
|----------|-----------------|------------------|
| `GEMINI_API_KEY` | `api/roadmap.ts` (`process.env`) | **Never** |

There are **no `VITE_*` variables** — the client bundle contains no
`import.meta.env`/`process.env` references (verified against the build).

---

## 6. No secrets in Git

- `.gitignore` excludes `.env`, `.env.local`, `.env.*.local` — env files with
  real values must never be committed.
- `.env.example` is committed by design; it contains **no real value**.
- Before pushing, sweep for a leaked key:

```bash
grep -RInE "AIza[0-9A-Za-z_-]{30,}|GEMINI_API_KEY=" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v "^\./dist/"
```

- If a key was ever committed: rotate it at aistudio.google.com, remove it from
  history, and update the Vercel variable.

---

## 7. Production error handling (already implemented)

| Failure | Behavior |
|---------|----------|
| Runtime render crash | `ErrorBoundary` shows a branded "Something went wrong" screen with **Refresh** and **Go Home**; error logged to console, no stack shown to users |
| Unknown route | `NotFound` 404 page with links back to Home/Dashboard |
| AI upstream 429 / 5xx / timeout / missing key / invalid JSON | `api/roadmap.ts` classifies and returns a generic JSON error code only (no internals, no key data); `services/geminiService.ts` maps every failure to the deterministic, engine-only fallback roadmap, so the UI always renders structured content |
| Malformed `localStorage` data | `services/projectStore.ts` (versioned envelope) wraps reads in try-catch and recovers safely |
| Gemini key missing in production | `/api/roadmap` → `503` → graceful AI-off fallback; static site keeps working |

---

## 8. Build verification checklist (run before every release)

| # | Check | Command / how |
|---|-------|----------------|
| 1 | **Build succeeds** | `npm run build` exits 0, emits `dist/` |
| 2 | **Routes work** | Visit `/`, `/#/onboarding`, `/#/dashboard`, `/#/checklist`, an unknown route → 404 page |
| 3 | **Mobile works** | DevTools responsive mode (375px–768px): navigation drawer, modal overlays, dashboard grid |
| 4 | **AI request works** | Complete onboarding step 4 → "View my assessment" → roadmap renders; with key via `vercel dev`, without key the fallback roadmap shows |
| 5 | **Secret unavailable in browser** | `grep -R "GEMINI_API_KEY\|AIza" dist/` returns nothing; DevTools → Network shows only the same-origin `/api/roadmap` call, never a key |
| 6 | **WhatsApp CTA works** | Click each WhatsApp CTA; opens `https://wa.me/2348127251853?text=<prefilled>` with the correct number/message (number is centralized in `services/whatsapp.ts`) |
| 7 | **Error handling works** | Force a render error (temporary throw) → ErrorBoundary shows; check Network for `/api/roadmap` failure → fallback roadmap; verify no uncaught console errors |

### Automated subset (runs locally)

```bash
npx tsc --noEmit && npm test && npm run build
```

---

## 9. Rollback & previews

- **Preview deployments**: every PR/branch push gets its own `*.vercel.app` URL
  (no cost). Confirm the 7 checks there before merging.
- **Rollback**: Vercel → Deployments → ⋯ → **Promote to Production** an older,
  known-good deployment. Instant, no rebuild.

---

## 10. Cost & security posture notes

- **Cost:** $0. Static hosting + edge function on the Vercel free tier. No
  database is provisioned (data lives in each user's `localStorage`).
- **Known, documented trade-offs** (tracked in `docs/SECURITY_REMEDIATION.md`):
  no rate limiting on `/api/roadmap`, no request auth/JWT, no CORS whitelist
  (same-origin only), no CSP headers. Acceptable for a low-traffic MVP; revisit
  before broad public launch.
- **WhatsApp number**: configured centrally in `WHATSAPP_PHONE` in
  `services/whatsapp.ts` (`2348127251853`); contact email centrally in
  `CONTACT_EMAIL` in `constants.ts` (`permitflowinfo@gmail.com`).