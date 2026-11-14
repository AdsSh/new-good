# PermitFlow — MVP Product Requirements Document

> Version: 1.0
> Date: 2026-08-29
> Status: Pre-launch
> Budget: Zero

---

## 1. Product Definition

### 1.1 What PermitFlow Is

PermitFlow is a single-page web application that helps property developers, owners, and investors in Lagos State, Nigeria understand and navigate the building permit process with the Lagos State Physical Planning Permit Authority (LASPPPA) and LASBCA.

### 1.2 What PermitFlow Is NOT

PermitFlow is **not**:
- A replacement for LASPPPA or EPPES portal
- A real-time permit tracking system
- A document management or cloud storage platform
- A multi-user collaboration tool
- A legal advisory service
- An authenticated, per-user application

### 1.3 Core Value Proposition

A property developer in Lagos can visit PermitFlow, understand the permit process, assess their document readiness, capture their project details, receive a preliminary AI-generated roadmap, and connect with a human consultant via WhatsApp — all in under 10 minutes, on a single device, with no account required.

---

## 2. Non-Goals (What MVP Explicitly Does NOT Do)

| Non-Goal | Why |
|----------|-----|
| Real-time LASPPPA permit status | We have no API integration with LASPPPA or EPPES. All status information is user-managed. |
| Cloud document storage | Uploaded files are stored in browser localStorage only. They are lost on cache clear, incognito mode, or device switch. |
| Multi-user collaboration | All data lives in a single browser's localStorage. No user accounts, no sharing. |
| Real-time notifications | All notifications are generated client-side from project data. There is no push notification system, no SMS, no email. |
| Authentication / login | No user model exists. Any person with the URL sees the same app. |
| Backend server | The entire app runs client-side. The only external call is to Google Gemini for AI roadmap generation. |
| Mobile native app | MVP is a responsive web app only. |
| Payment processing | Pricing is informational. No online payments. |
| Document verification | We display document metadata only. We do not verify, validate, or authenticate any uploaded documents. |
| Regulatory compliance guarantee | We provide guidance. We do not guarantee permit approval. |

---

## 3. Feature Classification

### 3.1 MUST HAVE — Essential for Launch

These features must work correctly for the MVP to be useful.

| # | Feature | Current Status | What Must Work |
|---|---------|---------------|----------------|
| M1 | **Landing page** explains the service | Working | Hero, value proposition, CTAs to onboarding and checklist |
| M2 | **Process timeline** shows LASPPPA stages | Working | 4-phase visual timeline with task descriptions |
| M3 | **Services page** shows pricing | Working | 3 service packages with prices and WhatsApp quote links |
| M4 | **Checklist simulator** assesses readiness | Working | Interactive document toggles, readiness score calculation, timeline estimate |
| M5 | **Onboarding wizard** captures project info | Broken (step 4 crash) | Steps 1-3 must save data. Step 4 must not crash. |
| M6 | **WhatsApp integration** connects to consultant | Working | Deep links to wa.me with pre-filled contextual messages |
| M7 | **Navigation** works on all devices | Working | Desktop nav, mobile drawer, all links functional |
| M8 | **Dashboard** lists and manages projects | Working | Project listing, filtering, search, inspection view |
| M9 | **Project inspection** shows details | Working | Status stepper, task checklist, document list, notes |
| M10 | **About page** builds trust | Working | Mission, team, testimonials |

**M5 requires these fixes before launch:**
1. Wire `handleSaveAndGoToDashboard` to `handleComplete` (Onboarding.tsx:385)
2. Add `value` and `onChange` handlers to contact fields (Onboarding.tsx:371-381)
3. Move Gemini API key to a backend proxy or remove AI roadmap (vite.config.ts:14)
4. Create `.env.local` or `.env.example` (project root)
5. Remove or fix the missing `index.css` reference (index.html:109)

### 3.2 SHOULD HAVE — Useful but Not Launch-Blocking

These features enhance the experience but the MVP works without them.

