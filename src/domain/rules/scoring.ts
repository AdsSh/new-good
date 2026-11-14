/**
 * Deterministic readiness scoring.
 *
 * The score is PURE arithmetic over `AssessedRequirement`s produced by the
 * engine — no AI, no randomness, no hidden weighting. The same input always
 * yields the same score and the same explanation.
 *
 * Model (v1):
 * - Only requirements classified `required` count toward the score.
 * - Every required document counts EQUALLY.
 * - `readinessScore = round( completed / eligible * 100 )` where
 *   `eligible` = all required documents and `completed` = those the user
 *   has confirmed they hold.
 * - A document with availability `unknown` simply does not add to the
 *   numerator; it is surfaced separately so the user can confirm it.
 */

import type { AssessedRequirement } from './types';

export interface ScoreBreakdown {
  eligible: number;
  completed: number;
  confirmedMissing: number;
  unconfirmed: number;
}

export interface ReadinessScoreResult {
  /** 0-100, or null when nothing mandatory is triggered. */
  score: number | null;
  breakdown: ScoreBreakdown;
  explanation: string;
}

export function computeReadinessScore(
  required: AssessedRequirement[]
): ReadinessScoreResult {
  const eligible = required.length;
  const completed = required.filter((r) => r.availability === 'have').length;
  const confirmedMissing = required.filter((r) => r.availability === 'missing').length;
  const unconfirmed = eligible - completed - confirmedMissing;

  if (eligible === 0) {
    return {
      score: null,
      breakdown: { eligible: 0, completed: 0, confirmedMissing: 0, unconfirmed: 0 },
      explanation:
        'No mandatory documents are triggered for this project scope, so no readiness percentage is calculated. Confirm the project details with a consultant before lodging.',
    };
  }

  const pct = Math.round((completed / eligible) * 100);
  const noun = eligible === 1 ? 'document' : 'documents';
  const haveText = `You have ${completed} of ${eligible} mandatory ${noun} (${completed}/${eligible}).`;
  const missingText =
    confirmedMissing > 0
      ? ` ${confirmedMissing} confirmed missing, and ${
          unconfirmed > 0 ? `${unconfirmed} not yet confirmed.` : 'all others confirmed in hand.'
        }`
      : unconfirmed > 0
        ? ` ${unconfirmed} not yet confirmed.`
        : '';
  const denomText =
    completed === eligible
      ? 'All mandatory documents are in hand.'
      : 'Each mandatory document counts equally toward the score.';

  return {
    score: pct,
    breakdown: { eligible, completed, confirmedMissing, unconfirmed },
    explanation:
      `Your document readiness is ${pct}%. ${haveText}${missingText} ${denomText} ` +
      'This score measures document completeness only. It does not guarantee plan approval — ' +
      'LASPPPA/LASBCA also review the plans, compliance, and professional signatures before issuing a permit.',
  };
}