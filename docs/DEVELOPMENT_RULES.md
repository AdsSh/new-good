# Development Rules — PermitFlow

> These rules govern all code changes to the PermitFlow project.
> Every agent and developer must follow them. No exceptions.

---

## 1. Pre-Development Checklist

Before writing any code:

1. Read `docs/CURRENT_SYSTEM_AUDIT.md` to understand what currently exists.
2. Read this file (`docs/DEVELOPMENT_RULES.md`) for conventions.
3. Run `npm install` and `npm run dev` to verify the app starts.
4. Identify which files your change touches and check the "Protected Files" list.
5. If your change touches routing, types, or constants — flag it for review.

---

## 2. Code Conventions

### 2.1 TypeScript

- **No `any` types.** Use proper interfaces or `unknown` with type guards.
- **No `as any` casts.** Fix the type properly.
- All new interfaces go in `types.ts` if shared, or co-located if component-specific.
- Prefer `interface` over `type` for object shapes.
- Use `Record<K, V>` for dictionary types instead of `{ [key: string]: V }`.

### 2.2 React Components

- **Functional components only.** No class components.
- **Named exports** for all components (e.g., `export const Foo: React.FC = () => ...`).
- **File naming:** PascalCase for components (`MyComponent.tsx`), camelCase for utilities.
- Keep components under **300 lines.** If larger, split into sub-components.
- Extract data (constants, seed data, config) into separate files — not inline in components.

### 2.3 Styling

- **Tailwind CSS only.** No inline `style={}` except for dynamic values.
- Use the project's custom color tokens: `primary`, `primary-dark`, `accent-dark`, `surface-light`, `surface-dark`.
- Support **dark mode** via `dark:` prefix on all new UI.
- Use existing animation classes: `animate-fade-in`, `animate-fade-in-up`, `animate-slide-in-right`.
- Do not add custom CSS unless Tailwind cannot express it. If you must, add it to `index.html` `<style>` block.

### 2.4 Icons

- Use **Material Icons Outlined** only: `<span className="material-icons-outlined">icon_name</span>`.
- Do not add new icon libraries.
- Do not use inline SVGs for icons unless Material Icons has no equivalent.

### 2.5 File Organization

```
components/     → Reusable UI (not page-specific)
views/          → Page-level routed components
services/       → External API integrations
types.ts        → Shared TypeScript definitions
constants.ts    → Shared constants and configuration
```

New files must fit this structure. Do not create new top-level directories without justification.

---

## 3. State Management Rules

### 3.1 Current Approach

All state is local (`useState`). Cross-component data sharing uses `localStorage`.

### 3.2 Rules

- **Do not introduce a new state management library** (Redux, Zustand, etc.) without explicit approval.
- **Do not add new Context providers** without explicit approval.
- When reading from `localStorage`, **always wrap in try-catch** and validate the parsed data.
- When writing to `localStorage`, serialize with `JSON.stringify` and handle quota errors.
- Debounce any frequent writes (e.g., text input → localStorage).

### 3.3 localStorage Keys

| Key | Used By | Purpose |
|-----|---------|---------|
| `userProjects` | Dashboard, Onboarding, Layout | Array of all permit projects |
| `currentProject` | Dashboard, Onboarding | Currently active project |
| `permitHub_documentChecklist` | Onboarding, ChecklistSimulator | Checklist state from simulator |
| `permitflow_read_notifications` | NotificationCenter | Read notification IDs |
| `permitflow_dismissed_notifications` | NotificationCenter | Dismissed notification IDs |
| `permitflow_custom_notifications` | NotificationCenter | Simulated notifications |
| `permitflow_onboarding_draft` | Onboarding | In-progress wizard auto-save & resume |

**Do not add new localStorage keys without documenting them here.**

---

## 4. API & Security Rules

### 4.1 API Keys

- **NEVER** put API keys in client-side code.
- **NEVER** use `vite.config.ts` `define` to inject secrets into the bundle.
- API calls must go through a backend proxy or serverless function.
- If adding a new external API, create a service file in `services/` and document the endpoint.

### 4.2 User Data

- Do not log user data to console in production.
- Do not use `Math.random()` for security-sensitive IDs (use `crypto.randomUUID()` if available).
- Sanitize any user input before rendering if using `dangerouslySetInnerHTML` (avoid it entirely).

### 4.3 WhatsApp Integration

- Use `getWhatsAppQuoteLink()` from `constants.ts` for all WhatsApp links.
- Do not hardcode the phone number in new files — use `WHATSAPP_PHONE` or `WHATSAPP_DISPLAY` constants.

---

## 5. Component-Specific Rules

### 5.1 Dashboard.tsx (Protected)

