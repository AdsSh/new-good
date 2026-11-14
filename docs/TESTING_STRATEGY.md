# Testing Strategy — PermitFlow MVP

> Status: ratified for MVP. Driven by the priority list in `docs/DEVELOPMENT_RULES.md`
> (regulatory rules → onboarding flow → file management → WhatsApp/AI → persistence → critical UI).

## Principles

1. **Business-critical first.** Spend budget on the rules that determine permit
   outcomes: statutory requirements, readiness scoring, validation, persistence
   and the critical reusable UI. Never chase arbitrary coverage percentages.
2. **Deterministic core, thin UI.** Pure logic lives in `src/domain/rules` and
   `views/onboardingValidation.ts` and is tested with plain unit tests — no DOM.
   Component behavior is verified through React Testing Library tests and journey
   tests, not by re-testing logic through the DOM.
3. **The rules engine + scoring are the contract.** No new requirement, warning
   or scoring behaviour ships without a test in `tests/rules/`.
4. **jsdom only for "browser" tests.** Journey tests render routes in-process via
   `MemoryRouter`. No Playwright / Chrome download. (See "Known untested areas".)
5. **Test files** use `*.test.ts` / `*.test.tsx` under `tests/`, mirroring source
   layout. jsdom component/journey files opt in with a `// @vitest-environment jsdom`
   docblock — node-mode unit suites stay fast and dependency-free.
6. **No real network.** The Gemini client is mocked; `whatsapp` tests exercise the
   full message-builder + link encoding offline.

## Test matrix

| Area | Priority | Files | What is covered |
|------|----------|-------|-----------------|
| Statutory rules engine | 1 | `tests/rules/rules.test.ts` (19) | Requirement selection per applicant/development/scope/title/site-condition inputs |
| Readiness scoring | 1 | `tests/rules/scoring.test.ts` (6) | Scores, weighting, warnings, recommended action for representative profiles |
| Engine determinism | 1 | `tests/rules/engine.test.ts` (15) | Supply/demand scoring, unavailable-copy handling across steps |
| Onboarding validation | 1 | `tests/onboarding/onboardingValidation.test.ts` (19) | Step 1/2/4 field rules, title mapping, engine input building, display derivation |
| Onboarding → dashboard flow | 2 | `tests/journeys/onboardingFlow.test.tsx` (3) | Whole-wizard completion persists to the store + lands on dashboard; step-1 and step-4 blocking, draft autosave/clear |
| File lifecycle (archive/restore/delete) | 3 | `tests/journeys/dashboardFlow.test.tsx` (3) | Seed load, archive hides from All, Archived tab surfaces + restore, delete (confirmed/cancelled) against the store |
| File card UI | 3 | `tests/components/ProjectCard.test.tsx` (9) | Render fields, readiness chip, milestones, archive/restore/delete/inspect dispatch, note streaming, WhatsApp deep-link |
| Project filters | 3 | `tests/components/ProjectFilters.test.tsx` (7) | Status tabs + counts, type chips, search, sort, active-filter bar + Clear |
| Dashboard KPI tiles | 3 | `tests/components/DashboardStats.test.tsx` (7) | 5 tiles with counts, click-to-filter, active-state styling |
| WhatsApp messages & links | 4 | `tests/services/whatsapp.test.ts` (26) | Categorized builders, base64 context, encode/length safety, PHONE_PROTECTION |
| AI roadmap generation | 5 | `tests/services/geminiService.test.ts` (13) | Prompt assembly, success/fallback/failure outcomes, roadmap normalization, never-decides guarantees |
| localStorage persistence | 6 | `tests/services/projectStore.test.ts` (18) | Envelope, versioning, per-record repair, corrupted/unexpected-format data, reset semantics, currentProject |

**Total: 145 tests / 12 files — all green (`npm test`).**

## How to run

```bash
npm test              # entire suite (vitest run)
npx vitest run tests/onboarding   # one folder
npx vitest run tests/components/ProjectCard.test.tsx --environment jsdom
npx tsc --noEmit      # type gate — run before commit
npm run build         # bundling gate
```

## Known untested areas (accepted)

- **Real-browser E2E.** No Playwright. Journey tests run against jsdom. Layout,
  scroll, printing, file download/upload behaviour are not browser-verified.
- **Gemini live API.** Tests mock the client; the real model output and timeouts
  are only exercised manually. Fallback + error paths are covered.
- **Marketing/static pages** — `Landing`, `Services`, `Process`, `About`,
  `ChecklistSimulator` (`DocumentChecklistCalculator.tsx`): not component-tested.
- **Dashboard internals** — sorting (status/type/address), search matching, type
  filters and count derivation are only verified indirectly via default-state
  journeys, not individually.
- **Remaining dashboard components** — `ProjectTimeline`, `ProjectTasks`,
  `ProjectDocuments`, `ProjectSidebar`, `AssignmentModal`, `NotificationCenter`,
  `DocumentViewerModal` (SVG canvas): no direct coverage.
- **Accessibility** — no automated axe checks.
- **Visual regression** — none (no screenshots).

When any of the above becomes business-critical (e.g. the upload/viewer feature or
notification simulation ships to customers), promote it into the matrix before
expanding non-critical surfaces.

## Adding tests

- New statutor rule or validation rule must ship with matching unit tests.
- New localStorage key/schema change must ship with `tests/services/projectStore.test.ts`
  updates in the same change (`docs/LOCAL_STORAGE_ARCHITECTURE.md` too).
- Component tests: interact like a user (`userEvent`, role queries, stable ids like
  `btn-archive-<id>`), avoid asserting on Tailwind class strings unless that class is
  the behaviour under test.
- Journey tests: keep `window.scrollTo` / `requestAnimationFrame` /
  `HTMLCanvasElement.prototype.getContext` stubbed as in the existing journey files;
  clear `localStorage` between cases.