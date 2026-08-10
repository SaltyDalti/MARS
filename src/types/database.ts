export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "visitor"
  | "verified_performer"
  | "verified_org_admin"
  | "super_admin";

export type ReviewTargetType = "organization" | "staff" | "housing_site";

export type OrgActivityType = "dci" | "wgi";

export type ReviewStatus =
  | "pending_moderation"
  | "published"
  | "flagged";

export type KycStatus = "pending" | "approved" | "rejected";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          division: string | null;
          activity_type: OrgActivityType;
          claimed_by: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          division?: string | null;
          activity_type?: OrgActivityType;
          claimed_by?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          division?: string | null;
          activity_type?: OrgActivityType;
          claimed_by?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_claimed_by_fkey";
            columns: ["claimed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      housing_sites: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          state: string | null;
          claimed_by: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city?: string | null;
          state?: string | null;
          claimed_by?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string | null;
          state?: string | null;
          claimed_by?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "housing_sites_claimed_by_fkey";
            columns: ["claimed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          claimed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          claimed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          claimed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_profiles_claimed_by_fkey";
            columns: ["claimed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          target_type: ReviewTargetType;
          target_id: string;
          author_id: string;
          season_year: number;
          score_overall: number;
          score_demand: number;
          would_recommend: boolean;
          tags: string[];
          written_feedback: string | null;
          status: ReviewStatus;
          reviewer_roles: string[];
          sections: string[];
          staff_reviewee_role: string | null;
          staff_reviewer_relation: string | null;
          responses: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          target_type: ReviewTargetType;
          target_id: string;
          author_id: string;
          season_year: number;
          score_overall: number;
          score_demand: number;
          would_recommend: boolean;
          tags?: string[];
          written_feedback?: string | null;
          status?: ReviewStatus;
          reviewer_roles?: string[];
          sections?: string[];
          staff_reviewee_role?: string | null;
          staff_reviewer_relation?: string | null;
          responses?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          target_type?: ReviewTargetType;
          target_id?: string;
          author_id?: string;
          season_year?: number;
          score_overall?: number;
          score_demand?: number;
          would_recommend?: boolean;
          tags?: string[];
          written_feedback?: string | null;
          status?: ReviewStatus;
          reviewer_roles?: string[];
          sections?: string[];
          staff_reviewee_role?: string | null;
          staff_reviewer_relation?: string | null;
          responses?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      kyc_submissions: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          status: KycStatus;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          storage_path: string;
          status?: KycStatus;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          storage_path?: string;
          status?: KycStatus;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      public_reviews: {
        Row: {
          id: string;
          target_type: ReviewTargetType;
          target_id: string;
          season_year: number;
          score_overall: number;
          score_demand: number;
          would_recommend: boolean;
          tags: string[];
          written_feedback: string | null;
          status: ReviewStatus;
          created_at: string;
          reviewer_roles: string[];
          sections: string[];
          staff_reviewee_role: string | null;
          staff_reviewer_relation: string | null;
          responses: Json;
        };
        Relationships: [];
      };
    };
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      review_target_type: ReviewTargetType;
      review_status: ReviewStatus;
      kyc_status: KycStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

/** Public review payload — intentionally omits author_id */
export type PublicReview = Database["public"]["Views"]["public_reviews"]["Row"];

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type StaffProfile = Database["public"]["Tables"]["staff_profiles"]["Row"];
export type HousingSite = Database["public"]["Tables"]["housing_sites"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
