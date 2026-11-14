# Deep Technical Audit — PermitFlow

> Read-only source-code inspection. Every issue is verified against the actual codebase.
> Generated: 2026-08-29

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [React Component Structure](#2-react-component-structure)
3. [Routing](#3-routing)
4. [State Management](#4-state-management)
5. [localStorage Usage](#5-localstorage-usage)
6. [Gemini Integration](#6-gemini-integration)
7. [Environment Variable Handling](#7-environment-variable-handling)
8. [Authentication Assumptions](#8-authentication-assumptions)
9. [Document Uploads](#9-document-uploads)
10. [Dashboard Architecture](#10-dashboard-architecture)
11. [Accessibility](#11-accessibility)
12. [Responsive Design](#12-responsive-design)
13. [Error Handling](#13-error-handling)
14. [Dependency Risks](#14-dependency-risks)
15. [Duplicate Code](#15-duplicate-code)
16. [Dead Code](#16-dead-code)
17. [Hard-coded Data](#17-hard-coded-data)
18. [Hard-coded URLs/Phone Numbers](#18-hard-coded-urlsphone-numbers)
19. [Testing](#19-testing)
20. [Production Build](#20-production-build)
21. [Deployment Readiness](#21-deployment-readiness)
22. [Performance](#22-performance)
23. [Security](#23-security)

---

## 1. Architecture

### ISSUE 1.1 — No Backend Server

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `metadata.json:8-10` |
| **Why it matters** | `metadata.json` declares `"MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"` but no server exists. All data is localStorage-only. No user authentication, no data persistence across devices, no server-side API key protection. |
| **Evidence** | No `server/`, `api/`, `backend/` directories. No Express, Fastify, or serverless functions. `package.json` has no server dependencies. |
| **Recommended fix** | Create a backend proxy for Gemini API calls, or deploy a serverless function (Vite serverless, Cloudflare Worker, etc.). |
| **MVP?** | Yes — blocks production deployment |

### ISSUE 1.2 — No Authentication Layer

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | All files |
| **Why it matters** | Any user with the URL can access `/dashboard`. No login, no session, no user isolation. All projects in localStorage are shared if the same browser is used. |
| **Evidence** | Zero auth-related code. No JWT, no cookies, no session management. `Onboarding.tsx:371-381` collects email/name/phone but never stores or validates them. |
| **Recommended fix** | Add authentication (Firebase Auth, Supabase, or custom JWT). Scope localStorage per user. |
| **MVP?** | Yes — required for any multi-user deployment |

### ISSUE 1.3 — localStorage as Sole Data Store

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `Dashboard.tsx:331-352`, `Onboarding.tsx:91-96`, `NotificationCenter.tsx:35-81` |
| **Why it matters** | localStorage is browser-specific, device-specific, and has a 5-10MB limit. Users lose all data if they clear browser data, switch devices, or use incognito mode. |
| **Evidence** | 21 `localStorage.getItem`/`setItem` calls across 4 files. No server sync. No export/import capability. |
| **Recommended fix** | Migrate to a database (Supabase, Firebase, or PostgreSQL). Add localStorage as a fallback/offline cache only. |
| **MVP?** | Yes — required for data reliability |

---

## 2. React Component Structure

### ISSUE 2.1 — God Component: Dashboard.tsx (2,042 lines)

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `views/Dashboard.tsx` |
| **Why it matters** | Contains 21 `useState` hooks (lines 292-326), 5 `useMemo` hooks, 5 `useCallback` hooks, 5 `useRef` hooks, data model interfaces, seed data, confetti animation class, and all UI rendering. Impossible to test, maintain, or reason about. |
| **Evidence** | Lines 1-2042. Interfaces `PermitProject`, `TeamMember`, `Task`, `ProjectDocument`, `InternalNote`, `ItemComment` defined at lines 8-103. `SEED_PROJECTS` at lines 166-288. `ConfettiParticle` class at lines 121-164. |
| **Recommended fix** | Split into 8-10 components: `ProjectList`, `ProjectCard`, `ProjectInspection`, `ProjectStepper`, `TaskChecklist`, `DocumentDossier`, `ProjectSidebar`, `AssignmentModal`, `UploadModal`. Move interfaces to `types.ts`. |
| **MVP?** | Yes — blocks all feature work on Dashboard |

### ISSUE 2.2 — DocumentViewerModal.tsx (1,170 lines)

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `components/DocumentViewerModal.tsx` |
| **Why it matters** | Contains 4 inline SVG sub-renderers (~400 lines each) for architectural blueprints, cadastral surveys, structural calculations, and generic documents. All always bundled even when modal is closed. |
| **Evidence** | Lines 1-1170. SVG renderers embedded inline. No lazy loading. |
| **Recommended fix** | Extract SVG renderers into separate files. Lazy-load the modal and its sub-renderers. |
| **MVP?** | Later — works but impacts bundle size |

### ISSUE 2.3 — DocumentChecklistCalculator.tsx (1,010 lines)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `components/DocumentChecklistCalculator.tsx` |
| **Why it matters** | Mixes ~330 lines of document data configuration (lines 25-354) with ~680 lines of presentation logic. Hard to modify data without touching UI. |
| **Evidence** | `ALL_SUPPORTING_DOCUMENTS` array at lines 25-354 contains 20+ document definitions with cost ranges, prep days, regulatory bodies, etc. |
| **Recommended fix** | Extract document data to a separate `documentData.ts` file. |
| **MVP?** | Later — functional but hard to maintain |

---

## 3. Routing

### ISSUE 3.1 — Duplicate Route with No Redirect

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `App.tsx:22-23` |
| **Why it matters** | `/checklist` and `/simulator` both render `<ChecklistSimulator />` with no redirect. Users can reach the same page via two URLs, causing confusion and potential SEO issues. |
| **Evidence** | `<Route path="/checklist" element={<ChecklistSimulator />} />` and `<Route path="/simulator" element={<ChecklistSimulator />} />` |
| **Recommended fix** | Replace one route with a `<Navigate to="/checklist" replace />` redirect. |
| **MVP?** | Later — cosmetic issue |

### ISSUE 3.2 — No 404/Catch-All Route

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `App.tsx:17-26` |
| **Why it matters** | Navigating to an undefined path (e.g., `/nonexistent`) renders a blank page inside the Layout shell with no user feedback. |
| **Evidence** | No `<Route path="*" ...>` in the Routes block. |
| **Recommended fix** | Add `<Route path="*" element={<NotFound />} />` with a 404 page. |
| **MVP?** | Later — low user impact |

### ISSUE 3.3 — No Lazy Loading / Code Splitting

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `App.tsx:4-11` |
| **Why it matters** | All 7 view components are eagerly imported. The entire app (including Dashboard at 2,042 lines and DocumentViewerModal at 1,170 lines) is loaded on first page visit, even if the user only visits `/`. |
| **Evidence** | `import { Landing } from './views/Landing'` etc. at lines 4-11. No `React.lazy()` or `Suspense` anywhere in the codebase. |
| **Recommended fix** | Wrap each view in `React.lazy()` with `<Suspense>` fallback. |
| **MVP?** | Later — performance optimization |

---

## 4. State Management

### ISSUE 4.1 — Dashboard Has 21 useState Hooks

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `views/Dashboard.tsx:292-326` |
| **Why it matters** | 21 independent state variables create a combinatorial explosion of possible states. Hard to debug, test, or reason about state transitions. |
| **Evidence** | Lines 292-326: `projects`, `activeProjectId`, `isMounted`, `projectsFilter`, `projectTypeFilter`, `projectSortBy`, `projectSearchQuery`, `filterType`, `sortBy`, `pendingFile`, `pendingFilePreviewUrl`, `showConfirmUpload`, `previewingDoc`, `toast`, `isEditingDetails`, `isEditingValuation`, `editForm`, `activeItem`, `newComment`, `notesSavingState`, `activeTab`. |
| **Recommended fix** | Consolidate related state into useReducer or use a lightweight state library (Zustand). At minimum, group filter/sort/search into a single `filters` state object. |
| **MVP?** | Later — works but fragile |

### ISSUE 4.2 — No Shared State Solution

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | All files |
| **Why it matters** | Cross-component communication relies entirely on localStorage + `storage` event listeners. This creates race conditions, stale data, and makes the data flow hard to trace. |
| **Evidence** | `Layout.tsx:31-51` listens to `storage` events. `Dashboard.tsx:331-352` reads localStorage on mount. `Onboarding.tsx:91-96` writes to localStorage. No React Context or state management library. |
| **Recommended fix** | Introduce React Context for shared state, or use a lightweight library like Zustand. |
| **MVP?** | Later — localStorage works for single-user demo |

---

## 5. localStorage Usage

### ISSUE 5.1 — No Schema Validation on Parsed Data

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `Dashboard.tsx:336`, `Dashboard.tsx:357`, `Onboarding.tsx:44`, `NotificationCenter.tsx:35,44,53` |
| **Why it matters** | `JSON.parse()` results are used directly without type validation. Corrupted or tampered localStorage data can cause runtime errors or inject unexpected UI. |
| **Evidence** | `Dashboard.tsx:336`: `loadedProjects = JSON.parse(storedUserProjects)` — no schema check. `NotificationCenter.tsx:35`: `return stored ? JSON.parse(stored) : []` — no validation. |
| **Recommended fix** | Add runtime validation (e.g., Zod schemas) for all localStorage reads. Wrap in type guard functions. |
| **MVP?** | Yes — prevents data corruption crashes |

### ISSUE 5.2 — No localStorage Quota Error Handling

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | All localStorage write locations (21 calls) |
| **Why it matters** | `localStorage.setItem()` throws `QuotaExceededError` when storage is full. None of the 21 write calls handle this. |
| **Evidence** | All 21 `localStorage.setItem` calls have no try-catch around the write itself. |
| **Recommended fix** | Wrap localStorage writes in try-catch. Show user-friendly error when quota is exceeded. |
| **MVP?** | Later — rare edge case |

### ISSUE 5.3 — Toast Dismiss Not Debounced

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `Dashboard.tsx:446,475,493,550,588,2036` |
| **Why it matters** | Quick notes textarea triggers `localStorage.setItem` on every keystroke with no debouncing. Can cause performance issues with large projects. |
| **Evidence** | `Dashboard.tsx:596-612`: `handleProjectNoteChange` calls `setProjects` + `localStorage.setItem` on every `onChange` event. |
| **Recommended fix** | Debounce localStorage writes (300ms) for text inputs. |
| **MVP?** | Later — performance optimization |

---

## 6. Gemini Integration

### ISSUE 6.1 — API Key Exposed in Client Bundle

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `vite.config.ts:13-15`, `services/geminiService.ts:6` |
| **Why it matters** | Vite's `define` performs static text replacement at build time. The Gemini API key is embedded as a string literal in the client-side JavaScript. Anyone can extract it from browser DevTools → Sources tab. |
| **Evidence** | `vite.config.ts:14`: `'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)`. `geminiService.ts:6`: `new GoogleGenAI({ apiKey: process.env.API_KEY \|\| "" })`. |
| **Recommended fix** | Move API calls to a backend proxy or serverless function. Never expose API keys in client code. |
| **MVP?** | Yes — security vulnerability |

### ISSUE 6.2 — No Loading State for AI Roadmap

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Onboarding.tsx:73-78` |
| **Why it matters** | `handleGenerateRoadmap` sets `loadingRoadmap(true)` but the loading state is never used in the UI. Step 4 renders immediately with no loading indicator while the API call is in progress. |
| **Evidence** | `Onboarding.tsx:35`: `const [loadingRoadmap, setLoadingRoadmap] = useState(false)`. `Onboarding.tsx:73-78`: sets loading but no conditional rendering based on it. |
| **Recommended fix** | Add a loading spinner/skeleton while the AI roadmap is being generated. |
| **MVP?** | Later — UX improvement |

### ISSUE 6.3 — No Retry Logic for Failed API Calls

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `services/geminiService.ts:30-43` |
| **Why it matters** | If the Gemini API call fails (network error, rate limit), the user gets a generic error string with no retry option. |
| **Evidence** | Single try-catch with a fallback string return. No retry, no exponential backoff. |
| **Recommended fix** | Add retry logic (3 attempts with exponential backoff). Show retry button in UI on failure. |
| **MVP?** | Later — resilience improvement |

### ISSUE 6.4 — User Input Injected into Prompt Without Sanitization

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `services/geminiService.ts:8-28` |
| **Why it matters** | User-provided values (`data.projectType`, `data.address`, etc.) are interpolated directly into the prompt string. While not a security risk for the client, it could cause prompt injection or unexpected AI behavior. |
| **Evidence** | Lines 13-19: `${data.projectType}`, `${data.address}`, etc. directly in template literal. |
| **Recommended fix** | Sanitize/escape user input before prompt interpolation. Add input length limits. |
| **MVP?** | Later — AI quality improvement |

---

## 7. Environment Variable Handling

### ISSUE 7.1 — No .env.local File Exists

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | Project root (missing) |
| **Why it matters** | `README.md:18` instructs users to "Set the GEMINI_API_KEY in .env.local" but no such file exists. First-time developers will get a broken Gemini integration. |
| **Evidence** | `glob("**/.env*")` returns zero files. `.gitignore:13` excludes `*.local` files. |
| **Recommended fix** | Create `.env.example` with `GEMINI_API_KEY=your-key-here` as a template. |
| **MVP?** | Yes — blocks developer onboarding |

### ISSUE 7.2 — No .env.example Template

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | Project root (missing) |
| **Why it matters** | Developers have no reference for what environment variables are needed. |
| **Evidence** | No `.env.example`, `.env.template`, or `.env.sample` file exists. |
| **Recommended fix** | Create `.env.example` documenting all required and optional env vars. |
| **MVP?** | Yes — developer experience |

---

## 8. Authentication Assumptions

### ISSUE 8.1 — No User Model or Session

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | All files |
| **Why it matters** | The app assumes a single user per browser. No concept of user identity, sessions, or data ownership. If two people share a browser, they share all project data. |
| **Evidence** | No auth imports, no user ID in data models, no session tokens. `Onboarding.tsx:371-381` collects contact info but never persists it. |
| **Recommended fix** | Add authentication and scope all data per user ID. |
| **MVP?** | Yes — required for any real deployment |

### ISSUE 8.2 — Contact Fields on Step 4 Are Uncontrolled

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `views/Onboarding.tsx:371-381` |
| **Why it matters** | Email, Full Name, and Phone Number inputs have no `value` or `onChange` handlers. The values are never captured into state or saved anywhere. The "required" email field has no validation. |
| **Evidence** | Line 373: `<input type="email" ... placeholder="you@example.com" />` — no `value`, no `onChange`. Line 377: same for name. Line 381: same for phone. |
| **Recommended fix** | Add `value` and `onChange` handlers. Add email validation. Store in `data` state. |
| **MVP?** | Yes — user data is silently lost |

---

## 9. Document Uploads

### ISSUE 9.1 — Files Stored as Metadata Only

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `views/Dashboard.tsx:533-555` |
| **Why it matters** | Uploaded files are read via `FileReader.readAsDataURL()` but only metadata (name, size, type, date) is stored in localStorage. The actual file content is lost on page refresh. |
| **Evidence** | `Dashboard.tsx:536-545`: creates `ProjectDocument` with `name`, `size`, `type`, `icon`, `date`, `timestamp` — no file content field. `previewUrl` is set from `FileReader` result but localStorage has a 5-10MB limit. |
| **Recommended fix** | Store files in a backend object storage (S3, Supabase Storage). Use localStorage only for metadata. |
| **MVP?** | Yes — uploaded files are ephemeral |

### ISSUE 9.2 — No File Type Validation

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Dashboard.tsx:563-581` |
| **Why it matters** | `handleFileSelect` accepts any file type. No validation for file size, extension, or MIME type. Users could upload executables or malicious files. |
| **Evidence** | Line 564: `if (e.target.files && e.target.files[0])` — no type check. Line 570: checks `file.type.startsWith('image/')` only for preview, not for validation. |
| **Recommended fix** | Add file type whitelist (PDF, DWG, JPG, PNG). Add max file size limit (e.g., 50MB). |
| **MVP?** | Yes — security and UX |

### ISSUE 9.3 — No FileReader Error Handling

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Dashboard.tsx:571-577` |
| **Why it matters** | `FileReader` is used without an `onerror` handler. If the file read fails (corrupted file, permission error), the error is silently swallowed. |
| **Evidence** | Line 571: `const reader = new FileReader()` — only `onload` is set, no `onerror`. |
| **Recommended fix** | Add `reader.onerror` handler to show error message to user. |
| **MVP?** | Later — edge case |

---

## 10. Dashboard Architecture

### ISSUE 10.1 — Types Defined in Component File

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Dashboard.tsx:8-103` |
| **Why it matters** | `PermitProject`, `TeamMember`, `Task`, `ProjectDocument`, `InternalNote`, `ItemComment` are exported from Dashboard.tsx and imported by `NotificationCenter.tsx:3` and `DocumentViewerModal.tsx:2`. This creates circular dependency risk and couples components to a specific view. |
| **Evidence** | `DocumentViewerModal.tsx:2`: `import { ProjectDocument, TeamMember } from '../views/Dashboard'`. `NotificationCenter.tsx:3`: `import { PermitProject } from '../views/Dashboard'`. |
| **Recommended fix** | Move all shared interfaces to `types.ts`. |
| **MVP?** | Yes — architectural hygiene |

### ISSUE 10.2 — Seed Data Embedded in Component

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Dashboard.tsx:166-288` |
| **Why it matters** | 123 lines of hardcoded demo projects are embedded in the Dashboard component. This data is mixed with presentation logic and cannot be easily replaced or configured. |
| **Evidence** | `SEED_PROJECTS` array at lines 166-288 contains 4 full project objects with tasks, documents, addresses, etc. |
| **Recommended fix** | Move to a separate `seedData.ts` file. Consider making seed data configurable. |
| **MVP?** | Later — works but messy |

### ISSUE 10.3 — Confetti Animation Class in Component

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Dashboard.tsx:121-164` |
| **Why it matters** | `ConfettiParticle` class and canvas animation logic are embedded in the Dashboard component. This is animation logic that belongs in a utility or custom hook. |
| **Evidence** | Lines 121-164: Full class definition with `update()` and `draw()` methods. |
| **Recommended fix** | Extract to a `useConfetti()` hook or utility file. |
| **MVP?** | Later — separation of concerns |

---

## 11. Accessibility

### ISSUE 11.1 — Only 3 aria-labels in Entire App

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `Layout.tsx:141,304`, `NotificationCenter.tsx:268` |
| **Why it matters** | Only 3 elements in the entire application have `aria-label` attributes. All other interactive elements (filter buttons, project cards, WhatsApp buttons, task checkboxes, sort dropdowns) are inaccessible to screen readers. |
| **Evidence** | `Layout.tsx:141`: `aria-label="PermitFlow Lagos Home"`. `Layout.tsx:304`: `aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}`. `NotificationCenter.tsx:268`: `aria-label="View notifications and project alerts"`. Zero other occurrences. |
| **Recommended fix** | Add `aria-label` to all interactive elements. Estimated 30+ elements need labeling. |
| **MVP?** | Yes — legal compliance in many jurisdictions |

### ISSUE 11.2 — Project Cards Use div onClick Without Role

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `views/Dashboard.tsx:1148-1156` |
| **Why it matters** | Project cards are clickable `<div>` elements with `onClick` but no `role="button"`, `tabIndex`, or `onKeyDown`. They are not keyboard accessible and screen readers don't announce them as interactive. |
| **Evidence** | Line 1148: `<div key={p.id} onClick={() => handleSelectProject(p.id)} className="... cursor-pointer ...">` |
| **Recommended fix** | Change to `<button>` or add `role="button"`, `tabIndex={0}`, `onKeyDown` handler. |
| **MVP?** | Yes — keyboard accessibility |

### ISSUE 11.3 — No Focus Trapping in Modals

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Dashboard.tsx:1897-1987`, `components/DocumentViewerModal.tsx` |
| **Why it matters** | Modals (assignment modal, upload confirmation, document viewer) don't trap focus. Tab key can move focus behind the modal to inaccessible elements. |
| **Evidence** | No `focus-trap` library or manual focus management in any modal. |
| **Recommended fix** | Add focus trapping to all modals. Use `react-focus-lock` or implement manually. |
| **MVP?** | Later — UX improvement |

### ISSUE 11.4 — Task Checkboxes Missing Labels

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Dashboard.tsx:1618-1628` |
| **Why it matters** | Task toggle checkboxes have no `aria-label` or associated `<label>`. Screen readers announce them as "checkbox" with no context. |
| **Evidence** | Line 1618-1628: `<button type="button" onClick={() => toggleTask(task.id)} className="...">` — button-based checkbox without accessible name. |
| **Recommended fix** | Add `aria-label={`Toggle task: ${task.title}`}` to each checkbox. |
| **MVP?** | Later — accessibility improvement |

---

## 12. Responsive Design

### ISSUE 12.1 — Canvas Dimensions Fixed at Render Time

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Dashboard.tsx:735` |
| **Why it matters** | Confetti canvas uses `width={window.innerWidth} height={window.innerHeight}` which is evaluated once at render time. If the window is resized, the canvas dimensions are wrong. |
| **Evidence** | Line 735: `<canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} ...>` |
| **Recommended fix** | Use a `resize` event listener or CSS `width: 100vw; height: 100vh` on the canvas. |
| **MVP?** | Later — minor visual issue |

### ISSUE 12.2 — Mobile Nav Has Body Scroll Lock

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `components/Layout.tsx:59-69` |
| **Why it matters** | Mobile menu locks body scroll via `document.body.style.overflow = 'hidden'`. Cleanup on unmount restores it, but if the component unmounts abnormally, scroll may remain locked. |
| **Evidence** | Lines 59-69: `useEffect` sets/resets `document.body.style.overflow`. |
| **Recommended fix** | Ensure cleanup is robust. Consider using `overflow: hidden` on the container instead of body. |
| **MVP?** | Later — edge case |

---

## 13. Error Handling

### ISSUE 13.1 — No Error Boundaries Anywhere

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | All files |
| **Why it matters** | Zero `ErrorBoundary` components in the entire codebase. Any uncaught error in any component will white-screen the entire application with no recovery option. |
| **Evidence** | Grep for `ErrorBoundary`, `componentDidCatch`, `getDerivedStateFromError` returns zero results. |
| **Recommended fix** | Add an `ErrorBoundary` at the `App.tsx` level at minimum. Add route-level error boundaries for Dashboard. |
| **MVP?** | Yes — prevents total app failure |

### ISSUE 13.2 — handleSaveAndGoToDashboard Is Undefined

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `views/Onboarding.tsx:385` |
| **Why it matters** | Step 4 "Create Project" button calls `handleSaveAndGoToDashboard` which is never defined in the component. Clicking the button throws `ReferenceError: handleSaveAndGoToDashboard is not defined` and crashes the app. |
| **Evidence** | Line 385: `onClick={handleSaveAndGoToDashboard}`. Grep across entire codebase confirms this function is only referenced here, never defined. `handleComplete` (line 80) is the intended function but is not wired to the button. |
| **Recommended fix** | Replace `handleSaveAndGoToDashboard` with `handleComplete` on line 385. |
| **MVP?** | Yes — total feature failure |

### ISSUE 13.3 — Gemini API Error Returns String Not Exception

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `services/geminiService.ts:40-43` |
| **Why it matters** | On API failure, the function returns an error string instead of throwing. The caller (`Onboarding.tsx:75`) treats the return value as a valid roadmap, displaying error text as if it were a successful response. |
| **Evidence** | Line 42: `return "Error generating roadmap..."`. Line 75-76 in Onboarding.tsx: `const roadmap = await generatePermitRoadmap(data); setAiRoadmap(roadmap \|\| "Roadmap could not be generated...")`. |
| **Recommended fix** | Throw an error on failure. Let the caller handle it with a try-catch and display an appropriate error UI. |
| **MVP?** | Yes — incorrect error handling |

---

## 14. Dependency Risks

### ISSUE 14.1 — Tailwind CSS Loaded via CDN

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `index.html:11` |
| **Why it matters** | `https://cdn.tailwindcss.com` is the Tailwind CDN play script. It processes all classes at runtime in the browser, which is: (a) slow, (b) not recommended for production, (c) a single point of failure if CDN is down, (d) adds ~100KB+ to page load. |
| **Evidence** | Line 11: `<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>` |
| **Recommended fix** | Install Tailwind as a dev dependency. Build a purged CSS file. Use PostCSS plugin. |
| **MVP?** | Yes — performance and reliability |

### ISSUE 14.2 — Import Maps for Core Dependencies

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `index.html:98-108` |
| **Why it matters** | React, ReactDOM, React Router, and Google GenAI are loaded via `esm.sh` import maps. This means: (a) dependencies are loaded from a third-party CDN at runtime, (b) no version pinning beyond semver ranges, (c) if esm.sh is down, the app breaks, (d) no offline capability. |
| **Evidence** | Lines 98-108: `"react": "https://esm.sh/react@^19.2.3"` etc. |
| **Recommended fix** | Bundle dependencies via Vite. Remove import maps. Install all packages via npm. |
| **MVP?** | Yes — reliability and offline support |

### ISSUE 14.3 — No Dependency Lock File

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | Project root (missing) |
| **Why it matters** | No `package-lock.json` or `yarn.lock` file exists. Dependency versions are not locked, so different installs may get different versions. |
| **Evidence** | `glob("**/package-lock.json")` and `glob("**/yarn.lock")` return zero results. |
| **Recommended fix** | Run `npm install` to generate `package-lock.json`. Commit it. |
| **MVP?** | Yes — reproducible builds |

---

## 15. Duplicate Code

### ISSUE 15.1 — WhatsApp SVG Icon Duplicated 12 Times

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | 6 files, 12 occurrences |
| **Why it matters** | The exact same WhatsApp SVG `<path>` is copy-pasted 12 times across the codebase. If the icon needs updating, all 12 locations must be changed. |
| **Evidence** | `Layout.tsx:251,446,558`. `Dashboard.tsx:874,1292,1395,1832`. `Services.tsx:76,148`. `ChecklistSimulator.tsx:39,111`. `DocumentChecklistCalculator.tsx:991`. |
| **Recommended fix** | Extract to a `<WhatsAppIcon />` shared component. |
| **MVP?** | Later — maintenance improvement |

### ISSUE 15.2 — Toast setTimeout Pattern Duplicated 6 Times

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Dashboard.tsx:446,475,493,550,588,2036` |
| **Why it matters** | The pattern `setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)` is repeated 6 times with inconsistent delays (2000-3000ms). |
| **Evidence** | Lines 446, 475, 493, 550: 3000ms. Line 588: 2000ms. Line 2036: 2500ms. |
| **Recommended fix** | Extract a `useToast()` hook with a configurable auto-dismiss delay. |
| **MVP?** | Later — code quality |

### ISSUE 15.3 — localStorage Read/Parse Pattern Duplicated

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `Dashboard.tsx:331-339`, `Onboarding.tsx:43-48`, `NotificationCenter.tsx:33-57`, `Layout.tsx:32-46` |
| **Why it matters** | The pattern `localStorage.getItem(key)` → `JSON.parse()` → `try/catch` → type check is repeated 6 times with slight variations. |
| **Evidence** | 6 separate implementations of the same safe-read pattern across 4 files. |
| **Recommended fix** | Extract a `safeLocalStorageRead<T>(key, fallback)` utility function. |
| **MVP?** | Later — code quality |

---

## 16. Dead Code

### ISSUE 16.1 — Portfolio.tsx Is Never Routed

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Portfolio.tsx:1-62` |
| **Why it matters** | 62 lines of code that are never imported or rendered. Contains placeholder data referencing US cities (San Francisco, Austin, New York) — inconsistent with the Lagos-focused product. |
| **Evidence** | Grep for `Portfolio` across all files returns only: `Dashboard.tsx:325` (a comment), `Dashboard.tsx:838` (UI text "Permit Portfolio"), and `Portfolio.tsx:31` (the export). Never imported in `App.tsx`. |
| **Recommended fix** | Delete the file or repurpose it for a Lagos-focused portfolio page. |
| **MVP?** | Later — cleanup |

### ISSUE 16.2 — WHATSAPP_DISPLAY Imported but Unused in Services.tsx

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Services.tsx:3` |
| **Why it matters** | `WHATSAPP_DISPLAY` is imported but never used in the component. |
| **Evidence** | Line 3: `import { getWhatsAppQuoteLink, WHATSAPP_DISPLAY } from '../constants'`. Grep for `WHATSAPP_DISPLAY` in Services.tsx returns only the import line. |
| **Recommended fix** | Remove unused import. |
| **MVP?** | Later — cleanup |

### ISSUE 16.3 — OnboardingData.files Field Never Used

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `types.ts:29` |
| **Why it matters** | `files: File[]` is defined in `OnboardingData` but never populated or read by any component. |
| **Evidence** | `types.ts:29`: `files: File[]`. No component sets or reads `data.files`. |
| **Recommended fix** | Remove the field or implement file upload in onboarding. |
| **MVP?** | Later — cleanup |

---

## 17. Hard-coded Data

### ISSUE 17.1 — Seed Projects in Dashboard.tsx

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Dashboard.tsx:166-288` |
| **Why it matters** | 123 lines of hardcoded demo data (4 projects with tasks, documents, addresses) are embedded in the Dashboard component. This data is injected into localStorage on first load and merged on subsequent loads. |
| **Evidence** | Lines 166-288: `SEED_PROJECTS` array with full project objects including Lekki, Ikoyi, Ikeja, Victoria Island addresses. |
| **Recommended fix** | Move to a separate `seedData.ts` file. Make it configurable or remove for production. |
| **MVP?** | Later — demo data management |

### ISSUE 17.2 — Team Members Hardcoded in Dashboard.tsx

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Dashboard.tsx:64-67` |
| **Why it matters** | Two team members with Unsplash profile photos are hardcoded. Not from any backend or configuration. |
| **Evidence** | Lines 64-67: `TEAM_MEMBERS` array with `Tunde Bakare` and `Ngozi Okonjo`. |
| **Recommended fix** | Move to constants or fetch from backend. |
| **MVP?** | Later — demo data |

### ISSUE 17.3 — Lagos LGA List Hardcoded

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Onboarding.tsx:14-19` |
| **Why it matters** | The 20 Lagos LGAs are hardcoded in the Onboarding component. If Lagos state creates new LGAs or LCDAs, the list must be manually updated. |
| **Evidence** | Lines 14-19: `LAGOS_LGAS` array with 20 entries. |
| **Recommended fix** | Move to constants.ts. Consider fetching from an API for future-proofing. |
| **MVP?** | Later — data management |

---

## 18. Hard-coded URLs/Phone Numbers

### ISSUE 18.1 — WhatsApp Phone Number

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `constants.ts:4-5` |
| **Why it matters** | WhatsApp phone number `2348123456789` is hardcoded. The number appears to be a placeholder (812-345-6789 is a sequential pattern). If this is not the real business number, all WhatsApp links are broken. |
| **Evidence** | Line 4: `export const WHATSAPP_PHONE = '2348123456789'`. Line 5: `export const WHATSAPP_DISPLAY = '+234 812 345 6789'`. |
| **Recommended fix** | Verify the phone number is correct. If it's a placeholder, replace with the real number before launch. |
| **MVP?** | Yes — broken CTA if placeholder |

### ISSUE 18.2 — Unsplash Image URLs

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `Dashboard.tsx:65-66`, `About.tsx:102-104`, `Services.tsx:43`, `Landing.tsx:2-3` |
| **Why it matters** | Multiple Unsplash URLs are hardcoded for team photos, hero images, and service images. Unsplash URLs can change or become unavailable. |
| **Evidence** | `Dashboard.tsx:65`: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100`. `About.tsx:102-104`: 3 team photo URLs. `Services.tsx:43`: hero image URL. |
| **Recommended fix** | Download images and serve locally. Or use a CDN with stable URLs. |
| **MVP?** | Later — reliability improvement |

### ISSUE 18.3 — Email and Address Hardcoded

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `components/Layout.tsx:522,526` |
| **Why it matters** | Contact email `info@permitflow.ng` and address `Plot 14, CBD Alausa, Ikeja` are hardcoded in the Footer. |
| **Evidence** | Line 522: `<span>info@permitflow.ng</span>`. Line 526: `<span>Plot 14, CBD Alausa, Ikeja<br/>Lagos State, Nigeria</span>`. |
| **Recommended fix** | Move to constants.ts for single-source management. |
| **MVP?** | Later — maintainability |

---

## 19. Testing

### ISSUE 19.1 — No Tests Whatsoever

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | All files |
| **Why it matters** | Zero test files, no test framework configured, no test scripts in package.json. No regression safety net. Any code change could break existing functionality without detection. |
| **Evidence** | `glob("**/*.{test,spec}.{ts,tsx,js,jsx}")` returns zero results. `package.json` has no test script. No `vitest.config`, `jest.config`, or similar. |
| **Recommended fix** | Add Vitest + React Testing Library. Write tests for: utility functions, component rendering, user interactions, localStorage cycles. |
| **MVP?** | Yes — quality assurance |

---

## 20. Production Build

### ISSUE 20.1 — No Lint or Typecheck Scripts

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `package.json:6-10` |
| **Why it matters** | No `npm run lint` or `npm run typecheck` scripts. No ESLint or Prettier configured. Code quality is not enforced automatically. |
| **Evidence** | `package.json` scripts: only `dev`, `build`, `preview`. No `lint`, `typecheck`, `format`, or `test` scripts. |
| **Recommended fix** | Add ESLint + Prettier. Add `lint` and `typecheck` scripts. Run in CI. |
| **MVP?** | Yes — code quality enforcement |

### ISSUE 20.2 — No index.css File Exists

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `index.html:109` |
| **Why it matters** | `index.html:109` references `<link rel="stylesheet" href="/index.css">` but no CSS file exists in the project. This generates a 404 on every page load. |
| **Evidence** | `glob("**/*.css")` returns zero results. Line 109: `<link rel="stylesheet" href="/index.css">`. |
| **Recommended fix** | Either create the CSS file or remove the link tag. The custom styles in `index.html` `<style>` block (lines 58-97) may be intended to be in this file. |
| **MVP?** | Yes — broken resource link |

---

## 21. Deployment Readiness

### ISSUE 21.1 — No CI/CD Configuration

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | Project root (missing) |
| **Why it matters** | No GitHub Actions, GitLab CI, Vercel, Netlify, or any deployment configuration. No automated builds, tests, or deployments. |
| **Evidence** | No `.github/`, `.gitlab-ci.yml`, `vercel.json`, `netlify.toml`, or `Dockerfile`. |
| **Recommended fix** | Add deployment config for Vercel/Netlify (simplest for Vite SPA). |
| **MVP?** | Yes — required for production |

### ISSUE 21.2 — No Dockerfile or Containerization

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | Project root (missing) |
| **Why it matters** | No containerization for consistent deployment across environments. |
| **Evidence** | No `Dockerfile`, `docker-compose.yml`, or `.dockerignore`. |
| **Recommended fix** | Add Dockerfile for containerized deployments if needed. |
| **MVP?** | Later — deployment flexibility |

### ISSUE 21.3 — HashRouter Instead of BrowserRouter

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `App.tsx:3` |
| **Why it matters** | `HashRouter` produces URLs with `#` (e.g., `example.com/#/dashboard`). This is less clean than `BrowserRouter` but works without server-side URL rewriting. |
| **Evidence** | Line 3: `import { HashRouter as Router, Routes, Route } from 'react-router-dom'`. |
| **Recommended fix** | Switch to `BrowserRouter` and configure server-side fallback for SPA routing. |
| **MVP?** | Later — URL aesthetics |

---

## 22. Performance

### ISSUE 22.1 — Confetti Animation Memory Leak

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `views/Dashboard.tsx:410-431` |
| **Why it matters** | `triggerConfetti` starts a `requestAnimationFrame` loop but never calls `cancelAnimationFrame` on component unmount. If the user navigates away during the animation, the loop continues running. |
| **Evidence** | Line 410-431: `triggerConfetti` uses `requestRef.current = requestAnimationFrame(animate)`. No cleanup `useEffect` to cancel on unmount. `cancelAnimationFrame` is only called at line 429 when starting a new confetti, not on unmount. |
| **Recommended fix** | Add a cleanup `useEffect` that calls `cancelAnimationFrame(requestRef.current)` on unmount. |
| **MVP?** | Later — memory optimization |

### ISSUE 22.2 — No useMemo for Filtered Project List

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Dashboard.tsx:1606` |
| **Why it matters** | `(activeProject.tasks \|\| []).map(...)` creates a new array reference on every render, causing unnecessary re-renders of child components. |
| **Evidence** | Line 1606: Direct `.map()` on tasks array without memoization. |
| **Recommended fix** | Wrap in `useMemo` or extract to a memoized child component. |
| **MVP?** | Later — rendering optimization |

### ISSUE 22.3 — Inline Functions in JSX .map()

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Dashboard.tsx:746,994,1151,1300` |
| **Why it matters** | Arrow functions in JSX props create new function references on every render, defeating React's reconciliation optimization. |
| **Evidence** | Line 746: `onClick={() => { setProjectsFilter('All'); ... }}`. Line 1151: `onClick={() => handleSelectProject(p.id)}`. |
| **Recommended fix** | Extract handlers outside JSX or use `useCallback`. |
| **MVP?** | Later — micro-optimization |

---

## 23. Security

### ISSUE 23.1 — API Key in Client Bundle (Critical)

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `vite.config.ts:14`, `services/geminiService.ts:6` |
| **Why it matters** | The Gemini API key is baked into the client-side JavaScript via Vite's `define` config. Anyone can extract it from DevTools. Leads to API abuse, unexpected billing, and rate limiting. |
| **Evidence** | `vite.config.ts:14`: `'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)`. This is a static text replacement — the key appears as a string literal in the built JS bundle. |
| **Recommended fix** | Move all API calls to a backend proxy. Never expose secrets in client code. |
| **MVP?** | Yes — security vulnerability |

### ISSUE 23.2 — No Input Sanitization Layer

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | All form inputs |
| **Why it matters** | User inputs (address, description, notes) are rendered as React text content (auto-escaped, so no DOM XSS). However, there is no validation for format, length, or content. Users can enter arbitrary text including script-like content. |
| **Evidence** | All `<input>` and `<textarea>` elements have no `pattern`, `maxLength`, or custom validation. |
| **Recommended fix** | Add input validation (length limits, format patterns). Consider a sanitization library for user-generated content. |
| **MVP?** | Later — defense in depth |

### ISSUE 23.3 — Predictable IDs

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **File** | `views/Onboarding.tsx:67`, `views/Dashboard.tsx:499,537` |
| **Why it matters** | Project and document IDs are generated with `Math.random().toString(36).substr(2, N)`. These are predictable and could be guessed. Not a security risk for internal use but problematic if IDs are exposed in URLs. |
| **Evidence** | `Onboarding.tsx:67`: `Math.random().toString(36).substr(2, 6)`. `Dashboard.tsx:499`: `Math.random().toString(36).substr(2, 9)`. |
| **Recommended fix** | Use `crypto.randomUUID()` for cryptographically secure IDs. |
| **MVP?** | Later — ID security |

---

## Prioritized Remediation Matrix

### P0 — Critical (Fix Before Any Deployment)

| # | Issue | File | Effort | MVP? |
|---|-------|------|--------|------|
| 1 | handleSaveAndGoToDashboard undefined | `Onboarding.tsx:385` | 5 min | Yes |
| 2 | API key exposed in client bundle | `vite.config.ts:14` | 2-4 hrs | Yes |
| 3 | No Error Boundaries | All files | 1-2 hrs | Yes |
| 4 | No tests | All files | 1-2 days | Yes |
| 5 | No authentication | All files | 2-3 days | Yes |
| 6 | No backend server | All files | 3-5 days | Yes |

### P1 — High (Fix Before MVP Launch)

| # | Issue | File | Effort | MVP? |
|---|-------|------|--------|------|
| 7 | Contact fields uncontrolled | `Onboarding.tsx:371-381` | 30 min | Yes |
| 8 | No .env.example | Project root | 5 min | Yes |
| 9 | No lint/typecheck scripts | `package.json` | 30 min | Yes |
| 10 | No package-lock.json | Project root | 5 min | Yes |
| 11 | index.css missing (404) | `index.html:109` | 5 min | Yes |
| 12 | Dashboard types in component file | `Dashboard.tsx:8-103` | 30 min | Yes |
| 13 | localStorage no schema validation | 4 files | 2-3 hrs | Yes |
| 14 | WhatsApp phone placeholder | `constants.ts:4` | 5 min | Yes |
| 15 | Tailwind CDN in production | `index.html:11` | 2-4 hrs | Yes |
| 16 | Import maps for core deps | `index.html:98-108` | 2-4 hrs | Yes |
| 17 | File uploads metadata only | `Dashboard.tsx:533-555` | 1-2 days | Yes |
| 18 | No file type validation | `Dashboard.tsx:563-581` | 30 min | Yes |
| 19 | Only 3 aria-labels | Multiple | 2-3 hrs | Yes |
| 20 | div onClick without role | `Dashboard.tsx:1148` | 1 hr | Yes |
| 21 | No CI/CD config | Project root | 1-2 hrs | Yes |
| 22 | Gemini error returns string | `geminiService.ts:40-43` | 30 min | Yes |

### P2 — Medium (Fix After MVP, Before Scale)

| # | Issue | File | Effort | MVP? |
|---|-------|------|--------|------|
| 23 | Dashboard god component (2,042 lines) | `Dashboard.tsx` | 2-3 days | Later |
| 24 | No lazy loading | `App.tsx` | 1-2 hrs | Later |
| 25 | Duplicate route | `App.tsx:22-23` | 5 min | Later |
| 26 | No 404 route | `App.tsx` | 30 min | Later |
| 27 | Dark mode toggle missing | Multiple | 1-2 hrs | Later |
| 28 | WhatsApp SVG 12x duplication | 6 files | 1 hr | Later |
| 29 | Toast pattern 6x duplication | `Dashboard.tsx` | 1 hr | Later |
| 30 | localStorage read pattern 4x | 4 files | 1 hr | Later |
| 31 | DocumentViewerModal 1,170 lines | `DocumentViewerModal.tsx` | 1 day | Later |
| 32 | DocumentChecklistCalculator 1,010 lines | `DocumentChecklistCalculator.tsx` | 1 day | Later |
| 33 | Confetti memory leak | `Dashboard.tsx:410-431` | 30 min | Later |
| 34 | Canvas dimensions fixed | `Dashboard.tsx:735` | 30 min | Later |
| 35 | No focus trapping in modals | Multiple | 2-3 hrs | Later |
| 36 | Task checkboxes missing labels | `Dashboard.tsx:1618` | 30 min | Later |
| 37 | No loading state for AI roadmap | `Onboarding.tsx:73-78` | 30 min | Later |
| 38 | User input in prompt unsanitized | `geminiService.ts:8-28` | 1 hr | Later |
| 39 | No retry logic for API | `geminiService.ts:30-43` | 1 hr | Later |
| 40 | Seed data in component | `Dashboard.tsx:166-288` | 30 min | Later |
| 41 | Confetti class in component | `Dashboard.tsx:121-164` | 1 hr | Later |
| 42 | No localStorage quota handling | 21 write calls | 1-2 hrs | Later |
| 43 | 21 useState in Dashboard | `Dashboard.tsx:292-326` | 2-3 days | Later |

### P3 — Low (Fix When Convenient)

| # | Issue | File | Effort | MVP? |
|---|-------|------|--------|------|
| 44 | Portfolio.tsx dead code | `views/Portfolio.tsx` | 5 min | Later |
| 45 | WHATSAPP_DISPLAY unused import | `Services.tsx:3` | 5 min | Later |
| 46 | OnboardingData.files unused | `types.ts:29` | 5 min | Later |
| 47 | 8 console.error statements | 4 files | 15 min | Later |
| 48 | Predictable IDs | 3 locations | 15 min | Later |
| 49 | HashRouter → BrowserRouter | `App.tsx:3` | 30 min | Later |
| 50 | No Dockerfile | Project root | 30 min | Later |
| 51 | Unsplash URLs hardcoded | 4 files | 1 hr | Later |
| 52 | Email/address hardcoded | `Layout.tsx:522,526` | 15 min | Later |
| 53 | LGA list hardcoded | `Onboarding.tsx:14-19` | 15 min | Later |
| 54 | `any` types (5 locations) | 4 files | 30 min | Later |
| 55 | Footer links broken (#) | `Layout.tsx:535-536` | 15 min | Later |
| 56 | Print no styles | `Dashboard.tsx:1402` | 1 hr | Later |
| 57 | Inline functions in JSX | `Dashboard.tsx` | 1-2 hrs | Later |
| 58 | No useMemo for task list | `Dashboard.tsx:1606` | 15 min | Later |
| 59 | Mobile body scroll lock | `Layout.tsx:59-69` | 30 min | Later |
| 60 | FileReader no onerror | `Dashboard.tsx:571-577` | 15 min | Later |
