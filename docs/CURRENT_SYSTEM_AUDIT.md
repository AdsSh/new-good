# Current System Audit — PermitFlow

> **Superseded in part:** the project dashboard (`views/Dashboard.tsx`,
> `views/dashboard/*`, `views/dashboard-types.ts`), its storage module
> (`services/projectStore.ts`), `NotificationCenter`, and `DocumentViewerModal`
> were removed. References to them below are historical.

> Generated from source code inspection. All findings are evidence-based.
> Last audited: 2026-08-29

---

## 1. Repository Inventory

### 1.1 File Manifest (All Source Files)

| File | Lines | Role |
|------|-------|------|
| `index.html` | 115 | HTML shell, Tailwind CDN config, import maps |
| `index.tsx` | 16 | React DOM entry point |
| `App.tsx` | 32 | Root component with HashRouter |
| `types.ts` | 48 | TypeScript enums and interfaces |
| `constants.ts` | 126 | App-wide constants, service packages, phases, about data |
| `vite.config.ts` | 23 | Vite build config + env injection |
| `tsconfig.json` | 29 | TypeScript compiler options |
| `package.json` | 23 | Dependencies and scripts |
| `metadata.json` | 11 | AI Studio app metadata |
| `services/geminiService.ts` | 357 | Structured AI roadmap client (request whitelist, normalize, fallback) |
| `components/Layout.tsx` | 563 | App shell (Navbar + Footer + WhatsApp FAB) |
| `components/NotificationCenter.tsx` | 541 | Notification dropdown + simulation controls |
| `components/DocumentChecklistCalculator.tsx` | 1010 | Interactive document checklist + timeline |
| `components/DocumentViewerModal.tsx` | 1170 | CAD/survey/structural document viewer |
| `views/Landing.tsx` | 146 | Hero + CTA home page |
| `views/Onboarding.tsx` | 1162 | 4-step progressive-disclosure wizard (engine-driven readiness) |
| `views/Process.tsx` | 98 | LASPPPA 5-stage approval timeline |
| `views/Services.tsx` | 170 | Service packages + pricing |
| `views/ChecklistSimulator.tsx` | 127 | Wrapper for DocumentChecklistCalculator |
| `views/About.tsx` | 143 | Mission, team, testimonials |
| `views/Dashboard.tsx` | 2042 | Main project dashboard (god-component) |
| `views/Portfolio.tsx` | 62 | Portfolio showcase (UNUSED — not in routes) |
| `src/assets/images/` | — | 2 JPG images (hero_bg, solutions_img) |

**Total TypeScript/TSX source:** ~7,600 lines across 20 files.

### 1.2 Dependencies

**Runtime:**
- `react` ^19.2.3
- `react-dom` ^19.2.3
- `react-router-dom` ^7.11.0
- `@google/genai` ^1.34.0

**Dev:**
- `vite` ^6.2.0
- `@vitejs/plugin-react` ^5.0.0
- `typescript` ~5.8.2
- `@types/node` ^22.14.0

**CDN (loaded in index.html):**
- Tailwind CSS (with forms + typography plugins)
- Google Fonts (Inter: 300–700)
- Google Material Icons (Outlined)

### 1.3 Build & Dev Scripts

```json
"dev": "vite"          // port 3000, host 0.0.0.0
"build": "vite build"  // outputs to dist/
"preview": "vite preview"
```

No lint, typecheck, or test scripts exist.

### 1.4 Environment Variables

| Variable | Source | Mechanism |
|----------|--------|-----------|
| `GEMINI_API_KEY` | `.env.local` (dev) / Vercel env vars (prod) | **Server-side only** — read by `api/roadmap.ts` edge function via `process.env`; never in the client bundle |

**No `.env`, `.env.local`, or `.env.example` files exist in the repository.** See
`docs/AI_ARCHITECTURE.md` for the full AI request/response/safety contract.

---

## 2. Architecture Audit

### 2.1 Routing

| Path | Component | In Nav? | Notes |
|------|-----------|---------|-------|
| `/` | `Landing` | Yes | Home page |
| `/onboarding` | `Onboarding` | Yes (via CTA) | 4-step wizard |
| `/process` | `Process` | Yes | Static timeline page |
| `/services` | `Services` | Yes | Pricing page |
| `/checklist` | `ChecklistSimulator` | Yes | Document checklist |
| `/simulator` | `ChecklistSimulator` | No | **DUPLICATE of /checklist** |
| `/about` | `About` | Yes | Company info |
| `/dashboard` | `Dashboard` | Yes | Project management |

