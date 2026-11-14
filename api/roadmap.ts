import { GoogleGenAI } from '@google/genai';
import {
  ROADMAP_MODEL,
  ROADMAP_SYSTEM_PROMPT,
  classifyRoadmapError,
  jsonResponse,
  readRoadmapPrompt,
  toRoadmapResponse,
} from '../server/roadmapCore';

/**
 * Vercel edge function / server-side AI roadmap generator.
 *
 * The Gemini API key lives ONLY here (process.env.GEMINI_API_KEY) and is
 * never exposed to the client bundle. The model is instructed to EXPLAIN the
 * deterministic engine output it receives — it never determines regulatory
 * requirements. See docs/AI_ARCHITECTURE.md for the safety model.
 *
 * Cloudflare Pages uses `functions/api/roadmap.ts`, which shares the same
 * validation and response logic from `server/roadmapCore.ts`.
 */

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonResponse({ error: { code: 'network', message: 'Method not allowed' } }, 405);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: { code: 'unavailable', message: 'AI roadmap generation is not configured.' } }, 503);
  }

  const prepared = await readRoadmapPrompt(req);
  if (prepared.ok === false) return prepared.response;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: ROADMAP_MODEL,
      contents: prepared.prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: ROADMAP_SYSTEM_PROMPT,
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    });

    return toRoadmapResponse(response.text ?? '');
  } catch (err) {
    const { code, status } = classifyRoadmapError(err);
    return jsonResponse({ error: { code } }, status);
  }
}
