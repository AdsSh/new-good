# PermitFlow — Security Remediation Report

> Date: 2026-08-29
> Status: **REMEDIATED** — build and repository scans pass

---

## Executive Summary

The Gemini API key was exposed in the client-side JavaScript bundle via Vite's `import.meta.env.VITE_GEMINI_API_KEY` mechanism. This has been fixed by moving the AI call to a serverless edge function that runs exclusively on the server.

**Before:** API key baked into `dist/assets/index-{hash}.js` — anyone could extract it from the browser.

**After:** API key lives only in Vercel environment variables. The client calls `/api/roadmap` (a serverless edge function). The key never touches the browser.

---

## Vulnerability Details

### VULN-001: Gemini API Key Exposed in Client Bundle

| Field | Value |
|-------|-------|
| **Severity** | CRITICAL |
| **Location** | `services/geminiService.ts:6` |
| **Code** | `const apiKey = import.meta.env.VITE_GEMINI_API_KEY \|\| ""` |
| **Impact** | API key visible in built JS file (`dist/assets/index-*.js`). Anyone can extract it, use it, or exhaust the quota. |
| **Root cause** | Vite inlines `import.meta.env.VITE_*` variables at build time as string literals in the client bundle. |

**Evidence (before fix):**
```
# Built bundle contained:
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""
# Vite replaces this with:
const apiKey = "AIzaSy..." || ""
```

---

## Remediation Applied

### Change 1: Serverless Edge Function

**File:** `api/roadmap.ts` (NEW)

Created a Vercel-compatible edge function that:
- Reads `GEMINI_API_KEY` from `process.env` (server-side only)
- Accepts POST requests with project data
- Calls Gemini API with the key
- Returns the roadmap text as JSON
- Handles errors gracefully without leaking credentials

```
Client → POST /api/roadmap → Edge Function → Gemini API
                                              ↑
                                    Key from process.env
                                    (never sent to client)
```

### Change 2: Client Service Refactored

**File:** `services/geminiService.ts`

| Before | After |
|--------|-------|
| `import { GoogleGenAI } from "@google/genai"` | `// No SDK import` |
| `const apiKey = import.meta.env.VITE_GEMINI_API_KEY` | `// No env var access` |
| `new GoogleGenAI({ apiKey })` | `// No client-side API call` |
| Direct Gemini API call from browser | `fetch("/api/roadmap", ...)` |

The client now sends only the project data (property type, address, LGA, etc.) to the proxy. No secrets are transmitted.

### Change 3: Environment Variable Cleanup

**File:** `vite.config.ts`

Removed the `define` block that previously injected `process.env.API_KEY` and `process.env.GEMINI_API_KEY` into the bundle. (This was already done in a prior session; confirmed no `define` block exists.)

### Change 4: `.env.example` Created

**File:** `.env.example` (NEW)

Documents that `GEMINI_API_KEY` is server-side only and provides setup instructions.

### Change 5: `.gitignore` Updated

**File:** `.gitignore`

Added explicit entries for `.env`, `.env.local`, and `.env.*.local` to prevent accidental commits.

### Change 6: Safe Error Messages

**File:** `services/geminiService.ts`

All error paths return user-friendly messages that do not reveal:
- API key existence or absence
- Which service is being called
- Internal error details
- Stack traces

Error messages:
- `"Unable to generate roadmap at this time. Your consultant will provide a personalized roadmap during your consultation."`
- `"Roadmap could not be generated at this time."`

### Change 7: Edge Function Error Handling

**File:** `api/roadmap.ts`

| Error condition | Response | Leaks? |
|-----------------|----------|--------|
| Missing API key | 200 with fallback message | No — returns user-friendly text, not "key missing" |
| Invalid JSON body | 400 `"Invalid request body"` | No |
| Missing required fields | 400 `"Missing required project fields"` | No |
| Gemini API failure | 200 with fallback message | No — generic error, no stack trace |
| Wrong HTTP method | 405 `"Method not allowed"` | No |

