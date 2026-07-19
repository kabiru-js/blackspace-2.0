export type StudyLevel = "undergraduate" | "masters" | "phd";
export type FundingType = "full" | "partial";
export type ApplicationStatus = "draft" | "ready" | "submitted";
export type DocumentType = "cv" | "transcript" | "passport" | "personal_statement";

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
  created_at: string;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  level: StudyLevel;
  field: string;
  funding_type: FundingType;
  deadline: string;
  description: string;
  eligibility: string;
  application_link: string;
  tags: string[];
  created_at: string;
}

export interface ScholarshipWithMatch extends Scholarship {
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
