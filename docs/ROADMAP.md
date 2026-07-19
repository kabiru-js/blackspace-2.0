# Blackspace — Production Roadmap

---

## Phase 1: Ship It (2-3 days)

| # | Task | Status |
|---|---|---|
| 1.1 | **Landing page at `/`** — marketing page with hero, features, CTA. Users see this before login. | ✅ |
| 1.2 | **DeepSeek live scholarship pipeline** — AI discovers real, currently-open scholarships matching user profiles. Parses into schema, saves to Supabase. App no longer depends on static seed data. | ✅ |
| 1.3 | **Add `middleware.ts`** — protect routes server-side. Block unauthenticated users from `/swipe`, `/saved` before page renders. | ✅ |
| 1.4 | **Rate limit `/api/generate-essay` + `/api/discover-scholarships`** — 5 req/user/min via in-memory rate limiter. | ✅ |
| 1.5 | **Remove all `supabase: any`** — run `npx supabase gen types`, replace every `any` with generated types across 8 files. | ⬜ |
| 1.6 | **Add `error.tsx` per route** — a single card crash shouldn't white-screen the entire app. | ✅ |
| 1.7 | **Add `loading.tsx` per route** — skeleton loaders matching card layouts on `/saved` and `/swipe`. | ✅ |
| 1.8 | **Fix favicon + PWA metadata** — added `favicon.svg`, metadata icons config. | ✅ |
| 1.9 | **Deploy to Vercel** — connect GitHub, set env vars, ship to `blackspace.vercel.app`. | ⬜ |

---

## Phase 2: Polish the UX (3-4 days)

| # | Task | Status |
|---|---|---|
| 2.1 | **Empty state illustrations** — SVG graphics for "No saved scholarships", "All caught up". CTA copy that converts. | ⬜ |
| 2.2 | **Skeleton loaders everywhere** — match card dimensions, replace all spinners. | ⬜ |
| 2.3 | **Swipe undo** — "Undo" toast for 3s after swiping. | ⬜ |
| 2.4 | **Mobile QA** — test on iPhone SE, Galaxy, iPad. Fix overflow, tap targets, card sizing. | ⬜ |
| 2.5 | **Keyboard navigation** — ← → to swipe, Enter to like, Escape to pass, Tab through saved. | ⬜ |
| 2.6 | **Profile page** — `/profile` to edit name, country, level, field, goals, preferred countries. | ⬜ |
| 2.7 | **Logout confirmation dialog** — "Your saved matches will be preserved." | ⬜ |
| 2.8 | **Deadline sort on `/saved`** — "Sort by: match score / deadline (soonest)". | ⬜ |

---

## Phase 3: Trust & Scale (3-5 days)

| # | Task | Status |
|---|---|---|
| 3.1 | **Error monitoring** — `@sentry/nextjs` for crash tracking. | ⬜ |
| 3.2 | **Analytics** — PostHog or Plausible. Funnel: signup → onboarding → swipe → AI generation. | ⬜ |
| 3.3 | **Supabase PITR** — enable point-in-time recovery ($16/mo). | ⬜ |
| 3.4 | **DB indexes** — `swipes.created_at`, `applications.created_at`, `scholarships.deadline`. | ⬜ |
| 3.5 | **Code splitting** — `next/dynamic` for ApplicationModal, AI logic. First-load JS from 87kB to <50kB. | ⬜ |
| 3.6 | **Env validation at build** — fail build with clear error if keys are missing. | ⬜ |
| 3.7 | **CSP headers** — `connect-src` restricted to Supabase + DeepSeek only. | ⬜ |

---

## Phase 4: Retention & Growth (1-2 weeks)

| # | Task | Status |
|---|---|---|
| 4.1 | **Deadline reminder emails** — Edge Function cron every 6h. Notify on 3/7/14-day deadlines via Resend. | ⬜ |
| 4.2 | **Weekly scholarship digest** — "3 new scholarships match your profile" email. | ⬜ |
| 4.3 | **Shareable match cards** — OG image per scholarship, shareable on Twitter/WhatsApp. | ⬜ |
| 4.4 | **AI profile enrichment** — DeepSeek suggests profile improvements after onboarding. | ⬜ |
| 4.5 | **Application checklist per scholarship** — ☐ CV, ☐ Essay, ☐ Submitted. Progress bar. | ⬜ |
| 4.6 | **Daily swipe limit + streak** — gamified engagement mechanic. | ⬜ |

---

## Phase 5: Enterprise / Team (ongoing)

| # | Task | Status |
|---|---|---|
| 5.1 | **Cypress test suite** — signup → onboarding → swipe → saved → apply. | ⬜ |
| 5.2 | **CI/CD** — GitHub Actions: lint → typecheck → build → preview deploy. Block PRs on fail. | ⬜ |
| 5.3 | **Scholarship admin dashboard** — CRUD scholarships without `pnpm seed`. Admin RLS role. | ⬜ |
| 5.4 | **i18n** — `next-intl` for multi-language. | ⬜ |
| 5.5 | **SOC 2 / GDPR** — data deletion, privacy policy, cookie consent, data export. | ⬜ |

---

## Suggested Sprint Order

```
Week 1: Phase 1 (all) → deploy to Vercel
Week 2: Phase 1 complete + Phase 2.1–2.5
Week 3: Phase 2.6–2.8 + Phase 3.1–3.3
Week 4: Phase 3.4–3.7 + Phase 4.1–4.2
```
