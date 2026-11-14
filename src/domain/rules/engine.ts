/**
 * PermitFlow regulatory rules engine — orchestration.
 *
 * `evaluateRules(input, documents)` is a PURE function. It:
 *  1. Runs every rule in the catalog (fixed order) over the project input.
 *  2. Maps each rule verdict to its knowledge-base requirement.
 *  3. Classifies requirements as required / conditional / unknown.
 *  4. Attaches the user's document availability.
 *  5. Computes a deterministic readiness score + plain-language explanation.
 *  6. Deferring any undecidable question to a human consultant (never invents
 *     an answer).
 *
 * The same (input, documents) always yields the same assessment.
 */

import type {
  AssessedRequirement,
  ConsultantQuestion,
  ProjectDocuments,
  ProjectInput,
  ReadinessAssessment,
  RuleOutcome,
} from './types';
import { RULES } from './rules';
import { REQUIREMENTS } from './knowledge-base';
import { computeReadinessScore } from './scoring';

/** Availability reported by the user for a requirement, defaulting to unknown. */
function availabilityFor(docs: ProjectDocuments, requirementId: string) {
  return docs[requirementId] ?? 'unknown';
}

/** Human question the engine asks when a rule cannot be resolved. */
function questionForRule(outcome: RuleOutcome): ConsultantQuestion {
  const ruleId = outcome.ruleId;
  const knownQuestions: Record<string, string> = {
    RUL_BASE_TITLE:
      'Confirm which title document you hold (C of O, Governor’s Consent, registered Deed of Assignment, or other).',
    RUL_3D_STRUCT: 'How many floors does the proposed building have? (3D structural drawings apply above 3 floors.)',
    RUL_3D_MECH: 'How many floors does the proposed building have? (3D mechanical drawings apply above 3 floors.)',
    RUL_3D_ELEC: 'How many floors does the proposed building have? (3D electrical drawings apply above 3 floors.)',
    RUL_SUBSOIL:
      'Confirm the floor count and site terrain. Sub-soil investigation applies above 2 floors, for commercial buildings, or on Lekki/Island/coastal/swampy/high-density sites.',
    RUL_PPTR:
      'Confirm the floor count, unit count, or land area. PPTR applies to land ≥ 5,000 sqm, buildings above 4 floors, ≥ 8 units, or non-residential uses.',
    RUL_DRAINAGE:
      'Confirm unit count, floor count, and proximity to drainage channels. Drainage clearance applies to 8-unit/4-floor buildings and flood-prone or canal-adjacent sites.',
    RUL_INSURANCE_2F: 'How many floors does the proposed building have? (LASBCA insurance applies above 2 floors.)',
  };
  return {
    category: 'input',
    ruleId,
    question: knownQuestions[ruleId] ?? `Confirm whether "${outcome.title}" applies to this project.`,
    reason: outcome.rationale,
  };
}

/** Clearance-type letters that require a human consultant (third-party letters, not checklist docs). */
function clearanceQuestions(input: ProjectInput): ConsultantQuestion[] {
  const devType = input.developmentType;
  const questions: ConsultantQuestion[] = [];
  const requiresFirePolice = [
    'commercial',
    'institutional',
    'specialized',
    'agricultural',
    'recreational',
    'religious',
    'special_applications',
    'transportation',
  ].includes(devType);
  if (requiresFirePolice) {
    questions.push({
      category: 'clearance',
      question:
        'Confirm whether Fire Service clearance and a Police report are required for this use type.',
      reason:
        'Clearance letters from the Lagos State Fire Service and Police are listed in LASPPPA document requirements for commercial / institutional / specialized uses.',
    });
  }
  if (devType === 'specialized') {
    questions.push({
      category: 'clearance',
      question: 'Confirm whether NUPRC (petroleum regulator) clearance applies to this development.',
      reason:
        'NUPRC clearance is listed for petroleum-related developments in the LASPPPA documentation requirements.',
    });
  }
  if (input.inUrbanRenewalZone === true) {
    questions.push({
      category: 'clearance',
      question:
        'Confirm whether Ministry of Physical Planning urban-renewal clearance applies to this property.',
      reason:
        'Urban renewal zone properties carry an additional clearance requirement in LASPPPA documentation.',
    });
  }
  return questions;
}

