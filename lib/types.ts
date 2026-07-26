// Blackspace v3 — Unified Opportunity Types

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
  | "athletic_trial";

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
}

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  country: string;

  // v3 fields
  category: OpportunityCategory;
  type: OpportunityType;
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
  academic: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  career: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  creative: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  athletic: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export const TYPE_LABELS: Record<OpportunityType, string> = {
  scholarship: "Scholarship",
  fellowship: "Fellowship",
  job: "Job",
  internship: "Internship",
  grant: "Grant",
  creative_call: "Creative Call",
  athletic_trial: "Athletic Trial",
};
