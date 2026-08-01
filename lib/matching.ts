// Blackspace v4 — Intent-driven personalisation engine
// Scoring: interest(40%) + intent(20%) + location(20%) + behaviour(20%)

import { Opportunity, OpportunityWithMatch, User } from "./types";

export function computeMatchScore(
  opportunity: Opportunity,
  user: User,
  userAffinities?: Record<string, number>,
  userSkippedTags?: Set<string>
): number {
  let score = 0;

  // ── 40% Interest match (tags / keywords overlap) ──
  const userInterests = (user.interests || []).map((s) => s.toLowerCase());
  const oppTags = (opportunity.tags || []).map((s) => s.toLowerCase());
  const matchedInterests = userInterests.filter((i) =>
    oppTags.some((t) => t.includes(i) || i.includes(t))
  );
  if (userInterests.length > 0) {
    score += (matchedInterests.length / Math.max(userInterests.length, 1)) * 40;
  }

  // ── 20% Intent match ──
  const userIntents = user.intents || [];
  const oppIntents = inferIntents(opportunity.type, opportunity.tags || []);

  const matchedIntents = userIntents.filter((i) => oppIntents.includes(i));
  if (userIntents.length > 0 && oppIntents.length > 0) {
    score += (matchedIntents.length / Math.max(userIntents.length, 1)) * 20;
  } else if (userIntents.length === 0) {
    score += 15; // partial credit if user hasn't expressed intents
  }

  // ── 20% Location match ──
  if (
    user.preferred_countries &&
    user.preferred_countries.length > 0 &&
    user.preferred_countries.some(
      (c) => c.toLowerCase() === opportunity.country.toLowerCase()
    )
  ) {
    score += 20;
  } else if (!user.preferred_countries || user.preferred_countries.length === 0) {
    score += 15; // global user — partial credit
  }

  // ── 20% Behaviour / affinity match ──
  if (userAffinities) {
    const tagBoosts = oppTags
      .map((t) => userAffinities[t] || userAffinities[t.toLowerCase()] || 0)
      .filter((v) => v > 0);
    if (tagBoosts.length > 0) {
      const avgBoost = tagBoosts.reduce((a, b) => a + b, 0) / tagBoosts.length;
      score += avgBoost * 20;
    }
  }

  // Penalise skipped tags
  if (userSkippedTags) {
    const skippedOverlap = oppTags.filter((t) => userSkippedTags.has(t) || userSkippedTags.has(t.toLowerCase()));
    score -= skippedOverlap.length * 5;
  }

  // ── Category bonus (internal, invisible to user) ──
  if (user.category_focus && user.category_focus.includes(opportunity.category as any)) {
    score += 5;
  }

  return Math.max(0, Math.min(score, 100));
}

// ── Exploration factor ──
function applyExploration(scored: OpportunityWithMatch[], level: string): OpportunityWithMatch[] {
  const factor = level === "focused" ? 0.05 : level === "balanced" ? 0.15 : 0.25;
  return scored.map((o) => ({
    ...o,
    match_score: Math.round(o.match_score * (1 - factor) + Math.random() * factor * 100),
  }));
}

export function sortOpportunitiesByMatch(
  opportunities: Opportunity[],
  user: User,
  userAffinities?: Record<string, number>,
  userSkippedTags?: Set<string>
): OpportunityWithMatch[] {
  const scored = opportunities.map((o) => ({
    ...o,
    match_score: Math.round(computeMatchScore(o, user, userAffinities, userSkippedTags)),
  }));

  const explored = applyExploration(scored, user.exploration_level || "balanced");
  return explored.sort((a, b) => b.match_score - a.match_score);
}

// ── Relevance floor for the feed ──────────────────────────────
// Without this, a user whose only interest is culinary still gets served
// STEM scholarships / football trials filling out the deck — every
// opportunity is scored, then ranked, but *all* of them appear. This
// function separates genuinely relevant items from everything else and
// only tops up with the rest when relevant inventory is running low.
//   • RELEVANCE_FLOOR: a card must score at least this to be "relevant"
//     (30/100 = a real interest/tag match; ~40 requires intent too).
//   • MIN_FEED_SIZE: if fewer than this many relevant cards exist, the
//     next-best cards fill the gap so the user is never staring at an
//     empty deck while we discover more.
export const RELEVANCE_FLOOR = 30;
export const MIN_FEED_SIZE = 10;

