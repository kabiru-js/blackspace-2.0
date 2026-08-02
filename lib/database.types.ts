export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          full_name: string;
          country: string;
          level: "undergraduate" | "masters" | "phd" | "early_career" | "mid_career" | "all";
          field_of_study: string;
          gpa: string | null;
          preferred_countries: string[] | null;
          goals: string | null;
          skills: string[] | null;
          category_focus: string[] | null;
          experience_level: string | null;
          interests: string[] | null;
          intents: string[] | null;
          exploration_level: "focused" | "balanced" | "open" | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name: string;
          country: string;
          level: "undergraduate" | "masters" | "phd" | "early_career" | "mid_career" | "all";
          field_of_study: string;
          gpa?: string | null;
          preferred_countries?: string[] | null;
          goals?: string | null;
          skills?: string[] | null;
          category_focus?: string[] | null;
          experience_level?: string | null;
          interests?: string[] | null;
          intents?: string[] | null;
          exploration_level?: "focused" | "balanced" | "open" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string;
          country?: string;
          level?: "undergraduate" | "masters" | "phd" | "early_career" | "mid_career" | "all";
          field_of_study?: string;
          gpa?: string | null;
          preferred_countries?: string[] | null;
          goals?: string | null;
          skills?: string[] | null;
          category_focus?: string[] | null;
          experience_level?: string | null;
          interests?: string[] | null;
          intents?: string[] | null;
          exploration_level?: "focused" | "balanced" | "open" | null;
          created_at?: string;
        };
      };
      scholarships: {
        Row: {
          id: string;
          title: string;
          provider: string;
          country: string;
          category: string | null;
          type: string | null;
          skills: string[] | null;
          is_remote: boolean | null;
          location: string | null;
          level: string;
          field: string;
          funding_type: "full" | "partial" | "paid" | "unpaid";
          deadline: string;
          description: string;
          eligibility: string | null;
          requirements: string | null;
          application_link: string | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          provider: string;
          country: string;
          category?: string | null;
          type?: string | null;
          skills?: string[] | null;
          is_remote?: boolean | null;
          location?: string | null;
          level: string;
          field: string;
          funding_type: "full" | "partial" | "paid" | "unpaid";
          deadline: string;
          description?: string;
          eligibility?: string | null;
          requirements?: string | null;
          application_link?: string | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          provider?: string;
          country?: string;
          category?: string | null;
          type?: string | null;
          skills?: string[] | null;
          is_remote?: boolean | null;
          location?: string | null;
          level?: string;
          field?: string;
          funding_type?: "full" | "partial" | "paid" | "unpaid";
          deadline?: string;
          description?: string;
          eligibility?: string | null;
          requirements?: string | null;
          application_link?: string | null;
          tags?: string[] | null;
          created_at?: string;
        };
      };
      swipes: {
        Row: {
          id: string;
          user_id: string;
          scholarship_id: string;
          liked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scholarship_id: string;
          liked?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scholarship_id?: string;
          liked?: boolean;
          created_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          scholarship_id: string;
          status: "draft" | "ready" | "submitted";
          generated_essay: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scholarship_id: string;
          status?: "draft" | "ready" | "submitted";
          generated_essay?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scholarship_id?: string;
          status?: "draft" | "ready" | "submitted";
          generated_essay?: string | null;
          created_at?: string;
        };
      };
      user_documents: {
        Row: {
          id: string;
          user_id: string;
          type: "cv" | "transcript" | "passport" | "personal_statement";
          file_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "cv" | "transcript" | "passport" | "personal_statement";
          file_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "cv" | "transcript" | "passport" | "personal_statement";
          file_url?: string;
          created_at?: string;
        };
      };
    };
  };
}
