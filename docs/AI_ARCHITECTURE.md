# AI Architecture & Safety Rules

> The authoritative spec for PermitFlow's AI-assisted roadmap layer.
> Covers the safety boundary between the deterministic rules engine and the AI
> assistant, the request/response contract, the error/fallback taxonomy, and the
> rules AI never gets to break.

## 1. First Principle: AI Explains, the Engine Decides

PermitFlow's permit requirements are wholly owned by the **deterministic rules
engine** (`src/domain/rules/`). AI is a **post-processing explainer**:

- The engine computes the readiness score, required documents, and next actions.
- The AI rewrites that *engine output* into plain language.
- **AI must never add new requirements, delete requirements, or invent facts.**

If the AI were to independently judge what a permit requires, every single
"law", fee, or timeline it produced would be an unverifiable guess with no
regulatory authority behind it. Therefore the AI's role is strictly limited.

### Contract in one line

> AI in this system is advisory and explanatory only — it can never be a source
> of truth. Requirements, scoring, and recommendations come from the
> deterministic engine; anything the AI says is a re-statement of that data.

## 2. Explicit AI Safety Rules

These rules are written into the server system prompt
(`api/roadmap.ts` → `SYSTEM_PROMPT`) **and** enforced structurally in code.
A violation of any rule is treated as a defect, not a style issue.

| # | Rule | Enforced by |
|---|------|-------------|
| R1 | **Explain only.** Re-state engine output; never introduce requirements | System prompt + input is whitelisted to engine data only |
| R2 | **No authority claims.** Never claim official approval, endorsement, or regulatory authority | System prompt; forced disclaimers in output |
| R3 | **No invented laws/fees/timelines.** Quote only data provided in the input; never claim a fee, deadline, or statutory citation | System prompt; fallback roadmap generated from engine data; client caps output size |
| R4 | **Flag uncertainty.** When the supplied data is incomplete, say so explicitly instead of guessing | System prompt |
| R5 | **No key exposure.** The API key lives only on the server (`process.env.GEMINI_API_KEY`), never in the client bundle | `api/roadmap.ts` edge function; `vite.config.ts` has no `define` env injection |
| R6 | **One JSON object, nothing else.** Response must be a single JSON object matching the schema | `responseMimeType: 'application/json'` + `normalizeRoadmap` validation |
| R7 | **Never decide requirements.** The AI cannot change `assessment.required`, scores, or availability | Structurally impossible — the engine output is fixed before the request is built |

### The two hard-disclaimer lines

The engine's fallback path (and the system prompt guidance) always include:

1. This is not an official approval or guarantee of permit issuance.
2. Confirm official fees and timelines before relying on them.

These are forced into the structured output's `disclaimers[]` array.

## 3. What AI May and May Not Do

### May do (sole responsibility)

- Explain the deterministic assessment in plain language.
- Summarize the workflow implied by the engine's staged process.
- Explain why a missing document matters.
- Explain why a checklist item is checked/unchecked.
- List practical next steps derived from the engine's `recommendedAction`.
- Ask clarifying questions the human consultant should verify.

### May NOT do

- Claim the app is an official government channel or that a permit is approved.
- Guarantee permit issuance or approval.
- Invent laws, statutory citations, fees, or timelines.
- Contradict the deterministic rules output without flagging uncertainty.
- Expose, log, or echo secrets, keys, or raw database content.

## 4. Data Flow

```
Onboarding step 4
      │  OnboardingData + ReadinessAssessment (engine output)
      ▼
services/geminiService.ts          (client)
   buildRoadmapRequest()  ── whitelist/narrow to expected fields only
      │  POST /api/roadmap  { project, assessment }        (25s AbortController)
      ▼
api/roadmap.ts                   (Vercel edge function, server-side)
   narrow(body)  ── trims/slices every field, rejects missing address/lga,
                     caps arrays → AI never sees raw app state
   GoogleGenAI  ── gemini-3-flash-preview, JSON mode, temp 0.3,
                   maxOutputTokens 2048, SYSTEM_PROMPT (R1–R7)
      │  { roadmap: {...} }   (already normalized)
      ▼
geminiService.normalizeRoadmap()  (client, defense-in-depth)
   validates structure, clamps string/array lengths, drops malformed items
      ▼
views/Onboarding.tsx  →  <RoadmapView/>
   field-by-field React rendering — never dangerouslySetInnerHTML,
   never `render aiRoadmap as markdown`
```

### Safety boundaries, annotated

1. **`narrow(body)` (server):** the AI request is constructed from a strict
   whitelist. Unknown fields are dropped, strings are trimmed and length-capped,
   arrays are capped, and a missing address/LGA rejects the request. The AI can
   never be used as an arbitrary prompt-injection channel into app state.
2. **JSON-only contract:** the model is forced into
   `responseMimeType: 'application/json'`; `maxOutputTokens: 2048` caps output;
   the client additionally runs `extractJsonObject` + `normalizeRoadmap`.
