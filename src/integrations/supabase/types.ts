export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analysis_logs: {
        Row: {
          ai_model_version: string | null
          analysis_result: string
          analysis_timestamp: string
          confidence_score: number
          detected_keywords: string[] | null
          id: string
          processing_time_ms: number | null
          url: string
        }
        Insert: {
          ai_model_version?: string | null
          analysis_result: string
          analysis_timestamp?: string
          confidence_score: number
          detected_keywords?: string[] | null
          id?: string
          processing_time_ms?: number | null
          url: string
        }
        Update: {
          ai_model_version?: string | null
          analysis_result?: string
          analysis_timestamp?: string
          confidence_score?: number
          detected_keywords?: string[] | null
          id?: string
          processing_time_ms?: number | null
          url?: string
        }
        Relationships: []
      }
      blocked_sites: {
        Row: {
          analysis_details: Json | null
          blocked_at: string
          confidence_score: number
          content_category: string | null
          detected_content: string[] | null
          detected_language: string | null
          id: string
          site_type: string
          url: string
        }
        Insert: {
          analysis_details?: Json | null
          blocked_at?: string
          confidence_score: number
          content_category?: string | null
          detected_content?: string[] | null
          detected_language?: string | null
          id?: string
          site_type: string
          url: string
        }
        Update: {
          analysis_details?: Json | null
          blocked_at?: string
          confidence_score?: number
          content_category?: string | null
          detected_content?: string[] | null
          detected_language?: string | null
          id?: string
          site_type?: string
          url?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read_status: boolean | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read_status?: boolean | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read_status?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          accounts_suspended: number | null
          created_at: string
          date: string
          id: string
          links_submitted: number | null
        }
        Insert: {
          accounts_suspended?: number | null
          created_at?: string
          date?: string
          id?: string
          links_submitted?: number | null
        }
        Update: {
          accounts_suspended?: number | null
          created_at?: string
          date?: string
          id?: string
          links_submitted?: number | null
        }
        Relationships: []
      }
      high_alert_profiles: {
        Row: {
          added_at: string
          added_by_admin: boolean | null
          id: string
          notes: string | null
          site_type: string
          url: string
        }
        Insert: {
          added_at?: string
          added_by_admin?: boolean | null
          id?: string
          notes?: string | null
          site_type: string
          url: string
        }
        Update: {
          added_at?: string
          added_by_admin?: boolean | null
          id?: string
          notes?: string | null
          site_type?: string
          url?: string
        }
        Relationships: []
      }
      learning_content: {
        Row: {
          content: string
          description: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          description?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          content?: string
          description?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      updates: {
        Row: {
          content: string
          created_at: string
          created_by_admin: boolean | null
          id: string
          image_url: string | null
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by_admin?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by_admin?: boolean | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      waiting_list: {
        Row: {
          added_at: string
          analysis_details: Json | null
          confidence_score: number
          content_category: string | null
          detected_content: string[] | null
          detected_language: string | null
          id: string
          reviewed: boolean | null
          site_type: string
          url: string
        }
        Insert: {
          added_at?: string
          analysis_details?: Json | null
          confidence_score: number
          content_category?: string | null
          detected_content?: string[] | null
          detected_language?: string | null
          id?: string
          reviewed?: boolean | null
          site_type: string
          url: string
        }
        Update: {
          added_at?: string
          analysis_details?: Json | null
          confidence_score?: number
          content_category?: string | null
          detected_content?: string[] | null
          detected_language?: string | null
          id?: string
          reviewed?: boolean | null
          site_type?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