export function evaluateRules(
  input: ProjectInput,
  documents: ProjectDocuments = {}
): ReadinessAssessment {
  // 1. Deterministic rule pass (fixed order).
  const ruleOutcomes: RuleOutcome[] = RULES.map((rule) => rule.evaluate(input));

  const outcomeByRule = new Map(ruleOutcomes.map((o) => [o.ruleId, o]));

  // 2. Map rule verdicts to requirements. Requirements whose rule verdict is
  //    `not_applicable` are genuinely NOT needed — they are dropped entirely.
  //    The `conditional` bucket is reserved for clearance-type letters that are
  //    not bound to the checklist KB and surface only as consultant questions.
  const assessed: Array<{
    requirement: (typeof REQUIREMENTS)[number];
    outcome: RuleOutcome;
    classification: 'required' | 'unknown';
  }> = [];

  for (const def of REQUIREMENTS) {
    const outcome = outcomeByRule.get(def.ruleId);
    if (!outcome) {
      throw new Error(`Requirement ${def.id} references unknown rule ${def.ruleId}`);
    }
    if (outcome.state === 'not_applicable') continue;
    assessed.push({
      requirement: def,
      outcome,
      classification: outcome.state === 'applicable' ? 'required' : 'unknown',
    });
  }

  const required: AssessedRequirement[] = assessed
    .filter((a) => a.classification === 'required')
    .map((a) => ({
      requirementId: a.requirement.id,
      name: a.requirement.name,
      category: a.requirement.category,
      ruleId: a.requirement.ruleId,
      classification: 'required',
      availability: availabilityFor(documents, a.requirement.id),
      rationale: a.outcome.rationale,
      sources: [...a.requirement.sources],
      meta: a.requirement.meta,
    }));

  const conditional: AssessedRequirement[] = [];

  const unknown: AssessedRequirement[] = assessed
    .filter((a) => a.classification === 'unknown')
    .map((a) => ({
      requirementId: a.requirement.id,
      name: a.requirement.name,
      category: a.requirement.category,
      ruleId: a.requirement.ruleId,
      classification: 'unknown',
      availability: availabilityFor(documents, a.requirement.id),
      rationale: a.outcome.rationale,
      sources: [...a.requirement.sources],
      meta: a.requirement.meta,
    }));

  // 3. Deterministic score.
  const score = computeReadinessScore(required);
  const completedCount = score.breakdown.completed;
  const missingCount = score.breakdown.confirmedMissing + score.breakdown.unconfirmed;
  const conditionalCount = conditional.length;
  const unknownCount = unknown.length;

  // 4. Consultant questions — deduplicated, deterministic order.
  const questions: ConsultantQuestion[] = [];
  const seen = new Set<string>();
  const pushQuestion = (q: ConsultantQuestion) => {
    const key = `${q.category}:${q.ruleId ?? q.question}`;
    if (!seen.has(key)) {
      seen.add(key);
      questions.push(q);
    }
  };
  for (const outcome of ruleOutcomes) {
    if (outcome.state === 'unknown') pushQuestion(questionForRule(outcome));
  }
  const titleOutcome = outcomeByRule.get('RUL_BASE_TITLE');
  if (titleOutcome && titleOutcome.state === 'unknown') {
    pushQuestion(questionForRule(titleOutcome));
  }
  for (const q of clearanceQuestions(input)) pushQuestion(q);

  // 5. Warnings.
  const warnings: string[] = [];
  if (input.titleStatus === 'none') {
    warnings.push(
      'No title document was reported. A verified document of ownership (C of O, Governor’s Consent, or registered Deed of Assignment) is mandatory and cannot be skipped.'
    );
  } else if (input.titleStatus === 'unknown') {
    warnings.push('Title status was not provided. Confirm your ownership document before lodging.');
  }
  const unknownRules = ruleOutcomes.filter((o) => o.state === 'unknown');
  if (unknownRules.length > 0) {
    warnings.push(
      `Assessment is incomplete for ${unknownRules.length} requirement${
        unknownRules.length === 1 ? '' : 's'
      }: ${unknownRules.map((r) => r.title).join('; ')}. Provide the missing details.`
    );
  }
  const unconfirmedDocs = required.filter((r) => r.availability === 'unknown');
  if (unconfirmedDocs.length > 0) {
    warnings.push(
      `${unconfirmedDocs.length} mandatory document${
        unconfirmedDocs.length === 1 ? ' is' : 's are'
      } not yet confirmed: ${unconfirmedDocs.map((r) => r.name).join('; ')}.`
    );
  }

  // 6. Deterministic recommendation.
  let recommendedAction: string;
  if (required.length === 0) {
    recommendedAction =
      'No mandatory checklist documents are triggered for this scope. Confirm the project details with a consultant before approaching the agency.';
  } else if (unknown.length > 0) {
    recommendedAction =
      'Resolve the open questions above with a consultant first — a complete assessment is needed before lodging.';
  } else if (score.score !== null && score.score === 100) {
    recommendedAction =
      'All mandatory documents are ready. Proceed to lodge your application on the Lagos EPPES portal.';
  } else if (missingCount > 0) {
    recommendedAction = `Obtain the remaining ${missingCount} mandatory document${
      missingCount === 1 ? '' : 's'
    } you do not yet have, then lodge on the EPPES portal.`;
  } else {
    recommendedAction =
      'Confirm your documents with a consultant, then lodge on the EPPES portal.';
  }

  return {
    readinessScore: score.score,
    required,
    conditional,
    unknown,
    ruleOutcomes,
    completedCount,
    missingCount,
    conditionalCount,
    unknownCount,
    consultantQuestions: questions,
    warnings,
    scoringExplanation: score.explanation,
    recommendedAction,
  };
}

export const REQUIREMENT_COUNT = REQUIREMENTS.length;