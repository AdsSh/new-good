import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWhatsAppQuoteLink } from '../constants';
import { evaluateRules, REQUIREMENTS } from '@/src/domain/rules';
import type {
  ApplicantType,
  DevelopmentType,
  DocumentAvailability,
  ProjectDocuments,
  ProjectInput,
  ProjectScope,
  SiteCondition,
  TitleStatus,
} from '@/src/domain/rules';
import type { RequirementCategory } from '@/src/domain/rules';

export interface DocumentItem {
  id: string;
  name: string;
  category: RequirementCategory;
  icon: string;
  badge?: string;
  description: string;
  costRange: string;
  prepDays: number;
  mandatoryRule: string;
  regulatoryBody: string;
  bottleneckWarning: string;
  hasIt: boolean;
  is3DMandate?: boolean;
  isCorporateOnly?: boolean;
  isIndividualOnly?: boolean;
  isMultiStoreyMandate?: boolean;
  isExistingBuildingOnly?: boolean;
}

const ALL_SUPPORTING_DOCUMENTS: DocumentItem[] = [
  // 1. Core Drawings (Signed, Sealed, Dated)
  {
    id: 'structural_drawings',
    name: 'Structural Drawings (Duly signed, sealed and dated)',
    category: 'drawings',
    icon: 'foundation',
    badge: 'Signed & Sealed',
    description: 'Complete structural calculation sheets, beam/column reinforcement details, and foundation schedule sealed by a COREN-registered structural engineer.',
    costRange: '₦450,000 – ₦1,200,000+',
    prepDays: 12,
    mandatoryRule: 'Mandatory for all developments with reinforced concrete elements or load-bearing structures.',
    regulatoryBody: 'COREN Certified Engineer / LASBCA',
    bottleneckWarning: 'District structural desk rejects file at Stage 1 vetting without COREN seal and calculation sheets.',
    hasIt: true
  },
  {
    id: 'mechanical_drawings',
    name: 'Mechanical Drawings (Duly signed, sealed and dated)',
    category: 'drawings',
    icon: 'plumbing',
    badge: 'Signed & Sealed',
    description: 'Plumbing schematics, sanitary pipe runs, water supply reticulation, HVAC layouts, and storm drainage integration sealed by a COREN mechanical engineer.',
    costRange: '₦250,000 – ₦650,000',
    prepDays: 8,
    mandatoryRule: 'Mandatory for all building permit lodgments on the Lagos EPPES portal.',
    regulatoryBody: 'COREN Registered Mechanical Engineer / LASPPPA',
    bottleneckWarning: 'EPPES digital portal flags missing M&E engineering documentation during automated upload vetting.',
    hasIt: true
  },
  {
    id: 'electrical_drawings',
    name: 'Electrical Drawings (Duly signed, sealed and dated)',
    category: 'drawings',
    icon: 'electrical_services',
    badge: 'Signed & Sealed',
    description: 'Single-line diagrams, load schedules, conduit routes, earthing/lightning protection, and generator/substation layouts signed and sealed by a COREN electrical engineer.',
    costRange: '₦250,000 – ₦650,000',
    prepDays: 8,
    mandatoryRule: 'Mandatory for all building permit lodgments on the Lagos EPPES portal.',
    regulatoryBody: 'COREN Registered Electrical Engineer / LASPPPA',
    bottleneckWarning: 'Utility and physical planning vetting desk halts review if electrical load calculation is omitted.',
    hasIt: true
  },
  {
    id: 'survey_plan',
    name: 'Survey Plan (Registered Red Copy & NIS Seal)',
    category: 'insurance_legal',
    icon: 'map',
    badge: 'Registered Red Copy',
    description: 'Official survey plan showing beacon coordinates, boundary setbacks, road reservation alignment, and Surveyor General lodgment number.',
    costRange: '₦425,000 – ₦1,575,000',
    prepDays: 14,
    mandatoryRule: 'Mandatory for every single land plot and building permit in Lagos State.',
    regulatoryBody: 'Office of the State Surveyor General (OSGOF) / NIS',
    bottleneckWarning: 'EPPES coordinate validation fails immediately if beacon coordinates do not match cadastral mapping.',
    hasIt: true
  },

  // 2. 3D Drawings Requirement for Buildings > 3 Floors
  {
    id: 'structural_3d',
    name: '3D Structural Drawings',
    category: 'drawings',
    icon: 'view_in_ar',
    badge: '>3 Floors Mandate',
    description: 'Spatial 3D BIM structural model showing spatial frame geometry, connection detailing, and shear wall integration submitted alongside standard 2D sets.',
    costRange: '₦350,000 – ₦850,000',
    prepDays: 10,
    mandatoryRule: 'Mandatory: Buildings beyond 3 floors (>3 floors) are mandated to submit 3D as well as 2D.',
    regulatoryBody: 'COREN / LASBCA Special Projects Vetting Unit',
    bottleneckWarning: 'Multi-storey files (>3 floors) are auto-queried on EPPES without 3D structural model upload.',
    hasIt: false,
    is3DMandate: true,
    isMultiStoreyMandate: true
  },
  {
    id: 'mechanical_3d',
    name: '3D Mechanical Drawings',
    category: 'drawings',
    icon: 'view_in_ar',
    badge: '>3 Floors Mandate',
    description: '3D isometric piping, HVAC duct routing, vertical riser coordination, and sanitary flow visualization.',
    costRange: '₦300,000 – ₦650,000',
    prepDays: 9,
    mandatoryRule: 'Mandatory: Buildings beyond 3 floors (>3 floors) are mandated to submit 3D as well as 2D.',
    regulatoryBody: 'COREN / Lagos State Ministry of Physical Planning',
    bottleneckWarning: 'Vertical service duct clearance cannot be certified by District M&E vetting team without 3D spatial models.',
    hasIt: false,
    is3DMandate: true,
    isMultiStoreyMandate: true
  },
  {
    id: 'electrical_3d',
    name: '3D Electrical Drawings',
    category: 'drawings',
    icon: 'view_in_ar',
    badge: '>3 Floors Mandate',
    description: '3D conduit coordination, vertical cable tray risers, high/low voltage switchgear room modeling, and lighting layout visualization.',
    costRange: '₦300,000 – ₦650,000',
    prepDays: 9,
    mandatoryRule: 'Mandatory: Buildings beyond 3 floors (>3 floors) are mandated to submit 3D as well as 2D.',
    regulatoryBody: 'COREN / Lagos State Ministry of Physical Planning',
    bottleneckWarning: 'EPPES upload portal will not permit submission finalization for >3 storey projects without 3D MEP files.',
    hasIt: false,
    is3DMandate: true,
    isMultiStoreyMandate: true
  },

  // 3. Technical Reports & Site Studies
  {
    id: 'subsoil_investigation',
    name: 'Sub-soil Investigation Report (Soil Test)',
    category: 'technical_reports',
    icon: 'science',
    badge: 'Terrain / Height Mandate',
    description: 'Geotechnical soil bearing capacity, compaction, and foundation design parameters approved by the LASBCA Materials Testing Laboratory.',
    costRange: '₦450,000 – ₦950,000',
    prepDays: 12,
    mandatoryRule: 'Mandatory for all buildings beyond 2 floors, commercial structures, Lekki/Island/coastal terrains, and high-density zones.',
    regulatoryBody: 'LASBCA Materials Testing Laboratory',
    bottleneckWarning: 'EPPES Foundation Module is gated behind a valid sub-soil investigation identifier for >2 floors or commercial structures.',
    hasIt: false
  },
  {
    id: 'pptr_report',
    name: 'Physical Planning Technical Report (PPTR / LUPAR)',
    category: 'technical_reports',
    icon: 'assignment',
    badge: 'Large Parcel / High-Rise',
    description: 'Technical report covering land use analysis, density, parking, setbacks, environmental impact and planning standards, stamped by TOPREC.',
    costRange: '₦450,000 – ₦1,200,000',
    prepDays: 15,
    mandatoryRule: 'Mandatory if the building is 8 units or 4 Floors (or >3 floors), commercial developments, schools, filling stations, and zoning changes.',
    regulatoryBody: 'TOPREC / LASPPPA HQ',
    bottleneckWarning: 'Files over 4 floors are forwarded to LASPPPA HQ Planning Board — PPTR is a hard submission gate there.',
    hasIt: false
  },
  {
    id: 'drainage_clearance',
    name: 'Drainage Clearance (PPTR Drainage Annex)',
    category: 'technical_reports',
    icon: 'water_drop',
    badge: 'Flood / 8+ Units',
    description: 'Drainage impact assessment approval from the Lagos State Ministry of Environment for canal-adjacent plots, flood-prone districts, or high-density developments.',
    costRange: '₦300,000 – ₦700,000',
    prepDays: 10,
    mandatoryRule: 'Mandatory if the building is 8 units or 4 Floors, canal-adjacent plots, or developments in flood-prone districts.',
    regulatoryBody: 'Lagos State Ministry of Environment / LASWMO',
    bottleneckWarning: 'Canal-buffer infringement is a top reason for demolition order issuance in Eti-Osa and Ikoyi districts.',
    hasIt: false
  },
  {
    id: 'transport_impact',
    name: 'Transport Impact Analysis (TIA) / Traffic Clearance',
    category: 'technical_reports',
    icon: 'traffic',
    badge: 'Commercial / High Density',
    description: 'Traffic generation study and mitigation plan approved by the Lagos State Ministry of Transportation for traffic-sensitive developments.',
    costRange: '₦500,000 – ₦1,500,000',
    prepDays: 14,
    mandatoryRule: 'Mandatory for commercial complexes, event centres, education/medical facilities, high-density estates, filling stations, and major arterial junctions.',
    regulatoryBody: 'Lagos State Ministry of Transportation / LASTMA',
    bottleneckWarning: 'Major arterial frontage without TIA is rejected outright by the Ministry of Transportation vetting unit.',
    hasIt: false
  },

  // 4. Insurance
  {
    id: 'contractors_insurance',
    name: 'Contractors All-Risk Insurance / Building Insurance Policy',
    category: 'insurance_legal',
    icon: 'verified_user',
    badge: '>2 Floors (LASBCA)',
    description: 'Statutory construction-phase insurance policy underwritten by a NAICOM-certified insurer covering all works, plant, and third-party liability.',
    costRange: 'Underwriting Premium (based on project valuation)',
    prepDays: 5,
    mandatoryRule: 'Contractors All-Risk Insurance required for developments above 2 floors (LASBCA Regulations).',
    regulatoryBody: 'NAICOM Certified Underwriter / LASBCA',
    bottleneckWarning: 'LASBCA site inspection will not clear foundation works without a valid contractors all-risk policy.',
    hasIt: false
  },

  // 5. Tax & Corporate
  {
    id: 'cac_incorporation',
    name: 'Certificate of Incorporation (CAC)',
    category: 'tax_corporate',
    icon: 'business',
    badge: 'Company Only',
    description: 'Current Certified True Copy of the company’s CAC registration, Form CAC 1.1 and 2.3, with updated status search.',
    costRange: 'Statutory CAC Filing',
    prepDays: 3,
    mandatoryRule: 'Mandatory for all corporate applicants, corporate property owners, and developer companies.',
    regulatoryBody: 'CAC / EPPES Portal',
    bottleneckWarning: 'Corporate applicant files are suspended until CAC document links on the EPPES applicant profile.',
    hasIt: false,
    isCorporateOnly: true
  },
  {
    id: 'individual_tcc',
    name: 'Current Tax Clearance of Individual (LIRS e-TCC)',
    category: 'tax_corporate',
    icon: 'receipt_long',
    badge: 'Individual Only',
    description: 'Valid LIRS e-TCC for the preceding year confirming the individual applicant’s personal income tax compliance.',
    costRange: 'Personal Income Tax Assessment',
    prepDays: 5,
    mandatoryRule: 'Mandatory for all individual applicant submissions on EPPES.',
    regulatoryBody: 'LIRS',
    bottleneckWarning: 'e-TCC is cross-validated on LIRS portal at upload — expired certificates instantly halt the application.',
    hasIt: false,
    isIndividualOnly: true
  },
  {
    id: 'company_tcc',
    name: 'Current Tax Clearance of the Company (Corporate TCC)',
    category: 'tax_corporate',
    icon: 'corporate_fare',
    badge: 'Company Only',
    description: 'Valid corporate tax clearance certificate issued by LIRS/FIRS confirming the company’s tax compliance status.',
    costRange: 'Corporate Income Tax Assessment',
    prepDays: 7,
    mandatoryRule: 'Mandatory for all corporate entity building permit applications in Lagos State.',
    regulatoryBody: 'LIRS / FIRS',
    bottleneckWarning: 'EPPES hard-blocks corporate submission without a current Corporate Tax Clearance Certificate.',
    hasIt: false,
    isCorporateOnly: true
  },
  {
    id: 'directors_tcc',
    name: 'Current Tax Clearance of 2 Directors',
    category: 'tax_corporate',
    icon: 'badge',
    badge: 'Company Only',
    description: 'LIRS tax clearance for at least two directors of the applicant company, confirming their personal tax compliance.',
    costRange: 'Director Personal Income Tax',
    prepDays: 6,
    mandatoryRule: 'Mandatory when applicant is a registered company or corporate developer.',
    regulatoryBody: 'LIRS',
    bottleneckWarning: 'Director TCC mismatch on LIRS search triggers a corporate vetting query.',
    hasIt: false,
    isCorporateOnly: true
  },
  {
    id: 'paye_returns',
    name: 'Current PAYE Returns of the Company',
    category: 'tax_corporate',
    icon: 'groups',
    badge: 'Company Only',
    description: 'Current verified PAYE (Pay As You Earn) remittance returns filed by the company with LIRS.',
    costRange: 'Payroll Statutory Remittance',
    prepDays: 4,
    mandatoryRule: 'Mandatory for all company applicants in Lagos State.',
    regulatoryBody: 'LIRS',
    bottleneckWarning: 'Unverified PAYE schedule is queried by LIRS compliance desk before final permit issuance.',
    hasIt: false,
    isCorporateOnly: true
  },

  // 6. Existing / Renovation / Regularization / Amnesty
  {
    id: 'stability_letter',
    name: 'Letter of Structural Stability / Structural Integrity (NDT)',
    category: 'existing_renovation',
    icon: 'fact_check',
    badge: 'Existing / NDT',
    description: 'Non-Destructive Testing (NDT) report by a COREN structural specialist confirming the existing building’s structural safety.',
    costRange: '₦450,000 – ₦1,250,000',
    prepDays: 14,
    mandatoryRule: 'Mandatory for existing buildings, under-construction, renovation, regularization, or amnesty.',
    regulatoryBody: 'LASBCA Materials Testing Lab & COREN Structural Specialist',
    bottleneckWarning: 'Amnesty/regularization files are rejected without an approved NDT structural stability report.',
    hasIt: false,
    isExistingBuildingOnly: true
  },
  {
    id: 'former_permit',
    name: 'Former Development Permit (Previous Approval)',
    category: 'existing_renovation',
    icon: 'history_edu',
    badge: 'Renovation',
    description: 'Copy of the previous development permit for renovation, extension, or modification of an approved building.',
    costRange: 'Archival Search / Retrieve',
    prepDays: 5,
    mandatoryRule: 'Mandatory for renovations, extensions, floor additions, or modifications of previously approved buildings.',
    regulatoryBody: 'LASPPPA Records & Archives Directorate',
    bottleneckWarning: 'Approval history cannot be built without the prior permit — renovation files stall in archival search.',
    hasIt: false,
    isExistingBuildingOnly: true
  },
  {
    id: 'land_use_charge',
    name: 'Land Use Charges (LUC) or Sworn Affidavit in Lieu',
    category: 'existing_renovation',
    icon: 'gavel',
    badge: 'Existing / Renovation',
    description: 'Current verified Lagos State Land Use Charge (LUC) payment receipt, or High Court Sworn Affidavit in lieu where billing assessment is pending.',
    costRange: 'State Land Use Charge Tariff',
    prepDays: 3,
    mandatoryRule: 'Mandatory for all existing properties undergoing renovation, extension, or amnesty regularization.',
    regulatoryBody: 'Lagos State Ministry of Finance / High Court of Lagos State',
    bottleneckWarning: 'Finance & land administration vetting desk holds approval issuance pending proof of LUC payment.',
    hasIt: false,
    isExistingBuildingOnly: true
  }
];

