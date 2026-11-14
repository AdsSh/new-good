/**
 * Unit tests for the pure onboarding validation & mapping helpers
 * (views/onboardingValidation.ts).
 *
 * These cover the exact rules the wizard enforces on steps 1, 2 and 4 —
 * the same functions the component calls — so form-blocking bugs cannot
 * hide behind the UI. No DOM required.
 */

import { describe, it, expect } from 'vitest';
import { OnboardingData } from '../../types';
import {
  TITLE_OPTIONS,
  TITLE_STATUS_BY_LABEL,
  createInitialData,
  validateStep1,
  validateStep2,
  validateStep4,
  titleStatusFor,
  buildEngineInput,
  derivePropertyType,
  deriveScopeLabel,
  deriveCofOStatus,
  toDisplayProject,
} from '../../views/onboardingValidation';

function filledData(overrides: Partial<OnboardingData> = {}): OnboardingData {
  return {
    ...createInitialData(),
    applicantType: 'individual',
    developmentType: 'residential',
    workScope: 'new_construction',
    address: '5 Adeola Odeku Street, Victoria Island',
    lga: 'Eti-Osa',
    titleType: 'Certificate of Occupancy',
    landAreaSqm: 600,
    floors: 2,
    units: 1,
    valuation: '50,000,000',
    phone: '0803 123 4567',
    email: 'client@example.com',
    ...overrides,
  };
}

describe('createInitialData', () => {
  it('produces a blank project with a generated id and default status', () => {
    const d = createInitialData();
    expect(d.id).toMatch(/^LAS-\d{4}-[A-Z0-9]{4}$/);
    expect(d.address).toBe('');
    expect(d.timeline).toBe('Just exploring');
    expect(d.selectedPackage).toBeNull();
    expect(d.status).toBe('Documents Received');
  });
});

describe('validateStep1', () => {
  it('rejects a blank first step with one message per required field', () => {
    const errors = validateStep1(createInitialData());
    expect(errors.applicantType).toBeDefined();
    expect(errors.developmentType).toBeDefined();
    expect(errors.workScope).toBeDefined();
  });

  it('passes when all three choices are made', () => {
    expect(validateStep1(filledData())).toEqual({});
  });
});

describe('validateStep2', () => {
  it('reports every invalid field at once', () => {
    const d = createInitialData();
    const errors = validateStep2(d);
    expect(errors.address).toBeDefined();
    expect(errors.lga).toBeDefined();
    expect(errors.titleType).toBeDefined();
    expect(errors.landAreaSqm).toBeDefined();
    expect(errors.floors).toBeDefined();
    expect(errors.units).toBeDefined();
  });

  it('rejects an address shorter than 5 characters', () => {
    expect(validateStep2(filledData({ address: 'Plot' })).address).toBeDefined();
    expect(validateStep2(filledData({ address: '   ' })).address).toBeDefined();
  });

  it('rejects non-positive, fractional or non-finite measurements', () => {
    expect(validateStep2(filledData({ landAreaSqm: 0 })).landAreaSqm).toBeDefined();
    expect(validateStep2(filledData({ landAreaSqm: -5 })).landAreaSqm).toBeDefined();
    expect(validateStep2(filledData({ floors: 0 })).floors).toBeDefined();
    expect(validateStep2(filledData({ floors: 2.5 })).floors).toBeDefined();
    expect(validateStep2(filledData({ units: NaN })).units).toBeDefined();
  });

  it('accepts a complete valid step 2', () => {
    expect(validateStep2(filledData())).toEqual({});
  });
});

describe('validateStep4', () => {
  it('requires a phone number', () => {
    expect(validateStep4(filledData({ phone: '' })).phone).toContain('required');
    expect(validateStep4(filledData({ phone: '   ' })).phone).toContain('required');
  });

  it('rejects phone numbers outside 10-14 digits', () => {
    expect(validateStep4(filledData({ phone: '0803123' })).phone).toBeDefined();
    expect(validateStep4(filledData({ phone: '0'.repeat(15) })).phone).toBeDefined();
  });

  it('accepts a Nigerian mobile formatted naturally', () => {
    expect(validateStep4(filledData({ phone: '0803 123 4567' }))).toEqual({});
  });

  it('rejects a malformed email but tolerates an empty one', () => {
    expect(validateStep4(filledData({ email: 'not-an-email' })).email).toBeDefined();
    expect(validateStep4(filledData({ email: '' })).email).toBeUndefined();
    expect(validateStep4(filledData({ email: 'a@b.io' })).email).toBeUndefined();
  });
});

