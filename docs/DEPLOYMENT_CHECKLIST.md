# PermitFlow — Deployment Checklist

Run this checklist on **every production deployment**. The automated subset
platforms the build/type/test gates; the manual items are verified in the
preview deployment before promoting to production.

---

## Automated gates (run locally / in CI)

| # | Check | Command | Expected |
|---|-------|---------|----------|
| A1 | **Build succeeds** | `npm run build` | Exits 0, emits `dist/`, no Vite warnings |
| A2 | Type check | `npx tsc --noEmit` | Exit 0, no errors |
| A3 | Test suite | `npm test` | 12 files / 145 tests pass |
| A4 | **Secret unavailable in browser** | `grep -RInE "GEMINI_API_KEY|AIza[0-9A-Za-z_-]{30,}|process\.env|import\.meta\.env" dist/` | Zero matches |

```bash
# One-liner for the automated subset:
npx tsc --noEmit && npm test && npm run build
```

---

## Manual verification (preview deployment → production)

### Routes work

- [ ] `/` landing renders hero + CTA
- [ ] `/#/onboarding` wizard opens (all 4 steps)
- [ ] `/#/dashboard` renders (empty state if no data)
- [ ] `/#/checklist` and `/#/simulator` load the calculator
- [ ] `/#/services`, `/#/process`, `/#/about` render
- [ ] Unknown route (e.g. `/#/nope`) shows the styled 404 page
- [ ] Direct deep-link reload (`/#/dashboard`) survives refresh (HashRouter)

### Mobile works

- [ ] 375px and 768px widths: no horizontal scroll on any page
- [ ] Mobile nav drawer opens/closes; menu closes on route change; Escape closes it
- [ ] Onboarding radios/inputs usable and keyboard-focusable on touch
- [ ] Dashboard grids stack correctly; project filter tabs scroll
- [ ] Modal overlays (assign officer, confirm upload, document viewer) fit the viewport and close via backdrop/close button

### AI request works

- [ ] `.env.local` has a real key locally, or Vercel env var set for the environment
- [ ] Step 4 "View my assessment" renders a roadmap from `/api/roadmap`
- [ ] `npx vercel dev` runs the edge function locally with a valid key
- [ ] **Failure path:** with no key, `/api/roadmap` returns a generic error and the client shows the deterministic fallback roadmap (no crash, no raw error text)

### WhatsApp CTA works

- [ ] Landing, navbar, footer, dashboard cards, notifications, and services CTAs open `https://wa.me/<number>?text=<prefilled message>` in a new tab
- [ ] Message preview includes the expected project/service context
- [ ] Number is the intended business number (`2348127251853` from `services/whatsapp.ts`); contact email `permitflowinfo@gmail.com` renders as a `mailto:` link in the footer

### Error handling works

- [ ] Force a render error → `ErrorBoundary` shows branded recovery screen with Refresh/Go Home
- [ ] No uncaught exceptions in the browser console during the walkthrough above
- [ ] Corrupted `localStorage` key is handled (recovery path does not crash)
- [ ] Page still fully functional with AI disabled (fallback roadmap path)

---

## Go/no-go

All boxes above checked on the **preview** URL → promote to production.
Any failure in **A1–A4** blocks the release.