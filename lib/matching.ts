import { Scholarship, ScholarshipWithMatch, User } from "./types";

export function computeMatchScore(
  scholarship: Scholarship,
  user: User
): number {
  let score = 0;

  // +40 if level matches
  if (scholarship.level === user.level) {
    score += 40;
  }

  // +30 if field matches (case-insensitive partial match)
  if (
    scholarship.field.toLowerCase() === user.field_of_study.toLowerCase() ||
    scholarship.field.toLowerCase().includes(user.field_of_study.toLowerCase()) ||
    user.field_of_study.toLowerCase().includes(scholarship.field.toLowerCase())
  ) {
    score += 30;
  }

  // +20 if country matches preferred countries
  if (
    user.preferred_countries &&
    user.preferred_countries.some(
      (c) => c.toLowerCase() === scholarship.country.toLowerCase()
    )
  ) {
    score += 20;
  }

  // +10 random boost (for variety)
  score += Math.floor(Math.random() * 10);

  return Math.min(score, 100);
}

export function sortScholarshipsByMatch(
  scholarships: Scholarship[],
  user: User
): ScholarshipWithMatch[] {
  const scored = scholarships.map((s) => ({
    ...s,
    match_score: computeMatchScore(s, user),
  }));

  return scored.sort((a, b) => b.match_score - a.match_score);
}