describe('title mapping & engine input', () => {
  it('exposes exactly the ten required title documents, unique and in order', () => {
    expect(TITLE_OPTIONS.map((o) => o.label)).toEqual([
      'Certificate of Occupancy',
      'Clearance letter from Lands',
      'Conveyance',
      'Deed of assignment',
      'Family receipt',
      "Governor's consent",
      'Land agreement',
      'Letter of regularization',
      'Purchase receipt',
      'Registered deed',
    ]);
    expect(new Set(TITLE_OPTIONS.map((o) => o.label)).size).toBe(10);
    expect(TITLE_OPTIONS.map((o) => o.value)).toContain('certificate_of_occupancy');
    expect(TITLE_STATUS_BY_LABEL['Certificate of Occupancy']).toBe('certificate_of_occupancy');
  });

  it('prefers the explicit titleStatus, falling back to the label mapping', () => {
    expect(titleStatusFor(filledData({ titleType: 'Family receipt' }))).toBe('receipt_survey_only');
    expect(titleStatusFor(filledData({ titleType: 'C of O', titleStatus: 'none' }))).toBe('none');
  });

  it('builds the engine input the assessment uses', () => {
    const input = buildEngineInput(filledData());
    expect(input).toMatchObject({
      applicantType: 'individual',
      developmentType: 'residential',
      projectScope: 'new_construction',
      landAreaSqm: 600,
      floors: 2,
      units: 1,
      titleStatus: 'certificate_of_occupancy',
    });
    expect(input.lga).toBe('Eti-Osa');
  });

  it('defaults missing choices instead of passing undefined to the engine', () => {
    const input = buildEngineInput(createInitialData());
    expect(input.applicantType).toBe('individual');
    expect(input.developmentType).toBe('residential');
    expect(input.projectScope).toBe('new_construction');
    expect(input.titleStatus).toBeUndefined();
  });
});

describe('display derivation', () => {
  it('derives property type from scope and development type', () => {
    expect(derivePropertyType('new_construction', 'residential')).toBe('residential-new');
    expect(derivePropertyType('renovation', 'residential')).toBe('renovation');
    expect(derivePropertyType('regularization_amnesty', 'residential')).toBe('regularization');
    expect(derivePropertyType('extension', 'commercial')).toBe('commercial');
    expect(derivePropertyType(undefined, undefined)).toBe('residential');
  });

  it('derives display labels for the new development types (and legacy specialized)', () => {
    expect(derivePropertyType('new_construction', 'agricultural')).toBe('Agricultural');
    expect(derivePropertyType('new_construction', 'recreational')).toBe('Recreational');
    expect(derivePropertyType('new_construction', 'religious')).toBe('Religious');
    expect(derivePropertyType('new_construction', 'special_applications')).toBe('Special Applications');
    expect(derivePropertyType('new_construction', 'specialized')).toBe('Special Applications');
    expect(derivePropertyType('new_construction', 'transportation')).toBe('Transportation');
  });

  it('derives readable scope and C of O labels', () => {
    expect(deriveScopeLabel('new_construction')).toBe('New construction');
    expect(deriveScopeLabel(undefined)).toBe('');
    expect(deriveCofOStatus(filledData())).toBe('Yes, registered');
    expect(deriveCofOStatus(filledData({ titleStatus: 'receipt_survey_only' }))).toBe('No, I need help obtaining');
    expect(deriveCofOStatus(createInitialData())).toBe('Not sure');
  });

  it('maps a completed onboarding record to the display project', () => {
    const display = toDisplayProject(filledData());
    expect(display).toMatchObject({
      propertyType: 'residential-new',
      projectScope: 'New construction',
      cOfOStatus: 'Yes, registered',
      sqft: '600',
      titleType: 'Certificate of Occupancy',
    });
  });
});