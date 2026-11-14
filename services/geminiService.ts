import type { OnboardingData } from '../types';
import type {
  AssessedRequirement,
  DocumentAvailability,
  ReadinessAssessment,
} from '../src/domain/rules';

/**
 * PermitFlow AI Roadmap service.
 *
 * The AI NEVER determines regulatory requirements. It only EXPLAINS the
 * deterministic engine output supplied to it. All structured lists returned
 * here are validated and clamped before they can reach the UI, and every
 * failure mode falls back to a deterministic engine-only roadmap so the UI
 * always has safe structured content to render.
 *
 * See docs/AI_ARCHITECTURE.md for the full safety model.
 */

export interface RoadmapItem {
  requirementId?: string;
  name: string;
  why: string;
}

export interface AIPermitRoadmap {
  version: 1;
  summary: string;
  workflow: string[];
  missingDocuments: RoadmapItem[];
  checklistExplanations: RoadmapItem[];
  nextSteps: string[];
  consultantQuestions: string[];
  disclaimers: string[];
}

export type RoadmapFailure =
  | 'timeout'
  | 'rate_limit'
  | 'network'
  | 'unavailable'
  | 'malformed'
  | 'empty';

export type RoadmapOutcome =
  | { status: 'ok'; roadmap: AIPermitRoadmap }
  | { status: 'fallback'; error: RoadmapFailure; roadmap: AIPermitRoadmap };

export const ROADMAP_FAILURE_LABELS: Record<RoadmapFailure, string> = {
  timeout: 'the request timed out',
  rate_limit: 'the AI service is rate-limited right now',
  network: 'a network error occurred',
  unavailable: 'the AI model is temporarily unavailable',
  malformed: 'the AI response could not be interpreted as valid JSON',
  empty: 'the AI returned an empty response',
};

const REQUEST_TIMEOUT_MS = 25000;
const MAX_LIST_ITEMS = 12;
const MAX_ITEM_LENGTH = 240;
const MAX_SUMMARY_LENGTH = 700;

const FAILURE_CODES: readonly RoadmapFailure[] = [
  'timeout',
  'rate_limit',
  'network',
  'unavailable',
  'malformed',
  'empty',
];

const FALLBACK_WORKFLOW: string[] = [
  'Confirm ownership and title documents before any submission.',
  'Engage ARCON-registered architects and COREN-certified engineers to prepare signed, sealed drawings.',
  'Compile the mandatory documents from your readiness checklist.',
  'Lodge the application on the Lagos EPPES portal at the relevant district office.',
  'Attend LASPPPA / LASBCA site inspection and respond to any queries within the stated window.',
  'Collect the development permit once issued and retained.',
];

const ENGINE_DISCLAIMERS: string[] = [
  'This guidance is computed from the statutory checklist and is not an official approval, pre-approval, or commitment from LASPPPA, LASBCA, or any other agency.',
  'Timelines and fees are not guaranteed — confirm them directly with the relevant Lagos State agency.',
];

function trimLines(lines: unknown[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const t = typeof raw === 'string' ? raw.trim() : '';
    if (!t) continue;
    out.push(t.slice(0, MAX_ITEM_LENGTH));
    if (out.length >= MAX_LIST_ITEMS) break;
  }
  return out;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? trimLines(v) : [];
}

function asItems(v: unknown): RoadmapItem[] {
  if (!Array.isArray(v)) return [];
  const items: RoadmapItem[] = [];
  for (const raw of v) {
    if (typeof raw !== 'object' || raw === null) continue;
    const obj = raw as Record<string, unknown>;
    const name = typeof obj.name === 'string' ? obj.name.trim() : '';
    const why = typeof obj.why === 'string' ? obj.why.trim() : '';
    if (!name || !why) continue;
    const requirementId = typeof obj.requirementId === 'string' ? obj.requirementId : undefined;
    items.push({
      requirementId,
      name: name.slice(0, MAX_ITEM_LENGTH),
      why: why.slice(0, MAX_ITEM_LENGTH),
    });
    if (items.length >= MAX_LIST_ITEMS) break;
  }
  return items;
}

/**
 * Validate and clamp an unknown AI payload into a safe AIPermitRoadmap.
 * Returns null when the payload is not a usable roadmap (empty, malformed,
 * or missing required fields) — callers must then treat it as a failure.
 */
export function normalizeRoadmap(raw: unknown): AIPermitRoadmap | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const src = raw as Record<string, unknown>;
  const summary = typeof src.summary === 'string' ? src.summary.trim().slice(0, MAX_SUMMARY_LENGTH) : '';
  if (!summary) return null;
  return {
    version: 1,
    summary,
    workflow: asStringArray(src.workflow),
    missingDocuments: asItems(src.missingDocuments),
    checklistExplanations: asItems(src.checklistExplanations),
    nextSteps: asStringArray(src.nextSteps),
    consultantQuestions: asStringArray(src.consultantQuestions),
    disclaimers: asStringArray(src.disclaimers),
  };
}

/**
 * Extract a single JSON object from a raw model response, tolerating
 * surrounding prose and markdown code fences. Returns null when none found.
 */
export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function mandatoryExcerpt(r: AssessedRequirement): string {
  return r.meta?.mandatoryRule || r.rationale;
}

