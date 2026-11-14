# PermitFlow — Cloudflare Pages Deployment

Deploy PermitFlow as a single Cloudflare Pages project:

- **Frontend:** static Vite build (`dist/`) on Cloudflare Pages (free tier, global CDN, automatic HTTPS).
- **AI roadmap:** `functions/api/roadmap.ts`, a Pages Function served at the same origin as `/api/roadmap`.
- **Secrets:** one Pages environment variable (`GEMINI_API_KEY`), server-side only.
- **Data:** `localStorage` on the user's device — there is no database.

```
                           ┌──────────────────────────────────────────────┐
  ┌──────────┐   HTTPS     │              Cloudflare Pages                │
  │  Browser │────────────▶│  dist/ (static SPA)        *.pages.dev       │
  │          │             │        │                                     │
  │          │             │        │ POST /api/roadmap                   │
  │          │             │        ▼                                     │
  │          │             │  functions/api/roadmap.ts                    │
  │          │             │  reads env.GEMINI_API_KEY                    │
  │          │             │        │                                     │
  └──────────┘             └────────┼─────────────────────────────────────┘
                                    ▼
                          Google Gemini REST API
```

> The Vercel setup (`api/roadmap.ts` + `vercel.json`) still works. Both server
> runtimes share validation/response logic in `server/roadmapCore.ts`.

---

## 1. Prerequisites

