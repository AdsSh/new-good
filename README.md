<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PermitFlow

Building permit consulting platform for Lagos State property developers.

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set the Gemini API key for AI roadmap generation:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your key from https://aistudio.google.com/apikey
   ```

3. Run the app:
   ```bash
   npm run dev
   ```
   The app starts on `http://localhost:3000`.

4. (Optional) For AI roadmap features, run the API server:
   ```bash
   npx vercel dev
   ```
   This starts both the frontend and the serverless API proxy.

## Deploy to Cloudflare Pages (recommended)

PermitFlow deploys as one Cloudflare Pages project: the static Vite build plus a
Pages Function at `/api/roadmap`.

1. Push the repository to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Build command `npm run build`, output directory `dist`, Node 22 (from `.nvmrc`).
4. Add `GEMINI_API_KEY` under **Settings → Environment variables** (Production and Preview).
5. Deploy.

Full walkthrough, verification commands, and rollback: `docs/CLOUDFLARE_DEPLOYMENT.md`.

## Deploy to Vercel (alternative)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Set `GEMINI_API_KEY` in Project Settings > Environment Variables
4. Deploy — Vercel auto-detects the Vite framework

Both platforms share the request validation and response logic in
`server/roadmapCore.ts`; only the thin runtime adapter differs.

## Security

- The Gemini API key is stored **server-side only** (Cloudflare Pages or Vercel environment variables)
- The key is never exposed to the browser bundle
- AI calls go through a same-origin serverless endpoint at `/api/roadmap`
- See `docs/SECURITY_REMEDIATION.md` and `docs/CLOUDFLARE_DEPLOYMENT.md` for details
