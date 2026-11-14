# PermitFlow — Performance Report

> Measurements-based optimization pass. Every change below is backed by a
> before/after production build. No changes were made on guesses.

---

## 1. Baseline (before any optimization)

`npm run build` (Vite 6.4.3, production):

| Asset | Size | gzip |
|-------|------|------|
| `index.html` | 5.14 kB | 1.57 kB |
| `assets/index-BRD4o9OB.js` | **575.36 kB** | **153.91 kB** |
| `assets/hero_bg_*.jpg` | 1,130.03 kB | — |
| `assets/solutions_img_*.jpg` | 784.39 kB | — |

- **78 modules** transformed into a **single monolithic JS bundle**.
- The home route (`/`) downloaded the *entire application* including the
  1,170-line `DocumentViewerModal`, 1,010-line `DocumentChecklistCalculator`,
  1,162-line `Onboarding`, and 903-line `Dashboard` — even though none of them
  appear on the landing page.
- Vite emitted a **"chunk larger than 500 kB"** warning.

---

## 2. Applied optimizations (evidence-backed)

### 2.1 Route-level code splitting — `App.tsx`
The three heavy routes are loaded lazily via `React.lazy` + a shared
`Suspense` fallback in the existing design system:

- `/onboarding` → `views/Onboarding` (1,162 lines)
- `/checklist`, `/simulator` → `views/ChecklistSimulator` (wraps the 1,010-line calculator)
- `/dashboard` → `views/Dashboard` (903 lines + 9 dashboard components)

Static/small views (`Landing`, `Process`, `Services`, `About`, `NotFound`)
stay eager so the home page renders with zero async waiting.

### 2.2 Lazy-load heavy module on demand — `views/Dashboard.tsx`
`DocumentViewerModal` (1,170-line CAD/SVG viewer) was statically imported by
`Dashboard`, so it shipped with the dashboard chunk even though it only opens
when a user clicks **Preview Plan**. It is now loaded with `React.lazy` inside
the existing `previewingDoc &&` guard, wrapped in `Suspense`.

### 2.3 Third-party resource hints — `index.html`
Added `rel="preconnect"` for `fonts.googleapis.com` and `fonts.gstatic.com`
so the Inter + Material Icons stylesheets start DNS/TLS plus the first request
earlier.

### 2.4 Image loading — `views/Landing.tsx`
`solutions_img_*.jpg` (784 kB) sits in the below-the-fold Trust section.
Added `loading="lazy"` + `decoding="async"` so it is no longer fetched or
decoded until the user scrolls near it.

---

## 3. After measurement

`npm run build` (same command):

| Asset | Size | gzip |
|-------|------|------|
| `index.html` | 5.28 kB | 1.60 kB |
| `assets/index-BLTqCTK3.js` (initial) | **307.54 kB** | **92.85 kB** |
| `assets/engine-*.js` (shared rules) | 30.06 kB | 7.04 kB |
| `assets/Onboarding-*.js` | 49.29 kB | 12.72 kB |
| `assets/ChecklistSimulator-*.js` | 54.72 kB | 12.74 kB |
| `assets/Dashboard-*.js` | 93.39 kB | 21.33 kB |
| `assets/DocumentViewerModal-*.js` | 42.58 kB | 10.27 kB |
| `assets/hero_bg_*.jpg` | 1,130.03 kB | — |
| `assets/solutions_img_*.jpg` | 784.39 kB | — |

### Impact on initial load (`/`)

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Initial JS (raw) | 575.36 kB | 307.54 kB | **−267.82 kB (−46.5%)** |
| Initial JS (gzip) | 153.91 kB | 92.85 kB | **−61.06 kB (−39.7%)** |
| JS modules fetched at startup | all 78 | landing/shared only | deferred |
| >500 kB chunk warning | present | **gone** | — |

Landing page no longer downloads Onboarding, Dashboard, ChecklistSimulator, or
the DocumentViewer — those chunks load only when their route/feature is actually
reached.

### Deferred payload (gzip, loaded on demand)

| Route / action | Extra JS (raw / gzip) |
|----------------|-----------------------|
| `/dashboard` | 93.39 kB / 21.33 kB |
| `/checklist` | 54.72 kB / 12.74 kB |
| `/onboarding` | 49.29 kB / 12.72 kB |
| Preview a document | 42.58 kB / 10.27 kB |
| shared rules engine | 30.06 kB / 7.04 kB |

---

## 4. Verification

- `npx tsc --noEmit` — clean.
- `npm test` — **145/145 passing** (12 files), including both journey suites
  (they render `Dashboard`/`Onboarding` directly, so lazy routes do not affect them).
- `npm run build` — succeeded in 3.01s with no warnings.

---

## 5. Areas inspected but intentionally NOT changed (and why)

| Area | Finding | Decision |
|------|---------|----------|
| `@google/genai` (AI SDK) | Imported **only** by `api/roadmap.ts` (server-side Vercel function). No client import exists in `services/geminiService.ts` — it calls `/api/roadmap` via `fetch`. | No client cost to remove. The `index.html` importmap entry is inert for the production bundle. |
| Hero image (1.13 MB) | Above-the-fold CSS `background-image` on the landing hero — required for LCP; cannot be lazy-loaded as an `<img>`. | Kept as-is. **Recommendation:** re-encode to a compressed JPEG/WebP (no image tooling or encoder available in this environment, and new dependencies are not permitted). |
| Tailwind CDN | Loads the full runtime CSS generator (~300+ kB JS) on every page. | Swapping to a build-time pipeline is a styling-infrastructure change, not a measured fix; out of scope per the task. Documented as a known opportunity (would move Tailwind CSS generation fully into the build). |
| Rerenders | `useMemo` already guards the expensive derivations (NotificationCenter regeneration, dashboard derivations). Lists are small; no hot-path recomputation was measurable. | No speculative changes — avoids complexity with no measured benefit. |
| `hero_bg` loaoding | Above fold; kept eager. `solutionsImg` now lazy. | Favors LCP over speculative idle prefetch. |

---

## 6. Remaining opportunities (requires tooling/dependency approval)

1. Re-encode `hero_bg` (1,130 kB) and `solutions_img` (784 kB) — e.g. quality-tuned
   JPEG or WebP — the single largest remaining payload on the home route
   (~1.9 MB combined, ~2× the JS+gzip total).
2. Replace the Tailwind runtime CDN with a build-time stylesheet to cut the
   third-party JS/CSS execution cost per load.
3. Optionally `manualChunks` the shared vendor (react/react-dom/router) once the
   initial chunk approaches the warning threshold again.