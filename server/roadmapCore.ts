import { extractJsonObject, normalizeRoadmap } from '../services/geminiService';

/**
 * Shared AI roadmap request/response logic for both server runtimes:
 * - `api/roadmap.ts` — Vercel edge function (local dev uses this)
 * - `functions/api/roadmap.ts` — Cloudflare Pages Function
 *
 * The Gemini API key is read by each runtime's thin adapter and passed only
 * into the model call. Nothing here reads `process.env` or request bindings,
 * so this module never leaks configuration into the client bundle.
 */

export const ROADMAP_MODEL = 'gemini-3-flash-preview';
const MAX_STRING = 240;
const MAX_LIST = 12;

export const ROADMAP_SYSTEM_PROMPT = `You are the explanation engine inside PermitFlow, a Lagos State building permit guidance app. You EXPLAIN the deterministic regulatory assessment you are given — you never redo or override it.

MANDATORY SAFETY RULES:
1. Regulatory requirements are decided ONLY by the deterministic engine output provided to you. Never add, remove, or rename checklist items. Never invent new requirements.
2. You are NOT a government agency. Never claim or imply official authority or agency approval. Never guarantee that a permit will be approved.
3. Never invent laws, regulations, statutory instruments, fees, prices, costs, or timelines. If a figure is not in the provided data, omit it or tell the user to confirm it with the relevant Lagos State agency.
4. Do not silently contradict the provided deterministic assessment. If something appears inconsistent, flag it as uncertain and recommend a consultant review.
5. Quote only the provided project profile, assessment, and knowledge-base excerpts. Never cite sources that are not in the input.
6. If the input is insufficient, say so instead of guessing.
7. Respond with EXACTLY one JSON object: no markdown, no prose, no text outside the JSON. Escape all strings correctly.`;

interface NarrowedItem {
  id: string;
  name: string;
  rationale: string;
  regulatoryBody?: string;
  availability?: string;
}

interface NarrowedPayload {
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
    required: NarrowedItem[];
    unknown: Array<{ id: string; name: string; rationale: string }>;
  };
}

function str(v: unknown, max = MAX_STRING): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function strings(v: unknown, cap = MAX_LIST): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const raw of v) {
    const t = str(raw);
    if (!t) continue;
    out.push(t);
    if (out.length >= cap) break;
  }
  return out;
}

function rows(v: unknown, cap = MAX_LIST): NarrowedItem[] {
  if (!Array.isArray(v)) return [];
  const out: NarrowedItem[] = [];
  for (const raw of v) {
    if (typeof raw !== 'object' || raw === null) continue;
    const obj = raw as Record<string, unknown>;
    const name = str(obj.name);
    const rationale = str(obj.rationale);
    if (!name || !rationale) continue;
    out.push({
      id: str(obj.id, 80),
      name,
      rationale,
      regulatoryBody: str(obj.regulatoryBody, 80) || undefined,
      availability: str(obj.availability, 20) || undefined,
    });
    if (out.length >= cap) break;
  }
  return out;
}

function narrowUnknown(v: unknown): Array<{ id: string; name: string; rationale: string }> {
  if (!Array.isArray(v)) return [];
  const out: Array<{ id: string; name: string; rationale: string }> = [];
  for (const raw of v) {
    if (typeof raw !== 'object' || raw === null) continue;
    const obj = raw as Record<string, unknown>;
    const name = str(obj.name);
    const rationale = str(obj.rationale);
    if (!name || !rationale) continue;
    out.push({ id: str(obj.id, 80), name, rationale });
    if (out.length >= MAX_LIST) break;
  }
  return out;
}

