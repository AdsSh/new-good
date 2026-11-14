# RULE_ENGINE.md — PermitFlow Regulatory Rules Engine

The engine (`src/domain/rules/`) is a **pure, deterministic** TypeScript module
that maps a Lagos building-permit project description to a document readiness
assessment. It is deliberately separate from the React UI: the UI consumes it,
never re-implements its logic.

## Guarantees

- **Deterministic.** The same `(ProjectInput, ProjectDocuments)` always
  produces the identical `ReadinessAssessment`. No randomness, no wall-clock
  time, no AI, no hidden weighting.
- **Traceable.** Every rule carries a stable `ruleId` and a list of `SourceId`s;
  every requirement in the knowledge base maps to exactly one rule.
- **Never guesses.** When the engine lacks an input it needs to decide, the rule
  returns `state: 'unknown'`, which surfaces as a `ConsultantQuestion`. Missing
  input is never silently treated as "not applicable".

## Architecture

```
src/domain/rules/
├── index.ts           Public entry point (re-exports below)
├── types.ts           Input/output contract (pure types)
├── sources.ts         Source registry (SourceId → reference)
├── knowledge-base.ts  REQUIREMENTS catalog (pure data)
├── rules.ts           RULES catalog (pure functions, one predicate per rule)
├── scoring.ts         computeReadinessScore (pure arithmetic)
└── engine.ts          evaluateRules — orchestration
```

Flow:

1. `evaluateRules(input, documents)` runs every rule in `RULES` in fixed order.
2. Each rule verdict (`applicable` / `not_applicable` / `unknown`) is mapped to
   its knowledge-base requirement.
   - `applicable` → requirement classified `required`.
   - `not_applicable` → requirement **dropped** (not needed for this project).
   - `unknown` → requirement classified `unknown` + a `ConsultantQuestion`.
3. User document availability (`have` / `missing` / `unknown`) is attached.
4. `computeReadinessScore` produces the deterministic score + explanation.
5. Consultant questions and warnings are deduplicated and returned.

## Rule ↔ Source trace table

| Rule ID | When applicable | Sources |
|---|---|---|
| `RUL_BASE_ARCH` | always | SRC-REG-LASPPPA-2019 |
| `RUL_BASE_STRUCT` | always | SRC-REG-LASPPPA-2019, SRC-EPP-CHECKLIST-2024 |
| `RUL_BASE_MECH` | always | SRC-REG-LASPPPA-2019, SRC-EPP-CHECKLIST-2024 |
| `RUL_BASE_ELEC` | always | SRC-REG-LASPPPA-2019, SRC-EPP-CHECKLIST-2024 |
| `RUL_BASE_SURVEY` | always | SRC-REG-LASPPPA-2019 |
| `RUL_BASE_TITLE` | always; `unknown` when title status not confirmed | SRC-LAW-2010 |
| `RUL_3D_STRUCT` | floors > 3 | SRC-EPP-CHECKLIST-2024 |
| `RUL_3D_MECH` | floors > 3 | SRC-EPP-CHECKLIST-2024 |
| `RUL_3D_ELEC` | floors > 3 | SRC-EPP-CHECKLIST-2024 |
| `RUL_SUBSOIL` | floors > 2, commercial, or coastal/swampy/water/reclaimed | SRC-EPP-CHECKLIST-2024, SRC-FAQ-DOCX |
| `RUL_PPTR` | land ≥ 5,000 sqm; floors > 4; ≥ 8 units; non-residential use | SRC-REG-LASPPPA-2019, SRC-EPP-CHECKLIST-2024, SRC-FAQ-DOCX |
| `RUL_DRAINAGE` | ≥ 8 units; ≥ 4 floors; flood-prone / canal-adjacent / water-adjacent | SRC-EPP-CHECKLIST-2024, SRC-FAQ-DOCX |
| `RUL_TIA` | commercial / institutional / specialized; ≥ 8 units; ≥ 4 floors | SRC-EPP-CHECKLIST-2024, SRC-FAQ-DOCX |
| `RUL_INSURANCE_2F` | floors > 2 | SRC-REG-LASBCA-2019 |
| `RUL_TCC_INDIVIDUAL` | applicant type = individual | SRC-LIRS |
| `RUL_TCC_COMPANY` | applicant type = corporate | SRC-LIRS, SRC-REG-LASPPPA-2019 |
| `RUL_TCC_DIRECTORS` | applicant type = corporate | SRC-LIRS |
| `RUL_PAYE` | applicant type = corporate | SRC-LIRS |
| `RUL_CAC` | applicant type = corporate | SRC-EPP-CHECKLIST-2024 |
| `RUL_LIRS_CLEARANCE` | always (LIRS clearance on the EPPES form) | SRC-LIRS, SRC-EPP-CHECKLIST-2024 |
| `RUL_STABILITY_NDT` | renovation / regularization / extension / change-of-use | SRC-EPP-CHECKLIST-2024, SRC-FAQ-DOCX |
| `RUL_FORMER_PERMIT` | renovation / extension / change-of-use | SRC-EPP-CHECKLIST-2024 |
| `RUL_LUC` | renovation / extension / regularization | SRC-FAQ-DOCX |