const LOCAL_BY_ID: Record<string, DocumentItem> = Object.fromEntries(
  ALL_SUPPORTING_DOCUMENTS.map((d) => [d.id, d])
);

const DISPLAY_FALLBACK: Record<
  string,
  Pick<
    DocumentItem,
    'icon' | 'badge' | 'description' | 'costRange' | 'prepDays' | 'mandatoryRule' | 'regulatoryBody' | 'bottleneckWarning'
  >
> = {
  architectural_drawings: {
    icon: 'draw',
    badge: 'ARCON',
    description: 'Complete architectural floor plans stamped and sealed by an ARCON-registered architect (5 sets).',
    costRange: '₦400,000+',
    prepDays: 12,
    mandatoryRule: 'Mandatory for all building permit lodgments on the Lagos EPPES portal.',
    regulatoryBody: 'ARCON Registered Architect / LASPPPA',
    bottleneckWarning: 'EPPES requires ARCON-signed floor plans before Stage 1 vetting can begin.',
  },
  title_document: {
    icon: 'verified_user',
    badge: 'Ownership',
    description: 'Verified documentary evidence of ownership — Certificate of Occupancy, Governor’s Consent, or registered Deed of Assignment.',
    costRange: 'Varies by title type',
    prepDays: 60,
    mandatoryRule: 'Evidence of valid ownership required for every permit application.',
    regulatoryBody: 'Lagos Lands Bureau / LASPPPA',
    bottleneckWarning: 'Applications cannot proceed without verified documentary title (C of O, Governor’s Consent, or registered Deed).',
  },
};