**Issues:**
- `/simulator` and `/checklist` both render the same component with no redirect.
- `Portfolio.tsx` exists but is **never imported in App.tsx** — dead code.
- No 404/catch-all route.
- No lazy loading — all views eagerly imported.

### 2.2 State Management

**All state is local (`useState`).** No React Context, Zustand, Redux, or other state management.

**Cross-component communication:**
- `Layout.tsx` reads `localStorage.userProjects` to show project count badge.
- `Layout.tsx` listens to `window.addEventListener('storage', ...)` for cross-tab sync.
- `NotificationCenter.tsx` reads/writes `localStorage` for notification read/dismissed/custom state.
- `Dashboard.tsx` reads/writes `localStorage.userProjects` and `localStorage.currentProject`.
- `Onboarding.tsx` reads/writes `localStorage.userProjects` and `localStorage.currentProject`, and auto-saves in-progress wizard state to `permitflow_onboarding_draft`.

**Dashboard.tsx has 19+ `useState` hooks** — a clear signal that state needs externalization.

### 2.3 Data Flow

```
Onboarding (step 1-4)
  → localStorage.currentProject (JSON)
  → localStorage.userProjects (JSON array)
  → navigate('/dashboard')

Dashboard
  → reads localStorage on mount
  → seeds with SEED_PROJECTS if empty
  → merges SEED_PROJECTS if missing IDs
  → writes back on every mutation
  → activeProject synced to localStorage.currentProject

NotificationCenter
  → reads projects prop from Dashboard
  → generates notifications from project status
  → reads/writes 3 localStorage keys for persistence

Layout (Navbar)
  → reads localStorage.userProjects for badge count
  → listens to storage events for cross-tab sync
```

### 2.4 Component Hierarchy

```
<App>
  <HashRouter>
    <Layout>                          (Navbar + Footer + WhatsApp FAB)
      <Routes>
        <Landing />
        <Onboarding />
        <Process />
        <Services />
        <ChecklistSimulator />
        <About />
        <Dashboard>
          <NotificationCenter />      (child of Dashboard)
          <DocumentViewerModal />     (child of Dashboard)
        </Dashboard>
      </Routes>
    </Layout>
  </HashRouter>
</App>
```

---

## 3. Feature Status Audit

### 3.1 Production-Ready Features

| Feature | Evidence |
|---------|----------|
| Landing page | Fully rendered, responsive, all links functional |
| Process timeline | Static content from constants.ts, renders correctly |
| Services page | Static content, WhatsApp quote links functional |
| About page | Static content from constants.ts, renders correctly |
| Navigation (desktop + mobile) | Fully responsive, mobile drawer, active state tracking |
| WhatsApp integration | `wa.me` deep links with pre-filled messages throughout |
| Dark mode toggle | CSS class-based via Tailwind `dark:` prefix (manual toggle not visible — may rely on `prefers-color-scheme`) |
| Checklist Simulator | Interactive document toggles, timeline calculation |

### 3.2 Prototype-Only / Simulated Features

| Feature | Evidence |
|---------|----------|
| **Confetti animation** | `Dashboard.tsx:120-164` — Canvas-based `ConfettiParticle` class. Triggers on task completion. No cleanup on unmount (memory leak). |
| **Notification simulation** | `NotificationCenter.tsx:214-252` — "Trigger Query" and "Advance Stage" buttons create fake notifications. Not connected to any backend. |
| **File upload** | `Dashboard.tsx:563-581` — Uses `FileReader` API to read files into memory. Data stored in localStorage as metadata only (no actual file storage). |
| **Document viewer** | `DocumentViewerModal.tsx:1170 lines` — Renders inline SVG "blueprints" for CAD, survey, and structural documents. These are **synthetic placeholder renderings**, not actual document previews. |
| **Team member profiles** | `Dashboard.tsx:64-67` — Hardcoded `TEAM_MEMBERS` with Unsplash URLs. Not from any backend. |
| **Seed projects** | `Dashboard.tsx:166-288` — 4 hardcoded projects injected on first load. Demo data, not real. |

### 3.3 Broken Features

