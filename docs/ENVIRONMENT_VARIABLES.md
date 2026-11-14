# PermitFlow — Environment Variables

PermitFlow has **exactly one** environment variable. It is read exclusively
**server-side** by the `/api/roadmap` handler and is never exposed to the browser.
Both deployment targets are supported: the Vercel edge function
(`api/roadmap.ts`) and the Cloudflare Pages Function (`functions/api/roadmap.ts`).

---

## Variable reference

| Variable | Scope | Required? | Read by | Used for |
|----------|-------|-----------|---------|----------|
| `GEMINI_API_KEY` | Server only | Yes (for AI roadmap; falls back safely without it) | `api/roadmap.ts` via `process.env.GEMINI_API_KEY` (Vercel) or `functions/api/roadmap.ts` via `env.GEMINI_API_KEY` (Cloudflare Pages) | Authenticating to the Google Gemini API used to generate the explainer roadmap |

### Why `GEMINI_API_KEY` is server-side only

- The app renders with `React + Vite` and ships a **static** build (`dist/`).
  Vite inlines anything referenced via `import.meta.env.VITE_*` directly into
  the browser bundle — a key set that way is public.
- Instead, the client calls `POST /api/roadmap` (same origin). That request is
  handled by `api/roadmap.ts` on Vercel or `functions/api/roadmap.ts` on
  Cloudflare Pages — the only place the key is read.
- Verified: the client code (`src/`, `views/`, `components/`, `services/`)
  contains **zero** references to `process.env`, `import.meta.env`, or `GEMINI`.
  The production bundle contains no key material (see `docs/DEPLOYMENT.md` §8).

---

## Configuration

### Local development

```bash
# 1. Create your local env file (this file is git-ignored)
cp .env.example .env.local

# 2. Add your key (get one at https://aistudio.google.com/apikey)
GEMINI_API_KEY=your-key-here
```

- Use `npx vercel dev` to run the Vite frontend **and** the `api/roadmap.ts`
  edge function together so the AI feature works locally.
- `npm run dev` alone runs only the frontend; the AI feature then degrades to
  the deterministic fallback roadmap (this is by design and handled gracefully).
- Without a key the API returns `503` with a generic message and the client
  falls back to the engine-only roadmap — the app never crashes.

### Production (Cloudflare Pages)

Set it in the Pages project — do **not** create `.env.production` locally or
commit a key:

1. Cloudflare dashboard → **Workers & Pages** → your Pages project.
2. **Settings → Environment variables** → **Add variable**.
3. Name: `GEMINI_API_KEY`; value: your Gemini API key; click **Encrypt**.
4. Add it for **Production** and **Preview**.
5. Redeploy (or push a commit) so the new value is applied.

For local Pages Function testing, put the key in `.dev.vars` (gitignored) and
run `npx wrangler pages dev dist`.

### Production (Vercel)

Set it in the Vercel dashboard — do **not** create `.env.production` locally or
commit a key:

1. Open the project on Vercel → **Settings → Environment Variables**.
2. Key: `GEMINI_API_KEY`
3. Value: your Gemini API key
4. Environments: select **Production** (and **Preview** if previews should have
   the AI feature).
5. Redeploy or trigger a new build so the variable is applied.

---

## What must NOT be configured via environment variables

| Setting | Where it actually lives | Why it's not an env var |
|---------|------------------------|--------------------------|
| WhatsApp number (`2348127251853`) | `services/whatsapp.ts` (`WHATSAPP_PHONE`) | Public business contact, not a secret. Centralized in code as the single source of truth. |
| Contact email (`permitflowinfo@gmail.com`) | `constants.ts` (`CONTACT_EMAIL`) | Public business contact, not a secret. Centralized in code as the single source of truth. |
| Branding / colors / fonts | `index.html` (inline Tailwind config) | Static visual config, not environment-specific. |
| API key | Server env var only | Must never enter the client (see above). |

---

## Git safety rules

- `.gitignore` already excludes `.env`, `.env.local`, `.env.*.local` — never
  un-ignore them.
- `.env.example` is committed on purpose: it is a documented **template** with
  no real value. Never paste a real key into it.
- Before pushing, confirm no live key exists in source:

```bash
# Should return nothing in app code (node_modules is excluded):
grep -RInE "AIza[0-9A-Za-z_-]{30,}|GEMINI_API_KEY=" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" . | grep -v node_modules | grep -v "^\./dist/"
```