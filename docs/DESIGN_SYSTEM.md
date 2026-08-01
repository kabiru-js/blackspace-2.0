# Blackspace Design System — Agent Reference

## Colors
| Token | Value | Usage |
|---|---|---|
| Obsidian (bg) | `#000000` | Page canvas, nav, full-bleed sections |
| Bone (text) | `#faf9f6` | Primary text — warm off-white, never pure white |
| Phosphor Violet | `#cbb0f7` | Icons, links, code accents, category badges — **never** for filled buttons |
| Ash Mid | `#b4b4b2` | Secondary text, ghost button text |
| Ash | `#868684` | Body copy, muted descriptions |
| Iron | `#666469` | Tertiary text, footers, metadata |
| Ink | `#080808` | Text on white buttons |
| Graphite | `#121212` | Section backgrounds |
| Onyx | `#1e1e1d` | Card surfaces, borders |
| Carbon | `#333333` | Input borders, tag outlines |

## Typography
- **Font**: Inter (system-ui fallback)
- **Weights**: 400 (body), 500-600 (emphasis), 700 (bold only in specific contexts)
- **Scale**: 10, 12, 13, 14, 16, 18, 20, 24, 32, 42, 56px
- **Tracking**: Negative at large sizes (-2.24px at 56px, -1.13px at 42px), neutral at body sizes
- **Line height**: 0.96 (display) to 1.38 (body)

## Shapes
| Element | Radius |
|---|---|
| Buttons (filled & ghost) | `33px` |
| Tags / chips | `50px` (full pill) |
| Cards | `20px` |
| Testimonial cards | `7px` |
| Icons | `4px` |

## Elevation — Flat Only
- **No drop shadows, no blur, no glassmorphism**
- Depth comes from surface stepping: `#000000` → `#121212` → `#1e1e1d` → `#333333`
- Separators: 1px hairline borders in `#1e1e1d`

## Components
- **Filled Button**: `#ffffff` bg, `#080808` text, 33px radius, Inter 14px weight 500
- **Ghost Button**: transparent bg, 1px `#333333` border, `#b4b4b2` text, 33px radius
- **Pill Tag**: transparent bg, 1px `#333333` border, 10px Inter uppercase tracking 0.1em
- **Card**: `#1e1e1d` bg, 1px `#1e1e1d` border, 20px radius, 24px padding

## Rules
- NEVER use pure white (`#ffffff`) for text — always `#faf9f6`
- NEVER add gradients, drop shadows, or blur to UI surfaces
- NEVER use Phosphor Violet (`#cbb0f7`) for filled buttons or large backgrounds
- NEVER use chromatic accent colors — the system is monochrome + violet only
- Match spacing to the compact scale: 4-40px increments
- Inter font only, weight 400 by default

## Current App Pages
- `/` — Landing page (hero, category cards, testimonials, CTA)
- `/login` — Auth page (needs Warp restyling)
- `/onboarding` — 4-step profile setup (needs Warp restyling)
- `/swipe` — Smart Match + AI Search dual mode (needs Warp restyling)
- `/saved` — Saved opportunities (needs Warp restyling)
- `/profile` — User profile editor (needs Warp restyling)

## Component Files
- `components/BlackspaceLogo.tsx` — SVG orbital logo
- `components/SwipeCard.tsx` — Swipeable opportunity card
- `components/SwipeDeck.tsx` — Card stack manager
- `components/DetailView.tsx` — Tap-to-expand detail modal
- `components/AISearch.tsx` — AI Search UI
- `components/ApplicationModal.tsx` — AI apply flow
- `components/Navbar.tsx` — Bottom nav
- `components/Providers.tsx` — Auth + store wrapper

## Files to Restyle for Consistency
Priority order:
1. `app/login/page.tsx`
2. `app/onboarding/page.tsx`
3. `app/swipe/page.tsx` + `components/SwipeCard.tsx`
4. `app/saved/page.tsx`
5. `app/profile/page.tsx`
