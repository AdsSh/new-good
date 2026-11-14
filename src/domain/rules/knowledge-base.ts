/**
 * Regulatory knowledge base — requirement catalog.
 *
 * PURE DATA. No logic here. Every requirement traces to a verified source.
 * CamelCase fields mirror the front-end checklist (`DocumentItem` in
 * components/DocumentChecklistCalculator.tsx) where applicable.
 */

import type { SourceId } from './sources';

export type RequirementCategory =
  | 'drawings'
  | 'technical_reports'
  | 'tax_corporate'
  | 'insurance_legal'
  | 'existing_renovation';

export interface RequirementMeta {
  costRange?: string;
  prepDays?: number;
  mandatoryRule?: string;
  regulatoryBody?: string;
  icon?: string;
}

export interface RequirementDef {
  /**
   * Stable ID. Where a document exists in the UI checklist, this matches
   * the existing `DocumentItem.id` so the assessment can bind to it.
   */
  id: string;
  name: string;
  category: RequirementCategory;
  /** Rule ID (in rules.ts) that decides applicability. */
  ruleId: string;
  /** Source IDs this requirement traces back to. */
  sources: SourceId[];
  /** Human-readable statement of when it applies. */
  appliesWhen: string;
  meta?: RequirementMeta;
}

export const REQUIREMENTS: RequirementDef[] = [
  // ── Core drawings (required for all lodgments) ────────────────────────
  {
    id: 'architectural_drawings',
    name: 'Architectural Floor Plans (ARCON signed & sealed)',
    category: 'drawings',
    ruleId: 'RUL_BASE_ARCH',
    sources: ['SRC-REG-LASPPPA-2019', 'SRC-EPP-FORM-2024'],
    appliesWhen: 'All development permit applications. ARCON-registered architect, 5 sets.',
    meta: {
      costRange: '₦400,000+',
      prepDays: 12,
      mandatoryRule: 'Mandatory for all building permit lodgments on the Lagos EPPES portal.',
      regulatoryBody: 'ARCON Registered Architect / LASPPPA',
      icon: 'draw',
    },
  },
  {
    id: 'structural_drawings',
    name: 'Structural Drawings (Duly signed, sealed and dated)',
    category: 'drawings',
    ruleId: 'RUL_BASE_STRUCT',
    sources: ['SRC-REG-LASPPPA-2019', 'SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'All developments with reinforced concrete elements or load-bearing structures.',
    meta: {
      costRange: '₦450,000 – ₦1,200,000+',
      prepDays: 12,
      mandatoryRule:
        'Mandatory for all developments with reinforced concrete elements or load-bearing structures.',
      regulatoryBody: 'COREN Certified Engineer / LASBCA',
      icon: 'foundation',
    },
  },
  {
    id: 'mechanical_drawings',
    name: 'Mechanical Drawings (Duly signed, sealed and dated)',
    category: 'drawings',
    ruleId: 'RUL_BASE_MECH',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'All building permit lodgments on the Lagos EPPES portal.',
    meta: {
      costRange: '₦250,000 – ₦650,000',
      prepDays: 8,
      mandatoryRule: 'Mandatory for all building permit lodgments on the Lagos EPPES portal.',
      regulatoryBody: 'COREN Registered Mechanical Engineer / LASPPPA',
      icon: 'plumbing',
    },
  },
  {
    id: 'electrical_drawings',
    name: 'Electrical Drawings (Duly signed, sealed and dated)',
    category: 'drawings',
    ruleId: 'RUL_BASE_ELEC',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'All building permit lodgments on the Lagos EPPES portal.',
    meta: {
      costRange: '₦250,000 – ₦650,000',
      prepDays: 8,
      mandatoryRule: 'Mandatory for all building permit lodgments on the Lagos EPPES portal.',
      regulatoryBody: 'COREN Registered Electrical Engineer / LASPPPA',
      icon: 'electrical_services',
    },
  },
  {
    id: 'survey_plan',
    name: 'Survey Plan (Registered Red Copy & NIS Seal)',
    category: 'insurance_legal',
    ruleId: 'RUL_BASE_SURVEY',
    sources: ['SRC-REG-LASPPPA-2019', 'SRC-LAW-2010'],
    appliesWhen: 'Every single land plot and building permit in Lagos State.',
    meta: {
      costRange: '₦425,000 – ₦1,575,000',
      prepDays: 14,
      mandatoryRule: 'Mandatory for every single land plot and building permit in Lagos State.',
      regulatoryBody: 'Office of the State Surveyor General (OSGOF) / NIS',
      icon: 'map',
    },
  },

  // ── Title documents (land ownership evidence) ─────────────────────────
  {
    id: 'title_document',
    name: 'Title Document (C of O / Governor’s Consent / Deed of Assignment)',
    category: 'insurance_legal',
    ruleId: 'RUL_BASE_TITLE',
    sources: ['SRC-LAW-2010', 'SRC-REG-LASPPPA-2019'],
    appliesWhen: 'All applications. Exact document depends on title status.',
    meta: {
      costRange: 'Varies by title type',
      prepDays: 60,
      mandatoryRule: 'Evidence of valid ownership required for every permit application.',
      regulatoryBody: 'Lagos Lands Bureau / LASPPPA',
      icon: 'verified_user',
    },
  },

  // ── 3D drawings: buildings beyond 3 floors ────────────────────────────
  {
    id: 'structural_3d',
    name: '3D Structural Drawings (BIM)',
    category: 'drawings',
    ruleId: 'RUL_3D_STRUCT',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Buildings beyond 3 floors (>3). Mandated to submit 3D as well as 2D.',
    meta: {
      costRange: '₦350,000 – ₦850,000',
      prepDays: 10,
      mandatoryRule:
        'Buildings beyond 3 floors (>3 floors) are mandated to submit 3D as well as 2D.',
      regulatoryBody: 'COREN / LASBCA Special Projects Vetting Unit',
      icon: 'view_in_ar',
    },
  },
  {
    id: 'mechanical_3d',
    name: '3D Mechanical Drawings',
    category: 'drawings',
    ruleId: 'RUL_3D_MECH',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Buildings beyond 3 floors (>3). Mandated to submit 3D as well as 2D.',
    meta: {
      costRange: '₦300,000 – ₦650,000',
      prepDays: 9,
      mandatoryRule:
        'Buildings beyond 3 floors (>3 floors) are mandated to submit 3D as well as 2D.',
      regulatoryBody: 'COREN / Lagos State Ministry of Physical Planning',
      icon: 'view_in_ar',
    },
  },
  {
    id: 'electrical_3d',
    name: '3D Electrical Drawings',
    category: 'drawings',
    ruleId: 'RUL_3D_ELEC',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Buildings beyond 3 floors (>3). Mandated to submit 3D as well as 2D.',
    meta: {
      costRange: '₦300,000 – ₦650,000',
      prepDays: 9,
      mandatoryRule:
        'Buildings beyond 3 floors (>3 floors) are mandated to submit 3D as well as 2D.',
      regulatoryBody: 'COREN / Lagos State Ministry of Physical Planning',
      icon: 'view_in_ar',
    },
  },

  // ── Technical reports / site studies ──────────────────────────────────
  {
    id: 'subsoil_investigation',
    name: 'Sub-soil Investigation Report (Soil Test)',
    category: 'technical_reports',
    ruleId: 'RUL_SUBSOIL',
    sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    appliesWhen:
      'Buildings beyond 2 floors, commercial structures, Lekki/Island/coastal terrain, high-density zones.',
    meta: {
      costRange: '₦450,000 – ₦950,000',
      prepDays: 12,
      mandatoryRule:
        'Mandatory for all buildings beyond 2 floors, commercial structures, Lekki/Island/coastal terrains, and high-density zones.',
      regulatoryBody: 'LASBCA Materials Testing Laboratory',
      icon: 'science',
    },
  },
  {
    id: 'pptr_report',
    name: 'Physical Planning Technical Report (PPTR / LUPAR)',
    category: 'technical_reports',
    ruleId: 'RUL_PPTR',
    sources: ['SRC-REG-LASPPPA-2019', 'SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    appliesWhen:
      'Land ≥ 5,000 sqm; or floors > 4; or ≥ 8 units; or commercial / institutional / industrial / mixed-use / specialized uses requiring planning board review.',
    meta: {
      costRange: '₦450,000 – ₦1,200,000',
      prepDays: 15,
      mandatoryRule:
        'Land ≥ 5,000 sqm, > 4 floors, ≥ 8 units, or uses requiring TOPREC stamping / HQ Planning Board review.',
      regulatoryBody: 'TOPREC / LASPPPA HQ',
      icon: 'assignment',
    },
  },
  {
    id: 'drainage_clearance',
    name: 'Drainage Clearance (PPTR Drainage Annex)',
    category: 'technical_reports',
    ruleId: 'RUL_DRAINAGE',
    sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    appliesWhen:
      'Building of 8 units or 4 floors; canal-adjacent plots; flood-prone districts; developments near drainage channels.',
    meta: {
      costRange: '₦300,000 – ₦700,000',
      prepDays: 10,
      mandatoryRule:
        'Mandatory if the building is 8 units or 4 floors, canal-adjacent, or in flood-prone districts.',
      regulatoryBody: 'Lagos State Ministry of Environment / LASWMO',
      icon: 'water_drop',
    },
  },
  {
    id: 'transport_impact',
    name: 'Transport Impact Analysis (TIA) / Traffic Clearance',
    category: 'technical_reports',
    ruleId: 'RUL_TIA',
    sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    appliesWhen:
      'Commercial complexes, event centres, educational/medical facilities, high-density residential estates, filling stations, major arterial junctions.',
    meta: {
      costRange: '₦500,000 – ₦1,500,000',
      prepDays: 14,
      mandatoryRule:
        'Mandatory for commercial complexes, event centres, education/medical facilities, high-density estates, and major arterial junctions.',
      regulatoryBody: 'Lagos State Ministry of Transportation / LASTMA',
      icon: 'traffic',
    },
  },

  // ── Insurance & construction-phase documents ──────────────────────────
  {
    id: 'contractors_insurance',
    name: 'Contractors All-Risk Insurance / Building Insurance Policy',
    category: 'insurance_legal',
    ruleId: 'RUL_INSURANCE_2F',
    sources: ['SRC-REG-LASBCA-2019', 'SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Buildings > 2 floors (LASBCA). Statutory for construction phase.',
    meta: {
      costRange: 'Underwriting Premium (based on project valuation)',
      prepDays: 5,
      mandatoryRule:
        'Contractors All-Risk Insurance required for developments above 2 floors (LASBCA Regulations).',
      regulatoryBody: 'NAICOM Certified Underwriter / LASBCA',
      icon: 'verified_user',
    },
  },

  // ── Tax & corporate (applicant-type dependent) ────────────────────────
  {
    id: 'individual_tcc',
    name: 'Current Tax Clearance of Individual (LIRS e-TCC)',
    category: 'tax_corporate',
    ruleId: 'RUL_TCC_INDIVIDUAL',
    sources: ['SRC-LIRS', 'SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Individual landowner/applicant on EPPES.',
    meta: {
      costRange: 'Personal Income Tax Assessment',
      prepDays: 5,
      mandatoryRule: 'Mandatory for all individual applicant submissions on EPPES.',
      regulatoryBody: 'LIRS',
      icon: 'receipt_long',
    },
  },
  {
    id: 'company_tcc',
    name: 'Current Tax Clearance of the Company (Corporate TCC)',
    category: 'tax_corporate',
    ruleId: 'RUL_TCC_COMPANY',
    sources: ['SRC-LIRS', 'SRC-REG-LASPPPA-2019'],
    appliesWhen: 'Corporate entity building permit applications in Lagos State.',
    meta: {
      costRange: 'Corporate Income Tax Assessment',
      prepDays: 7,
      mandatoryRule:
        'Mandatory for all corporate entity building permit applications in Lagos State.',
      regulatoryBody: 'LIRS / FIRS',
      icon: 'corporate_fare',
    },
  },
  {
    id: 'directors_tcc',
    name: 'Current Tax Clearance of 2 Directors',
    category: 'tax_corporate',
    ruleId: 'RUL_TCC_DIRECTORS',
    sources: ['SRC-LIRS', 'SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Company / corporate developer applicant.',
    meta: {
      costRange: 'Director Personal Income Tax',
      prepDays: 6,
      mandatoryRule:
        'Mandatory when applicant is a registered company or corporate developer.',
      regulatoryBody: 'LIRS',
      icon: 'badge',
    },
  },
  {
    id: 'paye_returns',
    name: 'Current PAYE Returns of the Company',
    category: 'tax_corporate',
    ruleId: 'RUL_PAYE',
    sources: ['SRC-LIRS', 'SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Company applicants proving employer tax compliance in Lagos State.',
    meta: {
      costRange: 'Payroll Statutory Remittance',
      prepDays: 4,
      mandatoryRule: 'Mandatory for all company applicants in Lagos State.',
      regulatoryBody: 'LIRS',
      icon: 'groups',
    },
  },
  {
    id: 'cac_incorporation',
    name: 'Certificate of Incorporation (CAC)',
    category: 'tax_corporate',
    ruleId: 'RUL_CAC',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Corporate applicants, corporate property owners, developer companies.',
    meta: {
      costRange: 'Statutory CAC Filing',
      prepDays: 3,
      mandatoryRule:
        'Mandatory for all corporate applicants, corporate property owners, and developer companies.',
      regulatoryBody: 'CAC / EPPES Portal',
      icon: 'business',
    },
  },
  {
    id: 'lirs_clearance',
    name: 'LIRS Clearance',
    category: 'tax_corporate',
    ruleId: 'RUL_LIRS_CLEARANCE',
    sources: ['SRC-LIRS', 'SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'All building permit applications lodged on the Lagos EPPES portal.',
    meta: {
      costRange: 'LIRS Clearance Certificate',
      prepDays: 7,
      mandatoryRule:
        'Listed as a mandatory supporting document on the Lagos EPPES portal for every applicant.',
      regulatoryBody: 'Lagos State Internal Revenue Service (LIRS)',
      icon: 'receipt_long',
    },
  },

  // ── Existing / renovation / regularization / amnesty ──────────────────
  {
    id: 'stability_letter',
    name: 'Letter of Structural Stability / Structural Integrity (NDT)',
    category: 'existing_renovation',
    ruleId: 'RUL_STABILITY_NDT',
    sources: ['SRC-EPP-CHECKLIST-2024', 'SRC-FAQ-DOCX'],
    appliesWhen:
      'Existing building / under-construction / renovation / regularization / amnesty.',
    meta: {
      costRange: '₦450,000 – ₦1,250,000',
      prepDays: 14,
      mandatoryRule:
        'Mandatory for existing buildings, under-construction, renovation, regularization, or amnesty.',
      regulatoryBody: 'LASBCA Materials Testing Lab & COREN Structural Specialist',
      icon: 'fact_check',
    },
  },
  {
    id: 'former_permit',
    name: 'Former Development Permit (Previous Approval)',
    category: 'existing_renovation',
    ruleId: 'RUL_FORMER_PERMIT',
    sources: ['SRC-EPP-CHECKLIST-2024'],
    appliesWhen: 'Renovations, extensions, floor additions, or modification of approved buildings.',
    meta: {
      costRange: 'Archival Search / Retrieve',
      prepDays: 5,
      mandatoryRule:
        'Mandatory for renovations, extensions, floor additions, or modifications of previously approved buildings.',
      regulatoryBody: 'LASPPPA Records & Archives Directorate',
      icon: 'history_edu',
    },
  },
  {
    id: 'land_use_charge',
    name: 'Land Use Charges (LUC) or Sworn Affidavit in Lieu',
    category: 'existing_renovation',
    ruleId: 'RUL_LUC',
    sources: ['SRC-FAQ-DOCX'],
    appliesWhen:
      'Existing properties undergoing renovation, extension, or amnesty regularization.',
    meta: {
      costRange: 'State Land Use Charge Tariff',
      prepDays: 3,
      mandatoryRule:
        'Mandatory for existing properties undergoing renovation, extension, or amnesty regularization.',
      regulatoryBody: 'Lagos State Ministry of Finance / High Court of Lagos',
      icon: 'gavel',
    },
  },
];

export const REQUIREMENT_BY_ID: Record<string, RequirementDef> = Object.fromEntries(
  REQUIREMENTS.map((r) => [r.id, r])
);

/**
 * Conditional third-party clearances listed under
 * "Clearance letter from" on the Lagos EPPES supporting-documents form.
 *
 * These are case-by-case letters rather than statutory checklist items, so
 * they are tracked in the UI but deliberately excluded from the readiness
 * score. Applicability is confirmed by a consultant, not guessed here.
 */
export const CLEARANCE_LETTERS: { id: string; name: string }[] = [
  {
    id: 'clearance_land_use_allocation',
    name: 'Clearance letter from Land Use and Allocation committee',
  },
  {
    id: 'clearance_new_town_development',
    name: 'Clearance letter from New Town Development Authority',
  },
  {
    id: 'clearance_environment_drainage',
    name: 'Clearance letter from Ministry of Environment (Drainage Department)',
  },
  {
    id: 'clearance_transportation_metro',
    name: 'Clearance letter from Ministry of Transportation (Metro Alignment / Traffic Report)',
  },
  {
    id: 'clearance_private_estate',
    name: 'Clearance letter from Private estate and others',
  },
  {
    id: 'clearance_lsdpc',
    name: 'Clearance letter from LSDPC',
  },
  {
    id: 'clearance_urban_renewal',
    name: 'Clearance letter from Lagos State Urban Renewal Agency',
  },
  {
    id: 'clearance_nnpc_dpr',
    name: 'Clearance letter from NNPC / DPR',
  },
  {
    id: 'clearance_power_fire_police',
    name: 'Clearance letter from Power Distribution Company / Fire Services / Police Report',
  },
  {
    id: 'clearance_other',
    name: 'Others',
  },
];