interface ChecklistDoc {
  id: string;
  name: string;
  category: RequirementCategory;
  icon: string;
  badge?: string;
  description: string;
  costRange: string;
  prepDays: number;
  mandatoryRule: string;
  regulatoryBody: string;
  bottleneckWarning: string;
  hasIt: boolean;
}

const CATALOG: ChecklistDoc[] = REQUIREMENTS.map((def) => {
  const local = LOCAL_BY_ID[def.id];
  const fallback = DISPLAY_FALLBACK[def.id];
  const meta = def.meta;
  return {
    id: def.id,
    name: def.name,
    category: def.category,
    icon: local?.icon ?? fallback?.icon ?? 'description',
    badge: local?.badge ?? fallback?.badge,
    description: local?.description ?? fallback?.description ?? 'Required supporting document for this project scope.',
    costRange: local?.costRange ?? fallback?.costRange ?? meta?.costRange ?? 'Varies',
    prepDays: local?.prepDays ?? fallback?.prepDays ?? meta?.prepDays ?? 10,
    mandatoryRule:
      local?.mandatoryRule ?? fallback?.mandatoryRule ?? meta?.mandatoryRule ?? 'Required per verified regulatory documentation.',
    regulatoryBody:
      local?.regulatoryBody ?? fallback?.regulatoryBody ?? meta?.regulatoryBody ?? 'LASPPPA',
    bottleneckWarning:
      local?.bottleneckWarning ??
      fallback?.bottleneckWarning ??
      'This document is a known vetting gate at district or HQ level.',
    hasIt: local?.hasIt ?? false,
  };
});

