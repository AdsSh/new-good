/**
 * Unit tests for deterministic readiness scoring (src/domain/rules/scoring.ts).
 */

import { describe, it, expect } from 'vitest';
import { computeReadinessScore } from '../../src/domain/rules/scoring';
import type {
  AssessedRequirement,
  DocumentAvailability,
} from '../../src/domain/rules/types';

const req = (availability: DocumentAvailability, requirementId = `doc-${availability}`):
  AssessedRequirement => ({
  requirementId,
  name: 'Test document',
  category: 'drawings',
  ruleId: 'RUL_TEST',
  classification: 'required',
  availability,
  rationale: 'test fixture',
  sources: ['SRC-REG-LASPPPA-2019'],
});

describe('computeReadinessScore', () => {
  it('returns null when nothing is required', () => {
    const r = computeReadinessScore([]);
    expect(r.score).toBeNull();
    expect(r.breakdown.eligible).toBe(0);
    expect(r.explanation).toContain('No mandatory documents');
  });

  it('scores 100 when every required document is held', () => {
    const r = computeReadinessScore([req('have'), req('have'), req('have')]);
    expect(r.score).toBe(100);
    expect(r.breakdown.completed).toBe(3);
    expect(r.breakdown.confirmedMissing).toBe(0);
    expect(r.breakdown.unconfirmed).toBe(0);
  });

  it('scores half when half the documents are held', () => {
    const r = computeReadinessScore([req('have'), req('missing')]);
    expect(r.score).toBe(50);
    expect(r.breakdown.completed).toBe(1);
    expect(r.breakdown.confirmedMissing).toBe(1);
  });

  it('does not grant credit for unconfirmed documents', () => {
    const r = computeReadinessScore([req('have'), req('have'), req('unknown')]);
    expect(r.score).toBe(67);
    expect(r.breakdown.unconfirmed).toBe(1);
  });

  it('scores 0 when everything is missing', () => {
    const r = computeReadinessScore([req('missing'), req('missing')]);
    expect(r.score).toBe(0);
  });

  it('explains that the score does not guarantee approval', () => {
    const r = computeReadinessScore([req('have')]);
    expect(r.explanation).toContain('does not guarantee');
    expect(r.explanation).toContain('100%');
  });
});