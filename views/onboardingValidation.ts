/**
 * Pure onboarding helpers — extracted from the wizard component so the
 * validation and mapping rules can be unit-tested without a DOM.
 *
 * These functions are deterministic: the same input always yields the same
 * output. The UI behaviour they drive is exercised in the journey tests.
 */

import { OnboardingData, ProjectStatus } from '../types';
import type {
  DevelopmentType,
  ProjectInput,
  ProjectScope,
  TitleStatus,
} from '../src/domain/rules';

export type Errors = Record<string, string>;

export const TITLE_OPTIONS: { label: string; value: TitleStatus }[] = [
  { label: 'Certificate of Occupancy', value: 'certificate_of_occupancy' },
  { label: 'Clearance letter from Lands', value: 'land_certificate' },
  { label: 'Conveyance', value: 'deed_of_assignment' },
  { label: 'Deed of assignment', value: 'deed_of_assignment' },
  { label: 'Family receipt', value: 'receipt_survey_only' },
  { label: "Governor's consent", value: 'governors_consent' },
  { label: 'Land agreement', value: 'letter_of_allocation' },
  { label: 'Letter of regularization', value: 'letter_of_allocation' },
  { label: 'Purchase receipt', value: 'receipt_survey_only' },
  { label: 'Registered deed', value: 'deed_of_assignment' },
];

export const TITLE_STATUS_BY_LABEL: Record<string, TitleStatus> = {};
TITLE_OPTIONS.forEach((o) => {
  TITLE_STATUS_BY_LABEL[o.label] = o.value;
});

export function generateProjectId(): string {
  const year = new Date().getFullYear();
  return `LAS-${year}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

export function createInitialData(): OnboardingData {
  return {
    propertyType: '',
    projectScope: '',
    cOfOStatus: '',
    timeline: 'Just exploring',
    address: '',
    lga: '',
    titleType: '',
    sqft: '',
    valuation: '',
    description: '',
    selectedPackage: null,
    files: [],
    consultationDate: null,
    consultationTime: null,
    status: ProjectStatus.DOCUMENTS_RECEIVED,
    id: generateProjectId(),
    email: '',
    contactName: '',
    phone: '',
  };
}

export function validateStep1(d: OnboardingData): Errors {
  const e: Errors = {};
  if (!d.applicantType) e.applicantType = 'Select who is applying for the permit.';
  if (!d.developmentType) e.developmentType = 'Choose the development type.';
  if (!d.workScope) e.workScope = 'Choose the work scope.';
  return e;
}

export function titleStatusFor(d: OnboardingData): TitleStatus | undefined {
  return d.titleStatus ?? (d.titleType ? TITLE_STATUS_BY_LABEL[d.titleType] : undefined);
}

export function validateStep2(d: OnboardingData): Errors {
  const e: Errors = {};
  if (!d.address || d.address.trim().length < 5) e.address = 'Enter the full property address (e.g. 5 Adeola Odeku Street, Victoria Island).';
  if (!d.lga) e.lga = 'Select the Local Government Area.';
  if (!titleStatusFor(d)) e.titleType = 'Select your title document status.';
  if (d.landAreaSqm === undefined || !isFinite(d.landAreaSqm) || d.landAreaSqm <= 0) e.landAreaSqm = 'Enter the land size in square metres (greater than 0).';
  if (d.floors === undefined || !isFinite(d.floors) || d.floors < 1 || Math.floor(d.floors) !== d.floors) e.floors = 'Enter the number of floors as a whole number (min 1).';
  if (d.units === undefined || !isFinite(d.units) || d.units < 1 || Math.floor(d.units) !== d.units) e.units = 'Enter the number of units as a whole number (min 1).';
  return e;
}

export function validateStep4(d: OnboardingData): Errors {
  const e: Errors = {};
  const digits = (d.phone || '').replace(/[^0-9]/g, '');
  if (!digits) e.phone = 'Phone number is required so we can send your assessment via WhatsApp.';
  else if (digits.length < 10 || digits.length > 14) e.phone = 'Enter a valid phone number (e.g. 0803 123 4567).';
  const email = (d.email || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address, or leave blank.';
  return e;
}

export function buildEngineInput(d: OnboardingData): ProjectInput {
  return {
    applicantType: d.applicantType ?? 'individual',
    developmentType: d.developmentType ?? 'residential',
    projectScope: d.workScope ?? 'new_construction',
    lga: d.lga || undefined,
    landAreaSqm: d.landAreaSqm,
    floors: d.floors,
    units: d.units,
    titleStatus: titleStatusFor(d),
    siteConditions: d.siteConditions && d.siteConditions.length > 0 ? d.siteConditions : undefined,
  };
}

export function derivePropertyType(scope: ProjectScope | undefined, dev: DevelopmentType | undefined): string {
  if (scope === 'renovation') return 'renovation';
  if (scope === 'regularization_amnesty') return 'regularization';
  switch (dev) {
    case 'residential': return scope === 'new_construction' ? 'residential-new' : 'residential';
    case 'commercial': return 'commercial';
    case 'mixed_use': return 'Mixed-Use';
    case 'industrial': return 'Industrial';
    case 'institutional': return 'Institutional';
    case 'agricultural': return 'Agricultural';
    case 'recreational': return 'Recreational';
    case 'religious': return 'Religious';
    case 'special_applications': return 'Special Applications';
    case 'specialized': return 'Special Applications';
    case 'transportation': return 'Transportation';
    default: return 'residential';
  }
}

export function deriveScopeLabel(scope: ProjectScope | undefined): string {
  switch (scope) {
    case 'new_construction': return 'New construction';
    case 'renovation': return 'Renovation / structural changes';
    case 'extension': return 'Extension';
    case 'change_of_use': return 'Change of use';
    case 'regularization_amnesty': return 'Regularization (amnesty)';
    default: return '';
  }
}

export function deriveCofOStatus(d: OnboardingData): string {
  const status = titleStatusFor(d);
  if (status === 'certificate_of_occupancy') return 'Yes, registered';
  if (status === 'none' || status === 'receipt_survey_only') return 'No, I need help obtaining';
  if (!status || status === 'unknown') return 'Not sure';
  return 'In progress';
}

export function toDisplayProject(d: OnboardingData): Partial<OnboardingData> {
  return {
    propertyType: derivePropertyType(d.workScope, d.developmentType),
    projectScope: deriveScopeLabel(d.workScope),
    cOfOStatus: deriveCofOStatus(d),
    timeline: 'Just exploring',
    titleType: d.titleType || '',
    sqft: d.landAreaSqm !== undefined ? String(d.landAreaSqm) : '',
    valuation: d.valuation,
  };
}