3. **UI rendering:** structured fields render as React nodes. There is no
   `dangerouslySetInnerHTML` and no string-as-markdown path in the AI section.

## 5. Request Contract

`POST /api/roadmap`

```ts
interface RoadmapRequest {
  project: {
    propertyType: string;      // e.g. "residential-new"
    lga: string;               // required; rejected when empty
    address?: string;          // trimmed, ≤ 300 chars
    floors?: number;
    units?: number;
    landAreaSqm?: number;
    siteConditions?: string[]; // capped
  };
  assessment: {
    readinessScore: number;         // engine-computed, never AI-editable
    recommendedAction: string;      // engine decision
    required?: { name: string; availability: 'have' | 'missing' | 'unknown' }[]; // missing/unknown only
    warnings?: string[];
  };
}
```

Availability filtering: only rows where availability is `missing` or `unknown`
are sent; confirmed (`have`) documents are never re-questioned by the AI.

## 6. Response Schema (AIPermitRoadmap)

```ts
interface AIPermitRoadmap {
  version: 1;
  summary: string;                 // ≤ 700 chars, required
  workflow: string[];              // ≤ 12 items, each ≤ 240 chars
  missingDocuments: { name: string; why: string }[];  // ≤ 12
  checklistExplanations: { name: string; why: string }[];  // ≤ 12
  nextSteps: string[];             // ≤ 12
  consultantQuestions: string[];   // ≤ 12
  disclaimers: string[];           // ≤ 5; engine forces the two hard lines
}
```

`normalizeRoadmap` returns `null` when `summary` is missing/empty (this is the
"empty response" failure). Every list is clamped and every item filtered:
non-strings and whitespace-only values are dropped.

## 7. Failure Taxonomy

The client maps every failure to a typed `RoadmapFailure` and **always** shows a
deterministic, engine-generated fallback roadmap instead of a raw error.

| Failure | Signal | Client handling |
|---------|--------|-----------------|
| `timeout` | 25s `AbortController` fires (or server 408/504) | typed + fallback |
| `rate_limit` | HTTP 429 | typed + fallback |
| `unavailable` | HTTP 5xx, 404, invalid/absent key, model unavailable | typed + fallback |
| `network` | fetch rejects, non-JSON content-type, unparseable body | typed + fallback |
| `malformed` | HTTP 200 but JSON does not validate | typed + fallback |
| `empty` | HTTP 200 with no roadmap / empty summary | typed + fallback |

**Fallback roadmap** (`buildFallbackRoadmap`): generated purely from
`assessment.required` (filtered to non-`have`), never fabricating content.
Guaranteed invariants (tested): production text never invents fees (₦) or
timelines (days/weeks/months).

No AI failure can leave the user with a blank screen or a bare error string.

## 8. Server Notes

- **Key:** `process.env.GEMINI_API_KEY`, server-side only (Vercel edge env var;
  `.env.local` in dev). Never imported by client code.
- **Model:** `gemini-3-flash-preview`, temperature 0.3, JSON mode,
  `maxOutputTokens: 2048`.
- **Error mapping** (`classifyError`): 429 → `rate_limit`;
  timeout/deadline → `timeout`; 404 / not found / permission-denied / api-key /
  unavailable / model → `unavailable`; remainder → `unavailable`.
- **CORS/abuse:** intentional MVP posture — no auth on the endpoint; a strict
  payload whitelist prevents prompt-injection of arbitrary state.

## 9. UI Behavior

- Step 4 shows a loading state while the request is in flight.
- On success (`status: 'ok'`): `<RoadmapView>` renders the validated roadmap.
- On `status: 'fallback'`: the same `<RoadmapView>` renders the deterministic
  fallback **plus** a small, non-blocking notice naming the failure reason.
- The copy labels the block as an optional plain-language *explanation* and
  explicitly notes the score is determined by the engine, not the AI.

## 10. Testing Requirements

New/edited AI code must keep the guarantees low-level tested. Current coverage
(`tests/services/geminiService.test.ts`):

- `extractJsonObject` — plain, fenced, prose-prefixed, invalid/empty.
- `normalizeRoadmap` — valid payload, null payloads, missing summary, malformed
  item filtering.
- `buildFallbackRoadmap` — full structure, no invented fees/timelines, credits
  confirmed docs.
- `mapStatusToFailure` — every failure class and explicit-code precedence.

## 11. Glossary

| Term | Meaning |
|------|---------|
| Engine | `src/domain/rules/` — pure, deterministic, source-grounded |
| AI assistant | Gemini (`gemini-3-flash-preview`) — explainer only |
| `RoadmapOutcome` | `{ status: 'ok', roadmap }` \| `{ status: 'fallback', error, roadmap }` |
| `RoadmapFailure` | `'timeout' \| 'rate_limit' \| 'network' \| 'unavailable' \| 'malformed' \| 'empty'` |
| `narrow()` | Server-side input whitelist for the AI request |
| `normalizeRoadmap()` | Client-side schema validation/clamping (defense-in-depth) |