| Feature | Evidence | Severity |
|---------|----------|----------|
| ~~**Gemini API key in client bundle**~~ | **FIXED** — `vite.config.ts` has no `define` block; the key moved to the server-side edge function `api/roadmap.ts` (`process.env.GEMINI_API_KEY`). See `docs/AI_ARCHITECTURE.md` §8. | ~~**CRITICAL**~~ |
| **No `.env.local` file** | `README.md` says "Set the GEMINI_API_KEY in .env.local" but no such file exists. Create one (or set Vercel env vars) before calling /api/roadmap. | **HIGH** |
| **Portfolio.tsx dead code** | `views/Portfolio.tsx` is never imported or routed. Contains placeholder data referencing US cities (San Francisco, Austin, New York) — inconsistent with Lagos-focused product. | **LOW** |

### 3.4 Incomplete Features

| Feature | Evidence |
|---------|----------|
| **Dark mode toggle** | No visible toggle button in the UI. The Tailwind `dark:` classes are present throughout, but `darkMode: 'class'` in config requires a `class="dark"` on `<html>`. No mechanism to toggle this is implemented. |
| **Privacy Policy / Terms** | Footer links (`Layout.tsx:535-536`) are `<a href="#">` — non-functional placeholders. |
| **Email field in onboarding** | `<input type="email">` on step 4 has no `value` or `onChange` handler. |
| **Print dossier** | `Dashboard.tsx:1402` — `onClick={() => window.print()}` — no print stylesheet exists, result will be unstyled. |

### 3.5 Duplicated Code

| Duplication | Occurrences | Files |
|-------------|-------------|-------|
| WhatsApp SVG icon (`<path d="M12.031...`) | 7+ | Dashboard.tsx, Layout.tsx, Services.tsx, ChecklistSimulator.tsx, DocumentChecklistCalculator.tsx |
| Toast setTimeout pattern | 6+ | Dashboard.tsx (lines 446, 475, 493, 550, 588, 2036) |
| localStorage read/parse/try-catch | 4 | Dashboard.tsx, Onboarding.tsx, NotificationCenter.tsx, Layout.tsx |
| `getWhatsAppQuoteLink()` calls | 15+ | Across every view and layout component |

---

## 4. Security Audit

### 4.1 Fixed: API Key Exposure

**Status: FIXED.** The `define` block is gone from `vite.config.ts` (no static
env injection exists), and `services/geminiService.ts` no longer constructs a
`GoogleGenAI` instance or reads any env var.

**Current design:** the Gemini key is read only on the server by
`api/roadmap.ts` (`process.env.GEMINI_API_KEY`). The browser only ever calls
`POST /api/roadmap`. See `docs/AI_ARCHITECTURE.md` for the full contract and
safety rules.

### 4.2 Medium: localStorage Trust

Multiple components parse `localStorage` data and use it directly without schema validation:

- `Dashboard.tsx:336` — `JSON.parse(storedUserProjects)` → used as `PermitProject[]`
- `Dashboard.tsx:357` — `JSON.parse(storedCurrentProject)` → used as `PermitProject`
- `Onboarding.tsx:44` — `JSON.parse(saved)` → used as checklist summary
- `NotificationCenter.tsx:35,43,53` — Three separate localStorage reads, all `JSON.parse` with no validation

Malicious or corrupted localStorage data could cause runtime errors or inject unexpected UI.

### 4.3 Low: No XSS via dangerouslySetInnerHTML

**Good news:** No `dangerouslySetInnerHTML` usage found anywhere. All user content rendered via React text interpolation (auto-escaped).

### 4.4 Low: Predictable IDs

- `Onboarding.tsx:67` — `Math.random().toString(36).substr(2, 6).toUpperCase()`
- `Dashboard.tsx:499` — `Math.random().toString(36).substr(2, 9)`
- `Dashboard.tsx:537` — Same pattern for document IDs

Not a security risk for internal use, but IDs are predictable.

---

## 5. Performance Audit

### 5.1 Bundle Size Concerns

| Issue | Impact |
|-------|--------|
| No code splitting / lazy loading | All 8 view components loaded on initial page load |
| `@google/genai` eagerly imported | ~large SDK bundled even though only used in one async function |
| DocumentViewerModal (1170 lines) always bundled | SVG sub-renderers loaded even when modal is closed |
| Tailwind CDN script | Full Tailwind runtime loaded in browser (vs. purged CSS in build) |

### 5.2 Rendering Concerns

| Issue | Location | Impact |
|-------|----------|--------|
| `canvasRef` uses `window.innerWidth/Height` at render time | Dashboard.tsx:735 | Never updates on resize |
| `(activeProject.tasks \|\| []).map(...)` creates new array ref | Dashboard.tsx:1606 | Unnecessary re-renders |
| Inline arrow functions in `.map()` | Dashboard.tsx:746, 994, 1151, 1300+ | New function refs every render |
| `navLinks` array recreated every render | Layout.tsx:71-117 | Stable data re-created |
| Confetti `cancelAnimationFrame` not called on unmount | Dashboard.tsx:410-431 | Memory leak risk |

