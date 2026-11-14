/**
 * Regulatory rule definitions.
 *
 * Each rule is a PURE, deterministic function of `ProjectInput`.
 * - Same input → same output (no randomness, no time, no AI).
 * - Every rule has an explicit ID and traces to verified sources.
 * - `state === 'unknown'` means: the engine lacks input to decide and must
 *   ask a human. It NEVER guesses.
 *
 * No UI coupling. These functions know nothing about React or components.
 */

import type { ProjectInput } from './types';
import type { SourceId } from './sources';

export type RuleState = 'applicable' | 'not_applicable' | 'unknown';

export interface RuleResult {
  ruleId: string;
  title: string;
  state: RuleState;
  rationale: string;
  sources: SourceId[];
}

export interface RuleDef {
  id: string;
  title: string;
  sources: SourceId[];
  evaluate: (input: ProjectInput) => RuleResult;
}

/** True when a floor value is present and greater than n. */
const floorsAbove = (input: ProjectInput, n: number): boolean | undefined =>
  input.floors === undefined ? undefined : input.floors > n;

/** True when a unit count is present and at least {limit}. */
const unitsAtLeast = (input: ProjectInput, limit: number): boolean | undefined =>
  input.units === undefined ? undefined : input.units >= limit;

const hasSpecialSite = (input: ProjectInput, conditions: string[]): boolean =>
  Boolean(input.siteConditions && input.siteConditions.some((c) => conditions.includes(c)));

/** Non-residential uses that assertively trigger planning-board review. */
const NON_RESIDENTIAL: string[] = [
  'commercial',
  'industrial',
  'institutional',
  'mixed_use',
  'specialized',
  'agricultural',
  'recreational',
  'religious',
  'special_applications',
  'transportation',
];

const base = (id: string, title: string, sources: SourceId[], rationale: string): RuleDef => ({
  id,
  title,
  sources,
  evaluate: () => ({
    ruleId: id,
    title,
    state: 'applicable',
    rationale,
    sources,
  }),
});

