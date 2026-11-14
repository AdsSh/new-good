/**
 * Integration tests for the full engine (src/domain/rules/engine.ts).
 *
 * Scenarios mirror real Lagos permit applicants: standard residential,
 * multi-storey commercial (corporate), renovation, missing title, and
 * incomplete input (which must surface as "unknown", never a guess).
 */

import { describe, it, expect } from 'vitest';
import { evaluateRules } from '../../src/domain/rules/engine';
import type { ProjectDocuments, ProjectInput } from '../../src/domain/rules/types';

const baseInput: ProjectInput = {
  applicantType: 'individual',
  developmentType: 'residential',
  projectScope: 'new_construction',
  floors: 1,
  units: 1,
  landAreaSqm: 300,
  titleStatus: 'certificate_of_occupancy',
  siteConditions: [],
};

const every = (ids: string[]): ProjectDocuments =>
  Object.fromEntries(ids.map((id) => [id, 'have'])) as ProjectDocuments;

const idsOf = (requirements: ReadonlyArray<{ requirementId: string }>) =>
  requirements.map((r) => r.requirementId).sort();

const CORE_DRAWINGS = [
  'architectural_drawings',
  'structural_drawings',
  'mechanical_drawings',
  'electrical_drawings',
  'survey_plan',
  'title_document',
  'lirs_clearance',
];

describe('standard residential (individual, 1 floor, new build)', () => {
  const assessment = evaluateRules(baseInput, every(CORE_DRAWINGS.concat(['individual_tcc'])));

  it('requires exactly the 8 core documents', () => {
    expect(idsOf(assessment.required)).toEqual(
      ['architectural_drawings', 'electrical_drawings', 'individual_tcc', 'lirs_clearance',
        'mechanical_drawings', 'structural_drawings', 'survey_plan', 'title_document'].sort()
    );
  });

  it('scores 100 when all required docs are held and stays conditional/unknown-free', () => {
    expect(assessment.readinessScore).toBe(100);
    expect(assessment.completedCount).toBe(8);
    expect(assessment.missingCount).toBe(0);
    expect(assessment.conditional).toEqual([]);
    expect(assessment.unknown).toEqual([]);
    expect(assessment.consultantQuestions).toEqual([]);
    expect(assessment.warnings).toEqual([]);
  });

  it('recommends lodging when ready', () => {
    expect(assessment.recommendedAction).toContain('All mandatory documents are ready');
  });

  it('scores partial readiness when docs are missing', () => {
    const partial = evaluateRules(baseInput, { architectural_drawings: 'have' });
    expect(partial.readinessScore).toBe(13); // 1/8 rounded
    expect(partial.completedCount).toBe(1);
    expect(partial.missingCount).toBe(7);
    expect(partial.warnings.some((w) => w.includes('not yet confirmed'))).toBe(true);
  });

  it('produces identical output for identical input (determinism)', () => {
    const again = evaluateRules(baseInput, every(CORE_DRAWINGS.concat(['individual_tcc'])));
    expect(again).toEqual(assessment);
  });
});