| # | Feature | Current Status | Notes |
|---|---------|---------------|-------|
| S1 | **AI roadmap generation** via Gemini | Broken (API key exposed) | Requires backend proxy. Can launch without AI and add later. |
| S2 | **Dark mode toggle** | CSS classes present, no toggle | Dark mode classes exist but no UI to switch. Nice-to-have. |
| S3 | **Document viewer modal** | Working (SVG placeholders) | Shows synthetic blueprint renderings, not real documents. Useful for demo. |
| S4 | **Notification center** | Working (simulated) | Generates notifications from project status. Demo-only. |
| S5 | **File upload** (metadata only) | Working | Captures file metadata to localStorage. Actual files lost on refresh. |
| S6 | **Task completion confetti** | Working | Fun visual feedback. Low priority. |
| S7 | **Quick notes on project cards** | Working | Auto-saves to localStorage. Useful for power users. |
| S8 | **Sort and filter projects** | Working | Multiple sort orders and status filters. |

### 3.3 FUTURE — After User Validation

These features require significant infrastructure or are only valuable with real users.

| # | Feature | Why Future |
|---|---------|------------|
| F1 | **Backend server + database** | Required for data persistence, multi-device, multi-user |
| F2 | **User authentication** | Required for per-user data isolation |
| F3 | **Real LASPPPA integration** | Requires government API access or manual data entry |
| F4 | **Cloud document storage** | Requires S3/Supabase Storage backend |
| F5 | **Email/SMS notifications** | Requires SendGrid/Twilio integration |
| F6 | **Multi-user collaboration** | Requires auth + real-time sync |
| F7 | **Payment processing** | Requires Paystack/Flutterwave integration |
| F8 | **Mobile app** | Requires React Native or Flutter rewrite |
| F9 | **Real-time permit status** | Requires LASPPPA partnership or web scraping |
| F10 | **Document verification** | Requires manual review workflow or AI analysis |
| F11 | **Print-optimized dossier** | Requires print stylesheet |

### 3.4 REMOVE/DEFER — Unnecessary for MVP

| # | Feature | Why Remove |
|---|---------|------------|
| R1 | **Portfolio page** (`views/Portfolio.tsx`) | Dead code. Never routed. Contains US-city placeholder data. Delete the file. |
| R2 | **Confetti animation class** | 44 lines of canvas animation code in Dashboard. Extract to hook or remove. |
| R3 | **Seed projects** (4 hardcoded demo projects) | Confusing for real users who see fake projects on first visit. Show empty state instead. |
| R4 | **Team member assignment UI** | Requires a concept of team members and roles that doesn't exist in MVP. Remove assignment modal. |
| R5 | **Document viewer SVG renderers** | 1,170 lines of synthetic blueprint drawings. Impressive but misleading — they're not real documents. Remove or clearly label as "example". |
| R6 | **Comment/discussion threads** | Requires a backend to persist. Remove from MVP. |
| R7 | **Status simulation controls** | "Trigger Query" and "Advance Stage" buttons in NotificationCenter are demo-only. Remove from production. |

---

## 4. User Journeys

### 4.1 Journey 1: First-Time Visitor (Primary)

**Goal:** Understand the permit process and assess readiness

```
1. Land on PermitFlow homepage
   → See hero: "Lagos Building Permit Fast-Track Service"
   → Understand value proposition in 5 seconds

2. Explore the process
   → Click "Process" in nav
   → See 4-phase LASPPPA timeline
   → Understand what documents are needed at each phase

3. Check document readiness
   → Click "Checklist & Simulator" in nav
   → Toggle documents they have/don't have
   → See readiness score and estimated timeline
   → Identify missing documents

4. Start a project
   → Click "Start Permit Application"
   → Complete Step 1: Property type, scope, C of O status, timeline
   → Complete Step 2: Address, LGA, title document, size, valuation
   → Complete Step 3: Choose service package
   → Complete Step 4: See preliminary assessment, contact info

5. Contact consultant
   → Click "WhatsApp" button
   → Pre-filled message sent to consultant
   → Human follow-up within 24 hours
```

**Time:** 8-12 minutes
**Success:** User contacts consultant via WhatsApp

### 4.2 Journey 2: Returning User (Project Management)

**Goal:** Track and manage existing permit project