export function rankForFeed(
  opportunities: Opportunity[],
  user: User,
  userAffinities?: Record<string, number>,
  userSkippedTags?: Set<string>
): OpportunityWithMatch[] {
  const scored = opportunities.map((o) => ({
    ...o,
    match_score: Math.round(computeMatchScore(o, user, userAffinities, userSkippedTags)),
  }));

  const hasInterests = (user.interests || []).length > 0 || (user.skills || []).length > 0;

  // User hasn't expressed any interests yet — fall back to plain ranking
  // (with exploration) so we never over-restrict a fresh profile.
  if (!hasInterests) {
    return applyExploration(scored, user.exploration_level || "balanced")
      .sort((a, b) => b.match_score - a.match_score);
  }

  const relevant = scored.filter((o) => o.match_score >= RELEVANCE_FLOOR);
  const irrelevant = scored.filter((o) => o.match_score < RELEVANCE_FLOOR);

  relevant.sort((a, b) => b.match_score - a.match_score);
  irrelevant.sort((a, b) => b.match_score - a.match_score);

  if (relevant.length >= MIN_FEED_SIZE) return relevant;

  // Not enough relevant cards — top up with the best of the rest, but
  // keep them clearly ranked below the genuinely relevant ones.
  const topupCount = Math.min(MIN_FEED_SIZE - relevant.length, irrelevant.length);
  return [...relevant, ...irrelevant.slice(0, topupCount)];
}

// ── Affinity helpers ──
export function updateAffinity(
  current: Record<string, number>,
  tags: string[],
  action: "save" | "skip",
  learningRate: number = 0.1
): Record<string, number> {
  const next = { ...current };
  const delta = action === "save" ? learningRate : -learningRate * 0.5;
  tags.forEach((tag) => {
    const key = tag.toLowerCase();
    next[key] = Math.max(0, Math.min(1, (next[key] || 0.5) + delta));
  });
  return next;
}

// ── Intent pill definitions ──
export const INTENT_PILLS = [
  { key: "for_you", label: "For You", icon: "⚡" },
  { key: "learn", label: "Learn", icon: "📚" },
  { key: "earn", label: "Earn", icon: "💼" },
  { key: "compete", label: "Compete", icon: "🏆" },
  { key: "create", label: "Create", icon: "🎨" },
  { key: "explore", label: "Explore", icon: "🌐" },
];

// ── Centralized intent inference ────────────────────────────
// This is THE single source of truth for "what intent does this
// opportunity serve" — used by both scoring (computeMatchScore) and
// pill filtering (SwipeDeck). It layers three signals so that an
// opportunity NEVER falls through to zero intents just because its
// `type` isn't one of the ~10 known values:
//
//   1. Known type -> intent (fast path, covers common cases)
//   2. Tag keyword match -> intent (covers anything: hackathons,
//      chess tournaments, marathons, spelling bees, game jams...)
//   3. If still nothing matched, no intent is forced — the opportunity
//      simply relies on interest/location/behaviour scoring instead.

const KNOWN_TYPE_TO_INTENT: Record<string, string> = {
  scholarship: "learn",
  fellowship: "learn",
  job: "earn",
  internship: "earn",
  grant: "create",
  creative_call: "create",
  casting_call: "create",
  residency: "create",
  athletic_trial: "compete",
  hackathon: "create",
  competition: "compete",
};

const INTENT_KEYWORDS: Record<string, string[]> = {
  learn: ["scholarship", "fellowship", "course", "study", "academic", "university", "degree", "bootcamp", "training", "workshop", "masterclass"],
  earn: ["job", "hire", "salary", "internship", "apprentice", "paid", "career", "employment", "position"],
  compete: ["trial", "tournament", "competition", "contest", "championship", "hackathon", "league", "match", "race", "marathon", "esports", "chess", "debate", "spelling"],
  create: ["grant", "creative", "gig", "residency", "casting", "build", "design", "hackathon", "art", "film", "music", "exhibition", "gamejam", "jam"],
};

export function inferIntents(type: string | null | undefined, tags: string[]): string[] {
  const intents = new Set<string>();

  // Signal 1: known type
  if (type && KNOWN_TYPE_TO_INTENT[type]) {
    intents.add(KNOWN_TYPE_TO_INTENT[type]);
  }

  // Signal 2: tag keyword overlap (works for ANY type, known or not)
  const haystack = [type || "", ...tags].join(" ").toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) {
      intents.add(intent);
    }
  }

  return Array.from(intents);
}

export function intentPillToTypes(intent: string): string[] {
  switch (intent) {
    case "learn": return ["scholarship", "fellowship"];
    case "earn": return ["job", "internship"];
    case "compete": return ["athletic_trial", "hackathon", "competition"];
    case "create": return ["creative_call", "grant", "casting_call", "residency", "hackathon"];
    case "explore": return [];
    case "for_you":
    default: return [];
  }
}

// Tag keywords used to widen the pill filter beyond the fixed type list
// above — see SwipeDeck's Supabase query. This ensures an opportunity
// with an unrecognized `type` (e.g. "chess_tournament") but tags like
// ["chess", "tournament"] still shows up under the "Compete" pill.
export function intentPillToTagKeywords(intent: string): string[] {
  return INTENT_KEYWORDS[intent] || [];
}

export function intentPillToExploration(intent: string): "focused" | "balanced" | "open" {
  switch (intent) {
    case "for_you": return "focused";
    case "learn": case "earn": return "focused";
    case "compete": case "create": return "balanced";
    case "explore": return "open";
    default: return "balanced";
  }
}