export const RULES: RuleDef[] = [
  base(
    'RUL_BASE_ARCH',
    'Architectural drawings required',
    ['SRC-REG-LASPPPA-2019'],
    'Every permit application requires ARCON-signed architectural floor plans (5 sets).'
  ),
  base(
    'RUL_BASE_STRUCT',
    'Structural drawings required',
    ['SRC-REG-LASPPPA-2019', 'SRC-EPP-CHECKLIST-2024'],
    'Structural drawings signed, sealed and dated by a COREN engineer are required for all developments with reinforced concrete or load-bearing elements.'
  ),
  base(
    'RUL_BASE_MECH',
    'Mechanical drawings required',
    ['SRC-REG-LASPPPA-2019', 'SRC-EPP-CHECKLIST-2024'],
    'Mechanical drawings are mandatory for all building permit lodgments on the Lagos EPPES portal.'
  ),
  base(
    'RUL_BASE_ELEC',
    'Electrical drawings required',
    ['SRC-REG-LASPPPA-2019', 'SRC-EPP-CHECKLIST-2024'],
    'Electrical drawings are mandatory for all building permit lodgments on the Lagos EPPES portal.'
  ),
  base(
    'RUL_BASE_SURVEY',
    'Survey plan required',
    ['SRC-REG-LASPPPA-2019'],
    'A registered survey plan (Red Copy with NIS seal) is mandatory for every land plot in Lagos State.'
  ),
  {
    id: 'RUL_BASE_TITLE',
    title: 'Title document required',
    sources: ['SRC-LAW-2010'],
    evaluate: (input) => {
      if (input.titleStatus === 'none') {
        return {
          ruleId: 'RUL_BASE_TITLE',
          title: 'Title document required',
          state: 'unknown',
          rationale:
            'No title document was reported. The application cannot proceed without verified ownership evidence (C of O, Governor’s Consent, or registered Deed of Assignment).',
          sources: ['SRC-LAW-2010'],
        };
      }
      if (input.titleStatus === undefined || input.titleStatus === 'unknown') {
        return {
          ruleId: 'RUL_BASE_TITLE',
          title: 'Title document required',
          state: 'unknown',
          rationale:
            'Title status was not reported. A valid title document is always required; please confirm which document you hold.',
          sources: ['SRC-LAW-2010'],
        };
      }
      return {
        ruleId: 'RUL_BASE_TITLE',
        title: 'Title document required',
        state: 'applicable',
        rationale: 'A valid title document is mandatory for every permit application in Lagos.',
        sources: ['SRC-LAW-2010'],
      };
    },
  },
  {
    id: 'RUL_3D_STRUCT',
    title: '3D structural drawings (>3 floors)',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    evaluate: (input) => {
      const above = floorsAbove(input, 3);
      if (above === undefined) {
        return {
          ruleId: 'RUL_3D_STRUCT',
          title: '3D structural drawings',
          state: 'unknown',
          rationale:
            'Number of floors was not provided. Buildings beyond 3 floors must submit 3D structural drawings alongside 2D.',
          sources: ['SRC-EPP-CHECKLIST-2024'],
        };
      }
      return {
        ruleId: 'RUL_3D_STRUCT',
        title: '3D structural drawings',
        state: above ? 'applicable' : 'not_applicable',
        rationale: above
          ? 'Building exceeds 3 floors — 3D structural drawings are mandated.'
          : 'Building is 3 floors or fewer — 3D structural drawings are not required.',
        sources: ['SRC-EPP-CHECKLIST-2024'],
      };
    },
  },
  {
    id: 'RUL_3D_MECH',
    title: '3D mechanical drawings (>3 floors)',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    evaluate: (input) => {
      const above = floorsAbove(input, 3);
      if (above === undefined) {
        return {
          ruleId: 'RUL_3D_MECH',
          title: '3D mechanical drawings',
          state: 'unknown',
          rationale:
            'Number of floors was not provided. Buildings beyond 3 floors must submit 3D mechanical drawings.',
          sources: ['SRC-EPP-CHECKLIST-2024'],
        };
      }
      return {
        ruleId: 'RUL_3D_MECH',
        title: '3D mechanical drawings',
        state: above ? 'applicable' : 'not_applicable',
        rationale: above
          ? 'Building exceeds 3 floors — 3D mechanical drawings are mandated.'
          : 'Building is 3 floors or fewer — 3D mechanical drawings are not required.',
        sources: ['SRC-EPP-CHECKLIST-2024'],
      };
    },
  },
  {
    id: 'RUL_3D_ELEC',
    title: '3D electrical drawings (>3 floors)',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    evaluate: (input) => {
      const above = floorsAbove(input, 3);
      if (above === undefined) {
        return {
          ruleId: 'RUL_3D_ELEC',
          title: '3D electrical drawings',
          state: 'unknown',
          rationale:
            'Number of floors was not provided. Buildings beyond 3 floors must submit 3D electrical drawings.',
          sources: ['SRC-EPP-CHECKLIST-2024'],
        };
      }
      return {
        ruleId: 'RUL_3D_ELEC',
        title: '3D electrical drawings',
        state: above ? 'applicable' : 'not_applicable',
        rationale: above
          ? 'Building exceeds 3 floors — 3D electrical drawings are mandated.'
          : 'Building is 3 floors or fewer — 3D electrical drawings are not required.',
        sources: ['SRC-EPP-CHECKLIST-2024'],
      };
    },
  },
  {
    id: 'RUL_SUBSOIL',
    title: 'Sub-soil investigation report',
    sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    evaluate: (input) => {
      const over2 = floorsAbove(input, 2);
      const triggers =
        over2 === true ||
        input.developmentType === 'commercial' ||
        hasSpecialSite(input, [
          'coastal',
          'swampy',
          'water_adjacent',
          'flood_prone',
          'reclaimed',
        ]);
      if (triggers) {
        return {
          ruleId: 'RUL_SUBSOIL',
          title: 'Sub-soil investigation report',
          state: 'applicable',
          rationale:
            'Sub-soil investigation is mandatory beyond 2 floors, for commercial structures, or on Lekki/Island/coastal/swampy/high-density terrain.',
          sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
        };
      }
      if (over2 === undefined) {
        return {
          ruleId: 'RUL_SUBSOIL',
          title: 'Sub-soil investigation report',
          state: 'unknown',
          rationale:
            'Floor count not provided. Confirm whether this building exceeds 2 floors before assuming the sub-soil report is not required.',
          sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
        };
      }
      return {
        ruleId: 'RUL_SUBSOIL',
        title: 'Sub-soil investigation report',
        state: 'not_applicable',
        rationale:
          'Development is 2 floors or fewer, residential, with no coastal/swampy/water/reclaimed site conditions — sub-soil investigation not triggered.',
        sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
      };
    },
  },
  {
    id: 'RUL_PPTR',
    title: 'Physical Planning Technical Report (PPTR)',
    sources: ['SRC-REG-LASPPPA-2019', 'SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    evaluate: (input) => {
      const landBig = input.landAreaSqm !== undefined && input.landAreaSqm >= 5000;
      const over4 = floorsAbove(input, 4);
      const manyUnits = unitsAtLeast(input, 8);
      const isNonRes = NON_RESIDENTIAL.includes(input.developmentType);

      if (landBig || over4 === true || manyUnits === true || isNonRes) {
        return {
          ruleId: 'RUL_PPTR',
          title: 'Physical Planning Technical Report (PPTR)',
          state: 'applicable',
          rationale:
            'PPTR is required for land ≥ 5,000 sqm, buildings > 4 floors, developments of ≥ 8 units, or non-residential uses (commercial, institutional, industrial, specialized).',
          sources: ['SRC-REG-LASPPPA-2019', 'SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
        };
      }
      if (input.landAreaSqm === undefined || over4 === undefined || manyUnits === undefined) {
        return {
          ruleId: 'RUL_PPTR',
          title: 'Physical Planning Technical Report (PPTR)',
          state: 'unknown',
          rationale:
            'Land area, floor count, or unit count is missing — cannot rule out the PPTR triggers (≥ 5,000 sqm / > 4 floors / ≥ 8 units).',
          sources: ['SRC-REG-LASPPPA-2019'],
        };
      }
      return {
        ruleId: 'RUL_PPTR',
        title: 'Physical Planning Technical Report (PPTR)',
        state: 'not_applicable',
        rationale:
          'Land under 5,000 sqm, 4 floors or fewer, under 8 units, residential use — PPTR not triggered.',
        sources: ['SRC-REG-LASPPPA-2019', 'SRC-EPP-CHECKLIST-2024'],
      };
    },
  },
  {
    id: 'RUL_DRAINAGE',
    title: 'Drainage clearance',
    sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    evaluate: (input) => {
      const manyUnits = unitsAtLeast(input, 8);
      const fourFloors = input.floors !== undefined && input.floors >= 4;
      const floodZone = hasSpecialSite(input, ['flood_prone', 'canal_adjacent', 'water_adjacent']);
      if (manyUnits === true || fourFloors || floodZone) {
        return {
          ruleId: 'RUL_DRAINAGE',
          title: 'Drainage clearance',
          state: 'applicable',
          rationale:
            'Drainage clearance is mandatory for buildings of 8 units or 4 floors, canal-adjacent plots, flood-prone districts, or near water bodies.',
          sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
        };
      }
      if (input.units === undefined || input.floors === undefined) {
        return {
          ruleId: 'RUL_DRAINAGE',
          title: 'Drainage clearance',
          state: 'unknown',
          rationale:
            'Units and floors not provided. Drainage clearance applies at 8 units or 4 floors and to flood-prone sites.',
          sources: ['SRC-EPP-CHECKLIST-2024'],
        };
      }
      return {
        ruleId: 'RUL_DRAINAGE',
        title: 'Drainage clearance',
        state: 'not_applicable',
        rationale:
          'Under 8 units, fewer than 4 floors, and no flood-zone indicators — drainage clearance not triggered.',
        sources: ['SRC-EPP-CHECKLIST-2024'],
      };
    },
  },
  {
    id: 'RUL_TIA',
    title: 'Transport Impact Analysis (TIA)',
    sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    evaluate: (input) => {
      const trafficSensitive = [
        'commercial',
        'institutional',
        'specialized',
        'agricultural',
        'recreational',
        'religious',
        'special_applications',
        'transportation',
      ].includes(input.developmentType);
      const highDensity =
        unitsAtLeast(input, 8) === true || (input.floors !== undefined && input.floors >= 4);
      if (trafficSensitive || highDensity) {
        return {
          ruleId: 'RUL_TIA',
          title: 'Transport Impact Analysis (TIA)',
          state: 'applicable',
          rationale:
            'TIA is required for commercial complexes, event centres, education/medical facilities, high-density estates, filling stations, and major arterial junctions.',
          sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
        };
      }
      if (input.units === undefined || input.floors === undefined) {
        return {
          ruleId: 'RUL_TIA',
          title: 'Transport Impact Analysis (TIA)',
          state: 'unknown',
          rationale:
            'Unit count or floor count is missing — cannot rule out the high-density TIA trigger.',
          sources: ['SRC-EPP-CHECKLIST-2024'],
        };
      }
      return {
        ruleId: 'RUL_TIA',
        title: 'Transport Impact Analysis (TIA)',
        state: 'not_applicable',
        rationale:
          'Residential, low-density development without traffic-sensitive use — TIA not triggered.',
        sources: ['SRC-EPP-CHECKLIST-2024'],
      };
    },
  },
  {
    id: 'RUL_INSURANCE_2F',
    title: 'Contractors All-Risk Insurance (>2 floors)',
    sources: ['SRC-REG-LASBCA-2019'],
    evaluate: (input) => {
      const over2 = floorsAbove(input, 2);
      if (over2 === undefined) {
        return {
          ruleId: 'RUL_INSURANCE_2F',
          title: 'Contractors All-Risk Insurance',
          state: 'unknown',
          rationale:
            'Floor count not provided. LASBCA requires Contractors All-Risk Insurance for buildings above 2 floors.',
          sources: ['SRC-REG-LASBCA-2019'],
        };
      }
      return {
        ruleId: 'RUL_INSURANCE_2F',
        title: 'Contractors All-Risk Insurance',
        state: over2 ? 'applicable' : 'not_applicable',
        rationale: over2
          ? 'Building exceeds 2 floors — Contractors All-Risk Insurance is required (LASBCA).'
          : 'Building is 2 floors or fewer — LASBCA insurance threshold not triggered.',
        sources: ['SRC-REG-LASBCA-2019'],
      };
    },
  },
  {
    id: 'RUL_TCC_INDIVIDUAL',
    title: 'Individual tax clearance (e-TCC)',
    sources: ['SRC-LIRS'],
    evaluate: (input) => ({
      ruleId: 'RUL_TCC_INDIVIDUAL',
      title: 'Individual tax clearance (e-TCC)',
      state: input.applicantType === 'individual' ? 'applicable' : 'not_applicable',
      rationale:
        input.applicantType === 'individual'
          ? 'Individual applicant — current LIRS e-TCC is mandatory.'
          : 'Corporate applicant — company tax clearance applies instead.',
      sources: ['SRC-LIRS'],
    }),
  },
  {
    id: 'RUL_TCC_COMPANY',
    title: 'Company tax clearance (Corporate TCC)',
    sources: ['SRC-LIRS', 'SRC-REG-LASPPPA-2019'],
    evaluate: (input) => ({
      ruleId: 'RUL_TCC_COMPANY',
      title: 'Company tax clearance (Corporate TCC)',
      state: input.applicantType === 'corporate' ? 'applicable' : 'not_applicable',
      rationale:
        input.applicantType === 'corporate'
          ? 'Corporate applicant — company tax clearance is mandatory.'
          : 'Individual applicant — individual e-TCC applies instead.',
      sources: ['SRC-LIRS', 'SRC-REG-LASPPPA-2019'],
    }),
  },
  {
    id: 'RUL_TCC_DIRECTORS',
    title: 'Tax clearance of 2 directors',
    sources: ['SRC-LIRS'],
    evaluate: (input) => ({
      ruleId: 'RUL_TCC_DIRECTORS',
      title: 'Tax clearance of 2 directors',
      state: input.applicantType === 'corporate' ? 'applicable' : 'not_applicable',
      rationale:
        input.applicantType === 'corporate'
          ? 'Corporate applicants must provide TCCs for at least 2 directors.'
          : 'Individual applicant — director TCC requirement does not apply.',
      sources: ['SRC-LIRS'],
    }),
  },
  {
    id: 'RUL_PAYE',
    title: 'PAYE returns of the company',
    sources: ['SRC-LIRS'],
    evaluate: (input) => ({
      ruleId: 'RUL_PAYE',
      title: 'PAYE returns of the company',
      state: input.applicantType === 'corporate' ? 'applicable' : 'not_applicable',
      rationale:
        input.applicantType === 'corporate'
          ? 'Corporate applicants must submit current verified PAYE returns.'
          : 'Individual applicant — PAYE requirement does not apply.',
      sources: ['SRC-LIRS'],
    }),
  },
  {
    id: 'RUL_CAC',
    title: 'Certificate of Incorporation (CAC)',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    evaluate: (input) => ({
      ruleId: 'RUL_CAC',
      title: 'Certificate of Incorporation (CAC)',
      state: input.applicantType === 'corporate' ? 'applicable' : 'not_applicable',
      rationale:
        input.applicantType === 'corporate'
          ? 'Corporate applicants — CAC incorporation certificate required.'
          : 'Individual applicant — CAC requirement does not apply.',
      sources: ['SRC-EPP-CHECKLIST-2024'],
    }),
  },
  base(
    'RUL_LIRS_CLEARANCE',
    'LIRS clearance required',
    ['SRC-LIRS', 'SRC-EPP-CHECKLIST-2024'],
    'A current LIRS clearance is listed as a mandatory supporting document on the Lagos EPPES portal for every applicant.'
  ),
  {
    id: 'RUL_STABILITY_NDT',
    title: 'Structural stability letter / NDT report',
    sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    evaluate: (input) => {
      const existingWork = [
        'renovation',
        'regularization_amnesty',
        'extension',
        'change_of_use',
      ].includes(input.projectScope);
      return {
        ruleId: 'RUL_STABILITY_NDT',
        title: 'Structural stability letter / NDT report',
        state: existingWork ? 'applicable' : 'not_applicable',
        rationale: existingWork
          ? 'Existing buildings, under-construction work, renovation, regularization, or amnesty require a Structural Stability / NDT report.'
          : 'New construction only — NDT stability letter not triggered.',
        sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
      };
    },
  },
  {
    id: 'RUL_FORMER_PERMIT',
    title: 'Former development permit',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    evaluate: (input) => {
      const needsFormer = ['renovation', 'extension', 'change_of_use'].includes(
        input.projectScope
      );
      return {
        ruleId: 'RUL_FORMER_PERMIT',
        title: 'Former development permit',
        state: needsFormer ? 'applicable' : 'not_applicable',
        rationale: needsFormer
          ? 'Renovations, extensions, or changes to previously approved buildings require the former development permit copy.'
          : 'New construction — former permit not applicable.',
        sources: ['SRC-EPP-CHECKLIST-2024'],
      };
    },
  },
  {
    id: 'RUL_LUC',
    title: 'Land Use Charge (LUC) or sworn affidavit in lieu',
    sources: ['SRC-FAQ-DOCX'],
    evaluate: (input) => {
      const needsLuc = ['renovation', 'regularization_amnesty', 'extension'].includes(
        input.projectScope
      );
      return {
        ruleId: 'RUL_LUC',
        title: 'Land Use Charge (LUC)',
        state: needsLuc ? 'applicable' : 'not_applicable',
        rationale: needsLuc
          ? 'Existing properties undergoing renovation, extension, or amnesty must evidence Land Use Charge payment or provide a sworn affidavit in lieu.'
          : 'New construction — LUC affidavit requirement not triggered by this scope.',
        sources: ['SRC-FAQ-DOCX'],
      };
    },
  },
];

export const RULE_BY_ID: Record<string, RuleDef> = Object.fromEntries(
  RULES.map((r) => [r.id, r])
);