# READINESS_ASSESSMENT.md — Permit Readiness Score

The readiness assessment converts a project description and the documents a
property owner reports holding into one explainable score plus a structured
checklist. It is produced entirely by the deterministic engine behind
`evaluateRules` — no AI, no hidden judgment.

## Inputs

| Input | Source in the app |
|---|---|
| Applicant type (individual / corporate) | Onboarding |
| Development type (residential / commercial / …) | Onboarding |
| Project scope (new build / renovation / amnesty / …) | Onboarding |
| Land area (sqm) | Onboarding |
| Number of floors | Onboarding |
| Number of units | Onboarding |
| Title status | Onboarding (`TITLE_DOCUMENTS`) |
| Site conditions (coastal, flood-prone, …) | Onboarding / checklist |
| Document availability per requirement | Checklist (`have` / `missing` / `unknown`) |

## How the score is computed

1. The engine evaluates every rule and classifies each knowledge-base
   requirement as:
   - **required** — the rule verdict is `applicable` for this project;
   - **conditional** — reserved for clearance letters (see below); not scored;
   - **unknown** — the engine lacks input to decide (never guessed).
2. Requirements whose rule verdict is `not_applicable` are **not** part of the
   checklist for this project.
3. The score is:

   ```
   readinessScore = round( documents you hold / all required documents × 100 )
   ```

   Every required document counts **equally**. Availability `unknown`
   (not yet confirmed) does not add to the numerator.

### Examples

| Required docs | Held | Score |
|---|---|---|
| 7 | 7 | 100 |
| 7 | 4 | 57 |
| 7 | 1 | 14 |
| 18 | 18 | 100 |

## Distinctions the engine maintains

These three pairs are treated differently everywhere in the output:

1. **Missing vs not applicable**
   - A document you do not have is `missing` (lower readiness, listed as an
     action).
   - A document that is genuinely not required for this project is dropped from
     the checklist entirely (e.g. 3D drawings for a 2-storey house).
2. **Unknown vs not required**
   - A document whose applicability cannot be determined from the input is
     `unknown` and generates a consultant question (e.g. floor count missing).
   - It is **never** silently treated as not required.
3. **Conditional vs required**
   - Third-party clearance letters (Fire, MOT/TIA traffic, Police, NUPRC,
     urban renewal) are conditional on site/use specifics. They are flagged as
     `clearance` consultant questions, not scored as required documents.

## Output

The assessment returns:

- `readinessScore` (0–100, or null when nothing mandatory applies);
- `required` / `conditional` / `unknown` requirement lists;
- `ruleOutcomes` for every rule that ran (full audit trail);
- `completedCount`, `missingCount`, `conditionalCount`, `unknownCount`;
- `consultantQuestions` (deferred human decisions);
- `warnings`;
- `scoringExplanation` (plain language, deterministic);
- `recommendedAction` (deterministic).

## What the score does NOT mean

The score measures **document completeness only**. It is not an approval
prospect, and it does not reflect LASPPPA/LASBCA review of the plans,
compliance, zoning, or professional signatures. The output states this
explicitly; the UI must not imply otherwise.

## UX guidance for the checklist surface

- Show the score with its plain-language explanation right above it.
- Colour: green (100), amber (partial), red (0) — derived only from the score.
- Keep `required`, `conditional`, and `unknown` in visually distinct groups.
- Render `warnings` as callouts and `consultantQuestions` as a "We need to ask
  our consultant" section.
- WhatsApp CTA links the recommended action; the score text itself stays
  neutral and factual.