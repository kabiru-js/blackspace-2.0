# Blackspace v3 — Pivot Migration Plan

## Overview

Current state: Scholarship-only app deployed on Vercel.
Target state: Universal opportunity engine (jobs, scholarships, fellowships, internships, grants, creative, athletic).

---

## Phase 0: Foundation Migration (2-3 days)

> Schema + types + seed. No UI changes yet. App still works during migration.

### 0.1 — Database: `scholarships` → `opportunities`

```sql
-- Add category to scholarships (non-breaking)
ALTER TABLE scholarships ADD COLUMN category TEXT DEFAULT 'academic';

-- Add new fields
ALTER TABLE scholarships ADD COLUMN salary TEXT;          -- for jobs
ALTER TABLE scholarships ADD COLUMN location TEXT;       -- city/region
ALTER TABLE scholarships ADD COLUMN remote BOOLEAN;      -- remote flag
ALTER TABLE scholarships ADD COLUMN requirements TEXT;   -- skills/experience

-- Rename field_of_study for broader use
-- (Keep as-is, use creatively)

-- Add to users:
ALTER TABLE users ADD COLUMN skills TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN category_focus TEXT[] DEFAULT '{academic}';
ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';
```

### 0.2 — Update Types

| Current | New |
|---|---|
| `Scholarship` | `Opportunity` |
| `ScholarshipWithMatch` | `OpportunityWithMatch` |
| `funding_type` | added `salary`, `remote` fields |
| `StudyLevel` | expanded to include `early_career`, `mid_career` |

### 0.3 — Update `database.types.ts`

Add new columns and the `opportunities` table type.

### 0.4 — Seed New Data (100+ opportunities)

| Category | Count | Examples |
|---|---|---|
| Academic | 15 | Chevening, DAAD, Fulbright (carried over) |
| Professional | 15 | Google internships, McKinsey fellowships, remote dev jobs |
| Creative | 15 | Sundance grants, Adobe residencies, D&AD awards |
| Athletic | 10 | NCAA trials, Olympic solidarity grants, sports scholarships |
| Grants | 15 | Startup grants, research funding, art commissions |
| Fellowships | 15 | Schwarzman, Skoll, Ashoka, journalism fellowships |
| Internships | 15 | Big tech, UN, NGO internships |

### 0.5 — Migrate Existing API Routes

- `/api/discover-scholarships` → `/api/discover-opportunities` + support category parameter
- `/api/generate-essay` → adaptable per category (job cover letter, grant proposal, etc.)

---

## Phase 1: Smart Match Evolution (3-4 days)

> Expand the swipe experience to all categories. Same core loop, broader content.

### 1.1 — Category Filter on Swipe

- Filter pills: `All | Academic | Professional | Creative | Athletic | Grants | Fellowships | Internships`
- `SwipeDeck` loads opportunities filtered by selected category
- Category stored in user preferences

### 1.2 — Updated Card UI

Adapt card per category:

| Category | Card highlights |
|---|---|
| Academic | Funding type, deadline, level |
| Professional | Salary, remote, company, location |
| Creative | Grant amount, deadline, medium |
| Athletic | Trial date, age range, sport |

Single `OpportunityCard` component with category-aware rendering.

### 1.3 — Expanded Match Algorithm

| Signal | Weight |
|---|---|
| Category match | +25 |
| Level/experience match | +25 |
| Field/skills match | +20 |
| Country match | +20 |
| Remote preference | +10 |

### 1.4 — Update Onboarding

Add steps:
- Skills (multi-select tags)
- Category focus (checkboxes: Academic, Professional, Creative, Athletic)

### 1.5 — Rename Pages

- `/swipe` → `/discover` (or keep `/swipe`, update content)
- All "scholarship" copy → "opportunity"

---

## Phase 2: AI Search Mode (4-5 days)

> The second discovery mode. This is the biggest new feature.

### 2.1 — Dual-Mode Homepage

After onboarding, users land on `/discover` with:

```
┌──────────────────────────────┐
│  [🧠 Smart Match]  [💬 AI Search]  │
├──────────────────────────────┤
│                              │
│   (Swipe deck or AI input)   │
│                              │
└──────────────────────────────┘
```

### 2.2 — AI Search UI

In AI Search mode:
- Text input with examples: *"Fully funded film fellowships in Europe"*
- DeepSeek parses: `{ category: "creative", type: "fellowship", funding: "full", location: "Europe", field: "film" }`
- Results rendered as feed (not swipe — too many)
- Each result expandable to full card

### 2.3 — `/api/ai-search` Route

```
POST /api/ai-search
Body: { query: "remote UI/UX internships for beginners", userId: "..." }
Response: { opportunities: [...], parsed: { category, level, location, ... } }
```

### 2.4 — Search History + Suggestions

- Recent searches saved per user
- Suggested prompts based on profile: *"Based on your creative arts profile: try 'artist residencies in Berlin'"*

### 2.5 — Result Feed UI

- Grid/list layout for search results
- Filter sidebar: category, funding, remote, location
- "Save" button per result (adds to saved)

---

## Phase 3: AI Action Layer (4-5 days)

> Help users act on opportunities — not just find them.

### 3.1 — Multi-Category Application Generation

| Category | AI generates |
|---|---|
| Academic | Personal statement + motivation letter |
| Professional | Cover letter + resume optimization tips |
| Creative | Artist statement + portfolio notes |
| Athletic | Athlete bio + achievement summary |
| Grants/Fellowships | Proposal draft + project summary |

### 3.2 — Smart Generation Router

`/api/generate-application` inspects the opportunity category and calls different prompt templates.

### 3.3 — Application Tracker

Per saved opportunity:
```
☐ Documents uploaded
☐ AI draft generated
☐ Submitted
```

Progress bar on each saved card.

---

## Phase 4: Polish & Launch (3-4 days)

### 4.1 — Copy Audit

- Replace all "scholarship" references with "opportunity"
- Update landing page: "Opportunities Worth Swipe Right For"
- Update email templates

### 4.2 — Landing Page Refresh

```
Old: "Scholarships Worth Swipe Right For"
New: "Opportunities Find You"

Categories: Academic · Professional · Creative · Athletic · Grants
```

### 4.3 — SEO + Metadata

- OG tags per opportunity category
- /opportunities/[id] shareable URLs
- Sitemap

### 4.4 — Performance

- Paginated search results
- Debounced AI search input
- Cache parsed search intents

---

## Migration Risk Matrix

| Risk | Impact | Mitigation |
|---|---|---|
| DB migration breaks existing data | High | Use ALTER TABLE (additive only), never DROP |
| Renamed types break entire codebase | High | Create new types alongside old, deprecate old after migration |
| AI Search mode feels disjointed from Smart Match | Medium | Share saved list, share profile, unified card component |
| Scope creep | Medium | Phase 2 (AI Search) is the MVP differentiator. Phase 3-4 can be post-launch |

---

## Suggested Implementation Order

```
Week 1: Phase 0 (schema, types, seed, API migration)
Week 2: Phase 1 (Smart Match expansion, categories, onboarding)
Week 3: Phase 2 (AI Search mode, dual-homepage)
Week 4: Phase 3 (multi-category AI generation) + Phase 4 (polish)
```