### 5.3 localStorage Performance

Every keystroke in Dashboard's quick notes textarea triggers:
1. `setProjects` (state update)
2. `localStorage.setItem('userProjects', ...)` (full serialization)
3. `localStorage.setItem('currentProject', ...)` (full serialization)

This runs on every `onChange` event with no debouncing.

---

## 6. Accessibility Audit

### 6.1 ARIA Labels

| Element | Has aria-label? | Location |
|---------|-----------------|----------|
| Mobile nav toggle | Yes | Layout.tsx:304 |
| Notification button | Yes | NotificationCenter.tsx:268 |
| Desktop nav links | No | Layout.tsx:188 |
| Filter buttons (status) | No | Dashboard.tsx:917-984 |
| Filter buttons (type) | No | Dashboard.tsx:1026-1039 |
| Sort dropdown | Has `<label>` | Dashboard.tsx:1045 |
| Project cards | No | Dashboard.tsx:1148 |
| WhatsApp buttons (multiple) | No | Multiple files |
| Task checkboxes | No | Dashboard.tsx:1618 |

### 6.2 Semantic HTML

| Issue | Location |
|-------|----------|
| Project cards use `<div onClick>` not `<button>` | Dashboard.tsx:1148 |
| Task items use `<div>` with `onClick` for comment trigger | Dashboard.tsx:1630 |
| Document cards use `<div onClick>` | Dashboard.tsx:1706 |

### 6.3 Keyboard Navigation

- Project cards have no `tabIndex`, `onKeyDown`, or `role="button"` — not keyboard accessible.
- DocumentViewerModal has keyboard shortcuts (Escape, +/-, 0, R) — good.
- No focus trapping in modals.

---

## 7. Testing Audit

**No test files found.** No test framework configured in `package.json`. No `jest.config`, `vitest.config`, or similar. No `__tests__` directories. No `.test.` or `.spec.` files.

---

## 8. Code Quality Summary

### 8.1 TypeScript Quality

| Issue | Location |
|-------|----------|
| `as any` cast | Dashboard.tsx:1053 — `e.target.value as any` |
| `any` parameter type | Services.tsx:129 — `(service: any)` |
| `as any` cast | DocumentViewerModal.tsx:906,909 — `textAnchor={p.anchor as any}` |

### 8.2 Console Statements in Production

| File | Line | Type |
|------|------|------|
| Layout.tsx | 45 | `console.error` |
| geminiService.ts | 41 | `console.error` |
| Dashboard.tsx | 338 | `console.error` |
| Dashboard.tsx | 378 | `console.error` |
| NotificationCenter.tsx | 67 | `console.error` |
| NotificationCenter.tsx | 75 | `console.error` |
| NotificationCenter.tsx | 83 | `console.error` |
| Onboarding.tsx | 98 | `console.error` |

### 8.3 Hardcoded Values

| Value | Location |
|-------|----------|
| WhatsApp phone `2348127251853` | constants.ts:4 |
| Unsplash image URLs (team) | Dashboard.tsx:65-66, About.tsx:102-104 |
| Unsplash image URLs (hero/about) | Landing.tsx:2-3, Services.tsx:43, About.tsx:11 |
| Confetti color array | Dashboard.tsx:135 |
| Seed project data (~120 lines) | Dashboard.tsx:166-288 |
| Contact email `permitflowinfo@gmail.com` | constants.ts (CONTACT_EMAIL) — centralized |
| Copyright `2025` | Layout.tsx:532 |

---

## 9. Files That Should Not Be Changed Without Justification

| File | Reason |
|------|--------|
| `index.html` | CDN imports, import maps, and Tailwind config are interdependent. Changing one breaks others. |
| `vite.config.ts` | Env injection, path aliases, and plugin config. Changes affect build and runtime. |
| `tsconfig.json` | Strict config with `allowImportingTsExtensions`, `noEmit`, path aliases. |
| `package.json` | Dependency versions are pinned. Upgrading React or Vite requires testing. |
| `constants.ts` | WhatsApp phone, service packages, phase data — shared across 8+ files. |
| `types.ts` | Shared enums/interfaces. Dashboard.tsx extends these with local interfaces. |