const BASE_READY_IDS = [
  'architectural_drawings',
  'structural_drawings',
  'mechanical_drawings',
  'electrical_drawings',
  'survey_plan',
];

interface PresetConfig {
  applicantType: ApplicantType;
  developmentType: DevelopmentType;
  projectScope: ProjectScope;
  floors: number;
  units: number;
  landAreaSqm: number;
  titleStatus: TitleStatus;
  siteConditions: SiteCondition[];
  seed: string[];
}

const PRESETS: Record<string, PresetConfig> = {
  standard_residential: {
    applicantType: 'individual',
    developmentType: 'residential',
    projectScope: 'new_construction',
    floors: 1,
    units: 1,
    landAreaSqm: 300,
    titleStatus: 'certificate_of_occupancy',
    siteConditions: [],
    seed: [...BASE_READY_IDS, 'individual_tcc'],
  },
  multi_storey: {
    applicantType: 'individual',
    developmentType: 'residential',
    projectScope: 'new_construction',
    floors: 5,
    units: 10,
    landAreaSqm: 800,
    titleStatus: 'certificate_of_occupancy',
    siteConditions: [],
    seed: [...BASE_READY_IDS, 'subsoil_investigation'],
  },
  commercial_high_density: {
    applicantType: 'corporate',
    developmentType: 'commercial',
    projectScope: 'new_construction',
    floors: 5,
    units: 10,
    landAreaSqm: 2000,
    titleStatus: 'certificate_of_occupancy',
    siteConditions: [],
    seed: [...BASE_READY_IDS, 'subsoil_investigation', 'cac_incorporation', 'company_tcc'],
  },
  existing_renovation: {
    applicantType: 'individual',
    developmentType: 'residential',
    projectScope: 'renovation',
    floors: 2,
    units: 1,
    landAreaSqm: 300,
    titleStatus: 'certificate_of_occupancy',
    siteConditions: [],
    seed: ['survey_plan', 'individual_tcc', 'former_permit', 'land_use_charge', 'stability_letter'],
  },
};

type FilterCategory = 'all' | 'drawings' | 'technical_reports' | 'tax_corporate' | 'insurance_legal' | 'existing_renovation';

const SITE_CONDITION_LABELS: Record<SiteCondition, string> = {
  coastal: 'Coastal',
  flood_prone: 'Flood-prone',
  canal_adjacent: 'Canal-adjacent',
  swampy: 'Swampy',
  water_adjacent: 'Water-adjacent',
  reclaimed: 'Reclaimed land',
};

const PROJECT_SCOPE_LABELS: Record<ProjectScope, string> = {
  new_construction: 'New Construction',
  renovation: 'Renovation',
  extension: 'Extension',
  change_of_use: 'Change of Use',
  regularization_amnesty: 'Regularization / Amnesty',
};

const DEVELOPMENT_TYPE_LABELS: Record<DevelopmentType, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
  institutional: 'Institutional',
  mixed_use: 'Mixed Use',
  specialized: 'Special Applications',
  agricultural: 'Agricultural',
  recreational: 'Recreational',
  religious: 'Religious',
  special_applications: 'Special Applications',
  transportation: 'Transportation',
};

const TITLE_STATUS_LABELS: Record<TitleStatus, string> = {
  certificate_of_occupancy: 'Certificate of Occupancy (C of O)',
  governors_consent: 'Governor’s Consent',
  deed_of_assignment: 'Registered Deed of Assignment',
  land_certificate: 'Land Certificate',
  gazette_excision: 'Gazette / Excision',
  letter_of_allocation: 'Letter of Allocation',
  receipt_survey_only: 'Receipt + Survey Plan Only',
  none: 'No title document',
  unknown: 'Not sure',
};

const BOTTLENECK_PRIORITY_IDS = [
  'survey_plan',
  'structural_drawings',
  'subsoil_investigation',
  'individual_tcc',
  'company_tcc',
  'stability_letter',
  'structural_3d',
];