```
1. Open PermitFlow
   → See dashboard with project list
   → Projects persisted in localStorage

2. Select a project
   → Click project card
   → See status stepper (Documents Received → Under Review → etc.)
   → See task checklist with completion status
   → See document list

3. Update project
   → Toggle task completion
   → Add quick notes
   → Upload document metadata (note: files not persisted)

4. Contact consultant about specific project
   → Click "WhatsApp" on project card
   → Pre-filled message includes project ID and status
```

**Time:** 3-5 minutes
**Success:** User updates project and contacts consultant

### 4.3 Journey 3: WhatsApp Direct (Marketing Funnel)

**Goal:** Convert WhatsApp inquiry to project creation

```
1. User receives WhatsApp link (from marketing, referral, etc.)
   → Clicks wa.me link with pre-filled message
   → Sends message to consultant

2. Consultant responds with PermitFlow link
   → User clicks through to PermitFlow

3. User completes onboarding
   → Follows Journey 1 from step 4
```

**Time:** 5-8 minutes on site
**Success:** User completes onboarding after WhatsApp inquiry

---

## 5. User Stories

### 5.1 Landing & Discovery

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| US-01 | As a property developer, I want to understand what PermitFlow does in 5 seconds so I know if it's relevant to me. | Hero section displays: (1) "Lagos Building Permit" headline, (2) one-sentence value prop, (3) two CTAs (Start Application, Checklist). | MUST |
| US-02 | As a property developer, I want to see the permit process steps so I know what to expect. | Process page shows 4 phases with titles, descriptions, and task lists. All content is accurate to LASPPPA process. | MUST |
| US-03 | As a property developer, I want to see pricing so I can budget. | Services page shows 3 packages with prices in Naira (₦500K-₦750K, ₦2.5M-₦3.5M+, ₦700K-₦1M). WhatsApp quote link works. | MUST |
| US-04 | As a property developer, I want to trust that this is a legitimate service. | About page shows mission, team members with photos, and client testimonials. | MUST |

### 5.2 Document Readiness Assessment

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| US-05 | As a property developer, I want to check which documents I already have so I know my readiness. | Checklist shows 20+ document types. Each can be toggled on/off. Readiness score updates in real-time. | MUST |
| US-06 | As a property developer, I want to see which documents are mandatory for my project type so I don't miss requirements. | Each document shows: name, description, cost range, preparation time, mandatory rule, regulatory body, bottleneck warning. | MUST |
| US-07 | As a property developer, I want to see an estimated timeline based on my document readiness. | Timeline estimate updates as documents are toggled. Shows days remaining and percentage complete. | MUST |
| US-08 | As a property developer, I want to know the cost of preparing missing documents. | Each document shows cost range (e.g., "₦450,000 – ₦1,200,000+"). Total estimated cost shown. | SHOULD |

### 5.3 Project Onboarding

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| US-09 | As a property developer, I want to tell PermitFlow about my project so they can help me. | Step 1 captures: property type (4 options), project scope (4 options), C of O status (4 options), timeline (4 options). All fields required to proceed. | MUST |
| US-10 | As a property developer, I want to provide my project location so the consultant knows where it is. | Step 2 captures: address (free text), LGA (20 Lagos LGAs dropdown), title document (7 options), land size, project cost, description. LGA and title are required. | MUST |
| US-11 | As a property developer, I want to choose a service package so I know what I'm paying for. | Step 3 shows 3 packages with prices, features, and descriptions. Selecting a package proceeds to step 4. | MUST |
| US-12 | As a property developer, I want to provide my contact details so the consultant can reach me. | Step 4 captures: email (required), full name, phone number. Values are saved to the project. | MUST |
| US-13 | As a property developer, I want to save my project and see it on a dashboard. | Clicking "Create Project" saves to localStorage and navigates to /dashboard. Project appears in project list. | MUST |

