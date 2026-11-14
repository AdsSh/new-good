
import type {
  ApplicantType,
  DevelopmentType,
  DocumentAvailability,
  ProjectScope,
  SiteCondition,
  TitleStatus,
} from './src/domain/rules';

export enum ProjectType {
  RESIDENTIAL_NEW = 'residential-new',
  COMMERCIAL = 'commercial',
  RENOVATION = 'renovation',
  REGULARIZATION = 'regularization' // Changed from CONSULTATION to match typical Lagos flow
}

export enum ProjectStatus {
  DOCUMENTS_RECEIVED = 'Documents Received',
  UNDER_REVIEW = 'District Office Review',
  SUBMITTED = 'Submitted to Alausa',
  AUTHORITY_FEEDBACK = 'Assessment Issued',
  APPROVED = 'Permit Collected'
}

export interface OnboardingData {
  propertyType: string;
  projectScope: string;
  cOfOStatus: string;
  timeline: string;
  address: string;
  lga: string;
  titleType: string;
  sqft: string;
  valuation: string;
  description: string;
  selectedPackage: string | null;
  files: File[];
  consultationDate: string | null;
  consultationTime: string | null;
  status: ProjectStatus;
  id: string;
  email: string;
  contactName: string;
  phone: string;
  createdAt?: number;
  dateCreated?: string;
  quickNotes?: string;
  applicantType?: ApplicantType;
  developmentType?: DevelopmentType;
  workScope?: ProjectScope;
  titleStatus?: TitleStatus;
  landAreaSqm?: number;
  floors?: number;
  units?: number;
  siteConditions?: SiteCondition[];
  documentAvailability?: Record<string, DocumentAvailability>;
  readinessScore?: number | null;
  recommendedAction?: string;
  warnings?: string[];
}

export interface ServicePackage {
  id: string;
  name: string;
  price: string;
  priceSub: string;
  description: string;
  features: string[];
  popular?: boolean;
  colorClass: string;
}
