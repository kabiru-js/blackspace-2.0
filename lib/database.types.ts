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
          search_vector: string | null;
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
          search_vector?: string | null;
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
          search_vector?: string | null;
          created_at?: string;
        };
      };
      search_logs: {
        Row: {
          id: string;
          query: string | null;
          keywords: string[] | null;
          result_count: number | null;
          fallback_used: boolean | null;
          clicked_result_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          query?: string | null;
          keywords?: string[] | null;
          result_count?: number | null;
          fallback_used?: boolean | null;
          clicked_result_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          query?: string | null;
          keywords?: string[] | null;
          result_count?: number | null;
          fallback_used?: boolean | null;
          clicked_result_id?: string | null;
          created_at?: string | null;
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
