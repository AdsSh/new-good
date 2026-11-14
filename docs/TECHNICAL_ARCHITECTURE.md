# PermitFlow — Zero-Budget Technical Architecture

> Version: 1.0
> Date: 2026-08-29
> Status: MVP Design

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [System Overview](#2-system-overview)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Component Architecture](#4-component-architecture)
5. [State Architecture](#5-state-architecture)
6. [localStorage Abstraction](#6-localstorage-abstraction)
7. [Domain Model](#7-domain-model)
8. [Rules Engine](#8-rules-engine)
9. [AI Service Architecture](#9-ai-service-architecture)
10. [Serverless API Architecture](#10-serverless-api-architecture)
11. [Environment Variables](#11-environment-variables)
12. [Error-Handling Strategy](#12-error-handling-strategy)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Migration Path to Database/Auth](#15-migration-path-to-databaseauth)

---

## 1. Design Principles

| Principle | Meaning |
|-----------|---------|
| **Browser-first** | All state lives in the browser. No server holds user data in MVP. |
| **Zero-cost deployment** | Static hosting on Vercel/Netlify free tier. No always-on servers. |
| **Progressive enhancement** | Core flows work without JavaScript where possible. AI is additive. |
| **Security-conscious** | No secrets in client bundles. All localStorage writes validated. No PII logged. |
| **Migration-ready** | Every abstraction layer has a clear "swap to backend" seam. |
| **Single source of truth** | TypeScript types define the domain. No runtime schema drift. |

---

## 2. System Overview

### 2.1 MVP Architecture (Current + Planned)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                           │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  React    │  │  Router   │  │  State   │  │  localStorage    │   │
│  │  19 App   │──│  Hash     │──│  Layer   │──│  Abstraction     │   │
│  │           │  │  Router   │  │          │  │                  │   │
│  └────┬─────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│       │                                                             │
│       │  AI calls only                                             │
│       ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Gemini API (Direct)                        │   │
│  │              apiKey via import.meta.env                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    WhatsApp deep links                        │   │
│  │              wa.me/{phone}?text={encoded}                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

External Dependencies (CDN):
  - Tailwind CSS (cdn.tailwindcss.com)
  - Google Fonts (fonts.googleapis.com)
  - Material Icons (fonts.googleapis.com)
  - React + deps via import maps (esm.sh) [DEV ONLY — bundled at build]
```

### 2.2 Future SaaS Architecture (Phase 2+)

```
┌──────────────────────┐     ┌──────────────────────────────────────┐
│   BROWSER (Client)   │     │           CLOUD (Serverless)         │
│                      │     │                                      │
│  ┌────────┐          │     │  ┌──────────────┐  ┌─────────────┐  │
│  │ React  │─── API ──│────▶│  │ Vercel/Netlify│  │  Supabase   │  │
│  │  App   │  calls   │     │  │ Edge Functions│  │  (Postgres  │  │
│  └────────┘          │     │  └──────┬───────┘  │   + Auth)   │  │
│                      │     │         │           └──────┬──────┘  │
│  ┌──────────────┐    │     │         │                  │         │
│  │ Supabase     │◀───│─────│─────────┘                  │         │
│  │ JS Client    │    │     │  ┌──────────────┐           │         │
│  └──────────────┘    │     │  │  Gemini API  │◀──────────┘         │
│                      │     │  │  (via proxy) │                     │
│                      │     │  └──────────────┘                     │
└──────────────────────┘     └──────────────────────────────────────┘

New services:
  - Supabase: Postgres DB + Auth + Storage + Realtime
  - Edge Functions: Gemini proxy, webhook handlers
  - SendGrid/Termii: Email/SMS notifications
  - Paystack: Payment processing
```

### 2.3 Data Flow Diagram — MVP

```
User visits site
       │
       ▼
┌─────────────┐
│ Landing page │ ──▶ WhatsApp deep link ──▶ wa.me
└──────┬──────┘
       │
       ▼
┌──────────────┐     ┌─────────────────┐
│  Onboarding  │────▶│ Gemini API call  │ (optional, if key configured)
│  (4 steps)   │     └────────┬────────┘
└──────┬───────┘              │
       │                      ▼
       │              ┌───────────────┐
       │              │ AI Roadmap    │ (stored in project object)
       │              └───────────────┘
       ▼
┌──────────────┐     ┌─────────────────┐
│  Dashboard   │────▶│ localStorage    │
│  (CRUD)      │◀────│ (read/write)    │
└──────┬───────┘     └─────────────────┘
       │
       ▼
┌──────────────┐
│  WhatsApp    │ ──▶ wa.me/{phone}?text={contextual message}
│  (contact)   │
└──────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Build Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19.2 | Functional components, hooks, concurrent features |
| Language | TypeScript 5.8 | Type safety, IDE support, compile-time error detection |
| Bundler | Vite 6.2 | Fast dev server, native ESM, optimized builds |
| Styling | Tailwind CSS (CDN) | Zero-config utility classes, dark mode via `dark:` prefix |
| Routing | React Router DOM 7.11 | HashRouter for static hosting (no server-side routing needed) |
| AI | @google/genai 1.34 | Official Gemini SDK, client-side calls |
| Icons | Material Icons Outlined | Consistent icon set, CDN-loaded |

### 3.2 Module Resolution

**Development:** Import maps in `index.html` resolve `react`, `react-dom`, `react-router-dom`, and `@google/genai` via `esm.sh` CDN.

**Production:** Vite bundles everything into a single JS chunk (`index-{hash}.js`). CDN imports are replaced by bundled code.

```
index.html (dev)
  └── import maps → esm.sh CDN
        ├── react@19.2.3
        ├── react-dom@19.2.3
        ├── react-router-dom@7.11
        └── @google/genai@1.34

index.html (prod)
  └── assets/index-{hash}.js (single bundle, ~542 KB)
        └── All deps inlined
```

### 3.3 File Structure

```
permit-web/
├── index.html              # Entry HTML, Tailwind config, import maps
├── index.tsx               # React root mount
├── App.tsx                 # Router + route definitions
├── types.ts                # Shared TypeScript interfaces/enums
├── constants.ts            # WhatsApp config, service packages, phases, about data
├── vite.config.ts          # Vite config (no secrets in define)
│
├── services/
│   └── geminiService.ts    # Gemini AI roadmap generation
│
├── components/             # Reusable UI components
│   ├── Layout.tsx          # App shell (Navbar + Footer + WhatsApp FAB)
│   ├── NotificationCenter.tsx
│   ├── DocumentChecklistCalculator.tsx
│   └── DocumentViewerModal.tsx
│
├── views/                  # Page-level components (one per route)
│   ├── Landing.tsx
│   ├── Onboarding.tsx      # 4-step wizard
│   ├── Process.tsx
│   ├── Services.tsx
│   ├── ChecklistSimulator.tsx
│   ├── About.tsx
│   └── Dashboard.tsx       # God component (2,042 lines)
│
├── hooks/                  # [MVP: MISSING — planned]
│   └── useLocalStorage.ts
│
├── lib/                    # [MVP: MISSING — planned]
│   └── storage.ts
│
└── docs/                   # Documentation
    ├── CURRENT_SYSTEM_AUDIT.md
    ├── DEEP_TECHNICAL_AUDIT.md
    ├── DEVELOPMENT_RULES.md
    ├── MVP_PRD.md
    └── TECHNICAL_ARCHITECTURE.md
```

### 3.4 Routing

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Landing | Home page, value prop, CTAs |
| `/onboarding` | Onboarding | 4-step project creation wizard |
| `/process` | Process | LASPPPA 4-phase timeline |
| `/services` | Services | Pricing packages + WhatsApp links |
| `/checklist` | ChecklistSimulator | Interactive document readiness |
| `/simulator` | ChecklistSimulator | Alias for `/checklist` |
| `/about` | About | Company info, team, testimonials |
| `/dashboard` | Dashboard | Project management hub |

**No lazy loading in MVP.** All routes are eagerly imported. Dashboard (2,042 lines) is the largest chunk.

**404 handling:** Not implemented. Unknown routes render blank. Must add a catch-all route.

---

## 4. Component Architecture

### 4.1 Component Tree

```
<App>
  <HashRouter>
    <Layout>                          ← App shell (always rendered)
      ├── <Navbar />                  ← Sticky nav, mobile drawer, project count
      ├── <WhatsAppFAB />            ← Floating WhatsApp button
      ├── <Footer />                 ← Links, contact info
      └── {children}                 ← Page content from Router
            │
            ├── <Landing />
            ├── <Onboarding />
            ├── <Process />
            ├── <Services />
            ├── <ChecklistSimulator />
            │     └── <DocumentChecklistCalculator />
            ├── <About />
            └── <Dashboard />
                  ├── <NotificationCenter />
                  └── <DocumentViewerModal />
```

### 4.2 Component Classification

| Component | Type | Lines | State | Reusable? |
|-----------|------|-------|-------|-----------|
| `Layout.tsx` | Shell | 563 | 4 useState | No — app-specific |
| `Navbar` | Shell (inline) | ~200 | 4 useState | No |
| `Landing` | Page | 146 | 0 useState | No |
| `Onboarding` | Page | 404 | 5 useState | No |
| `Process` | Page | 98 | 0 useState | No |
| `Services` | Page | 170 | 0 useState | No |
| `ChecklistSimulator` | Page (wrapper) | 127 | 0 useState | No |
| `DocumentChecklistCalculator` | Feature | 1,010 | ~8 useState | Yes (if extracted) |
| `About` | Page | 143 | 0 useState | No |
| `Dashboard` | Page (god) | 2,042 | 21 useState | No |
| `NotificationCenter` | Feature | 541 | ~6 useState | Yes (if refactored) |
| `DocumentViewerModal` | Feature | 1,170 | ~4 useState | Yes |

### 4.3 MVP Component Rules

1. **No new components unless a feature requires it.** The current set is sufficient.
2. **Dashboard must NOT gain new `useState` calls.** It already has 21. Extract to sub-components first.
3. **All components use functional form + hooks.** No class components.
4. **No `React.memo` in MVP.** Premature optimization. Add after profiling.
5. **No Context providers.** All state is local or in localStorage.
6. **All icons use Material Icons Outlined** via `<span className="material-icons-outlined">`.
7. **Dark mode via `dark:` prefix** on all color utilities.

### 4.4 Component Interface Patterns

**Page components** receive no props (they read from localStorage directly):
```tsx
// views/Landing.tsx
export const Landing: React.FC = () => { ... }
```

**Feature components** receive data via props or read from localStorage:
```tsx
// components/DocumentViewerModal.tsx
interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProjectDocument;
  project: PermitProject;
}
```

**Layout** wraps children via React's `children` prop:
```tsx
// components/Layout.tsx
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => { ... }
```

---

## 5. State Architecture

### 5.1 State Map (MVP)

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 COMPONENT STATE                      │   │
│  │              (useState in each component)            │   │
│  │                                                      │   │
│  │  Layout:       4 state vars (scroll, mobile, count)  │   │
│  │  Onboarding:   5 state vars (step, data, loading)    │   │
│  │  Dashboard:   21 state vars (projects, filters, ...) │   │
│  │  NotificationCenter: 6 state vars                    │   │
│  │  DocumentViewerModal: 4 state vars                   │   │
│  │  DocumentChecklistCalculator: ~8 state vars          │   │
│  │                                                      │   │
│  │  TOTAL: ~48 useState calls across the app            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PERSISTENT STATE (localStorage)         │   │
│  │                                                      │   │
│  │  Key: userProjects         → PermitProject[]          │   │
│  │  Key: currentProject       → PermitProject            │   │
│  │  Key: permitHub_documentChecklist → ChecklistState    │   │
│  │  Key: permitflow_read_notifications → string[]        │   │
│  │  Key: permitflow_dismissed_notifications → string[]   │   │
│  │  Key: permitflow_custom_notifications → Notification[]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              URL STATE (React Router)                │   │
│  │                                                      │   │
│  │  HashRouter: #/dashboard, #/onboarding, etc.         │   │
│  │  No query params, no route params in MVP             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              EXTERNAL STATE                          │   │
│  │                                                      │   │
│  │  Gemini API response → stored in PermitProject       │   │
│  │  WhatsApp links → opened in new tab (no state)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 State Flow

```
┌──────────────┐   setUser()    ┌──────────────────┐   setItem()   ┌──────────────┐
│  Onboarding  │──────────────▶│   localStorage    │◀─────────────│  Dashboard   │
│  (write)     │               │   (persistence)   │─────────────▶│  (read)      │
└──────────────┘               └──────────────────┘              └──────────────┘
      │                                ▲                              │
      │     navigate('/dashboard')     │     getItem()                │
      └────────────────────────────────┘                              │
                                                                      │
┌──────────────┐   setItem()    ┌──────────────────┐   getItem()   ┌──────────────┐
│  Document    │──────────────▶│   localStorage    │◀─────────────│  Onboarding  │
│  Checklist   │               │   permitHub_*     │─────────────▶│  (import)    │
└──────────────┘               └──────────────────┘              └──────────────┘
```

### 5.3 State Synchronization Rules

1. **localStorage is the source of truth** for all persistent data.
2. **Component state is ephemeral** — re-initialized from localStorage on mount.
3. **Write-through pattern:** Every state change that should persist also writes to localStorage.
4. **No optimistic updates** — writes are synchronous (localStorage is sync API).
5. **No conflict resolution** — single browser, single user. If two tabs open, the last write wins.
6. **`storage` event** — Layout.tsx listens for cross-tab sync (read only).

### 5.4 Future State Architecture (SaaS)

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION STATE                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SERVER STATE (Supabase)                 │   │
│  │                                                      │   │
│  │  projects table     ← PermitProject[]                │   │
│  │  documents table    ← ProjectDocument[]              │   │
│  │  tasks table        ← Task[]                         │   │
│  │  users table        ← User (auth)                    │   │
│  │  notifications      ← AppNotification[]              │   │
│  │                                                      │   │
│  │  Real-time sync via Supabase Realtime                 │   │
│  │  Optimistic updates with rollback                     │   │
│  │  Conflict resolution: last-write-wins                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CLIENT STATE (React Query / Zustand)    │   │
│  │                                                      │   │
│  │  Server cache: useQuery / useMutation                 │   │
│  │  UI state: Zustand store                              │   │
│  │  Form state: React Hook Form                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AUTH STATE (Supabase Auth)               │   │
│  │                                                      │   │
│  │  Session: JWT in httpOnly cookie                      │   │
│  │  User: id, email, role                                │   │
│  │  RLS policies: user can only access own projects      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. localStorage Abstraction

### 6.1 Current State (Raw Calls)

23 raw `localStorage.getItem` / `localStorage.setItem` calls across 5 files. No abstraction, no validation, no type safety.

### 6.2 MVP Abstraction Layer

Create `lib/storage.ts` — a typed wrapper around localStorage:

```typescript
// lib/storage.ts

type StorageKey = 
  | 'userProjects'
  | 'currentProject'
  | 'permitHub_documentChecklist'
  | 'permitflow_read_notifications'
  | 'permitflow_dismissed_notifications'
  | 'permitflow_custom_notifications';

interface StorageSchema {
  'userProjects': PermitProject[];
  'currentProject': PermitProject;
  'permitHub_documentChecklist': {
    readyDocs: string[];
    neededDocs: string[];
    readinessScore: number;
    estimatedDays: string;
  };
  'permitflow_read_notifications': string[];
  'permitflow_dismissed_notifications': string[];
  'permitflow_custom_notifications': AppNotification[];
}

export const storage = {
  get<K extends StorageKey>(key: K): StorageSchema[K] | null { ... },
  set<K extends StorageKey>(key: K, value: StorageSchema[K]): void { ... },
  remove<K extends StorageKey>(key: K): void { ... },
  clear(): void { ... },  // danger zone
};
```

### 6.3 Abstraction Rules

| Rule | Why |
|------|-----|
| Always `try-catch` localStorage reads | Corrupted data = runtime crash |
| Validate shape after parse | Wrong shape = silent bugs |
| Never store `File` objects | File objects aren't serializable (OnboardingData.files bug) |
| Never store functions | localStorage only handles JSON-serializable data |
| Max 5 MB per origin | Browser limit. Projects with many documents could hit this. |
| Wrap all writes in the abstraction | Enables future swap to IndexedDB or Supabase |

### 6.4 Migration Path

When moving to a database:

1. Replace `lib/storage.ts` internals with Supabase client calls
2. Keep the same `get`/`set`/`remove` API
3. Add async variants (Supabase calls are async)
4. Add real-time subscriptions for multi-device sync

```typescript
// Future: lib/storage.ts (Supabase-backed)
export const storage = {
  async get<K extends StorageKey>(key: K): Promise<StorageSchema[K] | null> {
    const { data } = await supabase.from('projects').select('*').eq('key', key);
    return data;
  },
  // ...
};
```

---

## 7. Domain Model

### 7.1 Entity Relationship (MVP)

```
┌─────────────────────────────────────────────────┐
│                 OnboardingData                   │
│  (types.ts — created during onboarding wizard)   │
│                                                  │
│  id: string (LAS-XXXXXX)                        │
│  propertyType: string                            │
│  projectScope: string                            │
│  cOfOStatus: string                              │
│  timeline: string                                │
│  address: string                                 │
│  lga: string                                     │
│  titleType: string                               │
│  sqft: string                                    │
│  valuation: string                               │
│  description: string                             │
│  selectedPackage: string | null                  │
│  email: string                                   │
│  contactName: string                             │
│  phone: string                                   │
│  status: ProjectStatus (enum)                    │
│  createdAt: number (timestamp)                   │
│  dateCreated: string (formatted)                 │
└──────────────────────┬──────────────────────────┘
                       │ extends
                       ▼
┌─────────────────────────────────────────────────┐
│                 PermitProject                    │
│  (Dashboard.tsx — extends OnboardingData)        │
│                                                  │
│  + statusCategory: PermitStatusCategory          │
│  + actionRequiredNote?: string                   │
│  + daysRemaining?: number                        │
│  + lastUpdated?: string                          │
│  + quickNotes?: string                           │
│  + aiRoadmap?: string                            │
│  + tasks?: Task[]                                │
│  + documents?: ProjectDocument[]                 │
│  + internalNotes?: InternalNote[]                │
└──────────────────────┬──────────────────────────┘
                       │ contains
                       ▼
┌────────────────────────────┐    ┌────────────────────────────┐
│         Task               │    │     ProjectDocument         │
│                            │    │                              │
│  id: string                │    │  id: string                  │
│  title: string             │    │  name: string                │
│  completed: boolean        │    │  size: string                │
│  category: string          │    │  sizeBytes: number           │
│  assignedTo?: string       │    │  type: string (extension)    │
│  comments?: ItemComment[]  │    │  icon: string                │
└────────────────────────────┘    │  date: string                │
                                  │  timestamp: number           │
                                  │  assignedTo?: string         │
                                  │  comments?: ItemComment[]    │
                                  │  previewUrl?: string         │
                                  └────────────────────────────┘

┌────────────────────────────┐    ┌────────────────────────────┐
│      ItemComment           │    │     InternalNote            │
│                            │    │                              │
│  id: string                │    │  id: string                  │
│  authorId: string          │    │  text: string                │
│  text: string              │    │  timestamp: number           │
│  timestamp: number         │    └────────────────────────────┘
└────────────────────────────┘

┌────────────────────────────┐    ┌────────────────────────────┐
│      TeamMember            │    │    AppNotification          │
│  (hardcoded in Dashboard)  │    │  (NotificationCenter)       │
│                            │    │                              │
│  id: string                │    │  id: string                  │
│  name: string              │    │  type: string                │
│  role: string              │    │  title: string               │
│  img: string (URL)         │    │  message: string             │
└────────────────────────────┘    │  timestamp: number           │
                                  │  read: boolean               │
                                  │  projectId?: string          │
                                  └────────────────────────────┘

┌────────────────────────────┐
│     ServicePackage         │
│  (constants.ts)            │
│                            │
│  id: string                │
│  name: string              │
│  price: string             │
│  priceSub: string          │
│  description: string       │
│  features: string[]        │
│  popular?: boolean         │
│  colorClass: string        │
└────────────────────────────┘
```

### 7.2 Enums

```typescript
enum ProjectType {
  RESIDENTIAL_NEW = 'residential-new',
  COMMERCIAL = 'commercial',
  RENOVATION = 'renovation',
  REGULARIZATION = 'regularization'
}

enum ProjectStatus {
  DOCUMENTS_RECEIVED = 'Documents Received',
  UNDER_REVIEW = 'District Office Review',
  SUBMITTED = 'Submitted to Alausa',
  AUTHORITY_FEEDBACK = 'Assessment Issued',
  APPROVED = 'Permit Collected'
}
```

### 7.3 Domain Model Issues (MVP)

| Issue | Location | Impact |
|-------|----------|--------|
| `PermitProject` defined in Dashboard.tsx, not types.ts | Dashboard.tsx:10 | Other components import from Dashboard (circular risk) |
| `Task`, `ProjectDocument`, `InternalNote` not exported | Dashboard.tsx | Cannot be used by other components |
| `TeamMember` hardcoded with Unsplash URLs | Dashboard.tsx:89 | No way to manage team without code changes |
| `OnboardingData.files: File[]` never populated | types.ts:29 | Dead field |
| `ServicePackage.id` is string, not enum | types.ts:39 | No compile-time checking |

---

## 8. Rules Engine

### 8.1 Current Rules (Scattered Across Components)

The "rules engine" in MVP is implicit — hardcoded logic in multiple components:

| Rule | Location | Logic |
|------|----------|-------|
| **Document readiness score** | DocumentChecklistCalculator.tsx | `readyDocs.length / totalDocs.length * 100` |
| **Mandatory document filtering** | DocumentChecklistCalculator.tsx:87-106 | `if (doc.mandatory && !userSelections[doc.id])` |
| **Timeline estimate** | DocumentChecklistCalculator.tsx:118-142 | Based on `readinessScore` ranges |
| **Status category mapping** | Dashboard.tsx:347-367 | `statusCategory` based on `ProjectStatus` enum |
| **Task completion confetti** | Dashboard.tsx:121-164 | Canvas animation triggered on all tasks done |
| **WhatsApp message generation** | constants.ts:8-19 | Template strings with conditional context |
| **Project creation validation** | Onboarding.tsx:210,301 | `disabled={!data.field}` on buttons |

### 8.2 MVP Rules Definition

```
┌─────────────────────────────────────────────────────────────┐
│                    RULES ENGINE (MVP)                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RULE: Document Readiness Score                     │   │
│  │                                                      │   │
│  │  IF readyDocs.length == 0 THEN score = 0            │   │
│  │  ELSE score = round(readyDocs.length / totalDocs * 100)│ │
│  │                                                      │   │
│  │  Used by: DocumentChecklistCalculator                │   │
│  │  Stored: permitHub_documentChecklist.readinessScore  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RULE: Timeline Estimate                            │   │
│  │                                                      │   │
│  │  IF score >= 90 THEN "30-45 working days"           │   │
│  │  IF score >= 70 THEN "45-60 working days"           │   │
│  │  IF score >= 50 THEN "60-90 working days"           │   │
│  │  ELSE "90-120+ working days"                         │   │
│  │                                                      │   │
│  │  Used by: DocumentChecklistCalculator                │   │
│  │  Stored: permitHub_documentChecklist.estimatedDays   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RULE: Mandatory Documents                          │   │
│  │                                                      │   │
│  │  IF doc.mandatory == true THEN                      │   │
│  │    IF doc.dependsOn.length > 0 THEN                │   │
│  │      IF any dependency not ready THEN skip rule     │   │
│  │      ELSE enforce mandatory                         │   │
│  │    ELSE enforce mandatory                            │   │
│  │                                                      │   │
│  │  Used by: DocumentChecklistCalculator                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RULE: Status Category                              │   │
│  │                                                      │   │
│  │  DOCUMENTS_RECEIVED → "In Review"                   │   │
│  │  UNDER_REVIEW       → "In Review"                   │   │
│  │  SUBMITTED          → "Submitted"                   │   │
│  │  AUTHORITY_FEEDBACK → "Action Required"             │   │
│  │  APPROVED           → "Approved"                    │   │
│  │                                                      │   │
│  │  Used by: Dashboard (filter buttons)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RULE: WhatsApp Message Templates                   │   │
│  │                                                      │   │
│  │  IF serviceName provided THEN                       │   │
│  │    "quote for {serviceName} ({price})"              │   │
│  │  ELIF customContext provided THEN                   │   │
│  │    "regarding: {customContext}"                      │   │
│  │  ELSE                                               │   │
│  │    "general inquiry"                                 │   │
│  │                                                      │   │
│  │  Used by: constants.ts getWhatsAppQuoteLink()        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 MVP Rules as Code

```typescript
// lib/rules.ts (planned — not yet created)

export const readinessScore = (readyCount: number, totalCount: number): number => {
  if (totalCount === 0) return 0;
  return Math.round((readyCount / totalCount) * 100);
};

export const timelineEstimate = (score: number): string => {
  if (score >= 90) return '30-45 working days';
  if (score >= 70) return '45-60 working days';
  if (score >= 50) return '60-90 working days';
  return '90-120+ working days';
};

export const statusCategory = (status: ProjectStatus): PermitStatusCategory => {
  const map: Record<ProjectStatus, PermitStatusCategory> = {
    [ProjectStatus.DOCUMENTS_RECEIVED]: 'In Review',
    [ProjectStatus.UNDER_REVIEW]: 'In Review',
    [ProjectStatus.SUBMITTED]: 'Submitted',
    [ProjectStatus.AUTHORITY_FEEDBACK]: 'Action Required',
    [ProjectStatus.APPROVED]: 'Approved',
  };
  return map[status];
};
```

### 8.4 Future Rules Engine (SaaS)

Move rules to a server-side module with:
- Versioned rule sets (v1, v2, ...)
- A/B testing capability
- Admin-editable via a dashboard
- Audit trail for rule changes

```
┌─────────────────────────────────────────┐
│           RULES ENGINE (SaaS)           │
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │  Rule Store   │  │  Rule Runner  │  │
│  │  (JSON/YAML)  │──│  (serverless) │  │
│  └───────────────┘  └───────┬───────┘  │
│                             │          │
│  ┌───────────────┐          │          │
│  │  Rule Version │          │          │
│  │  Registry     │          │          │
│  └───────────────┘          ▼          │
│                       ┌──────────┐     │
│                       │  Audit   │     │
│                       │  Log     │     │
│                       └──────────┘     │
└─────────────────────────────────────────┘
```

---

## 9. AI Service Architecture

### 9.1 MVP: Direct Gemini Calls

```
┌──────────────────┐                    ┌──────────────────┐
│  Browser          │                    │  Google Gemini    │
│                   │   POST /generate   │  API              │
│  Onboarding.tsx   │──────────────────▶│                   │
│       │           │   (client-side)    │  gemini-3-flash   │
│       ▼           │                    │                   │
│  geminiService.ts │◀──────────────────│  response.text    │
│       │           │   Markdown text    │                   │
│       ▼           │                    └──────────────────┘
│  PermitProject    │
│  .aiRoadmap       │
│  (stored in LS)   │
└──────────────────┘
```

**Security concern:** API key is in `import.meta.env.VITE_GEMINI_API_KEY`, which Vite inlines into the client bundle at build time. Anyone can extract it from the JS file.

**MVP acceptance:** For a zero-budget MVP with low traffic, this is acceptable. The key has no billing access (Gemini free tier). Document the risk.

### 9.2 AI Service Design

```typescript
// services/geminiService.ts

interface GeminiConfig {
  model: string;
  temperature: number;
  topP: number;
}

interface GeminiPrompt {
  system: string;
  project: OnboardingData;
}

interface GeminiResponse {
  text: string;
  error?: string;
}

const DEFAULT_CONFIG: GeminiConfig = {
  model: 'gemini-3-flash-preview',
  temperature: 0.7,
  topP: 0.95,
};

export const generatePermitRoadmap = async (
  data: OnboardingData,
  config: Partial<GeminiConfig> = {}
): Promise<string> => {
  // 1. Validate API key exists
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    return 'AI roadmap generation is not configured. Your consultant will provide a personalized roadmap during your consultation.';
  }

  // 2. Build prompt
  const prompt = buildPrompt(data);

  // 3. Call Gemini with retry
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: mergedConfig.model,
      contents: prompt,
      config: {
        temperature: mergedConfig.temperature,
        topP: mergedConfig.topP,
      },
    });
    return response.text;
  } catch (error) {
    console.error('Gemini Roadmap Generation Failed:', error);
    return 'Error generating roadmap. Our consultants will provide this during your consultation.';
  }
};

const buildPrompt = (data: OnboardingData): string => { ... };
```

### 9.3 Prompt Design

```
System: You are a senior regulatory consultant for LASPPPA.
        Analyze this project and provide a permit roadmap.

Project context:
  - Type: {propertyType}
  - Address: {address}
  - LGA: {lga}
  - Title: {titleType}
  - Size: {sqft} sqm
  - Value: ₦{valuation}
  - Description: {description}

Response format (Markdown):
  1. Regulatory Complexity (Low/Medium/High)
  2. Required Documents (LASPPPA-specific)
  3. Estimated Timeline
  4. Lagos Expert Tip (zoning/setbacks/LASBCA)
```

### 9.4 Future AI Architecture (SaaS)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Browser     │────▶│  Edge Function   │────▶│  Gemini API      │
│              │     │  /api/roadmap     │     │                  │
│  No API key  │     │  (Vercel/Netlify)│     │  Key on server   │
│  on client   │     │                  │     │  only            │
└──────────────┘     │  - Rate limiting │     └──────────────────┘
                     │  - Caching       │
                     │  - Prompt guard   │
                     │  - Cost tracking  │
                     └──────────────────┘
```

Benefits of server-side proxy:
- API key never exposed to client
- Rate limiting prevents abuse
- Response caching saves API calls
- Prompt injection prevention
- Cost tracking per user

---

## 10. Serverless API Architecture

### 10.1 MVP: No API Server

The MVP has **no API server**. All logic runs in the browser. The only external call is to Gemini (client-side).

### 10.2 Future API Routes (SaaS)

When backend is needed, add Vercel/Netlify Edge Functions:

```
/api/
├── roadmap/
│   └── POST /api/roadmap          → Gemini proxy
├── projects/
│   ├── GET    /api/projects       → List user projects
│   ├── POST   /api/projects       → Create project
│   ├── GET    /api/projects/:id   → Get project
│   ├── PUT    /api/projects/:id   → Update project
│   └── DELETE /api/projects/:id   → Delete project
├── documents/
│   ├── POST   /api/documents/upload → Upload to Supabase Storage
│   └── DELETE /api/documents/:id    → Delete document
├── notifications/
│   ├── GET    /api/notifications    → List notifications
│   └── PUT    /api/notifications/:id/read → Mark as read
├── webhooks/
│   └── POST /api/webhooks/whatsapp  → WhatsApp Business API
└── auth/
    ├── POST /api/auth/login          → Supabase Auth
    ├── POST /api/auth/signup         → Supabase Auth
    └── POST /api/auth/logout         → Supabase Auth
```

### 10.3 Edge Function Template (Future)

```typescript
// api/roadmap.ts (Vercel Edge Function)

import { GoogleGenAI } from '@google/genai';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  // 1. Authenticate
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return new Response('Unauthorized', { status: 401 });

  // 2. Validate input
  const { projectData } = await req.json();
  if (!projectData?.propertyType) return new Response('Invalid input', { status: 400 });

  // 3. Rate limit (per user, per hour)
  const userId = await verifyToken(token);
  if (await isRateLimited(userId)) return new Response('Rate limited', { status: 429 });

  // 4. Call Gemini (key on server only)
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({ ... });

  // 5. Cache response
  await cacheResponse(userId, projectData.id, response.text);

  // 6. Return
  return new Response(JSON.stringify({ roadmap: response.text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 11. Environment Variables

### 11.1 MVP Variables

| Variable | File | Required | Default | Notes |
|----------|------|----------|---------|-------|
| `VITE_GEMINI_API_KEY` | `.env.local` | No | `""` | AI roadmap disabled if empty |

**No other environment variables are needed for MVP.**

### 11.2 Environment File Layout

```
.env.example          # Documented template (committed to git)
.env.local            # Actual values (gitignored)
.env.development      # Dev-specific defaults
.env.production       # Prod-specific defaults
```

### 11.3 `.env.example`

```bash
# Gemini API key for AI roadmap generation
# Get from: https://aistudio.google.com/apikey
# Leave empty to disable AI features
VITE_GEMINI_API_KEY=
```

### 11.4 Future Variables (SaaS)

| Variable | Phase | Required | Notes |
|----------|-------|----------|-------|
| `VITE_SUPABASE_URL` | Phase 2 | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Phase 2 | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 2 | Yes (server only) | Never expose to client |
| `GEMINI_API_KEY` | Phase 2 | Yes (server only) | Move from client to server |
| `SENDGRID_API_KEY` | Phase 3 | Yes (server only) | Email notifications |
| `TERMII_API_KEY` | Phase 3 | Yes (server only) | SMS notifications (Nigeria) |
| `PAYSTACK_SECRET_KEY` | Phase 4 | Yes (server only) | Payment processing |
| `WHATSAPP_BUSINESS_TOKEN` | Phase 3 | Yes (server only) | WhatsApp Business API |

### 11.5 Security Rules

| Rule | Why |
|------|-----|
| Never prefix server-only keys with `VITE_` | Vite inlines `VITE_*` into client bundle |
| Never commit `.env.local` | Contains actual secrets |
| Always provide `.env.example` | Documents required variables |
| Use `import.meta.env.VITE_*` in client | Only way to access Vite env vars in browser |
| Use `process.env.*` in server code | Standard Node.js env access |

---

## 12. Error-Handling Strategy

### 12.1 MVP Error Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING (MVP)                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 1: Component-level try-catch                  │   │
│  │                                                      │   │
│  │  - localStorage reads: try-catch, fallback to []    │   │
│  │  - JSON.parse: try-catch, fallback to null           │   │
│  │  - Gemini API: try-catch, return fallback message   │   │
│  │  - File operations: try-catch, show toast error     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 2: UI error states                            │   │
│  │                                                      │   │
│  │  - Toast notifications (3-second auto-dismiss)      │   │
│  │  - Loading spinners during async operations          │   │
│  │  - Disabled buttons during pending state             │   │
│  │  - Empty states when no data                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 3: Fallback content                           │   │
│  │                                                      │   │
│  │  - Gemini fails → "Consultant will provide roadmap" │   │
│  │  - No projects → Empty state with CTA               │   │
│  │  - localStorage full → "Storage full, clear old data"│  │
│  │  - Image fails → Broken image placeholder           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 4: Console logging                            │   │
│  │                                                      │   │
│  │  - console.error for caught exceptions               │   │
│  │  - No console.log in production                      │   │
│  │  - No user-facing error details (security)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Error Boundaries (MVP: Missing)

**No error boundaries exist.** If a component throws during render, the entire app crashes.

**MVP fix:** Add a single error boundary at the App level:

```typescript
// components/ErrorBoundary.tsx (planned)

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1>Something went wrong</h1>
            <p>Please refresh the page or contact support.</p>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 12.3 Toast Notification System

Current implementation (Dashboard.tsx):
```typescript
const [toast, setToast] = useState<string | null>(null);

const showToast = (msg: string) => {
  setToast(msg);
  setTimeout(() => setToast(null), 3000);
};
```

**Issues:**
- 6 different `setTimeout` patterns for toasts across the codebase
- No centralized toast queue
- Toasts disappear after 3s (may be too fast for important messages)

**MVP recommendation:** Keep as-is. Standardize after user testing.

### 12.4 Future Error Handling (SaaS)

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING (SaaS)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 5: Error reporting service                    │   │
│  │                                                      │   │
│  │  - Sentry or LogRocket integration                  │   │
│  │  - Stack traces + user context                      │   │
│  │  - Alerting for critical errors                      │   │
│  │  - Free tier: 5K errors/month (Sentry)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 6: Retry logic                                │   │
│  │                                                      │   │
│  │  - Exponential backoff for API calls                │   │
│  │  - Offline detection + queue                        │   │
│  │  - Optimistic updates with rollback                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Layer 7: Structured logging                         │   │
│  │                                                      │   │
│  │  - Request ID correlation                           │   │
│  │  - User ID in logs                                  │   │
│  │  - Log levels (error, warn, info, debug)            │   │
│  │  - Never log PII or secrets                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Testing Strategy

### 13.1 MVP: No Tests

**Current state:** Zero test files. No test framework configured. No test scripts in package.json.

**MVP recommendation:** Do NOT add tests yet. The app is small enough to verify manually. Tests add maintenance burden before the product is validated.

**Manual verification checklist (per deployment):**
1. `npm run build` succeeds
2. Landing page loads, all links work
3. Onboarding: complete all 4 steps, no crash
4. Dashboard: create project, filter, search, inspect
5. WhatsApp links open correctly
6. Mobile nav drawer works
7. No console errors

### 13.2 Post-MVP Testing (Phase 1)

When adding tests, use this stack:

| Tool | Purpose | Config |
|------|---------|--------|
| Vitest | Test runner | `vitest.config.ts` |
| React Testing Library | Component tests | `@testing-library/react` |
| JSDOM | Browser simulation | Built into Vitest |
| MSW | API mocking (for Gemini) | `msw` |

### 13.3 Test File Structure (Future)

```
src/
├── lib/
│   ├── storage.test.ts        # localStorage abstraction
│   ├── rules.test.ts          # Rules engine
│   └── __mocks__/
├── components/
│   ├── Layout.test.tsx        # Navbar, Footer
│   └── DocumentChecklistCalculator.test.tsx
├── views/
│   ├── Onboarding.test.tsx    # Full wizard flow
│   ├── Dashboard.test.tsx     # Project CRUD
│   └── Landing.test.tsx
├── services/
│   └── geminiService.test.ts  # Mocked Gemini calls
└── e2e/
    └── onboarding.spec.ts     # Playwright E2E
```

### 13.4 Priority Test Cases (Future)

| Priority | Test | Type |
|----------|------|------|
| P0 | Onboarding completes without crash | E2E |
| P0 | Project appears in dashboard after creation | E2E |
| P0 | WhatsApp links have correct phone/message | Unit |
| P1 | Document checklist calculates correct score | Unit |
| P1 | Timeline estimate matches score | Unit |
| P1 | localStorage corruption doesn't crash app | Unit |
| P2 | Dark mode renders all pages correctly | Visual |
| P2 | Mobile nav drawer opens/closes | E2E |
| P3 | Gemini failure shows fallback message | Integration |

---

## 14. Deployment Architecture

### 14.1 MVP Deployment

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Developer    │     │  Git Provider    │     │  Hosting     │
│  (local)      │     │  (GitHub)        │     │  (Vercel)    │
│               │     │                  │     │              │
│  git push     │────▶│  Trigger build   │────▶│  Static      │
│               │     │                  │     │  files       │
└──────────────┘     └──────────────────┘     │  deployed    │
                                               │              │
                                               │  *.vercel.app│
                                               └──────┬───────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  Custom      │
                                               │  domain      │
                                               │  (optional)  │
                                               └──────────────┘
```

### 14.2 Build Pipeline

```
1. Developer pushes to GitHub
2. Vercel detects push
3. Vercel runs:
   a. npm install
   b. npm run build
   c. Output: dist/ folder
4. Vercel deploys dist/ to edge network
5. Vercel assigns preview URL (or updates production)
6. Total time: ~60 seconds
```

### 14.3 Build Output

```
dist/
├── index.html                    (4.7 KB)
├── assets/
│   ├── index-{hash}.js          (542 KB → 148 KB gzipped)
│   ├── hero_bg_{hash}.jpg       (1.1 MB)
│   └── solutions_img_{hash}.jpg (784 KB)
└── [no server-side code]
```

### 14.4 Deployment Platforms (Zero Budget)

| Platform | Free Tier | Custom Domain | HTTPS | Build Time |
|----------|-----------|---------------|-------|------------|
| **Vercel** | 100 GB bandwidth/mo | Yes | Yes | ~60s |
| **Netlify** | 100 GB bandwidth/mo | Yes | Yes | ~60s |
| **GitHub Pages** | 1 GB storage | Yes | Yes | ~90s |
| **Cloudflare Pages** | Unlimited bandwidth | Yes | Yes | ~60s |

**Recommended:** Vercel (best DX, automatic previews, easy rollback).

### 14.5 Performance Budget (MVP)

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 2s | ~1.5s (CDN Tailwind) |
| Largest Contentful Paint | < 4s | ~3s (large images) |
| Total Bundle Size | < 600 KB | 542 KB JS |
| Image Assets | < 2 MB | 1.9 MB (2 JPGs) |
| Lighthouse Performance | ≥ 70 | ~75 |
| Lighthouse Accessibility | ≥ 80 | ~85 |

### 14.6 Future Deployment (SaaS)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Developer    │     │  GitHub          │     │  Vercel      │
│               │────▶│                  │────▶│              │
│  git push     │     │  CI: lint, test, │     │  Edge:       │
│               │     │  build, typecheck│     │  - /api/*    │
└──────────────┘     └──────────────────┘     │  - index.html│
                                               └──────┬───────┘
                                                      │
                    ┌─────────────────────────────────┤
                    │                                 │
                    ▼                                 ▼
             ┌──────────────┐                ┌──────────────┐
             │  Supabase    │                │  CDN         │
             │              │                │              │
             │  - Postgres  │                │  - images    │
             │  - Auth      │                │  - assets    │
             │  - Storage   │                │  - fonts     │
             │  - Realtime  │                │              │
             └──────────────┘                └──────────────┘
```

---

## 15. Migration Path to Database/Auth

### 15.1 Migration Phases

```
Phase 0 (MVP)         Phase 1              Phase 2              Phase 3
─────────────         ───────              ───────              ───────
localStorage    ──▶   Supabase DB    ──▶   + Auth         ──▶  + Real-time
No auth              + CRUD API            + RLS policies      + Multi-user
Client Gemini        Server Gemini         + Email/SMS         + Payments
Static deploy        Edge functions        + File upload       + Mobile app
```

### 15.2 Phase 1: Database Migration

**Step 1: Set up Supabase**
- Create Supabase project (free tier: 500 MB, 50K monthly active users)
- Enable Postgres database

**Step 2: Create tables**

```sql
-- Supabase migration: 001_initial_schema

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  las_id TEXT UNIQUE NOT NULL,          -- LAS-XXXXXX
  property_type TEXT NOT NULL,
  project_scope TEXT NOT NULL,
  c_of_o_status TEXT NOT NULL,
  timeline TEXT NOT NULL,
  address TEXT NOT NULL,
  lga TEXT NOT NULL,
  title_type TEXT NOT NULL,
  sqft TEXT,
  valuation TEXT,
  description TEXT,
  selected_package TEXT,
  email TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Documents Received',
  status_category TEXT NOT NULL DEFAULT 'In Review',
  ai_roadmap TEXT,
  days_remaining INTEGER DEFAULT 21,
  quick_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  category TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT,
  size_bytes INTEGER,
  type TEXT,
  file_url TEXT,                          -- Supabase Storage URL
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  project_id UUID REFERENCES projects(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);
```

**Step 3: Create localStorage → Supabase sync**

```typescript
// lib/migration.ts (one-time migration script)

export const migrateLocalStorageToSupabase = async () => {
  const projects = JSON.parse(localStorage.getItem('userProjects') || '[]');
  
  for (const project of projects) {
    await supabase.from('projects').insert({
      las_id: project.id,
      property_type: project.propertyType,
      // ... map all fields
      user_id: supabase.auth.user()?.id,
    });
  }
  
  // Clear localStorage after successful migration
  localStorage.removeItem('userProjects');
  localStorage.removeItem('currentProject');
};
```

### 15.3 Phase 2: Authentication Migration

**Step 1: Enable Supabase Auth**
- Email/password auth (free tier)
- Optional: Google OAuth (free tier)

**Step 2: Add auth gate**

```typescript
// components/AuthGate.tsx (future)

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSupabaseAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginScreen />;
  
  return <>{children}</>;
};
```

**Step 3: Wrap routes**

```typescript
// App.tsx (future)
<Route path="/dashboard" element={
  <AuthGate>
    <Dashboard />
  </AuthGate>
} />
```

### 15.4 Phase 3: Real-time Migration

```typescript
// hooks/useRealtimeProjects.ts (future)

export const useRealtimeProjects = () => {
  const [projects, setProjects] = useState<PermitProject[]>([]);
  
  useEffect(() => {
    const subscription = supabase
      .from('projects')
      .on('*', (payload) => {
        // Handle INSERT, UPDATE, DELETE
        setProjects(prev => applyChange(prev, payload));
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, []);
  
  return projects;
};
```

### 15.5 Migration Checklist

| Step | Task | Effort | Phase |
|------|------|--------|-------|
| 1 | Set up Supabase project | 30 min | Phase 1 |
| 2 | Create database schema | 1 hr | Phase 1 |
| 3 | Create `lib/storage.ts` abstraction | 2 hr | Phase 1 |
| 4 | Swap localStorage for Supabase client | 4 hr | Phase 1 |
| 5 | Test data migration | 2 hr | Phase 1 |
| 6 | Enable Supabase Auth | 1 hr | Phase 2 |
| 7 | Add auth gate to protected routes | 2 hr | Phase 2 |
| 8 | Move Gemini to edge function | 2 hr | Phase 2 |
| 9 | Add RLS policies | 2 hr | Phase 2 |
| 10 | Add real-time subscriptions | 4 hr | Phase 3 |
| 11 | Add file upload to Supabase Storage | 4 hr | Phase 3 |
| 12 | Add email notifications | 4 hr | Phase 3 |
| 13 | Add SMS notifications | 4 hr | Phase 3 |
| **Total** | | **~33 hr** | |

### 15.6 Backward Compatibility

During migration, support both localStorage and Supabase:

```typescript
// lib/storage.ts (hybrid mode during migration)

export const storage = {
  async get<K extends StorageKey>(key: K): Promise<StorageSchema[K] | null> {
    // Try Supabase first
    if (isAuthenticated()) {
      return await supabaseGet(key);
    }
    // Fallback to localStorage
    return localStorageGet(key);
  },
};
```

---

## Appendix A: Architecture Decision Records

| Decision | Choice | Why | Trade-off |
|----------|--------|-----|-----------|
| **Router** | HashRouter | Works on static hosting, no server config | URL has `#` prefix |
| **Styling** | Tailwind CDN | Zero-config, no build step for CSS | Not production-optimized |
| **State** | useState + localStorage | Simple, no dependencies | No real-time, no multi-device |
| **AI** | Client-side Gemini | Zero server cost | API key exposed in bundle |
| **Icons** | Material Icons CDN | Consistent, well-known | CDN dependency |
| **Deployment** | Vercel | Free tier, auto-deploy, previews | Vendor lock-in risk |
| **Type system** | TypeScript strict | Compile-time safety | Slightly slower builds |
| **Module format** | ESM | Native browser, Vite default | Older browser support |

---

## Appendix B: Dependency Audit

| Dependency | Version | Purpose | Risk | Alternative |
|------------|---------|---------|------|-------------|
| react | 19.2.3 | UI framework | Low | — |
| react-dom | 19.2.3 | DOM rendering | Low | — |
| react-router-dom | 7.11 | Client routing | Low | tanstack-router |
| @google/genai | 1.34 | Gemini AI | Medium (exposed key) | OpenAI, Claude |
| vite | 6.2 | Build tool | Low | webpack, esbuild |
| @vitejs/plugin-react | 5.0 | React support | Low | — |
| typescript | 5.8 | Type checking | Low | — |
| @types/node | 22.14 | Node.js types | Low | — |

**Total: 4 runtime deps, 4 dev deps. Minimal.**
