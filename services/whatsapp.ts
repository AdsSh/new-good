/**
 * Centralized WhatsApp consultation layer.
 *
 * Single source of truth for the WhatsApp phone number, the pre-filled
 * message builders (one per consultation category), and the wa.me link
 * generator. Components import from `../constants` (which re-exports this
 * module) so the phone number is never duplicated or hand-written in a view.
 *
 * Privacy rule: the context passed to the builders is a strict whitelist of
 * project-level fields. Personal data (name, email, phone, home address) and
 * internal IDs must never be passed in — the builder only ever emits the
 * fields listed on `WhatsAppProjectContext`.
 */

export const WHATSAPP_PHONE = '2348127251853';
export const WHATSAPP_DISPLAY = '08127251853';

export type WhatsAppMessageType =
  | 'general_consultation'
  | 'missing_documentation'
  | 'permit_readiness_review'
  | 'service_enquiry';

export interface WhatsAppProjectContext {
  propertyType?: string;
  lga?: string;
  readinessScore?: number | null;
  recommendedAction?: string;
  missingDocuments?: string[];
  consultantQuestions?: string[];
  serviceName?: string;
  servicePrice?: string;
  customNote?: string;
}

const MAX_MESSAGE_LENGTH = 1200;
const MAX_PROJECT_TYPE = 40;
const MAX_LOCATION = 40;
const MAX_ACTION = 220;
const MAX_NOTE = 240;
const MAX_SERVICE_NAME = 60;
const MAX_SERVICE_PRICE = 60;
const MAX_ITEM = 120;
const MAX_DOCS = 6;
const MAX_QUESTIONS = 3;

const cleanText = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim();

const capText = (value: string, max: number): string => (value.length <= max ? value : `${value.slice(0, max - 1)}…`);

const listItems = (items: unknown[], max: number): string => {
  const clean = items
    .map((item) => capText(cleanText(item), MAX_ITEM))
    .filter(Boolean)
    .slice(0, max);
  if (clean.length === 0) return '';
  return `\n${clean.map((item) => `• ${item}`).join('\n')}`;
};

/**
 * Renders "Project: <type>, <lga>." as its own line only when something was
 * provided. Location is included by callers that want it; callers that already
 * mention the LGA in the opening line pass without it to avoid duplication.
 */
const projectLine = (propertyType?: string, lga?: string): string => {
  const type = capText(cleanText(propertyType), MAX_PROJECT_TYPE);
  const location = capText(cleanText(lga), MAX_LOCATION);
  const parts: string[] = [];
  if (type) parts.push(type);
  if (location) parts.push(location);
  return parts.length > 0 ? `\nProject: ${parts.join(', ')}.` : '';
};

const locationDesc = (lga?: string): string => {
  const location = capText(cleanText(lga), MAX_LOCATION);
  return location ? ` in ${location}` : '';
};

/**
 * Builds a plain-text WhatsApp message for one of the four consultation
 * categories. Contains only the project-level fields passed in the context.
 */
export function buildWhatsAppMessage(type: WhatsAppMessageType, ctx: WhatsAppProjectContext): string {
  let message: string;

  switch (type) {
    case 'general_consultation': {
      const note = ctx.customNote ? `\n${capText(cleanText(ctx.customNote), MAX_NOTE)}` : '';
      message = `Hello PermitFlow! I'd like a general consultation about a Lagos State building permit.${projectLine(
        ctx.propertyType,
        ctx.lga,
      )}${note}`;
      break;
    }

    case 'missing_documentation': {
      const docs = listItems(ctx.missingDocuments ?? [], MAX_DOCS);
      const count = ctx.missingDocuments?.length ?? 0;
      const docLabel = count === 1 ? 'a required document' : 'the required documents';
      const action = count > 0 ? 'Could you advise how to prepare and submit them?' : 'Could you advise me on next steps?';
      message = `Hello PermitFlow! I completed the PermitFlow readiness check and I need help obtaining ${docLabel} for my project${locationDesc(
        ctx.lga,
      )}.${projectLine(ctx.propertyType)}${docs}\n${action}`;
      break;
    }

    case 'permit_readiness_review': {
      const score =
        typeof ctx.readinessScore === 'number'
          ? `\nMy provisional readiness score is ${Math.round(ctx.readinessScore)}%.`
          : '';
      const action = capText(cleanText(ctx.recommendedAction), MAX_ACTION);
      const actionLine = action ? `\nRecommended next step: ${action}` : '';
      const questions = listItems(ctx.consultantQuestions ?? [], MAX_QUESTIONS);
      const questionsBlock = questions ? `${questions}\n` : '\n';
      message = `Hello PermitFlow! I'd like a human review of my building permit readiness.${projectLine(
        ctx.propertyType,
        ctx.lga,
      )}${score}${actionLine}${questionsBlock}Can a consultant confirm this recommended next step?`;
      break;
    }

    case 'service_enquiry': {
      const name = ctx.serviceName ? `*${capText(cleanText(ctx.serviceName), MAX_SERVICE_NAME)}*` : 'your permit services';
      const price = ctx.servicePrice ? ` (Est: ${capText(cleanText(ctx.servicePrice), MAX_SERVICE_PRICE)})` : '';
      const location = capText(cleanText(ctx.lga), MAX_LOCATION);
      const locationSuffix = location ? ` (${location})` : '';
      message = `Hello PermitFlow! I'd like an enquiry about the ${name} service${price} for a building permit in Lagos${locationSuffix}.${projectLine(
        ctx.propertyType,
      )}`;
      break;
    }
  }

  return capText(message, MAX_MESSAGE_LENGTH);
}

/** Full wa.me link with the pre-filled message URL-encoded. */
export const getWhatsAppLink = (type: WhatsAppMessageType, ctx: WhatsAppProjectContext): string =>
  `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(buildWhatsAppMessage(type, ctx))}`;

/**
 * Backward-compatible wrapper for existing callers (Services,
 * Layout, ChecklistSimulator).
 * Maps legacy arguments onto the categorized builders:
 * - serviceName + price  -> service enquiry
 * - customContext        -> general consultation with the note attached
 * - default              -> general consultation
 */
export const getWhatsAppQuoteLink = (
  serviceName?: string,
  price?: string,
  customContext?: string,
): string => {
  if (serviceName) return getWhatsAppLink('service_enquiry', { serviceName, servicePrice: price });
  if (customContext) return getWhatsAppLink('general_consultation', { customNote: customContext });
  return getWhatsAppLink('general_consultation', {});
};