### 5.4 Project Dashboard

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| US-14 | As a property developer, I want to see all my projects in one place. | Dashboard shows project cards with: ID, address, LGA, property type, status badge, task progress. | MUST |
| US-15 | As a property developer, I want to filter projects by status so I can focus on urgent ones. | Filter buttons: All, In Review, Action Required, Approved. Shows count for each. | MUST |
| US-16 | As a property developer, I want to search projects by address or LGA. | Search input filters project list in real-time. | MUST |
| US-17 | As a property developer, I want to see the permit processing stage for my project. | Status stepper shows 5 stages with progress bar. Current stage highlighted. | MUST |
| US-18 | As a property developer, I want to track key milestones/tasks for my project. | Task checklist with toggleable completion. Shows category and assigned officer (if any). | MUST |
| US-19 | As a property developer, I want to see my uploaded documents. | Document list shows: name, type, size, date, assigned officer. | MUST |
| US-20 | As a property developer, I want to add private notes to my project. | Quick notes textarea auto-saves to localStorage. Shows "Saved" indicator. | SHOULD |
| US-21 | As a property developer, I want to contact a consultant about a specific project. | WhatsApp button on project card sends pre-filled message with project ID, address, and status. | MUST |

### 5.5 WhatsApp Integration

| ID | Story | Acceptance Criteria | Priority |
|----|-------|---------------------|----------|
| US-22 | As a property developer, I want to quickly contact a consultant via WhatsApp. | Floating WhatsApp button on every page. Opens wa.me with pre-filled message. Phone number: 08127251853. | MUST |
| US-23 | As a property developer, I want the WhatsApp message to include my project context. | Different pages send different pre-filled messages: general inquiry, specific service quote, project-specific inquiry. | MUST |

---

## 6. Acceptance Criteria Summary

### 6.1 Critical Path (Must Pass Before Launch)

| # | Criterion | Test Method |
|---|-----------|-------------|
| AC-01 | Landing page loads in < 3 seconds on 3G | Lighthouse audit |
| AC-02 | All nav links work on desktop and mobile | Manual test: click every link |
| AC-03 | Checklist simulator: toggle 5 documents, score updates | Manual test |
| AC-04 | Onboarding: complete all 4 steps without crash | Manual test: full flow |
| AC-05 | Onboarding step 4: contact fields save values | Manual test: fill fields, check localStorage |
| AC-06 | Dashboard: project created from onboarding appears | Manual test: create project, verify it shows |
| AC-07 | Dashboard: filter by status works | Manual test: click each filter |
| AC-08 | Dashboard: search works | Manual test: type address, verify results |
| AC-09 | Dashboard: task toggle works with visual feedback | Manual test: check/uncheck task |
| AC-10 | WhatsApp links open wa.me with correct message | Manual test: click WhatsApp on each page |
| AC-11 | Mobile nav drawer opens and closes | Manual test: resize to mobile, test drawer |
| AC-12 | No console errors on any page | Browser DevTools check |
| AC-13 | No `handleSaveAndGoToDashboard` ReferenceError | Click "Create Project" on step 4 |
| AC-14 | No broken image links | Visual check on all pages |
| AC-15 | `npm run build` succeeds without errors | Run build command |

### 6.2 Quality Bar

| # | Criterion | Target |
|---|-----------|--------|
| QB-01 | Lighthouse Performance score | ≥ 70 (CDN Tailwind limits this) |
| QB-02 | Lighthouse Accessibility score | ≥ 80 |
| QB-03 | Mobile responsiveness | Works on 320px-1920px viewport |
| QB-04 | Dark mode | All pages render correctly in both modes |
| AC-05 | Zero runtime crashes | No uncaught exceptions in normal flow |

---

## 7. MVP Success Metrics

### 7.1 Primary Metrics (Measure After 30 Days)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **WhatsApp clicks** | 50+ unique clicks | Add `data-track` attribute to WhatsApp links. Count via simple analytics or UTM parameters. |
| **Onboarding completions** | 20+ projects created | Count `localStorage.setItem('userProjects')` events (add a counter). |
| **Checklist usage** | 100+ sessions | Count visits to `/checklist` route. |
| **Return visits** | 30%+ | Compare unique vs returning localStorage keys. |

### 7.2 Secondary Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Bounce rate | < 60% | Analytics tool |
| Average session duration | > 3 minutes | Analytics tool |
| Pages per session | > 3 | Analytics tool |
| Mobile usage | Track percentage | Analytics tool |

### 7.3 Failure Criteria (Pivot Signals)