- [Node.js](https://nodejs.org) 20+ (the repo pins Node 22 in `.nvmrc`)
- [Git for Windows](https://git-scm.com/download/win) — **not currently installed on this machine**
- A [GitHub](https://github.com) account
- A [Cloudflare](https://dash.cloudflare.com/sign-up) account (free)
- A [Gemini API key](https://aistudio.google.com/apikey) (free tier)

---

## 2. Publish to GitHub

Run these from the **project folder** (the one containing `package.json`):

```powershell
cd "C:\Users\USER\Downloads\new launch permit-web-main\permit-web-main"

git init -b main
git add .
git status --short
```

Before committing, confirm `git status` does **not** list `node_modules/`, `dist/`,
`.env.local`, or `.dev.vars`. They are already in `.gitignore`. Then:

```powershell
git commit -m "PermitFlow: accessibility pass and Cloudflare deployment"
```

Create an empty repository on GitHub (no README, no .gitignore), then:

```powershell
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

If you install the GitHub CLI (`winget install --id GitHub.cli -e`), you can do
both steps at once:

```powershell
gh auth login
gh repo create permitflow --private --source . --remote origin --push
```

> The outer folder (`new launch permit-web-main`) only wraps the project. Create
> the Git repository inside `permit-web-main`, not one level up.

---

## 3. Create the Cloudflare Pages project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub and select the repository.
3. Production branch: **main**.
4. Build settings:

   | Setting | Value |
   |---------|-------|
   | Framework preset | **Vite** (or None) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (repository root) |
   | Node version | **22** (from `.nvmrc`; set `NODE_VERSION=22` if the build ignores it) |

5. **Environment variables** (Production **and** Preview):
   - `GEMINI_API_KEY` = your Gemini API key (mark as secret)
6. **Save and Deploy**.

Cloudflare installs dependencies with `npm ci`/`npm install`, builds the Vite
app, publishes `dist/`, and bundles `functions/` automatically. No extra config
file is required.

### What gets deployed

| Path | Source | Notes |
|------|--------|-------|
| `/` and assets | `dist/` | Vite output, hashed asset filenames |
| `/api/roadmap` | `functions/api/roadmap.ts` | Pages Function, same origin, no CORS |
| `/sw.js`, `/manifest.webmanifest` | `public/` → `dist/` | Service worker + PWA manifest |
| `/_headers` | `public/` → `dist/` | Security and cache headers |

The Pages Function calls the Gemini REST API directly, so the Node-only
`@google/genai` package is **not** bundled into the Workers runtime.

---

## 4. Verify the deployment

Replace `<project>` with your Pages subdomain.

```powershell
# 1. Home page loads
curl.exe -I https://<project>.pages.dev/

# 2. Unknown path serves the app shell (automatic SPA fallback)
curl.exe -I https://<project>.pages.dev/some/unknown/path

# 3. Security headers present
curl.exe -I https://<project>.pages.dev/ | Select-String "X-Content-Type-Options|X-Frame-Options|Referrer-Policy"

# 4. API wiring: no key configured -> JSON 503 (not HTML 404)
curl.exe -X POST https://<project>.pages.dev/api/roadmap -H "Content-Type: application/json" -d "{}"

# 5. Wrong method -> 405 JSON
curl.exe -I https://<project>.pages.dev/api/roadmap
```

Then in the browser:

- [ ] `/`, `/#/onboarding`, `/#/process`, `/#/services`, `/#/checklist`, `/#/about` render
- [ ] Unknown hash route (`/#/nope`) shows the styled 404 page
- [ ] Mobile drawer opens/closes, Escape closes it
- [ ] Complete onboarding step 4 → AI roadmap renders (or the deterministic fallback if Gemini is unavailable)
- [ ] DevTools → Network shows only same-origin `/api/roadmap`; no API key in any request or in `dist/`
- [ ] WhatsApp CTAs open `https://wa.me/2348127251853?text=...`
- [ ] Reloading a page serves the latest build (hard-refresh once if an old service worker is cached)

### Local reproduction

```powershell
npm run build
npx wrangler pages dev dist --port 8788
```

With a key (creates a local-only secret file, already gitignored):

```powershell
# .dev.vars
GEMINI_API_KEY=your-key-here

npx wrangler pages dev dist --port 8788
```

Then open `http://127.0.0.1:8788`. This runs the real Pages Function locally.

---

## 5. Custom domain

1. Pages project → **Custom domains** → **Set up a custom domain**.
2. Add `permitflow.example` (and optionally `www`).
3. If the domain is on Cloudflare, DNS is created automatically; otherwise add
   the CNAME Cloudflare shows.
4. HTTPS is issued and renewed automatically.

---

## 6. Routing

- The app uses **HashRouter**, so routes are `https://<domain>/#/onboarding`.
  The server only ever serves the root document for these.
- Cloudflare Pages treats a project **without a `404.html`** as an SPA and
  serves the app shell for unknown paths, so no `_redirects` file is needed.
  Do **not** add `/* /index.html 200`: current Pages versions detect it as an
  infinite loop and ignore it.
- Pages Functions (`/api/*`) are matched before the static fallback, so the AI
  endpoint is not swallowed by the SPA behavior.

---

## 7. Rollback and previews

- Every push to a non-production branch creates a **preview deployment** with
  its own URL. Verify there before merging.
- **Rollback:** Pages project → **Deployments** → choose a known-good deployment
  → **Rollback to this deployment**. No rebuild required.
- Environment variable changes require a new deployment to take effect.

---

## 8. Cost and security notes

- **Cost:** free static hosting + free Pages Functions allowance + free Gemini
  tier for low traffic. No database.
- `GEMINI_API_KEY` is read only in the Pages Function (`env.GEMINI_API_KEY`) and
  never referenced by client code or inlined into `dist/`.
- Response headers are set in `public/_headers`: `nosniff`, `DENY` framing,
  strict referrer policy, and a permissions policy that blocks camera,
  microphone, geolocation, and payment APIs (the app uses none).
- `index.html` and `sw.js` are sent with `Cache-Control: no-cache` so releases
  and service-worker updates are picked up; hashed `/assets/*` are immutable.
- **Not yet configured:** a Content-Security-Policy (the app loads Tailwind and
  Google Fonts from CDNs, so a CSP needs a deliberate allowlist) and API rate
  limiting. Both are recommended before broad public launch — use Cloudflare
  WAF rate-limiting rules on `/api/roadmap`, or add Turnstile to the form.

See `docs/DEPLOYMENT_CHECKLIST.md` for the release go/no-go checklist.
