# AGENTS.md — PermitFlow

> Instructions for AI agents working on this codebase.
> Read this before making any changes.

---

## Project Identity

**PermitFlow** is a React 19 + TypeScript SPA for building permit consulting in Lagos State, Nigeria. It helps property developers navigate the LASPPPA and LASBCA permit process.

- **Framework:** React 19.2.3 (functional components + hooks)
- **Build:** Vite 6.2
- **Styling:** Tailwind CSS (CDN-loaded, with dark mode via `dark:` prefix)
- **Routing:** React Router DOM 7.11 (HashRouter)
- **AI:** Google Gemini API (`@google/genai` 1.34)
- **Icons:** Material Icons Outlined (Google Fonts CDN)
- **Font:** Inter (Google Fonts CDN)

---

## Quick Start

```bash
npm install
# Create .env.local with GEMINI_API_KEY=<your-key> (for AI roadmap feature)
npm run dev    # Starts Vite dev server on port 3000
# For API routes (AI roadmap), use: npx vercel dev
```

---

## Critical Issues (Fix Before Any Feature Work)

1. ~~**`Onboarding.tsx:385`** — `handleSaveAndGoToDashboard` is called but never defined.~~ **FIXED** — now calls `handleComplete`.
2. ~~**`vite.config.ts:14`** — Gemini API key is baked into client bundle via `define`.~~ **FIXED** — API key moved to server-side edge function (`api/roadmap.ts`).

---

## Architecture Summary

```
index.html → index.tsx → App.tsx → HashRouter
                                      ├── Layout (Navbar + Footer + WhatsApp FAB)
                                      └── Routes
                                            ├── Landing (/)
                                            ├── Onboarding (/onboarding) — 4-step wizard, ends on a confirmation screen
                                            ├── Process (/process) — static timeline
                                            ├── Services (/services) — pricing page
                                            ├── ChecklistSimulator (/checklist, /simulator)
                                            └── About (/about) — company info
```

The project-tracking dashboard and its storage layer were removed. Onboarding no
longer writes projects to `localStorage`; it validates the wizard and renders an
in-page confirmation summary with a WhatsApp hand-off.

**State:** All local `useState`. No Context, no Redux, no Zustand.
**Data persistence:** `localStorage` only. No backend, no database, no API server.
**API integration:** Gemini AI only (client-side, via `services/geminiService.ts`).

---

## File Map

| File | Lines | Purpose |
|------|-------|---------|
| `App.tsx` | 32 | Router + route definitions |
| `types.ts` | 48 | Shared enums (`ProjectType`, `ProjectStatus`) and interfaces |
| `constants.ts` | 126 | WhatsApp config, service packages, phases, about data |
| `services/geminiService.ts` | 44 | Gemini AI roadmap generation |
| `services/serviceWorker.ts` | 40 | Registers/unregisters the offline service worker |
| `components/Layout.tsx` | 563 | App shell (Navbar + Footer + WhatsApp FAB) |
| `components/DocumentChecklistCalculator.tsx` | 1010 | Interactive document checklist |
| `views/Landing.tsx` | 146 | Home page |
| `views/Onboarding.tsx` | 1162 | 4-step wizard (progressive disclosure, engine-driven readiness, confirmation screen) |
| `views/Process.tsx` | 98 | LASPPPA timeline |
| `views/Services.tsx` | 170 | Service pricing |
| `views/ChecklistSimulator.tsx` | 127 | Wrapper for DocumentChecklistCalculator |
| `views/About.tsx` | 143 | Company info |
| `api/roadmap.ts` | 50 | Vercel edge function adapter for the AI roadmap endpoint |
| `functions/api/roadmap.ts` | 115 | Cloudflare Pages Function adapter for `/api/roadmap` (direct Gemini REST call) |
| `server/roadmapCore.ts` | 230 | Shared request validation, prompt building, response/error mapping for both runtimes |
| `public/sw.js` | 171 | Offline cache service worker (precache + runtime strategies) |
| `public/manifest.webmanifest` | — | Web app manifest |
| `views/Portfolio.tsx` | 62 | DEAD CODE - not routed |

---

## Rules for Agents

### Before Changing Code
1. Read `docs/CURRENT_SYSTEM_AUDIT.md` — this is the source of truth for what exists.
2. Read `docs/DEVELOPMENT_RULES.md` — these are the coding conventions.
3. Do NOT modify protected files without justification.

### While Changing Code
- No `any` types. No `as any` casts.
- All new components go in `components/` if reusable, `views/` if page-specific.
- Use existing Tailwind tokens (`primary`, `accent-dark`, `surface-dark`).
- Support dark mode via `dark:` prefix.
- Use Material Icons Outlined for all icons.
- Wrap all `localStorage` reads in try-catch.
- Do not add new localStorage keys without documenting them.

### After Changing Code
- Verify the app builds: `npm run build`
- Verify the dev server starts: `npm run dev`
- Check for console errors in the browser

### What NOT To Do
- Do not introduce new dependencies.
- Do not refactor the entire codebase in one change.
- Do not add comments unless explicitly asked.
- Do not add `console.log` statements.
- Do not change the WhatsApp number or contact email except in their single source of truth (`WHATSAPP_PHONE`/`WHATSAPP_DISPLAY` in `services/whatsapp.ts`, `CONTACT_EMAIL` in `constants.ts`). Do not hard-code them in views.
- Do not commit secrets or API keys.

---

## Key Data Structures

### OnboardingData (types.ts)
Created during the onboarding wizard. Held in React state and auto-saved as a draft; it is no longer persisted as a project record.

---

## localStorage Schema

The app has no project store. Onboarding keeps only a resumable draft, and the checklist simulator keeps its own result. New keys must be documented in this table in the same change.

| Key | Type | Description |
|-----|------|-------------|
| `permitHub_documentChecklist` | `{ readyDocs, neededDocs, readinessScore, estimatedDays }` | Checklist from simulator |
| `permitflow_onboarding_draft` | `{ step, data }` | In-progress onboarding auto-save & resume |

Keys from the removed dashboard (`userProjects`, `currentProject`, `permitflow_read_notifications`, `permitflow_dismissed_notifications`, `permitflow_custom_notifications`) are no longer read or written. They may still exist in a returning visitor's browser; treat them as inert.

---

## Environment

| Variable | Where | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | `.env.local` (dev) / Cloudflare Pages or Vercel env vars (prod) | **SERVER-SIDE ONLY** — used by the `/api/roadmap` adapter for the target platform. Never exposed to client bundle. |

---

## Testing

- Framework: Vitest (jsdom for components, `node` for domain logic)
- Component testing: React Testing Library
- Test files live under `tests/`, mirroring the source folder
- Run: `npx vitest run --pool=vmThreads --no-file-parallelism`
  (`npm test` uses the forks pool, which fails to start workers in this environment)