| Signal | Action |
|--------|--------|
| < 10 onboarding completions in 30 days | Revisit value proposition or target audience |
| < 5 WhatsApp clicks in 30 days | Revisit CTA placement or WhatsApp message |
| > 80% bounce rate | Revisit landing page messaging |
| > 50% of users don't complete step 1 | Simplify onboarding |

---

## 8. Technical Requirements for MVP

### 8.1 Bug Fixes Required Before Launch

| # | Bug | File:Line | Fix | Effort |
|---|-----|-----------|-----|--------|
| BUG-01 | `handleSaveAndGoToDashboard` undefined | `Onboarding.tsx:385` | Change to `handleComplete` | 5 min |
| BUG-02 | Contact fields uncontrolled | `Onboarding.tsx:371-381` | Add `value` and `onChange` to email, name, phone | 30 min |
| BUG-03 | `index.css` referenced but missing | `index.html:109` | Remove the `<link>` tag or create the file | 5 min |
| BUG-04 | No `.env.example` | Project root | Create `.env.example` with `GEMINI_API_KEY=your-key` | 5 min |
| BUG-05 | Gemini API key in client bundle | `vite.config.ts:14` | Either: (a) move to backend proxy, or (b) disable AI roadmap and show static assessment | 2-4 hrs |

### 8.2 Minimum Code Quality

| Requirement | Status | Action |
|-------------|--------|--------|
| `npm run build` succeeds | Must verify | Run build, fix any TypeScript errors |
| No `any` types in critical path | 5 locations | Fix in Onboarding.tsx:95, Services.tsx:129, Dashboard.tsx:1053, DocumentViewerModal.tsx:906,909 |
| No runtime crashes | BUG-01 must be fixed | Test full onboarding flow |
| WhatsApp links work | Working | Verify all 15+ WhatsApp links |

### 8.3 Deployment

| Option | Effort | Recommendation |
|--------|--------|----------------|
| **Vercel** | 15 min | Connect GitHub repo, auto-deploy. Free tier sufficient. |
| **Netlify** | 15 min | Same as Vercel. |
| **GitHub Pages** | 30 min | Add `base` to vite.config.ts. Free. |
| **Manual (surge.sh)** | 10 min | `npx surge dist/` — quickest for zero-budget. |

**Recommended:** Vercel or Netlify (free tier, auto-deploy from GitHub, custom domain support).

---

## 9. What the MVP Looks Like (Honest Description)

### 9.1 What a User Sees

**Landing page:** A professional Lagos-focused landing page with a hero section, stats (500+ permits, 98% approval rate — marketing claims, not real data), service descriptions, and CTAs.

**Process page:** A static 4-phase timeline showing the LASPPPA approval journey. Content is accurate but hardcoded.

**Services page:** Three service packages with Naira pricing. Each has a WhatsApp button that opens a pre-filled message.

**Checklist simulator:** An interactive tool where users toggle 20+ document types to see their readiness score and estimated timeline. Data is hardcoded but based on real LASPPPA requirements.

**Onboarding wizard:** A 4-step form that captures project details. Steps 1-3 work. Step 4 collects contact info and saves the project. If Gemini API is configured, generates an AI roadmap. If not, shows a static assessment message.

**Dashboard:** A project management view showing all created projects (stored in localStorage). Users can filter, search, inspect projects, toggle tasks, view documents, and add notes. Includes a notification center that generates alerts from project status (simulated, not real-time).

**About page:** Company information, team profiles (with stock photos), and testimonials (fabricated for MVP).

### 9.2 What a User Does NOT See

- No login screen
- No real-time status updates from LASPPPA
- No actual document previews (only synthetic SVG placeholders)
- No real notifications from any authority
- No cloud storage indicators
- No multi-user features
- No payment forms

### 9.3 What Happens Behind the Scenes

- All data stored in browser localStorage
- Gemini API call (if configured) sends project details to Google's servers
- WhatsApp links open wa.me in a new tab
- No data leaves the browser except the Gemini API call
- No analytics, no tracking, no cookies (beyond localStorage)

---

## 10. Future Roadmap

### Phase 1: Post-MVP Validation (Month 1-2)

