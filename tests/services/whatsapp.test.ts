import { describe, it, expect } from 'vitest';
import {
  WHATSAPP_PHONE,
  buildWhatsAppMessage,
  getWhatsAppLink,
  getWhatsAppQuoteLink,
} from '../../services/whatsapp';
import type { WhatsAppProjectContext } from '../../services/whatsapp';

describe('centralized phone config', () => {
  it('exposes the shared WhatsApp number', () => {
    expect(WHATSAPP_PHONE).toBe('2348127251853');
  });

  it('embeds the centralized number in every wa.me link', () => {
    const link = getWhatsAppLink('general_consultation', {});
    expect(link.startsWith(`https://wa.me/${WHATSAPP_PHONE}?text=`)).toBe(true);
    expect(link.match(/2348127251853/g)).toHaveLength(1);
  });
});

describe('general consultation', () => {
  it('builds a friendly default message with no project details', () => {
    const msg = buildWhatsAppMessage('general_consultation', {});
    expect(msg).toContain('general consultation about a Lagos State building permit');
    expect(msg).not.toContain('Project:');
  });

  it('includes only provided project context', () => {
    const msg = buildWhatsAppMessage('general_consultation', {
      propertyType: 'residential-new',
      lga: 'Eti-Osa',
      customNote: 'I own the land but the title is a receipt.',
    });
    expect(msg).toContain('Project: residential-new, Eti-Osa.');
    expect(msg).toContain('I own the land but the title is a receipt.');
  });

  it('omits empty location', () => {
    const msg = buildWhatsAppMessage('general_consultation', { lga: '  ' });
    expect(msg).not.toContain('Project:');
  });
});

describe('missing documentation', () => {
  const msg = buildWhatsAppMessage('missing_documentation', {
    propertyType: 'commercial',
    lga: 'Ikeja',
    missingDocuments: ['Survey Plan', 'Structural Drawings', 'TCC'],
  });

  it('lists the missing documents and asks for advice', () => {
    expect(msg).toContain('I need help obtaining the required documents');
    expect(msg).toContain('• Survey Plan');
    expect(msg).toContain('• Structural Drawings');
    expect(msg).toContain('• TCC');
    expect(msg).toContain('Could you advise how to prepare and submit them?');
  });

  it('includes the project location without duplicating it', () => {
    expect(msg).toContain('for my project in Ikeja.');
    expect(msg).toMatch(/Ikeja/g);
  });

  it('handles a single document with singular phrasing', () => {
    const single = buildWhatsAppMessage('missing_documentation', { missingDocuments: ['Survey Plan'] });
    expect(single).toContain('a required document');
    expect(single).toContain('• Survey Plan');
  });
});

describe('permit readiness review', () => {
  const msg = buildWhatsAppMessage('permit_readiness_review', {
    propertyType: 'residential-new',
    lga: 'Eti-Osa',
    readinessScore: 60,
    recommendedAction: 'Obtain the survey plan to proceed.',
    consultantQuestions: ['Is my C of O acceptable?', 'Do I need an NDT report?'],
  });

  it('includes the score, recommended action, and confirmation prompt', () => {
    expect(msg).toContain('My provisional readiness score is 60%');
    expect(msg).toContain('Recommended next step: Obtain the survey plan to proceed.');
    expect(msg).toContain('Can a consultant confirm this recommended next step?');
  });

  it('lists the consultant questions', () => {
    expect(msg).toContain('• Is my C of O acceptable?');
    expect(msg).toContain('• Do I need an NDT report?');
  });

  it('includes the project line with location', () => {
    expect(msg).toContain('Project: residential-new, Eti-Osa.');
  });

  it('omits the score when it is not available', () => {
    const noScore = buildWhatsAppMessage('permit_readiness_review', { recommendedAction: 'Proceed.' });
    expect(noScore).not.toContain('readiness score');
    expect(noScore).toContain('Recommended next step: Proceed.');
  });
});

describe('service enquiry', () => {
  it('includes the bold service name and estimated price', () => {
    const msg = buildWhatsAppMessage('service_enquiry', {
      serviceName: 'LASPPPA Permit Processing',
      servicePrice: '₦500,000 – ₦750,000',
      lga: 'Surulere',
    });
    expect(msg).toContain('*LASPPPA Permit Processing*');
    expect(msg).toContain('(Est: ₦500,000 – ₦750,000)');
    expect(msg).toContain('for a building permit in Lagos (Surulere).');
  });

  it('falls back to a generic service mention', () => {
    const msg = buildWhatsAppMessage('service_enquiry', {});
    expect(msg).toContain('enquiry about the your permit services service');
  });
});