describe('multi-storey commercial (corporate developer)', () => {
  const input: ProjectInput = {
    ...baseInput,
    applicantType: 'corporate',
    developmentType: 'commercial',
    floors: 6,
    units: 10,
    landAreaSqm: 8000,
  };
  const allDocs = every(CORE_DRAWINGS.concat([
    'structural_3d',
    'mechanical_3d',
    'electrical_3d',
    'subsoil_investigation',
    'pptr_report',
    'drainage_clearance',
    'transport_impact',
    'contractors_insurance',
    'company_tcc',
    'directors_tcc',
    'paye_returns',
    'cac_incorporation',
  ]));

  it('triggers 3D, sub-soil, PPTR, drainage, TIA, insurance and corporate tax docs', () => {
    const assessment = evaluateRules(input, allDocs);
    expect(idsOf(assessment.required)).toEqual(
      [
        'architectural_drawings', 'structural_drawings', 'mechanical_drawings',
        'electrical_drawings', 'survey_plan', 'title_document',
        'structural_3d', 'mechanical_3d', 'electrical_3d',
        'subsoil_investigation', 'pptr_report', 'drainage_clearance',
        'transport_impact', 'contractors_insurance',
        'company_tcc', 'directors_tcc', 'paye_returns', 'cac_incorporation',
        'lirs_clearance',
      ].sort()
    );
    expect(assessment.required.map((r) => r.name)).toContain('Physical Planning Technical Report (PPTR / LUPAR)');
  });

  it('does not require the individual TCC', () => {
    const assessment = evaluateRules(input, allDocs);
    expect(idsOf(assessment.required)).not.toContain('individual_tcc');
  });

  it('flags clearance questions for a commercial development', () => {
    const assessment = evaluateRules(input, allDocs);
    expect(
      assessment.consultantQuestions.some((q) => q.category === 'clearance')
    ).toBe(true);
  });

  it('surfaces clearance follow-ups for the new non-residential use types', () => {
    for (const dev of [
      'agricultural',
      'recreational',
      'religious',
      'special_applications',
      'transportation',
    ] as const) {
      const a = evaluateRules({ ...baseInput, developmentType: dev }, allDocs);
      expect(
        a.consultantQuestions.some((q) => q.category === 'clearance'),
        `${dev} → clearance question`
      ).toBe(true);
    }
  });
});

describe('renovation of an existing house', () => {
  const input: ProjectInput = {
    ...baseInput,
    projectScope: 'renovation',
    floors: 2,
  };
  const docs = every(CORE_DRAWINGS.concat(['individual_tcc', 'stability_letter', 'former_permit', 'land_use_charge']));

  it('requires stability letter, former permit and LUC', () => {
    const assessment = evaluateRules(input, docs);
    const ids = idsOf(assessment.required);
    expect(ids).toContain('stability_letter');
    expect(ids).toContain('former_permit');
    expect(ids).toContain('land_use_charge');
  });

  it('does not trigger sub-soil, insurance or 3D at 2 floors', () => {
    const assessment = evaluateRules(input, docs);
    const ids = idsOf(assessment.required);
    expect(ids).not.toContain('subsoil_investigation');
    expect(ids).not.toContain('contractors_insurance');
    expect(ids).not.toContain('structural_3d');
  });
});

describe('land >= 5,000 sqm residential parcel', () => {
  it('requires the PPTR', () => {
    const input = { ...baseInput, landAreaSqm: 5000 };
    const assessment = evaluateRules(input, every(CORE_DRAWINGS.concat(['individual_tcc', 'pptr_report'])));
    expect(idsOf(assessment.required)).toContain('pptr_report');
  });
});

describe('missing title document', () => {
  const input: ProjectInput = { ...baseInput, titleStatus: 'none' };
  const assessment = evaluateRules(input, every(CORE_DRAWINGS.filter((id) => id !== 'title_document').concat(['individual_tcc'])));

  it('classifies the title requirement as unknown, never as satisfied', () => {
    expect(idsOf(assessment.unknown)).toContain('title_document');
    expect(idsOf(assessment.required)).not.toContain('title_document');
  });

  it('warns and asks a consultant about title', () => {
    expect(assessment.warnings.some((w) => w.includes('No title document'))).toBe(true);
    expect(
      assessment.consultantQuestions.some((q) => q.ruleId === 'RUL_BASE_TITLE')
    ).toBe(true);
  });
});

describe('incomplete input (floors not provided)', () => {
  const { floors: _f, ...noFloors } = baseInput;
  const assessment = evaluateRules(noFloors, every(CORE_DRAWINGS.concat(['individual_tcc'])));

  it('marks every floor-dependent requirement as unknown instead of guessing', () => {
    expect(idsOf(assessment.unknown)).toEqual(
      [
        'structural_3d', 'mechanical_3d', 'electrical_3d',
        'subsoil_investigation', 'pptr_report', 'drainage_clearance',
        'transport_impact', 'contractors_insurance',
      ].sort()
    );
  });

  it('asks consultant questions and recommends resolving them first', () => {
    expect(assessment.consultantQuestions.length).toBeGreaterThan(0);
    expect(assessment.recommendedAction).toContain('open questions');
  });
});