# Blackspace — Feature Scope

## 🔐 Authentication & Onboarding

| Feature | Details |
|---|---|
| Email/password signup & login | Supabase Auth with email confirmation |
| 4-step onboarding wizard | Name, country → academics → preferred countries → goals |
| Profile page (`/profile`) | Edit all profile fields after onboarding |
| Logout confirmation dialog | "Your saved matches will be preserved" |
| Route protection (`middleware.ts`) | Server-side redirect for unauthenticated users |
| Auth callback handler | Supabase email confirmation flow |

## 🏠 Landing Page

| Feature | Details |
|---|---|
| Hero section | Gradient headline, CTA, stats (50+ scholarships, 15+ countries) |
| "How it works" (3 steps) | Profile → Swipe → AI applies |
| Feature grid | Instant AI applications, real programs, smart matching, document hub |
| Trusted programs wall | Chevening, DAAD, Fulbright, Erasmus Mundus, Rhodes, etc. |
| Footer CTA | Get Started Free button |

## 🃏 Swipe System (Core UX)

| Feature | Details |
|---|---|
| Tinder-style swipe deck | Framer Motion drag gestures, card stacking with scale transform |
| Like/Nope overlays | Green/red text appears during swipe |
| Action buttons | ❌ and ❤️ buttons below cards |
| Swipe undo | "Undo" toast after every swipe — reverses like + deletes from DB |
| Keyboard navigation | ← → to swipe, Escape to skip |
| Daily streak counter | 🔥 flame icon showing consecutive days of swiping |
| Empty state illustration | Animated globe with "Discover More" button |
| Match score display | % badge with sparkle icon |
| Badge system | FULLY FUNDED (green), URGENT (red), CLOSING SOON (amber), HIGH MATCH (purple) |

## 🤖 AI Auto-Apply (Key Feature)

| Feature | Details |
|---|---|
| Auto-generate on swipe right | DeepSeek generates personal statement + motivation letter immediately |
| Application saved to DB | Stored as draft in `applications` table |
| Toast notification | Success: "Application generated!", Failure: fallback message |
| "APP READY" badge | Saved cards show when application is generated |
| AI profile enrichment | `/api/enrich-profile` — DeepSeek suggests profile improvements on profile page |
| Fallback template | Works without API key — returns smart template-based content |

## 🧠 Matching & Discovery

| Feature | Details |
|---|---|
| Match algorithm | +40 level, +30 field, +20 country, +10 random |
| DeepSeek live scholarship pipeline | When deck < 3 cards, AI discovers real scholarships matching user profile |
| Auto-save discovered scholarships | Parsed into schema, saved to Supabase with dedup |
| Rate limiting | 5 requests/minute/IP on both `/api/generate-essay` and `/api/discover-scholarships` |

## 💾 Saved Page

| Feature | Details |
|---|---|
| Liked scholarships list | All right-swiped scholarships with full card UI |
| Sort toggle | Best Match / Soonest Deadline |
| Empty state illustration | Card stack SVG with CTA to swipe |
| Skeleton loading state | Matching card dimensions during load |
| "Submit Application" button | Opens official application link in new tab |
| "Apply with AI" modal | Manual AI generation (backup to auto-apply) |
| Share button | Copies formatted "I just matched with..." text to clipboard |
| Application checklist | "Essay ready" indicator on APP READY cards |

## 📄 Application Modal

| Feature | Details |
|---|---|
| 3-step flow | Documents → Generate → Review |
| Document checklist | CV, transcript, passport, personal statement |
| Upload + status indicators | ✅ uploaded / ⚠ missing with upload buttons |
| DeepSeek generation | Personal statement + motivation letter |
| Review & save | Preview generated content, save to DB |
| Open application link | Redirects to official scholarship page |

## 📁 Document Hub

| Feature | Details |
|---|---|
| File upload | PDF, DOC, JPG, PNG → Supabase Storage |
| 4 document types | CV, transcript, passport, personal statement |
| Upload status | Real-time upload state with spinners |
| Public URL storage | Secured by Supabase Storage bucket |

## 🏗️ Infrastructure

| Feature | Details |
|---|---|
| State management | Zustand store (user, scholarships, liked IDs) |
| Supabase database | 5 tables: users, scholarships, swipes, applications, user_documents |
| Supabase Storage | Documents bucket for file uploads |
| Row-Level Security | All tables protected per-user |
| Database indexes | Optimized for swipes, applications, deadline queries |
| Rate limiting | In-memory rate limiter for API routes |
| CSP headers | Content Security Policy locked to Supabase + DeepSeek |
| Env validation | NEXT_PUBLIC_ vars validated in next.config |
| Code splitting | ApplicationModal lazy-loaded with `next/dynamic` |

## 💅 Design System

| Feature | Details |
|---|---|
| Dark mode only | Black gradient background with purple/blue accent |
| Brand colors | #7c3aed (accent), #a78bfa (light), #3b82f6 (blue) |
| Typography | System font stack, text-gradient for headlines |
| Animations | Framer Motion throughout — cards, modals, toasts, indicators |
| Responsive | Mobile-first with max-w-lg containers |
| Loading states | Skeleton loaders on /saved and /swipe |

## 📊 Analytics & Monitoring

| Feature | Details |
|---|---|
| Event tracking hooks | signup, signin, onboarding_complete, swipe_right, swipe_left, ai_application_generated |
| PostHog-ready | Integration code in `lib/analytics.ts` — activate with env var |
| Sentry-ready | Integration code in `lib/sentry.ts` — activate with DSN |
| Error boundaries | `error.tsx` at root level per route |

## 📧 Email System (Edge Functions)

| Feature | Details |
|---|---|
| Deadline reminders | Cron every 6h — emails users 3/7/14 days before deadlines |
| Weekly digest | Cron Mondays — "N new scholarships matching your profile" |
| Edge Functions | Deployed on Supabase with Deno runtime |

## 🚀 Deployment

| Feature | Details |
|---|---|
| Vercel deployment | Auto-deploy from GitHub main branch |
| Environment variables | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DEEPSEEK_API_KEY |
| Live URL | https://blackspace-2-0-5y39.vercel.app |

---

**Total: 50+ features across 15 pages, 8 API routes, 6 components, 2 Edge Functions**