function narrow(body: unknown): NarrowedPayload | null {
  if (typeof body !== 'object' || body === null) return null;
  const src = body as Record<string, unknown>;
  const projectRaw = src.project;
  if (typeof projectRaw !== 'object' || projectRaw === null) return null;
  const project = projectRaw as Record<string, unknown>;
  const address = str(project.address, 300);
  const lga = str(project.lga, 80);
  if (!address || !lga) return null;

  const assessmentRaw = src.assessment;
  if (typeof assessmentRaw !== 'object' || assessmentRaw === null) return null;
  const assessment = assessmentRaw as Record<string, unknown>;

  let readinessScore: number | null = null;
  if (typeof assessment.readinessScore === 'number' && isFinite(assessment.readinessScore)) {
    readinessScore = Math.min(100, Math.max(0, Math.round(assessment.readinessScore)));
  }

  return {
    project: {
      propertyType: str(project.propertyType, 120),
      address,
      lga,
      titleType: str(project.titleType, 160),
      applicantType: str(project.applicantType, 40) || undefined,
      developmentType: str(project.developmentType, 40) || undefined,
      workScope: str(project.workScope, 40) || undefined,
      description: str(project.description, 500) || undefined,
    },
    assessment: {
      readinessScore,
      scoringExplanation: str(assessment.scoringExplanation, 900),
      recommendedAction: str(assessment.recommendedAction, 500),
      completedCount: typeof assessment.completedCount === 'number' ? assessment.completedCount : 0,
      missingCount: typeof assessment.missingCount === 'number' ? assessment.missingCount : 0,
      warnings: strings(assessment.warnings, 8),
      consultantQuestions: strings(assessment.consultantQuestions, 8),
      required: rows(assessment.required),
      unknown: narrowUnknown(assessment.unknown),
    },
  };
}

function buildUserPrompt(payload: NarrowedPayload): string {
  return `Project profile:
${JSON.stringify(payload.project)}

Deterministic readiness assessment (this is authoritative — you explain it, you never contradict it):
${JSON.stringify(payload.assessment)}

Return a JSON object with exactly these keys:
- "summary": a 2-3 sentence plain-language explanation of the assessment.
- "workflow": ordered list of likely workflow steps for this project.
- "missingDocuments": array of { "name": string, "why": string } for the mandatory documents the user has NOT confirmed (availability is not "have"). Use only documents present in the assessment "required" list.
- "checklistExplanations": array of { "name": string, "why": string } explaining why the key checklist items matter. Use only the provided assessment data.
- "nextSteps": ordered list of practical next steps.
- "consultantQuestions": list of questions the user should confirm with a human permit consultant (use the assessment "consultantQuestions" where present).
- "disclaimers": list of short disclaimers (e.g. not an official approval, confirm fees/timelines with the agency).`;
}

export function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function classifyRoadmapError(err: unknown): { code: string; status: number } {
  const message = err instanceof Error ? err.message : String(err ?? '');
  const m = message.toLowerCase();
  if (/429|rate.?limit|quota|resource_exhausted/.test(m)) return { code: 'rate_limit', status: 429 };
  if (/timeout|deadline|timed ?out/.test(m)) return { code: 'timeout', status: 504 };
  if (/(404|not ?found|not supported|does not exist|permission denied|invalid argument|api ?key|unavailable|model)/.test(m)) {
    return { code: 'unavailable', status: 503 };
  }
  return { code: 'unavailable', status: 502 };
}

/**
 * Validate the incoming request and build the model prompt.
 * Returns a ready-to-send error response when the request is unusable.
 */
export async function readRoadmapPrompt(
  req: Request,
): Promise<{ ok: true; prompt: string } | { ok: false; response: Response }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, response: jsonResponse({ error: { code: 'network', message: 'Invalid request body.' } }, 400) };
  }

  const narrowed = narrow(body);
  if (!narrowed) {
    return {
      ok: false,
      response: jsonResponse(
        { error: { code: 'network', message: 'Missing required project or assessment fields.' } },
        400,
      ),
    };
  }

  return { ok: true, prompt: buildUserPrompt(narrowed) };
}

/**
 * Parse, validate and clamp the model output into the same JSON envelope
 * returned by both server runtimes.
 */
export function toRoadmapResponse(raw: string): Response {
  const parsed = extractJsonObject(raw);
  const roadmap = normalizeRoadmap(parsed);
  if (!roadmap) {
    return jsonResponse({ error: { code: parsed ? 'malformed' : 'empty' } }, 502);
  }
  return jsonResponse({ roadmap }, 200);
}
