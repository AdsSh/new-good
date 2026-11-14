import {
  ROADMAP_MODEL,
  ROADMAP_SYSTEM_PROMPT,
  classifyRoadmapError,
  jsonResponse,
  readRoadmapPrompt,
  toRoadmapResponse,
} from '../../server/roadmapCore';

/**
 * Cloudflare Pages Function for POST /api/roadmap.
 *
 * Mirrors the Vercel edge function (`api/roadmap.ts`) but calls the Gemini
 * REST API directly. This avoids bundling the Node-oriented `@google/genai`
 * dependency (and its transitive `google-auth-library` / `ws` packages) into
 * the Workers runtime, and keeps the endpoint same-origin for the SPA.
 *
 * The key is read from the Pages project's `GEMINI_API_KEY` environment
 * variable (server-side only) and never reaches the browser bundle.
 */

interface PagesEnv {
  GEMINI_API_KEY?: string;
}

interface PagesContext {
  request: Request;
  env: PagesEnv;
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${ROADMAP_MODEL}:generateContent`;

function extractCandidateText(payload: GeminiResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part): part is GeminiPart & { text: string } => typeof part.text === 'string' && !part.thought)
    .map((part) => part.text)
    .join('');
}

async function generateRoadmap(prompt: string, apiKey: string): Promise<Response> {
  const upstream = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: ROADMAP_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    throw new Error(`${upstream.status} ${detail.slice(0, 300)}`);
  }

  let payload: GeminiResponse;
  try {
    payload = (await upstream.json()) as GeminiResponse;
  } catch {
    throw new Error('Gemini returned a non-JSON response');
  }

  if (payload.promptFeedback?.blockReason) {
    throw new Error(`Blocked: ${payload.promptFeedback.blockReason}`);
  }

  return toRoadmapResponse(extractCandidateText(payload));
}

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: { code: 'unavailable', message: 'AI roadmap generation is not configured.' } }, 503);
  }

  const prepared = await readRoadmapPrompt(request);
  if (prepared.ok === false) return prepared.response;

  try {
    return await generateRoadmap(prepared.prompt, apiKey);
  } catch (err) {
    const { code, status } = classifyRoadmapError(err);
    return jsonResponse({ error: { code } }, status);
  }
}

export function onRequest({ request }: PagesContext): Response {
  if (request.method !== 'POST') {
    return jsonResponse({ error: { code: 'network', message: 'Method not allowed' } }, 405);
  }
  return jsonResponse({ error: { code: 'network', message: 'Invalid request.' } }, 400);
}
