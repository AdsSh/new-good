/**
 * Regulatory knowledge base source registry.
 *
 * Every rule and requirement in the engine traces back to at least one
 * source defined here. The registry is the single place that maps a
 * source ID to a human-readable reference.
 *
 * IMPORTANT: No requirement may be *invented*. Anything added here must
 * be traceable to one of the verified reference documents.
 */

export type SourceId =
  | 'SRC-REG-LASPPPA-2019'
  | 'SRC-REG-LASBCA-2019'
  | 'SRC-LAW-2010'
  | 'SRC-EPP-CHECKLIST-2024'
  | 'SRC-FAQ-DOCX'
  | 'SRC-LIRS'
  | 'SRC-EPP-FORM-2024';

export interface SourceRef {
  id: SourceId;
  /** Short display name. */
  name: string;
  /** Full reference / provenance. */
  reference: string;
  /** Verification status per source document. */
  verified: boolean;
}

export const SOURCES: Record<SourceId, SourceRef> = {
  'SRC-REG-LASPPPA-2019': {
    id: 'SRC-REG-LASPPPA-2019',
    name: 'LASPPPA Regulations (2019)',
    reference:
      'Lagos State Physical Planning Permit Authority permit regulations. Source: master-requirements CSV rows RUL-DEMO-001/002 and DOC-* rows tagged SRC-REG-LASPPPA-2019.',
    verified: true,
  },
  'SRC-REG-LASBCA-2019': {
    id: 'SRC-REG-LASBCA-2019',
    name: 'LASBCA Regulations (2019)',
    reference:
      'Lagos State Building Control Agency regulations. Source: master-requirements CSV row RUL-DEMO-006 (Contractors All-Risk Insurance > 2 floors) and DOC-53/54/55 rows.',
    verified: true,
  },
  'SRC-LAW-2010': {
    id: 'SRC-LAW-2010',
    name: 'Lagos State Urban & Regional Planning Law (2010)',
    reference:
      'Certificate of Occupancy (DOC-23) and Governor’s Consent (DOC-24) requirements. Source: master-requirements CSV rows tagged SRC-LAW-2010.',
    verified: true,
  },
  'SRC-EPP-CHECKLIST-2024': {
    id: 'SRC-EPP-CHECKLIST-2024',
    name: 'EPPES Supporting Documents Checklist (2024)',
    reference:
      'Official Lagos EPPES supporting documents list: M&E drawings signed/sealed/dated, 3D Structural/Mechanical/Electrical for buildings > 3 floors, sub-soil investigation, TIA, drainage clearance, insurance, CAC, PPTR. Source: EPPES portal transcription (DeepSeek file) + screencapture PDFs.',
    verified: true,
  },
  'SRC-FAQ-DOCX': {
    id: 'SRC-FAQ-DOCX',
    name: 'LASPPPA FAQ / Knowledge Docs',
    reference:
      'Clearance letters list (MOT, MoE Drainage, Fire, Police, NUPRC, FAAN/NCAA, MEMR, urban renewal, private estates), as-built regularization technical audits (RUL-DEMO-010), land use charge / sworn affidavit. Source: master-requirements CSV CLR-* and RUL-DEMO-010 rows + DeepSeek transcription.',
    verified: true,
  },
  'SRC-LIRS': {
    id: 'SRC-LIRS',
    name: 'Lagos State Internal Revenue Service (LIRS)',
    reference:
      'Current tax clearance (e-TCC) requirement for individuals and corporate entities; 2 directors TCC; PAYE returns. Source: EPPES supporting documents list (tax clearance section).',
    verified: true,
  },
  'SRC-EPP-FORM-2024': {
    id: 'SRC-EPP-FORM-2024',
    name: 'EPPES Application Form (2024)',
    reference:
      'Vital Information / Details of Subject Site fields: development use, building type, title owner class, title document, plot size, units, consultant professional registration (ARCON/COREN). Source: DeepSeek transcription of EPPES Application Form.',
    verified: true,
  },
};