export const DocumentChecklistCalculator: React.FC = () => {
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [applicantType, setApplicantType] = useState<ApplicantType>('individual');
  const [developmentType, setDevelopmentType] = useState<DevelopmentType>('residential');
  const [projectScope, setProjectScope] = useState<ProjectScope>('new_construction');
  const [floors, setFloors] = useState<number | undefined>(1);
  const [units, setUnits] = useState<number | undefined>(1);
  const [landAreaSqm, setLandAreaSqm] = useState<number | undefined>(300);
  const [titleStatus, setTitleStatus] = useState<TitleStatus>('certificate_of_occupancy');
  const [siteConditions, setSiteConditions] = useState<SiteCondition[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('standard_residential');

  const [hasDocs, setHasDocs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATALOG.map((d) => [d.id, d.hasIt]))
  );

  const markCustom = () => setSelectedPreset('custom');

  const toggleDocument = (id: string) => {
    setHasDocs((prev) => ({ ...prev, [id]: !prev[id] }));
    markCustom();
  };

  const toggleSiteCondition = (condition: SiteCondition) => {
    setSiteConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
    markCustom();
  };

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) {
      if (presetKey === 'all_ready') {
        setHasDocs(Object.fromEntries(CATALOG.map((d) => [d.id, true])));
        setSelectedPreset('all_ready');
      } else if (presetKey === 'all_needed') {
        setHasDocs(Object.fromEntries(CATALOG.map((d) => [d.id, false])));
        setSelectedPreset('all_needed');
      }
      return;
    }
    setApplicantType(preset.applicantType);
    setDevelopmentType(preset.developmentType);
    setProjectScope(preset.projectScope);
    setFloors(preset.floors);
    setUnits(preset.units);
    setLandAreaSqm(preset.landAreaSqm);
    setTitleStatus(preset.titleStatus);
    setSiteConditions(preset.siteConditions);
    setHasDocs(Object.fromEntries(CATALOG.map((d) => [d.id, preset.seed.includes(d.id)])));
    setSelectedPreset(presetKey);
  };

  const projectInput: ProjectInput = useMemo(
    () => ({
      applicantType,
      developmentType,
      projectScope,
      floors,
      units,
      landAreaSqm,
      titleStatus,
      siteConditions,
    }),
    [applicantType, developmentType, projectScope, floors, units, landAreaSqm, titleStatus, siteConditions]
  );

  const projectDocuments: ProjectDocuments = useMemo(
    () =>
      Object.fromEntries(
        CATALOG.map((d) => [d.id, (hasDocs[d.id] ? 'have' : 'missing') as DocumentAvailability])
      ),
    [hasDocs]
  );

  const assessment = useMemo(
    () => evaluateRules(projectInput, projectDocuments),
    [projectInput, projectDocuments]
  );

  const required = assessment.required;
  const unresolved = assessment.unknown;

  const docMetaById: Record<string, ChecklistDoc> = useMemo(
    () => Object.fromEntries(CATALOG.map((d) => [d.id, d])),
    []
  );

  const requiredDocs = useMemo(
    () =>
      required.map((req) => ({
        ...docMetaById[req.requirementId],
        id: req.requirementId,
        isRequired: true as const,
        isHave: req.availability === 'have',
      })),
    [required, docMetaById]
  );

  // Estimated turnaround + bottleneck modelling (UI layer heuristics only,
  // informed by the deterministic engine output).
  const stats = useMemo(() => {
    const totalDocs = required.length;
    const readyDocs = required.filter((r) => r.availability === 'have');
    const missingDocs = required.filter((r) => r.availability !== 'have');
    const readinessPercent =
      assessment.readinessScore === null
        ? 0
        : assessment.readinessScore;

    const highRise = (floors ?? 0) >= 4 || (units ?? 0) >= 8;
    const BASE_DAYS_MIN = highRise ? 30 : 25;
    const BASE_DAYS_MAX = highRise ? 45 : 35;

    const maxMissingPrepDays =
      missingDocs.length > 0
        ? Math.max(
            ...missingDocs.map((d) => docMetaById[d.requirementId]?.prepDays ?? 10)
          )
        : 0;
    const additionalBuffer = Math.ceil(missingDocs.length * 2.2);
    const totalExtraDays = maxMissingPrepDays + additionalBuffer;

    const estimatedDaysMin = BASE_DAYS_MIN + totalExtraDays;
    const estimatedDaysMax = BASE_DAYS_MAX + totalExtraDays + Math.round(missingDocs.length * 1.5);

    const maxPossibleDays = highRise ? 95 : 80;
    const daysSaved = Math.max(0, maxPossibleDays - estimatedDaysMax);

    const topBottleneck = missingDocs.find((d) =>
      BOTTLENECK_PRIORITY_IDS.includes(d.requirementId)
    );

    return {
      totalDocs,
      readyCount: readyDocs.length,
      missingCount: missingDocs.length,
      readinessPercentage: readinessPercent,
      estimatedDaysMin,
      estimatedDaysMax,
      daysSaved,
      missingDocs,
      topBottleneck,
      isFastTrack: readinessPercent >= 80,
    };
  }, [required, assessment.readinessScore, floors, units, docMetaById]);

  const visibleFilteredDocuments = useMemo(() => {
    if (selectedFilter === 'all') return requiredDocs;
    return requiredDocs.filter((d) => d.category === selectedFilter);
  }, [requiredDocs, selectedFilter]);

  const handleTransferToRoadmap = () => {
    const readyDocNames = required.filter((r) => r.availability === 'have').map((r) => r.name);
    const neededDocNames = required.filter((r) => r.availability !== 'have').map((r) => r.name);

    try {
      localStorage.setItem(
        'permitHub_documentChecklist',
        JSON.stringify({
          readyDocs: readyDocNames,
          neededDocs: neededDocNames,
          readinessScore: assessment.readinessScore,
          applicantType,
          developmentType,
          projectScope,
          floors,
          units,
          landAreaSqm,
          titleStatus,
          siteConditions,
          estimatedDays: `${stats.estimatedDaysMin} – ${stats.estimatedDaysMax} working days`,
          recommendedAction: assessment.recommendedAction,
        })
      );
    } catch {
      // fallback
    }

    navigate('/onboarding');
  };

  const whatsappMessage = `I used your Checklist Simulator (Readiness: ${
    assessment.readinessScore === null ? '—' : `${assessment.readinessScore}%`
  } with ${stats.missingCount} pending documents) and would like an official quote to procure missing documents.`;

  const show3DNote = required.some(
    (r) =>
      r.ruleId === 'RUL_3D_STRUCT' || r.ruleId === 'RUL_3D_MECH' || r.ruleId === 'RUL_3D_ELEC'
  );

  const showRenovationNote = ['renovation', 'regularization_amnesty', 'extension'].includes(
    projectScope
  );

  return (
    <section className="mt-14 mb-24">
      {/* Header Container */}
      <div className="bg-white dark:bg-[#161F30] rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
        
        {/* Top Banner */}
        <div className="p-8 sm:p-12 border-b border-gray-100 dark:border-gray-800/80 bg-gradient-to-br from-gray-50 via-white to-teal-50/25 dark:from-[#131B2A] dark:via-[#161F30] dark:to-[#0F2228]">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/40 border border-teal-200 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                Official Lagos EPPES Supporting Documents Standard
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Mandatory Supporting Documents Checklist & Timeline Simulator
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-3 text-base sm:text-lg leading-relaxed">
                Configure your project scope below (applicant, scope, floors, units, land area, title) to evaluate required signed/sealed drawings, 3D mandates, tax clearances, and special technical reports.
              </p>
            </div>

            {/* Presets Menu */}
            <div className="flex flex-col gap-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Quick Presets:</span>
              <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/90 dark:bg-gray-800/90 p-2 rounded-2xl border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => applyPreset('standard_residential')}
                  aria-pressed={selectedPreset === 'standard_residential'}
                  className={`text-xs px-3 py-2.5 min-h-11 rounded-xl font-medium transition-all ${
                    selectedPreset === 'standard_residential'
                      ? 'bg-primary text-white shadow-sm font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  1–3 Floors
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('multi_storey')}
                  aria-pressed={selectedPreset === 'multi_storey'}
                  className={`text-xs px-3 py-2.5 min-h-11 rounded-xl font-medium transition-all ${
                    selectedPreset === 'multi_storey'
                      ? 'bg-primary text-white shadow-sm font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  &gt;3 Floors (3D + PPTR)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('commercial_high_density')}
                  aria-pressed={selectedPreset === 'commercial_high_density'}
                  className={`text-xs px-3 py-2.5 min-h-11 rounded-xl font-medium transition-all ${
                    selectedPreset === 'commercial_high_density'
                      ? 'bg-primary text-white shadow-sm font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  Corporate &amp; Commercial
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('existing_renovation')}
                  aria-pressed={selectedPreset === 'existing_renovation'}
                  className={`text-xs px-3 py-2.5 min-h-11 rounded-xl font-medium transition-all ${
                    selectedPreset === 'existing_renovation'
                      ? 'bg-primary text-white shadow-sm font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  Renovation / NDT
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('all_ready')}
                  className={`text-xs px-3 py-2.5 min-h-11 rounded-xl font-medium transition-all ${
                    selectedPreset === 'all_ready'
                      ? 'bg-emerald-700 text-white shadow-sm font-bold'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  All Ready
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('all_needed')}
                  className={`text-xs px-3 py-2.5 min-h-11 rounded-xl font-medium transition-all ${
                    selectedPreset === 'all_needed'
                      ? 'bg-red-600 text-white shadow-sm font-bold'
                      : 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                  }`}
                >
                  All Needed
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Project Parameter Configurator Bar */}
          <div className="mt-8 pt-6 border-t border-gray-200/80 dark:border-gray-700/80 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Applicant Type Selection */}
            <div className="bg-white dark:bg-[#1A2436] p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Applicant Category</span>
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                  {applicantType === 'individual' ? 'Individual Landowner (e-TCC)' : 'Company / Corporate (CAC, 2 Directors, PAYE)'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => { setApplicantType('individual'); markCustom(); }}
                  className={`px-3 py-2.5 min-h-11 rounded-lg text-xs font-bold transition-all ${
                    applicantType === 'individual'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => { setApplicantType('corporate'); markCustom(); }}
                  className={`px-3 py-2.5 min-h-11 rounded-lg text-xs font-bold transition-all ${
                    applicantType === 'corporate'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  Company / Corporate
                </button>
              </div>
            </div>

            {/* Project Scope & Development Type */}
            <div className="bg-white dark:bg-[#1A2436] p-4 rounded-2xl border border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1.5">Work Type</span>
                <select
                  value={projectScope}
                  onChange={(e) => {
                    setProjectScope(e.target.value as ProjectScope);
                    markCustom();
                  }}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 min-h-11 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {(Object.keys(PROJECT_SCOPE_LABELS) as ProjectScope[]).map((key) => (
                    <option key={key} value={key}>{PROJECT_SCOPE_LABELS[key]}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1.5">Development Type</span>
                <select
                  value={developmentType}
                  onChange={(e) => {
                    setDevelopmentType(e.target.value as DevelopmentType);
                    markCustom();
                  }}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 min-h-11 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {(Object.keys(DEVELOPMENT_TYPE_LABELS) as DevelopmentType[]).map((key) => (
                    <option key={key} value={key}>{DEVELOPMENT_TYPE_LABELS[key]}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Numeric Dimensions & Title Status */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="block bg-white dark:bg-[#1A2436] p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1.5">Floors</span>
              <input
                type="number"
                min={1}
                value={floors ?? ''}
                onChange={(e) => {
                  setFloors(e.target.value === '' ? undefined : Number(e.target.value));
                  markCustom();
                }}
                placeholder="e.g. 3"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 min-h-11 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="block bg-white dark:bg-[#1A2436] p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1.5">Units</span>
              <input
                type="number"
                min={1}
                value={units ?? ''}
                onChange={(e) => {
                  setUnits(e.target.value === '' ? undefined : Number(e.target.value));
                  markCustom();
                }}
                placeholder="e.g. 4"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 min-h-11 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="block bg-white dark:bg-[#1A2436] p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1.5">Land Area (sqm)</span>
              <input
                type="number"
                min={1}
                value={landAreaSqm ?? ''}
                onChange={(e) => {
                  setLandAreaSqm(e.target.value === '' ? undefined : Number(e.target.value));
                  markCustom();
                }}
                placeholder="e.g. 500"
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 min-h-11 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <label className="block bg-white dark:bg-[#1A2436] p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1.5">Title Status</span>
              <select
                value={titleStatus}
                onChange={(e) => {
                  setTitleStatus(e.target.value as TitleStatus);
                  markCustom();
                }}
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 min-h-11 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                {(Object.keys(TITLE_STATUS_LABELS) as TitleStatus[]).map((key) => (
                  <option key={key} value={key}>{TITLE_STATUS_LABELS[key]}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Site Conditions */}
          <div className="mt-4 bg-white dark:bg-[#1A2436] p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Site Conditions <span className="text-gray-500 dark:text-gray-400 font-medium normal-case">(optional — affects soil, drainage &amp; coastal rules)</span>
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {(Object.keys(SITE_CONDITION_LABELS) as SiteCondition[]).map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => toggleSiteCondition(condition)}
                  aria-pressed={siteConditions.includes(condition)}
                  className={`px-3 py-2.5 min-h-11 rounded-xl text-xs font-bold transition-all border ${
                    siteConditions.includes(condition)
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  {SITE_CONDITION_LABELS[condition]}
                </button>
              ))}
              <span className="text-[11px] text-gray-500 dark:text-gray-400">Leaving a numeric field blank means "unknown" — we flag it for consultant confirmation instead of guessing.</span>
            </div>
          </div>
        </div>

        {/* Regulatory Trigger Callouts (engine-driven) */}
        {show3DNote && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-8 py-3.5 flex items-center gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
            <span aria-hidden="true" className="material-icons-outlined text-amber-700 text-lg shrink-0">notification_important</span>
            <span>
              <strong>Lagos State Mandatory Rule for &gt;3 Floors:</strong> For buildings exceeding 3 floors, applicants are mandated to upload <strong>3D Structural, 3D Mechanical, and 3D Electrical drawings</strong> in addition to 2D drawings.
            </span>
          </div>
        )}

        {showRenovationNote && (
          <div className="bg-blue-500/10 border-b border-blue-500/20 px-8 py-3.5 flex items-center gap-3 text-xs sm:text-sm text-blue-900 dark:text-blue-300">
            <span aria-hidden="true" className="material-icons-outlined text-blue-600 text-lg shrink-0">fact_check</span>
            <span>
              <strong>Existing / Renovation / Amnesty Requirements:</strong> Requires a <strong>Letter of Structural Stability / Integrity Report</strong> (NDT testing), <strong>Former Development Permit copy</strong>, and current <strong>Land Use Charge receipt (or Sworn Affidavit in lieu)</strong>.
            </span>
          </div>
        )}

        {assessment.warnings.length > 0 && (
          <div className="bg-red-500/5 border-b border-red-500/20 px-8 py-3.5 flex flex-col gap-1.5 text-xs sm:text-sm text-red-800 dark:text-red-300">
            {assessment.warnings.map((w) => (
              <span className="flex items-start gap-2" key={w}>
                <span aria-hidden="true" className="material-icons-outlined text-red-600 text-lg shrink-0">warning</span>
                <span>{w}</span>
              </span>
            ))}
          </div>
        )}

        {/* Live Timeline & Impact Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
          
          {/* Card 1: Estimated Turnaround */}
          <div className="bg-white dark:bg-[#161F30] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                <span>Total Est. Turnaround</span>
                <span aria-hidden="true" className="material-icons-outlined text-primary text-base">schedule</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {stats.estimatedDaysMin} – {stats.estimatedDaysMax}{' '}
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">working days</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-2 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${stats.isFastTrack ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {stats.isFastTrack ? 'Fast-Track EPPES Eligibility Active' : `+${stats.missingCount * 5} days document procurement delay`}
              </span>
            </div>
          </div>

          {/* Card 2: Readiness Score */}
          <div className="bg-white dark:bg-[#161F30] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                <span>Document Readiness</span>
                <span aria-hidden="true" className="material-icons-outlined text-teal-700 text-base">verified</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1" aria-live="polite">
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400">
                  {assessment.readinessScore === null ? '—' : `${assessment.readinessScore}%`}
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  ({stats.readyCount} of {stats.totalDocs} In Hand)
                </span>
              </div>
              <p className="text-[11px] leading-snug text-gray-500 dark:text-gray-400 mt-2">
                {assessment.scoringExplanation}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60">
              <div className="w-full bg-gray-100 dark:bg-gray-700/60 h-2.5 rounded-full overflow-hidden" role="progressbar" aria-label="Document readiness" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.readinessPercentage}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    stats.readinessPercentage >= 75
                      ? 'bg-emerald-500'
                      : stats.readinessPercentage >= 45
                      ? 'bg-primary'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${stats.readinessPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 3: Days Saved by Pre-Vetting */}
          <div className="bg-white dark:bg-[#161F30] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                <span>Time Saved</span>
                <span aria-hidden="true" className="material-icons-outlined text-emerald-700 text-base">trending_down</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                ~{stats.daysSaved}{' '}
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">days saved</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 text-xs text-gray-500 dark:text-gray-400">
              Eliminates District query loops &amp; Alausa upload rejections.
            </div>
          </div>

          {/* Card 4: Primary Bottleneck */}
          <div className="bg-white dark:bg-[#161F30] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                <span>Critical Path Item</span>
                <span aria-hidden="true" className="material-icons-outlined text-amber-700 text-base">warning_amber</span>
              </div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-1 line-clamp-2 leading-tight">
                {stats.topBottleneck
                  ? docMetaById[stats.topBottleneck.requirementId]?.name ?? stats.topBottleneck.name
                  : 'All critical prerequisites ready'}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 text-xs font-medium text-amber-700 dark:text-amber-400">
              {stats.topBottleneck
                ? `Requires ~${docMetaById[stats.topBottleneck.requirementId]?.prepDays ?? 10} days lead time`
                : 'Ready for direct EPPES submission'}
            </div>
          </div>
        </div>

        {/* Consultant Questions & Unknowns Panel */}
        {(unresolved.length > 0 || assessment.consultantQuestions.length > 0) && (
          <div className="p-6 sm:px-10 border-b border-gray-200 dark:border-gray-800 bg-amber-50/50 dark:bg-[#1A180F]">
            <div className="flex items-start gap-2.5">
              <span aria-hidden="true" className="material-icons-outlined text-amber-700 text-lg mt-0.5 shrink-0">help_outline</span>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  We need to confirm {unresolved.length + assessment.consultantQuestions.length} item{unresolved.length + assessment.consultantQuestions.length === 1 ? '' : 's'} with a consultant
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  The simulator never guesses. These points are deferred to human review before lodging.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {unresolved.map((u) => (
                <li key={u.requirementId} className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-300">
                  <span aria-hidden="true" className="material-icons-outlined text-amber-700 text-sm mt-0.5 shrink-0">rule</span>
                  <span><strong>{u.name}</strong> — {u.rationale}</span>
                </li>
              ))}
              {assessment.consultantQuestions.map((q, i) => (
                <li key={`${q.ruleId ?? 'question'}-${i}`} className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-300">
                  <span aria-hidden="true" className="material-icons-outlined text-amber-700 text-sm mt-0.5 shrink-0">
                    {q.category === 'clearance' ? 'policy' : 'quiz'}
                  </span>
                  <span>{q.question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Filter Tabs Navigation */}
        <div className="p-6 sm:px-10 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#131B2A]/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar" role="group" aria-label="Filter documents by category">
            {(
              [
                { key: 'all', label: 'All Supporting Docs' },
                { key: 'drawings', label: 'Drawings & 3D Models' },
                { key: 'technical_reports', label: 'Soil, PPTR & Traffic' },
                { key: 'tax_corporate', label: 'Tax & Corporate' },
                { key: 'insurance_legal', label: 'Survey & Insurance' },
                { key: 'existing_renovation', label: 'Existing & Renovation' }
              ] as { key: FilterCategory; label: string }[]
            ).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                aria-pressed={selectedFilter === tab.key}
                className={`whitespace-nowrap px-3.5 py-2.5 min-h-11 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ready with Applicant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></span> Needs Preparation
            </span>
          </div>
        </div>

        {/* Interactive Document Checklist Grid (engine-required documents only) */}
        <div className="p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {visibleFilteredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => toggleDocument(doc.id)}
                role="button"
                aria-pressed={doc.isHave}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleDocument(doc.id);
                  }
                }}
                className={`cursor-pointer rounded-2xl p-6 border transition-all select-none text-left relative flex flex-col justify-between ${
                  doc.isHave
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                    : 'bg-white dark:bg-[#1A2436] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          doc.isHave
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <span aria-hidden="true" className="material-icons-outlined text-xl">{doc.icon}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                            {doc.name}
                          </h3>
                          {doc.badge && (
                            <span
                              className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                doc.id.includes('_3d')
                                  ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : doc.category === 'tax_corporate'
                                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                  : doc.category === 'existing_renovation'
                                  ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              {doc.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <div
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                        doc.isHave ? 'bg-emerald-700' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          doc.isHave ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Market Rate & Lead Time */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 font-medium">Standard Cost Baseline: </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{doc.costRange}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Lead Time if Missing: </span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400">+{doc.prepDays} working days</span>
                    </div>
                  </div>

                  {/* Mandatory Rule Requirement */}
                  <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                    <span aria-hidden="true" className="material-icons-outlined text-xs text-primary shrink-0 mt-0.5">verified_user</span>
                    <span>
                      <strong className="text-gray-900 dark:text-white">Statutory Rule: </strong>
                      {doc.mandatoryRule} ({doc.regulatoryBody})
                    </span>
                  </div>
                </div>

                {/* Vetting Bottleneck Warning if missing */}
                {!doc.isHave && (
                  <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <span aria-hidden="true" className="material-icons-outlined text-xs text-amber-700 shrink-0 mt-0.5">warning</span>
                    <span>
                      <strong>Vetting Risk: </strong>
                      {doc.bottleneckWarning}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {visibleFilteredDocuments.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
              No required documents in this category for the selected scope.
            </div>
          )}
        </div>

        {/* Detailed Statutory Guidelines & EPPES Notes Section */}
        <div className="p-8 sm:p-10 bg-gray-50/70 dark:bg-[#131B2A] border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Box 1: Core Drawings & Stamps */}
            <div className="bg-white dark:bg-[#1A2436] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm mb-2">
                <span aria-hidden="true" className="material-icons-outlined text-primary text-lg">draw</span>
                Professional Seals &amp; Signatures
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                All Architectural drawings must bear the live <strong>ARCON seal</strong>. Structural, Mechanical, and Electrical drawings must carry <strong>COREN stamps, engineer signatures, and calculation sheets</strong>.
              </p>
            </div>

            {/* Box 2: Multi-Storey >3 Floors Rule */}
            <div className="bg-white dark:bg-[#1A2436] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm mb-2">
                <span aria-hidden="true" className="material-icons-outlined text-purple-600 text-lg">view_in_ar</span>
                &gt;3 Floors 3D Submission Mandate
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Buildings exceeding 3 floors must submit <strong>3D Structural, 3D Mechanical, and 3D Electrical drawings</strong> alongside standard 2D drawings. Developments with ≥8 units or ≥4 floors require a <strong>TOPREC PPTR and Drainage Clearance</strong>.
              </p>
            </div>

            {/* Box 3: Existing / Renovation / Tax */}
            <div className="bg-white dark:bg-[#1A2436] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm mb-2">
                <span aria-hidden="true" className="material-icons-outlined text-amber-700 text-lg">receipt_long</span>
                Tax &amp; Existing Buildings Protocol
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Companies must provide <strong>Company TCC, 2 Directors TCC, and PAYE returns</strong>. Existing or renovation projects mandate an <strong>NDT Structural Stability Letter</strong> and <strong>Land Use Charge receipt / Affidavit</strong>.
              </p>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="mb-6 flex items-start gap-2.5 bg-teal-50/70 dark:bg-teal-950/30 p-4 rounded-2xl border border-teal-200 dark:border-teal-900/50">
            <span aria-hidden="true" className="material-icons-outlined text-teal-700 dark:text-teal-300 text-lg mt-0.5 shrink-0">flag</span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 block mb-1">Recommended Next Step</span>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{assessment.recommendedAction}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
              Need assistance producing registered 2D/3D drawings, geotechnical reports, or tax alignment? Our team facilitates end-to-end lodgment.
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href={getWhatsAppQuoteLink(undefined, undefined, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all"
              >
                <svg aria-hidden="true" focusable="false" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.781 2.796.781 3.182 0 5.768-2.587 5.768-5.766.001-3.187-2.575-5.767-5.768-5.767zm9.969 5.766c0 5.405-4.394 9.799-9.799 9.799-1.688 0-3.277-.432-4.665-1.189l-5.536 1.452 1.48-5.394c-.827-1.439-1.279-3.097-1.279-4.868 0-5.405 4.395-9.799 9.799-9.799 5.405 0 10 4.394 10 9.799z"/>
                </svg>
                <span>Get Quote on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={handleTransferToRoadmap}
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Transfer to Permit Roadmap</span>
                <span aria-hidden="true" className="material-icons-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};