---

## Scan Results

### Pre-Remediation Scan

| Location | Finding | Status |
|----------|---------|--------|
| `services/geminiService.ts:6` | `import.meta.env.VITE_GEMINI_API_KEY` | **FIXED** — removed |
| `vite.config.ts:14` (historical) | `define: { 'process.env.API_KEY': ... }` | **FIXED** — removed in prior session |
| `constants.ts:4` | WhatsApp phone `2348127251853` | Not a secret — public business contact, centralized in code |

### Post-Remediation Client Source Scan

```
Pattern: import.meta.env | process.env | API_KEY | apiKey | GoogleGenAI | @google/genai
Scope:   All .ts/.tsx files (excluding api/ directory and node_modules)
Result:  ZERO matches in client-side code
```

### Post-Remediation Built Bundle Scan

```
File:    dist/assets/index-XnwviEVo.js (487 KB)
Pattern: VITE_GEMINI_API_KEY | GEMINI_API_KEY | AIza[A-Za-z0-9_-]{35} | import.meta.env.
Result:  ZERO matches — no secrets in client bundle
```

### Server-Side Only References

```
File:    api/roadmap.ts
Pattern: process.env.GEMINI_API_KEY
Result:  1 match — correct and expected (server-side edge function)
```

---

## Data Flow (After Remediation)

```
┌──────────────────┐                    ┌──────────────────┐
│  Browser          │   POST /api/roadmap│  Vercel Edge     │
│                   │──────────────────▶│  Function         │
│  geminiService.ts │   { propertyType, │  api/roadmap.ts   │
│       │           │     address, ... } │       │          │
│       │           │                    │       ▼          │
│       │           │                    │  process.env     │
│       │           │                    │  .GEMINI_API_KEY  │
│       │           │                    │       │          │
│       │           │                    │       ▼          │
│       │           │   { roadmap: "..." }│  Gemini API      │
│       │◀──────────│◀──────────────────│                   │
│       │           │                    └──────────────────┘
│       ▼           │
│  PermitProject    │
│  .aiRoadmap       │
│  (localStorage)   │
└──────────────────┘

Secrets in transit: NONE
Secrets in client bundle: NONE
Secrets in localStorage: NONE
Secrets on server: GEMINI_API_KEY (Vercel env var)
```

---

## Secret Inventory

| Secret | Where Stored | In Client Bundle? | In Git? |
|--------|-------------|-------------------|---------|
| `GEMINI_API_KEY` | Vercel env vars (prod), `.env.local` (dev) | No | No (`.gitignore` covers it) |
| WhatsApp phone | `constants.ts:4` | Yes (public info) | Yes (public business contact) |

---

## Configuration Guide

### Local Development

```bash
# 1. Clone and install
git clone <repo>
cd permit-web
npm install

# 2. Create local env file (gitignored)
cp .env.example .env.local

# 3. Add your Gemini API key to .env.local
#    Get one at: https://aistudio.google.com/apikey
echo "GEMINI_API_KEY=your-key-here" > .env.local

# 4. Start the dev server (frontend only — AI features require the proxy)
npm run dev

# 5. For AI features, run the Vercel dev server (starts both frontend + API)
npx vercel dev
```

### Vercel Deployment

```bash
# 1. Push to GitHub
git push origin main

# 2. Import at vercel.com/new
#    - Framework: Vite
#    - Build command: npm run build
#    - Output directory: dist

# 3. Set environment variable in Vercel Dashboard:
#    Project Settings → Environment Variables
#    Key:   GEMINI_API_KEY
#    Value: your-gemini-api-key
#    Environment: Production, Preview, Development

# 4. Deploy
#    Vercel auto-deploys on push. API routes are automatically handled.
```

### Netlify Deployment (Alternative)

