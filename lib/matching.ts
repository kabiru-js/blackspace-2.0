// Blackspace v3 — Multi-category matching engine
import { Opportunity, OpportunityWithMatch, User } from "./types";

export function computeMatchScore(
  opportunity: Opportunity,
  user: User
): number {
  let score = 0;

  // +30 if user's category focus matches
  if (
    user.category_focus &&
    user.category_focus.includes(opportunity.category)
  ) {
    score += 30;
  }

  // +25 type relevance (scholarships for students, jobs for career, etc.)
  const typeMap: Record<string, string[]> = {
    academic: ["scholarship", "fellowship"],
    career: ["job", "internship"],
    creative: ["creative_call", "grant"],
    athletic: ["athletic_trial", "scholarship"],
  };
  const relevantTypes = typeMap[opportunity.category] || [];
  if (relevantTypes.includes(opportunity.type)) {
    score += 25;
  }

  // +20 skills match (stronger weighting)
  if (user.skills && opportunity.skills) {
    const matched = user.skills.filter((skill) =>
      opportunity.skills.some(
        (os) => os.toLowerCase() === skill.toLowerCase()
      )
    );
    score += Math.min(matched.length * 8, 24);
  }

  // +15 location preference
  if (
    user.preferred_countries &&
    user.preferred_countries.some(
      (c) => c.toLowerCase() === opportunity.country.toLowerCase()
    )
  ) {
    score += 15;
  }

  // +10 experience level match
  if (
    opportunity.level &&
    opportunity.level.toLowerCase() === user.level.toLowerCase()
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function sortOpportunitiesByMatch(
  opportunities: Opportunity[],
  user: User
): OpportunityWithMatch[] {
  return opportunities
    .map((o) => ({ ...o, match_score: computeMatchScore(o, user) }))
    .sort((a, b) => b.match_score - a.match_score);
}