**Dashboard.tsx is 2,042 lines and must be split before any new features are added to it.**

When working on Dashboard:
- Do NOT add more `useState` hooks (already has 19+).
- Do NOT add more inline data (seed data, team members, etc.).
- If adding a new feature, extract it into a separate component first.
- Types defined in Dashboard (`PermitProject`, `TeamMember`, `Task`, `ProjectDocument`, `InternalNote`, `ItemComment`) should be moved to `types.ts` — but only during a dedicated refactoring pass.

### 5.2 Onboarding.tsx

- Rebuilt as a 4-step progressive-disclosure wizard driven by `evaluateRules` from `src/domain/rules`.
- The readiness score is computed by the deterministic engine — never by AI. AI is optional (step 4 explanation) with a graceful fallback.
- Progress is auto-saved to `permitflow_onboarding_draft` (debounced) and resumed on mount.

### 5.3 DocumentChecklistCalculator.tsx (1,010 lines)

- Mixes data configuration (~330 lines of document definitions) with presentation.
- When modifying, keep data and presentation concerns separate.

### 5.4 DocumentViewerModal.tsx (1,170 lines)

- Contains 4 inline SVG sub-renderers (~400 lines each).
- When modifying, consider extracting SVG renderers into separate files.

### 5.5 NotificationCenter.tsx

- Simulation controls ("Trigger Query", "Advance Stage") are demo-only.
- Do not remove simulation controls — they are used for demos.
- Notification generation is derived from project status — not from a backend.

### 5.6 AI Roadmap (`services/geminiService.ts` + `api/roadmap.ts`)

- **Read `docs/AI_ARCHITECTURE.md` before touching any AI code** — it is the
  authoritative spec for the AI safety rules (R1–R7) and the failure taxonomy.
- The AI **explains** the engine's output; it must never determine requirements,
  scores, or recommendations. `ReadinessAssessment` is fixed before any request.
- The API key is **server-side only** (`process.env.GEMINI_API_KEY` in
  `api/roadmap.ts`). Never add env injection (`define`/`import.meta.env`) to the
  client bundle.
- AI responses are validated server-side and re-validated client-side
  (`normalizeRoadmap`). Never render AI output via `dangerouslySetInnerHTML`.
- Every AI failure path must fall back to the deterministic
  `buildFallbackRoadmap` — never a raw error string.
- Keep `tests/services/geminiService.test.ts` coverage green (extract,
  normalize, fallback, failure mapping).

---

## 6. Testing Rules

### 6.1 Current State

**No tests exist.** No test framework is configured.

### 6.2 When Tests Are Added

- Use **Vitest** (Vite-native test runner).
- Use **React Testing Library** for component tests.
- Test files go next to the source file: `Component.test.tsx`.
- Minimum test coverage:
  - Utility functions (formatCurrency, formatPropertyType, getWhatsAppQuoteLink)
  - Component rendering (does it mount without crashing?)
  - User interactions (button clicks, form submissions)
  - localStorage read/write cycles

---

## 7. Git & Commit Rules

- **Do not commit** `.env`, `.env.local`, or any file containing secrets.
- **Do not commit** `node_modules/` or `dist/`.
- Commit messages: imperative mood, lowercase, max 72 chars.
  - Good: `add error boundary to dashboard`
  - Bad: `Fixed the bug in Dashboard.tsx`
- One logical change per commit. Do not mix refactoring with feature work.

---

## 8. Protected Files

These files require explicit justification to modify:

| File | Reason |
|------|--------|
| `index.html` | CDN imports, import maps, Tailwind config are interdependent |
| `vite.config.ts` | Build config, env injection, path aliases |
| `tsconfig.json` | Compiler options affect all files |
| `package.json` | Dependency versions must be tested together |
| `constants.ts` | Shared across 8+ files; changes cascade |
| `types.ts` | Shared enums/interfaces; changes cascade |
| `services/geminiService.ts` | Structured AI client; safety-critical — see `docs/AI_ARCHITECTURE.md` |

---

## 9. What NOT To Do

- Do not introduce new dependencies without approval.
- Do not refactor the entire codebase in one PR.
- Do not rename files unless necessary.
- Do not add comments to existing code during feature work.
- Do not add `console.log` statements.
- Do not use emoji in code or UI text unless explicitly requested.
- Do not change the WhatsApp number or contact email except in their single source of truth (`WHATSAPP_PHONE`/`WHATSAPP_DISPLAY` in `services/whatsapp.ts`, `CONTACT_EMAIL` in `constants.ts`). Do not hard-code them in views.
- Do not remove the notification simulation controls.
- Do not change the seed project data without updating the audit document.
- Do not add new localStorage keys without documenting them in this file.