```bash
# 1. netlify.toml (create this file)
[build]
  command = "npm run build"
  publish = "dist"
  functions = "api"

[functions]
  node_bundler = "esbuild"

# 2. Set environment variable in Netlify Dashboard:
#    Site settings → Build & deploy → Environment
#    Key:   GEMINI_API_KEY
#    Value: your-gemini-api-key

# 3. Deploy
netlify deploy --prod
```

---

## Remaining Security Considerations

### Acceptable Risks (MVP)

| Risk | Why Acceptable | Mitigation |
|------|---------------|------------|
| WhatsApp phone `2348127251853` | Public business contact, not a secret | Centralized in `services/whatsapp.ts` |
| No rate limiting on `/api/roadmap` | Zero-budget MVP, low traffic expected | Add rate limiting in Phase 2 |
| No CORS headers on edge function | Same-origin only (SPA calls its own API) | Add explicit CORS in Phase 2 |
| No request signing | MVP trust model: any POST to `/api/roadmap` triggers Gemini call | Add auth in Phase 2 |
| Tailwind CDN loaded at runtime | Not a secret, but production should use bundled CSS | Migrate to Tailwind build in Phase 2 |

### Must Fix Before Public Launch

| Item | Effort | Priority |
|------|--------|----------|
| ~~Replace placeholder WhatsApp phone with real number~~ | Done | Centralized to `2348127251853` |
| Add CORS headers to edge function | 15 min | MEDIUM |
| Add rate limiting (Vercel config or middleware) | 30 min | MEDIUM |
| Remove `console.error` in edge function (logs nothing sensitive, but clean practice) | 5 min | LOW |

### Future Security Enhancements (Phase 2+)

| Item | Phase | Depends On |
|------|-------|-----------|
| User authentication (Supabase Auth) | Phase 2 | Supabase setup |
| Row-level security (RLS) policies | Phase 2 | Auth |
| Request signing / JWT validation on edge function | Phase 2 | Auth |
| Rate limiting per user | Phase 2 | Auth |
| Input sanitization / validation library (Zod) | Phase 2 | — |
| CSP headers (Content Security Policy) | Phase 2 | — |
| CORS whitelist | Phase 2 | — |
| Secrets scanning in CI (gitleaks, trufflehog) | Phase 2 | CI/CD pipeline |
| Sentry error monitoring | Phase 2 | — |

---

## Verification Checklist

| Check | Result |
|-------|--------|
| `npm run build` succeeds | PASS — built in 3.48s |
| `npx tsc --noEmit` — no new errors from security changes | PASS — only pre-existing errors |
| Client bundle contains `import.meta.env.*` | PASS — zero matches |
| Client bundle contains `process.env.*` | PASS — zero matches |
| Client bundle contains API key patterns (`AIza`, `sk-`, etc.) | PASS — zero matches |
| Source code (client-side) imports `@google/genai` | PASS — zero matches |
| Source code (client-side) uses `process.env` | PASS — zero matches |
| `.env.local` is gitignored | PASS — covered by `*.local` and explicit `.env.local` |
| `.env.example` exists with documentation | PASS |
| `api/roadmap.ts` uses `process.env.GEMINI_API_KEY` | PASS — server-side only |
| Error messages hide implementation details | PASS — generic fallback messages |
| `vercel.json` routes `/api/*` correctly | PASS |

---

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `api/roadmap.ts` | **CREATED** | Serverless edge function — Gemini API proxy |
| `services/geminiService.ts` | **REWRITTEN** | Calls `/api/roadmap` instead of Gemini directly |
| `vite.config.ts` | Verified clean | No `define` block (fixed in prior session) |
| `package.json` | Verified | `@google/genai` kept as dependency (needed by edge function) |
| `.env.example` | **CREATED** | Documents `GEMINI_API_KEY` setup |
| `.gitignore` | **UPDATED** | Added `.env`, `.env.local`, `.env.*.local` |
| `vercel.json` | **CREATED** | Routes API calls to edge function |
| `AGENTS.md` | **UPDATED** | Removed security risk notes, updated env section |
| `README.md` | **REWRITTEN** | Updated setup instructions for new architecture |
