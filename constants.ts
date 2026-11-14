
import { ProjectType, ServicePackage } from './types';
import {
  WHATSAPP_DISPLAY,
  WHATSAPP_PHONE,
  getWhatsAppQuoteLink,
} from './services/whatsapp';

export { WHATSAPP_DISPLAY, WHATSAPP_PHONE, getWhatsAppQuoteLink };

export const CONTACT_EMAIL = 'permitflowinfo@gmail.com';

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'management',
    name: 'LASPPPA Permit Processing',
    price: '₦500,000 – ₦1,000,000+',
    priceSub: 'Standalone Facilitation',
    description: 'Covers: District Officer liaison, EPPES portal registration, assessment invoice generation, tax clearance alignment, and physical clearance follow-up.',
    features: [
      'District Officer Liaison',
      'EPPES Portal Registration',
      'Assessment Invoice Generation',
      'Tax Clearance Alignment',
      'Physical Clearance Follow-up'
    ],
    popular: true,
    colorClass: 'teal'
  },
  {
    id: 'design',
    name: 'Design + Approval Bundle',
    price: '₦2,500,000 – ₦3,500,000+',
    priceSub: 'Full Turnkey Package',
    description: 'Covers: ARCON-stamped architectural drawings, COREN-stamped structural/MEP drawings, soil test report analysis, and complete end-to-end LASPPPA planning permit processing.',
    features: [
      'ARCON-Stamped Architectural Drawings',
      'COREN-Stamped Structural / MEP Drawings',
      'Soil Test Report Analysis',
      'End-to-End LASPPPA Planning Permit Processing'
    ],
    colorClass: 'blue'
  },
  {
    id: 'regularization',
    name: 'REGULARIZATION',
    price: '₦700,000 – ₦1,000,000',
    priceSub: 'Processing Fee',
    description: 'Covers: As-built drawing revisions, Non-Destructive Testing (NDT) coordination, structural stability letters, and penalty assessment negotiations with Alausa.',
    features: [
      'As-Built Drawing Revisions',
      'Non-Destructive Testing (NDT) Coordination',
      'Structural Stability Letters',
      'Penalty Assessment Negotiations'
    ],
    colorClass: 'gray'
  }
];

export const PHASES = [
  {
    id: 1,
    title: 'Pre-Submission Preparation & Vetting',
    description: 'Architectural, Structural, and Engineering Alignment Check',
    duration: 'Phase 1: Compliance',
    icon: 'gavel',
    tasks: ['Quality vetting of architectural models', 'Final engineering structure certification', 'Procurement of official land surveys', 'Compiling mandatory soil geo-reports']
  },
  {
    id: 2,
    title: 'Digital E-Submission & EPPES Profiling',
    description: 'Document Transmission, Vetting, and Fee Generation',
    duration: 'Phase 2: E-Portal',
    icon: 'dns',
    tasks: ['Uploading drawings directly to EPPES', 'Electronic asset vetting checks', 'Generation of formal Assessment Fees', 'Processing statutory building charges']
  },
  {
    id: 3,
    title: 'Site Inspection & Vetting Coordination',
    description: 'Physical Field Verification by District Planning Officers',
    duration: 'Phase 3: Field Inspection',
    icon: 'location_on',
    tasks: ['Scheduling District Officer site visits', 'On-site dimension and boundary checks', 'Technical vetting of specialized designs', 'Addressing technical clearance queries']
  },
  {
    id: 4,
    title: 'Final Approval & Permit Issuance',
    description: 'LASPPPA Endorsement & Secure Document Handover',
    duration: 'Phase 4: Legal Issuance',
    icon: 'verified',
    tasks: ['Final evaluation by the General Manager', 'Applying the official physical stamp seals', 'Generation of final approval letters', 'Handover of your hard-copy building permit']
  }
];

export const ABOUT_DATA = {
    mission: "To streamline the physical planning permit process for developers, property owners, and investors in Lagos State – reducing delays, eliminating errors, and ensuring full compliance with LASPPPA and LASBCA regulations.",
    vision: "To become the most trusted permit consultancy in Nigeria, recognised for our integrity, technical excellence, and commitment to accelerating Lagos's built environment in a sustainable way.",
    values: [
        { title: "Integrity", desc: "We uphold the highest ethical standards, ensuring transparent communication and honest advice in every interaction.", icon: "verified_user" },
        { title: "Expertise", desc: "Our team combines deep regulatory knowledge with hands-on experience in the Lagos permit ecosystem – including the new EPPES platform.", icon: "school" },
        { title: "Client-Centric", desc: "We put your project first. From the initial assessment to final certification, we provide personalized support and clear guidance.", icon: "support_agent" }
    ],
    features: [
        { title: "End-to-end permit management", desc: "From land title verification to LASBCA stage inspections, we handle every step of the LASPPPA & LASBCA process." },
        { title: "EPPPS digital expertise", desc: "We are fully conversant with the Electronic Physical Planning Permit System – ensuring your online submissions are flawless." },
        { title: "Accurate fee assessments", desc: "Our proprietary estimator mirrors official LASPPPA formulae (MUL/A), IDC, stage fees – so you know what to expect." },
        { title: "Timely delivery", desc: "We prioritise efficient processing and proactive follow-up to minimise delays in your permit approval timeline." },
        { title: "Dedicated support", desc: "Every client gets a dedicated project manager who coordinates with LASPPPA, LASBCA, and other agencies on your behalf." },
        { title: "Regulatory relationships", desc: "We maintain strong working relationships with district offices across Lagos – from Ojo to Surulere and beyond." }
    ]
};
