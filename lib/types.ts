// Blackspace v3 — Unified Opportunity Types

// NOTE: these are known/labeled values used for internal scoring bonuses
// and UI badges — they are NOT a closed set. Any opportunity can carry a
// category/type outside this list (see Opportunity.category / .type below,
// which are typed as `string`, not these unions). Tags are the primary,
// unbounded classification mechanism — see Opportunity.tags.
export type OpportunityCategory =
  | "academic"
  | "career"
  | "creative"
  | "athletic";

export type OpportunityType =
  | "scholarship"
  | "fellowship"
  | "job"
  | "internship"
  | "grant"
  | "creative_call"
  | "athletic_trial"
  | "hackathon"
  | "competition"
  | "residency"
  | "other";

export type StudyLevel =
  | "undergraduate"
  | "masters"
  | "phd"
  | "early_career"
  | "mid_career"
  | "all";

export type FundingType = "full" | "partial" | "paid" | "unpaid";
export type ApplicationStatus = "draft" | "ready" | "submitted";
export type DocumentType = "cv" | "transcript" | "passport" | "personal_statement";

// ── Core Entities ──

export interface User {
  id: string;
  email: string;
  full_name: string;
  country: string;
  level: StudyLevel;
  field_of_study: string;
  gpa: string;
  preferred_countries: string[];
  goals: string;
  skills: string[];
  category_focus: OpportunityCategory[];
  experience_level: string;
  created_at: string;
  // v4 — intent-driven fields
  interests: string[];        // "painting", "football", "fashion"
  intents: string[];          // "learn", "earn", "compete", "create"
  exploration_level: "focused" | "balanced" | "open";
}

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  country: string;

  // v4: category/type are open strings — they may hold a known
  // OpportunityCategory/OpportunityType value, or something entirely new
  // (e.g. "esports", "chess tournament", "spelling bee"). Never gate
  // retrieval or scoring on these being one of the known values.
  // `tags` is the field that ALWAYS carries the real classification signal.
  category: OpportunityCategory | string;
  type: OpportunityType | string;
  skills: string[];
  is_remote: boolean;
  location: string;

  // legacy fields (kept for compat)
  level: StudyLevel | string;
  field: string;
  funding_type: FundingType | string;
  deadline: string;
  description: string;
  eligibility: string;
  requirements: string;
  application_link: string;
  tags: string[];
  created_at: string;
}

export interface OpportunityWithMatch extends Opportunity {
  match_score: number;
}

export interface Swipe {
  id: string;
  user_id: string;
  scholarship_id: string;
  liked: boolean;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: ApplicationStatus;
  generated_essay: string | null;
  created_at: string;
}

export interface UserDocument {
  id: string;
  user_id: string;
  type: DocumentType;
  file_url: string;
  created_at: string;
}

// ── Category Display Helpers ──

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  academic: "Academic",
  career: "Professional",
  creative: "Creative",
  athletic: "Athletic",
};

export const CATEGORY_COLORS: Record<OpportunityCategory, string> = {
  academic: "var(--violet)",
  career: "var(--cyan)",
  creative: "var(--magenta)",
  athletic: "var(--orange)",
};

export const TYPE_LABELS: Record<string, string> = {
  scholarship: "Scholarship",
  fellowship: "Fellowship",
  job: "Job",
  internship: "Internship",
  grant: "Grant",
  creative_call: "Creative Call",
  athletic_trial: "Athletic Trial",
  hackathon: "Hackathon",
  competition: "Competition",
  residency: "Residency",
  other: "Opportunity",
};

// Safe label lookup — gracefully handles ANY type string, known or unknown,
// instead of falling through to `undefined` or the raw snake_case value.
export function getTypeLabel(type: string | null | undefined): string {
  if (!type) return "Opportunity";
  if (TYPE_LABELS[type]) return TYPE_LABELS[type];
  // Title-case unknown types: "chess_tournament" -> "Chess Tournament"
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Safe category label lookup, same principle.
export function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return "General";
  if (CATEGORY_LABELS[category as OpportunityCategory]) return CATEGORY_LABELS[category as OpportunityCategory];
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