| Item | Depends On | Effort |
|------|-----------|--------|
| Add Vercel Analytics (free) | Deployment | 15 min |
| Add WhatsApp click tracking (UTM params) | Deployment | 1 hr |
| Fix all MUST HAVE bugs | — | 4 hrs |
| Remove dead code (Portfolio.tsx, seed projects) | — | 30 min |
| Add dark mode toggle | — | 2 hrs |
| Add 404 page | — | 30 min |

### Phase 2: Backend Foundation (Month 2-3)

| Item | Depends On | Effort |
|------|-----------|--------|
| Create backend proxy for Gemini API | Revenue or grant | 1 day |
| Add Supabase for data persistence | Backend | 2 days |
| Add basic email/password auth | Supabase | 1 day |
| Migrate localStorage data to Supabase | Auth + DB | 1 day |
| Add real file upload to Supabase Storage | DB | 1 day |

### Phase 3: Real Integrations (Month 3-6)

| Item | Depends On | Effort |
|------|-----------|--------|
| LASPPPA status tracking (manual data entry by consultant) | Backend | 1 week |
| Email notifications (SendGrid) | Backend | 2 days |
| SMS notifications (Termii — Nigeria-focused) | Backend | 2 days |
| Print-optimized dossier export | Backend | 3 days |
| Multi-user team collaboration | Auth + Real-time | 1 week |

### Phase 4: Growth (Month 6+)

| Item | Depends On | Effort |
|------|-----------|--------|
| Paystack payment integration | Business model | 1 week |
| Mobile app (React Native) | Stable backend | 1 month |
| LASPPPA API integration (if available) | Government partnership | Unknown |
| Document verification workflow | Manual review process | 2 weeks |
| Multi-language support (Yoruba, Pidgin) | User research | 1 week |

---

## 11. Appendix: Existing Feature Inventory

### A. Files and Their Status

| File | Lines | Status | MVP Action |
|------|-------|--------|------------|
| `App.tsx` | 32 | Working | Add 404 route |
| `types.ts` | 48 | Working | Move Dashboard types here |
| `constants.ts` | 126 | Working | Verify WhatsApp number |
| `vite.config.ts` | 23 | **BROKEN** | Remove API key from `define` |
| `services/geminiService.ts` | 44 | **BROKEN** | Move to backend or disable |
| `components/Layout.tsx` | 563 | Working | No changes needed |
| `components/NotificationCenter.tsx` | 541 | Working (simulated) | Remove simulation controls for production |
| `components/DocumentChecklistCalculator.tsx` | 1010 | Working | No changes needed |
| `components/DocumentViewerModal.tsx` | 1170 | Working (placeholders) | Label as "example view" or remove |
| `views/Landing.tsx` | 146 | Working | No changes needed |
| `views/Onboarding.tsx` | 404 | **BROKEN** | Fix step 4 crash + contact fields |
| `views/Process.tsx` | 98 | Working | No changes needed |
| `views/Services.tsx` | 170 | Working | Remove unused import |
| `views/ChecklistSimulator.tsx` | 127 | Working | No changes needed |
| `views/About.tsx` | 143 | Working | No changes needed |
| `views/Dashboard.tsx` | 2042 | Working (monolith) | No refactor for MVP — too risky |
| `views/Portfolio.tsx` | 62 | **DEAD CODE** | Delete |

### B. localStorage Keys (MVP)

| Key | Type | Purpose |
|-----|------|---------|
| `userProjects` | `PermitProject[]` | All permit projects |
| `currentProject` | `PermitProject` | Currently selected project |
| `permitHub_documentChecklist` | `{ readyDocs, neededDocs, readinessScore, estimatedDays }` | Checklist state |

### C. External Dependencies (MVP)

| Dependency | Purpose | Risk |
|------------|---------|------|
| Google Fonts CDN | Inter font, Material Icons | Low — widely available |
| Tailwind CSS CDN | Styling | Medium — not recommended for production |
| esm.sh CDN | React, React Router, Google GenAI imports | High — third-party CDN dependency |
| Google Gemini API | AI roadmap generation | Medium — requires API key, may be disabled |
| WhatsApp (wa.me) | Consultant contact | Low — widely available in Nigeria |