interface RoadmapRequest {
  project: {
    propertyType: string;
    address: string;
    lga: string;
    titleType: string;
    applicantType?: string;
    developmentType?: string;
    workScope?: string;
    description?: string;
  };
  assessment: {
    readinessScore: number | null;
    scoringExplanation: string;
    recommendedAction: string;
    completedCount: number;
    missingCount: number;
    warnings: string[];
    consultantQuestions: string[];
    required: Array<{
      id: string;
      name: string;
      rationale: string;
      regulatoryBody?: string;
      availability?: DocumentAvailability;
    }>;
    unknown: Array<{ id: string; name: string; rationale: string }>;
  };
}

export function buildRoadmapRequest(data: OnboardingData, assessment: ReadinessAssessment): RoadmapRequest {
  return {
    project: {
      propertyType: data.propertyType,
      address: data.address,
      lga: data.lga,
      titleType: data.titleType,
      applicantType: data.applicantType,
      developmentType: data.developmentType,
      workScope: data.workScope,
      description: data.description,
    },
    assessment: {
      readinessScore: assessment.readinessScore,
      scoringExplanation: assessment.scoringExplanation,
      recommendedAction: assessment.recommendedAction,
      completedCount: assessment.completedCount,
      missingCount: assessment.missingCount,
      warnings: assessment.warnings,
      consultantQuestions: assessment.consultantQuestions.map((q) => q.question),
      required: assessment.required.map((r) => ({
        id: r.requirementId,
        name: r.name,
        rationale: mandatoryExcerpt(r),
        regulatoryBody: r.meta?.regulatoryBody,
        availability: r.availability,
      })),
      unknown: assessment.unknown.map((r) => ({
        id: r.requirementId,
        name: r.name,
        rationale: r.rationale,
      })),
    },
  };
}

export function buildFallbackRoadmap(
  assessment: ReadinessAssessment,
  project: { propertyType: string; lga: string },
): AIPermitRoadmap {
  const score = assessment.readinessScore ?? 0;
  const missing = assessment.required
    .filter((r) => r.availability !== 'have')
    .map((r) => ({
      requirementId: r.requirementId,
      name: r.name,
      why: mandatoryExcerpt(r),
    }));

  const nextSteps: string[] =
    missing.length > 0
      ? missing.slice(0, 3).map((m) => `Obtain ${m.name}.`)
      : [assessment.recommendedAction];
  nextSteps.push('Lodge the completed dossier on the Lagos EPPES portal.');

  return {
    version: 1,
    summary: `Based on the deterministic readiness assessment, your ${project.propertyType || 'development'} project${project.lga ? ` in ${project.lga}` : ''} is ${score}% ready. ${assessment.recommendedAction}`,
    workflow: FALLBACK_WORKFLOW,
    missingDocuments: missing,
    checklistExplanations: assessment.required.slice(0, 6).map((r) => ({
      requirementId: r.requirementId,
      name: r.name,
      why: mandatoryExcerpt(r),
    })),
    nextSteps,
    consultantQuestions: assessment.consultantQuestions.map((q) => q.question),
    disclaimers: [...ENGINE_DISCLAIMERS],
  };
}

function isFailureCode(value: string): value is RoadmapFailure {
  return FAILURE_CODES.includes(value as RoadmapFailure);
}

function readErrorCode(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined;
  const error = (body as Record<string, unknown>).error;
  if (typeof error !== 'object' || error === null) return undefined;
  const code = (error as Record<string, unknown>).code;
  return typeof code === 'string' ? code : undefined;
}

export function mapStatusToFailure(status: number, code?: string): RoadmapFailure | null {
  if (code && isFailureCode(code)) return code;
  if (status === 429) return 'rate_limit';
  if (status === 408 || status === 504) return 'timeout';
  if (status >= 500) return 'unavailable';
  if (status >= 400) return 'network';
  return null;
}

async function fetchRoadmap(
  payload: RoadmapRequest,
): Promise<{ status: 'ok'; roadmap: AIPermitRoadmap } | { status: 'error'; error: RoadmapFailure }> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    let response: Response;
    try {
      response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return { status: 'error', error: 'timeout' };
      return { status: 'error', error: 'network' };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return { status: 'error', error: 'network' };

    let bodyJson: unknown;
    try {
      bodyJson = await response.json();
    } catch {
      return { status: 'error', error: 'network' };
    }

    if (!response.ok) {
      const code = readErrorCode(bodyJson);
      return { status: 'error', error: mapStatusToFailure(response.status, code) ?? 'unavailable' };
    }

    const body = bodyJson as Record<string, unknown>;
    const roadmap = normalizeRoadmap(body?.roadmap);
    if (!roadmap) {
      return { status: 'error', error: body && typeof body.roadmap !== 'undefined' ? 'malformed' : 'empty' };
    }
    return { status: 'ok', roadmap };
  } finally {
    window.clearTimeout(timer);
  }
}

export async function generatePermitRoadmap(
  data: OnboardingData,
  assessment: ReadinessAssessment,
): Promise<RoadmapOutcome> {
  const fallbackProject = { propertyType: data.propertyType, lga: data.lga };
  try {
    const result = await fetchRoadmap(buildRoadmapRequest(data, assessment));
    if (result.status !== 'ok') {
      return {
        status: 'fallback',
        error: result.error,
        roadmap: buildFallbackRoadmap(assessment, fallbackProject),
      };
    }
    return { status: 'ok', roadmap: result.roadmap };
  } catch {
    return {
      status: 'fallback',
      error: 'network',
      roadmap: buildFallbackRoadmap(assessment, fallbackProject),
    };
  }
}