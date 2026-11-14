/**
 * Unit tests for the deterministic rule catalog (src/domain/rules/rules.ts).
 *
 * Each test asserts the exact, repeatable outcome of a rule for a given
 * input — these are the source of truth that keeps the engine deterministic.
 */

import { describe, it, expect } from 'vitest';
import { RULES, RULE_BY_ID } from '../../src/domain/rules/rules';
import type { ProjectInput } from '../../src/domain/rules/types';
import { REQUIREMENTS } from '../../src/domain/rules/knowledge-base';

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

const stateOf = (ruleId: string, input: ProjectInput) =>
  RULE_BY_ID[ruleId].evaluate(input).state;

describe('rules catalog integrity', () => {
  it('registers every rule in RULE_BY_ID with a unique id', () => {
    const ids = RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(RULE_BY_ID[id], `missing RULE_BY_ID entry for ${id}`).toBeDefined();
    }
  });

  it('maps every knowledge-base requirement to a defined rule', () => {
    for (const re of REQUIREMENTS) {
      expect(RULE_BY_ID[re.ruleId], `${re.id} → ${re.ruleId}`).toBeDefined();
    }
  });
});

describe('baseline: residential, individual, 1-floor, new construction', () => {
  it('requires core drawings, survey, title and individual TCC', () => {
    for (const id of [
      'RUL_BASE_ARCH',
      'RUL_BASE_STRUCT',
      'RUL_BASE_MECH',
      'RUL_BASE_ELEC',
      'RUL_BASE_SURVEY',
      'RUL_BASE_TITLE',
      'RUL_TCC_INDIVIDUAL',
    ]) {
      expect(stateOf(id, baseInput), id).toBe('applicable');
    }
  });

  it('does not trigger conditional documents at 1 floor', () => {
    for (const id of [
      'RUL_3D_STRUCT',
      'RUL_3D_MECH',
      'RUL_3D_ELEC',
      'RUL_SUBSOIL',
      'RUL_PPTR',
      'RUL_DRAINAGE',
      'RUL_TIA',
      'RUL_INSURANCE_2F',
    ]) {
      expect(stateOf(id, baseInput), id).toBe('not_applicable');
    }
  });

  it('does not trigger corporate or renovation documents', () => {
    for (const id of [
      'RUL_TCC_COMPANY',
      'RUL_TCC_DIRECTORS',
      'RUL_PAYE',
      'RUL_CAC',
      'RUL_STABILITY_NDT',
      'RUL_FORMER_PERMIT',
      'RUL_LUC',
    ]) {
      expect(stateOf(id, baseInput), id).toBe('not_applicable');
    }
  });
});

describe('floor thresholds', () => {
  const byFloors = (floors: number) => ({ ...baseInput, floors });

  it('3D drawings apply above 3 floors only', () => {
    expect(stateOf('RUL_3D_STRUCT', byFloors(4))).toBe('applicable');
    expect(stateOf('RUL_3D_STRUCT', byFloors(3))).toBe('not_applicable');
  });

  it('LASBCA insurance applies above 2 floors only', () => {
    expect(stateOf('RUL_INSURANCE_2F', byFloors(3))).toBe('applicable');
    expect(stateOf('RUL_INSURANCE_2F', byFloors(2))).toBe('not_applicable');
  });

  it('sub-soil applies beyond 2 floors', () => {
    expect(stateOf('RUL_SUBSOIL', byFloors(3))).toBe('applicable');
    expect(stateOf('RUL_SUBSOIL', byFloors(2))).toBe('not_applicable');
  });

  it('PPTR applies above 4 floors but not exactly at 4', () => {
    expect(stateOf('RUL_PPTR', byFloors(5))).toBe('applicable');
    expect(stateOf('RUL_PPTR', byFloors(4))).toBe('not_applicable');
    expect(stateOf('RUL_PPTR', byFloors(5))).toBe('applicable');
  });
});

describe('use / size triggers', () => {
  it('PPTR and TIA trigger on commercial use', () => {
    const commercial = { ...baseInput, developmentType: 'commercial' as const };
    expect(stateOf('RUL_PPTR', commercial)).toBe('applicable');
    expect(stateOf('RUL_TIA', commercial)).toBe('applicable');
  });

  it('treats the new non-residential use types as planning-board / TIA triggers', () => {
    for (const dev of [
      'agricultural',
      'recreational',
      'religious',
      'special_applications',
      'transportation',
    ] as const) {
      const input = { ...baseInput, developmentType: dev };
      expect(stateOf('RUL_PPTR', input), `${dev} → PPTR`).toBe('applicable');
      expect(stateOf('RUL_TIA', input), `${dev} → TIA`).toBe('applicable');
    }
  });

  it('PPTR triggers on land >= 5,000 sqm', () => {
    expect(stateOf('RUL_PPTR', { ...baseInput, landAreaSqm: 5000 })).toBe('applicable');
  });

  it('PPTR and drainage trigger on 8+ units', () => {
    const dense = { ...baseInput, units: 8 };
    expect(stateOf('RUL_PPTR', dense)).toBe('applicable');
    expect(stateOf('RUL_DRAINAGE', dense)).toBe('applicable');
  });

  it('sub-soil triggers on coastal terrain even at 1 floor', () => {
    expect(stateOf('RUL_SUBSOIL', { ...baseInput, siteConditions: ['coastal'] })).toBe(
      'applicable'
    );
  });
});

describe('applicant type', () => {
  const corporate = { ...baseInput, applicantType: 'corporate' as const };

  it('switches from individual to corporate tax documents', () => {
    expect(stateOf('RUL_TCC_INDIVIDUAL', corporate)).toBe('not_applicable');
    for (const id of ['RUL_TCC_COMPANY', 'RUL_TCC_DIRECTORS', 'RUL_PAYE', 'RUL_CAC']) {
      expect(stateOf(id, corporate), id).toBe('applicable');
    }
  });
});

describe('renovation / existing work', () => {
  const renovation = { ...baseInput, projectScope: 'renovation' as const };

  it('requires stability letter, former permit and LUC', () => {
    for (const id of ['RUL_STABILITY_NDT', 'RUL_FORMER_PERMIT', 'RUL_LUC']) {
      expect(stateOf(id, renovation), id).toBe('applicable');
    }
  });
});

describe('unknown semantics (never guess)', () => {
  it('becomes unknown when floor count is missing', () => {
    const { floors: _replacement, ...noFloors } = baseInput;
    for (const id of [
      'RUL_3D_STRUCT',
      'RUL_3D_MECH',
      'RUL_3D_ELEC',
      'RUL_SUBSOIL',
      'RUL_INSURANCE_2F',
    ]) {
      expect(stateOf(id, noFloors), id).toBe('unknown');
    }
  });

  it('PPTR stays unknown when land/floors/units are missing', () => {
    const { floors: _f, units: _u, landAreaSqm: _l, ...bare } = baseInput;
    expect(stateOf('RUL_PPTR', bare)).toBe('unknown');
  });

  it('drainage and TIA stay unknown when units and floors are missing', () => {
    const { units: _u, floors: _f, ...bare } = baseInput;
    expect(stateOf('RUL_DRAINAGE', bare)).toBe('unknown');
    expect(stateOf('RUL_TIA', bare)).toBe('unknown');
  });

  it('title returns unknown for none or unknown title status', () => {
    expect(stateOf('RUL_BASE_TITLE', { ...baseInput, titleStatus: 'none' })).toBe('unknown');
    expect(stateOf('RUL_BASE_TITLE', { ...baseInput, titleStatus: 'unknown' })).toBe('unknown');
  });
});