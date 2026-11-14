import { describe, it, expect } from 'vitest';
import { evaluateRules } from '../../src/domain/rules';
import {
  buildFallbackRoadmap,
  extractJsonObject,
  mapStatusToFailure,
  normalizeRoadmap,
} from '../../services/geminiService';
import type { ReadinessAssessment } from '../../src/domain/rules';

const sampleInput = {
  applicantType: 'individual' as const,
  developmentType: 'residential' as const,
  projectScope: 'new_construction' as const,
  lga: 'Eti-Osa',
  landAreaSqm: 600,
  floors: 2,
  units: 1,
  titleStatus: 'certificate_of_occupancy' as const,
};

function sampleAssessment(): ReadinessAssessment {
  return evaluateRules(sampleInput, {
    architectural_drawings: 'missing',
    structural_drawings: 'have',
    mechanical_drawings: 'missing',
    electrical_drawings: 'have',
    survey_plan: 'missing',
    title_document: 'have',
    individual_tcc: 'missing',
  });
}

describe('extractJsonObject', () => {
  it('parses a plain JSON object', () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses JSON wrapped in markdown code fences', () => {
    const raw = '```json\n{"summary":"hello"}\n```';
    expect(extractJsonObject(raw)).toEqual({ summary: 'hello' });
  });

  it('parses JSON preceded by prose', () => {
    const raw = 'Here you go:\n{"summary":"ok"}';
    expect(extractJsonObject(raw)).toEqual({ summary: 'ok' });
  });

  it('returns null for invalid or missing JSON', () => {
    expect(extractJsonObject('')).toBeNull();
    expect(extractJsonObject('not json at all')).toBeNull();
    expect(extractJsonObject('{"a":')).toBeNull();
  });
});

describe('normalizeRoadmap', () => {
  it('normalizes a valid AI payload into a safe roadmap', () => {
    const result = normalizeRoadmap({
      summary: '  Your project is 40% ready. ',
      workflow: ['Step one', '  ', 'Step two'],
      missingDocuments: [{ name: 'Survey Plan', why: 'Statutory requirement' }],
      checklistExplanations: [{ name: 'Architectural Drawings', why: 'ARCON seal' }],
      nextSteps: ['Obtain the survey plan'],
      consultantQuestions: ['Confirm title document'],
      disclaimers: ['Not an official approval'],
    });

    expect(result).not.toBeNull();
    expect(result!.version).toBe(1);
    expect(result!.summary).toBe('Your project is 40% ready.');
    expect(result!.workflow).toEqual(['Step one', 'Step two']);
    expect(result!.missingDocuments).toHaveLength(1);
  });

  it('rejects non-object payloads', () => {
    expect(normalizeRoadmap(null)).toBeNull();
    expect(normalizeRoadmap('text')).toBeNull();
    expect(normalizeRoadmap([])).toBeNull();
  });

  it('rejects payloads without a summary (empty response)', () => {
    expect(normalizeRoadmap({ workflow: ['a'] })).toBeNull();
  });

  it('drops malformed list items', () => {
    const road = normalizeRoadmap({
      summary: 's',
      workflow: [123, '', 'ok'],
      missingDocuments: [{ name: 'No why' }, { why: 'No name' }],
    });
    expect(road!.workflow).toEqual(['ok']);
    expect(road!.missingDocuments).toEqual([]);
  });
});

describe('buildFallbackRoadmap (engine-only, deterministic)', () => {
  it('produces a valid structured roadmap without any AI', () => {
    const assessment = sampleAssessment();
    const road = buildFallbackRoadmap(assessment, { propertyType: 'residential-new', lga: 'Eti-Osa' });

    expect(normalizeRoadmap(road)).toEqual(road);
    expect(road.summary).toContain('Eti-Osa');
    expect(road.workflow.length).toBeGreaterThan(0);
    expect(road.missingDocuments.length).toBeGreaterThan(0);
    expect(road.nextSteps.length).toBeGreaterThan(0);
    expect(road.disclaimers.length).toBeGreaterThan(0);
  });

  it('does not invent fees or timelines', () => {
    const road = buildFallbackRoadmap(sampleAssessment(), { propertyType: '', lga: '' });
    const blob = JSON.stringify(road).toLowerCase();
    expect(blob).not.toContain('₦');
    expect(blob).not.toMatch(/\d+\s*(days|weeks|months)/);
  });

  it('credits confirmed documents when nothing is missing', () => {
    const allHave = { ...sampleInput };
    const assessment = evaluateRules(allHave, {
      architectural_drawings: 'have',
      structural_drawings: 'have',
      mechanical_drawings: 'have',
      electrical_drawings: 'have',
      survey_plan: 'have',
      title_document: 'have',
      individual_tcc: 'have',
      lirs_clearance: 'have',
    });
    const road = buildFallbackRoadmap(assessment, { propertyType: 'residential-new', lga: '' });
    expect(road.missingDocuments).toEqual([]);
    expect(road.nextSteps.some((s) => s.includes('EPPES'))).toBe(true);
  });
});

describe('mapStatusToFailure', () => {
  it('maps every failure class', () => {
    expect(mapStatusToFailure(429)).toBe('rate_limit');
    expect(mapStatusToFailure(504)).toBe('timeout');
    expect(mapStatusToFailure(500)).toBe('unavailable');
    expect(mapStatusToFailure(400)).toBe('network');
    expect(mapStatusToFailure(200)).toBeNull();
  });

  it('honours an explicit error code from the server', () => {
    expect(mapStatusToFailure(200, 'malformed')).toBe('malformed');
    expect(mapStatusToFailure(503, 'rate_limit')).toBe('rate_limit');
    expect(mapStatusToFailure(200, 'not-a-code')).toBeNull();
  });
});