All sources are defined and verified in `src/domain/rules/sources.ts`. The
knowledge base (`src/domain/rules/knowledge-base.ts`) provides the document
catalog (names, categories, cost/lead-time metadata) — it mirrors the verified
checklist documents bound to the UI checklist and adds `lirs_clearance` from the
Lagos EPPES supporting-documents form.

`CLEARANCE_LETTERS` in the same file lists the ten conditional third-party
clearances from the "Clearance letter from" block of the Lagos EPPES form.
They are tracked in the onboarding UI but excluded from the scored requirements
because applicability is confirmed case-by-case by a consultant.

## Determinism model

- Rules are pure functions of `ProjectInput` only.
- The catalog order is fixed; aggregation order is fixed.
- Scoring is `round(completed / eligible × 100)` where `eligible` = all
  `required` documents and `completed` = those the user holds. No weighting.
- `scoringExplanation` and `recommendedAction` are generated from the same
  deterministic data, never from AI.

## Unknown semantics

| Situation | Rule state | Result |
|---|---|---|
| floors missing, floor-dependent rule | `unknown` | requirement listed + consultant question |
| title status `none` | `unknown` | warning + blocking question (cannot proceed) |
| title status not provided | `unknown` | consultant question |
| input complete, not triggered | `not_applicable` | requirement dropped |
| document not yet confirmed | — | availability `unknown`; does not add to score |

## Extending the engine

1. Add/verify the source in `sources.ts` (never invent; `verified: false`
   sources must not be used for decisions).
2. Add the requirement to `knowledge-base.ts` (id must match the UI document id
   when one exists).
3. Add/point a rule in `rules.ts` with a unique `ruleId` and sources.
4. Add tests for the applicable and the not-applicable case in
   `tests/rules/rules.test.ts`, and an integration scenario in
   `tests/rules/engine.test.ts`.
5. Run `npm test` and `npm run build`.

> Note: the `conditional` classification is reserved for third-party clearance
> letters (Fire Service, MOT/TIA, Police, NUPRC, urban renewal) from
> SRC-FAQ-DOCX. They are not bound to checklist documents in v1 and therefore
> surface only as `ConsultantQuestion`s with category `clearance`, not as scored
> requirements. See docs/READINESS_ASSESSMENT.md.

## Running the engine

```ts
import { evaluateRules } from '@/src/domain/rules';
import type { ProjectInput, ProjectDocuments } from '@/src/domain/rules';

const input: ProjectInput = {
  applicantType: 'individual',
  developmentType: 'residential',
  projectScope: 'new_construction',
  floors: 1,
  units: 1,
  landAreaSqm: 300,
  titleStatus: 'certificate_of_occupancy',
};

const docs: ProjectDocuments = { architectural_drawings: 'have' };

const assessment = evaluateRules(input, docs);
console.log(assessment.readinessScore);            // 14
console.log(assessment.scoringExplanation);        // "Your document readiness is 14%…"
console.log(assessment.consultantQuestions);
```