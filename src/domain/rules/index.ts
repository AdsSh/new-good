/**
 * PermitFlow Regulatory Rules Engine — public entry point.
 *
 * Import from here to get the deterministic rules engine and knowledge base.
 * See docs/RULE_ENGINE.md for architecture and the rule↔source trace table.
 */

export { evaluateRules, REQUIREMENT_COUNT } from './engine';
export { computeReadinessScore } from './scoring';
export { RULES, RULE_BY_ID } from './rules';
export type { RuleDef, RuleResult, RuleState } from './rules';
export { REQUIREMENTS, REQUIREMENT_BY_ID, CLEARANCE_LETTERS } from './knowledge-base';
export type { RequirementCategory, RequirementDef, RequirementMeta } from './knowledge-base';
export { SOURCES } from './sources';
export type { SourceId, SourceRef } from './sources';
export type {
  ApplicantType,
  AssessedRequirement,
  ConsultantQuestion,
  DevelopmentType,
  DocumentAvailability,
  ProjectDocuments,
  ProjectInput,
  ProjectScope,
  ReadinessAssessment,
  RuleOutcome,
  SiteCondition,
  TitleStatus,
} from './types';