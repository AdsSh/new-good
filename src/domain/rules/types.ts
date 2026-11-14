/**
 * PermitFlow Regulatory Rules Engine — types
 *
 * These types define the contract between the deterministic rules engine
 * and any consumer (UI components, tests, future API).
 */

/** Applicant / title-owner category. */
export type ApplicantType = 'individual' | 'corporate';

/**
 * Development use type. Coarse-grained, aligned with EPPES intake fields.
 * `specialized` is retained as a legacy value only — new onboarding offers
 * `special_applications` instead.
 */
export type DevelopmentType =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'institutional'
  | 'mixed_use'
  | 'specialized'
  | 'agricultural'
  | 'recreational'
  | 'religious'
  | 'special_applications'
  | 'transportation';

/**
 * What kind of work is being done on the property.
 */
export type ProjectScope =
  | 'new_construction'
  | 'renovation'
  | 'regularization_amnesty'
  | 'extension'
  | 'change_of_use';

/**
 * Title / ownership status. Mirrors the Onboarding `TITLE_DOCUMENTS` list
 * plus explicit `none` and `unknown` states. `unknown` is distinct from
 * `none` so the engine can ask a human instead of assuming.
 */
export type TitleStatus =
  | 'certificate_of_occupancy'
  | 'governors_consent'
  | 'deed_of_assignment'
  | 'land_certificate'
  | 'gazette_excision'
  | 'letter_of_allocation'
  | 'receipt_survey_only'
  | 'none'
  | 'unknown';

/** Physical / site condition attributes that change applicable requirements. */
export type SiteCondition =
  | 'coastal'       // Lekki / Island / shoreline
  | 'flood_prone'   // flood plain
  | 'canal_adjacent'
  | 'swampy'
  | 'water_adjacent' // near a water body (lagoon, river)
  | 'reclaimed';

/**
 * Structured project information accepted by the engine.
 *
 * All fields are optional. A missing field is treated as UNKNOWN —
 * never assumed. The engine uses `unknown` to ask for human review
 * rather than guessing.
 */
export interface ProjectInput {
  applicantType: ApplicantType;
  developmentType: DevelopmentType;
  projectScope: ProjectScope;
  /** Lagos LGA (one of the 20). Optional; used for terrain assumptions. */
  lga?: string;
  /** Land area in square metres. Drives large-parcel rules. */
  landAreaSqm?: number;
  /** Max number of floors in the proposed development. */
  floors?: number;
  /** Number of dwelling / business units. */
  units?: number;
  /** Title / ownership status. */
  titleStatus?: TitleStatus;
  /** Physical site conditions. Empty/omitted means "not declared". */
  siteConditions?: SiteCondition[];
  /** True if the property is in a government acquisition / urban renewal zone. */
  inUrbanRenewalZone?: boolean;
}

/**
 * Availability of a document.
 *
 * - `have`      → user confirmed they possess it
 * - `missing`   → user confirmed they do NOT possess it
 * - `unknown`   → user is not sure (distinct from "not required")
 */
export type DocumentAvailability = 'have' | 'missing' | 'unknown';

/** Maps a requirement ID to its availability for a given project. */
export interface ProjectDocuments {
  [requirementId: string]: DocumentAvailability;
}

/**
 * Result of one rule evaluation.
 */
export interface RuleOutcome {
  /** Stable, explicit rule ID (e.g. RUL_PPTR_FLOOR_COUNT). */
  ruleId: string;
  /** Human-readable title. */
  title: string;
  /**
   * - `applicable`   → the requirement is triggered for this project
   * - `not_applicable` → the requirement does NOT apply
   * - `unknown`      → cannot decide from the available input (human review)
   */
  state: 'applicable' | 'not_applicable' | 'unknown';
  /** Plain-language explanation of WHY this outcome was reached. */
  rationale: string;
  /** Source IDs this rule traces back to. */
  sources: string[];
}

/**
 * A checklist requirement surfaced by the engine for a specific project.
 */
export interface AssessedRequirement {
  /** Matching DocumentItem id in the checklist / knowledge base. */
  requirementId: string;
  /** Display name. */
  name: string;
  /** Front-end grouping key (matches checklist categories). */
  category: 'drawings' | 'technical_reports' | 'tax_corporate' | 'insurance_legal' | 'existing_renovation';
  /** Rule that drove this requirement. */
  ruleId: string;
  /**
   * Classification used by the readiness assessment:
   * - `required`   → mandatory for this project (rule = applicable)
   * - `conditional`→ only required under conditions the engine cannot fully
   *                  verify from input; flagged for human review
   * - `unknown`    → engine could not determine applicability
   */
  classification: 'required' | 'conditional' | 'unknown';
  /** For required/conditional: does the user have the document? */
  availability?: DocumentAvailability;
  /** Why it applies (or why it is conditional / unknown). */
  rationale: string;
  /** Source IDs. */
  sources: string[];
  /** Cost / lead-time metadata if known (from checklist KB). */
  meta?: {
    costRange?: string;
    prepDays?: number;
    mandatoryRule?: string;
    regulatoryBody?: string;
  };
}

/**
 * A question the engine cannot resolve from input and defers to a human
 * consultant (not invented — explicitly requested follow-up).
 */
export interface ConsultantQuestion {
  category: 'document' | 'input' | 'clearance';
  question: string;
  /** Why the engine is asking. */
  reason: string;
  /** Related rule ID. */
  ruleId?: string;
}

/**
 * Full deterministic assessment produced by the engine.
 * Every field is derivable from the input plus the knowledge base.
 */
export interface ReadinessAssessment {
  /** Deterministic percentage (0-100). Null only when nothing is applicable. */
  readinessScore: number | null;
  /** Requirements classified as REQUIRED for this project. */
  required: AssessedRequirement[];
  /** Requirements classified as CONDITIONAL. */
  conditional: AssessedRequirement[];
  /** Requirements the engine could not classify. */
  unknown: AssessedRequirement[];
  /** Complete list of outcomes from every rule that ran. */
  ruleOutcomes: RuleOutcome[];
  /** Meeting/non-meeting requirements mapped to readiness score. */
  completedCount: number;
  missingCount: number;
  conditionalCount: number;
  unknownCount: number;
  /** Questions deferred to a human consultant. */
  consultantQuestions: ConsultantQuestion[];
  /** Warnings surfaced during evaluation. */
  warnings: string[];
  /**
   * Human-readable explanation of how the score was computed.
   * Guaranteed deterministic and independent of any AI.
   */
  scoringExplanation: string;
  /** Deterministic recommendation. */
  recommendedAction: string;
}