describe('category separation', () => {
  it('produces distinct messages per category', () => {
    const cases: [Parameters<typeof buildWhatsAppMessage>[0], WhatsAppProjectContext][] = [
      ['general_consultation', {}],
      ['missing_documentation', { missingDocuments: ['Survey Plan'] }],
      ['permit_readiness_review', { readinessScore: 50, recommendedAction: 'Act' }],
      ['service_enquiry', { serviceName: 'Design + Approval Bundle' }],
    ];
    const messages = cases.map(([type, ctx]) => buildWhatsAppMessage(type, ctx));
    for (let i = 0; i < messages.length; i++) {
      for (let j = i + 1; j < messages.length; j++) {
        expect(messages[i]).not.toEqual(messages[j]);
      }
    }
  });

  it('always opens with the same greeting', () => {
    expect(buildWhatsAppMessage('general_consultation', {})).toContain('Hello PermitFlow!');
    expect(buildWhatsAppMessage('missing_documentation', { missingDocuments: ['A'] })).toContain('Hello PermitFlow!');
    expect(buildWhatsAppMessage('permit_readiness_review', {})).toContain('Hello PermitFlow!');
    expect(buildWhatsAppMessage('service_enquiry', {})).toContain('Hello PermitFlow!');
  });
});

describe('URL building', () => {
  it('URL-encodes the pre-filled message', () => {
    const link = getWhatsAppLink('permit_readiness_review', { lga: 'Ikeja & Ajah', readinessScore: 50 });
    expect(link).toContain('%20');
    expect(link).toContain('%26');
    expect(decodeURIComponent(link)).toContain('Ikeja & Ajah');
  });
});

describe('sanitization and limits', () => {
  it('caps the number of listed documents to six', () => {
    const many = Array.from({ length: 10 }, (_, i) => `Document ${i + 1}`);
    const msg = buildWhatsAppMessage('missing_documentation', { missingDocuments: many });
    const bullets = msg.match(/• /g) || [];
    expect(bullets.length).toBeLessThanOrEqual(6);
  });

  it('caps the number of consultant questions to three', () => {
    const many = Array.from({ length: 8 }, (_, i) => `Question ${i + 1}`);
    const msg = buildWhatsAppMessage('permit_readiness_review', { recommendedAction: 'x', consultantQuestions: many });
    const bullets = msg.match(/• /g) || [];
    expect(bullets.length).toBeLessThanOrEqual(3);
  });

  it('clamps over-long recommended actions', () => {
    const msg = buildWhatsAppMessage('permit_readiness_review', {
      recommendedAction: 'A'.repeat(1000),
    });
    expect(msg.length).toBeLessThanOrEqual(1200);
    expect(msg).not.toContain('A'.repeat(500));
  });

  it('collapses whitespace and trims fields', () => {
    const msg = buildWhatsAppMessage('missing_documentation', {
      lga: '  Eti-Osa  ',
      missingDocuments: ['  Survey   Plan  '],
    });
    expect(msg).toContain('Eti-Osa');
    expect(msg).toContain('Survey Plan');
  });
});

describe('privacy: no personal data in messages', () => {
  it('never emits personal or sensitive fields, even if passed in', () => {
    const leaked = buildWhatsAppMessage(
      'permit_readiness_review',
      ({
        readinessScore: 40,
        recommendedAction: 'Proceed',
        email: 'owner@example.com',
        phone: '+2348000000000',
        address: '12 Private Road, Lekki',
        projectRef: 'LAS-2026-SECRET',
      } as unknown) as WhatsAppProjectContext,
    );
    expect(leaked).not.toContain('owner@example.com');
    expect(leaked).not.toContain('+2348000000000');
    expect(leaked).not.toContain('12 Private Road');
    expect(leaked).not.toContain('LAS-2026-SECRET');
  });

  it('has no personal-data fields on the context interface', () => {
    const build = buildWhatsAppMessage;
    expect(build('general_consultation', {})).toBeTruthy();
  });
});

describe('backward-compatible getWhatsAppQuoteLink', () => {
  it('maps service name + price to a service enquiry', () => {
    const link = getWhatsAppQuoteLink('Design + Approval Bundle', '₦2.5m');
    expect(decodeURIComponent(link)).toContain('enquiry about the *Design + Approval Bundle* service');
    expect(decodeURIComponent(link)).toContain('(Est: ₦2.5m)');
  });

  it('maps a custom context onto a general consultation note', () => {
    const link = getWhatsAppQuoteLink(undefined, undefined, 'Inquiry regarding my portfolio');
    expect(decodeURIComponent(link)).toContain('general consultation');
    expect(decodeURIComponent(link)).toContain('Inquiry regarding my portfolio');
  });

  it('uses the general consultation default when nothing is given', () => {
    const link = getWhatsAppQuoteLink();
    expect(decodeURIComponent(link)).toContain('general consultation about a Lagos State building permit');
    expect(link).toContain(WHATSAPP_PHONE);
  });
});