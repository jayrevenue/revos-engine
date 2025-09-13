export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          messages: Json | null
          outcome_notes: string | null
          outcome_rating: number | null
          title: string | null
          token_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          messages?: Json | null
          outcome_notes?: string | null
          outcome_rating?: number | null
          title?: string | null
          token_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          messages?: Json | null
          outcome_notes?: string | null
          outcome_rating?: number | null
          title?: string | null
          token_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_prompts: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          tags: string[] | null
          updated_at: string
          usage_count: number | null
          variables: Json | null
          vertical: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          variables?: Json | null
          vertical?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          variables?: Json | null
          vertical?: string | null
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          engagement_id: string | null
          id: string
          memory_config: Json | null
          model: string
          name: string
          org_id: string | null
          project_id: string | null
          role: string
          status: string
          system_prompt: string | null
          tools: Json | null
          updated_at: string
          usage_stats: Json | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          engagement_id?: string | null
          id?: string
          memory_config?: Json | null
          model?: string
          name: string
          org_id?: string | null
          project_id?: string | null
          role: string
          status?: string
          system_prompt?: string | null
          tools?: Json | null
          updated_at?: string
          usage_stats?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          engagement_id?: string | null
          id?: string
          memory_config?: Json | null
          model?: string
          name?: string
          org_id?: string | null
          project_id?: string | null
          role?: string
          status?: string
          system_prompt?: string | null
          tools?: Json | null
          updated_at?: string
          usage_stats?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company: string
          created_at: string
          created_by: string
          email: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company: string
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company?: string
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      dashboards: {
        Row: {
          created_at: string | null
          data: Json | null
          engagement_id: string | null
          id: string
          org_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          engagement_id?: string | null
          id?: string
          org_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          engagement_id?: string | null
          id?: string
          org_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboards_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      engagements: {
        Row: {
          budget: number | null
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          org_id: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          org_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          org_id?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks: {
        Row: {
          category: string
          content: Json | null
          created_at: string | null
          created_by: string
          description: string | null
          file_url: string | null
          framework_type: string | null
          id: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category: string
          content?: Json | null
          created_at?: string | null
          created_by: string
          description?: string | null
          file_url?: string | null
          framework_type?: string | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          content?: Json | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          file_url?: string | null
          framework_type?: string | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      interventions: {
        Row: {
          actual_impact: string | null
          assigned_to: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          engagement_id: string
          expected_impact: string | null
          id: string
          intervention_type: string | null
          module_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_impact?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          engagement_id: string
          expected_impact?: string | null
          id?: string
          intervention_type?: string | null
          module_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_impact?: string | null
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          engagement_id?: string
          expected_impact?: string | null
          id?: string
          intervention_type?: string | null
          module_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "revos_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          agent_id: string | null
          created_at: string | null
          direction: string
          engagement_id: string | null
          id: string
          message: string | null
          metadata: Json | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          direction: string
          engagement_id?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          direction?: string
          engagement_id?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      outcomes: {
        Row: {
          baseline_value: number | null
          created_at: string | null
          created_by: string
          current_value: number | null
          engagement_id: string
          id: string
          measurement_date: string | null
          metric_name: string
          module_id: string | null
          notes: string | null
          target_value: number | null
          updated_at: string | null
        }
        Insert: {
          baseline_value?: number | null
          created_at?: string | null
          created_by: string
          current_value?: number | null
          engagement_id: string
          id?: string
          measurement_date?: string | null
          metric_name: string
          module_id?: string | null
          notes?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Update: {
          baseline_value?: number | null
          created_at?: string | null
          created_by?: string
          current_value?: number | null
          engagement_id?: string
          id?: string
          measurement_date?: string | null
          metric_name?: string
          module_id?: string | null
          notes?: string | null
          target_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcomes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "revos_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          category: string
          content: Json | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          status: string | null
          steps: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          usage_count: number | null
          version: string | null
          vertical: string | null
        }
        Insert: {
          category: string
          content?: Json | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          status?: string | null
          steps?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          version?: string | null
          vertical?: string | null
        }
        Update: {
          category?: string
          content?: Json | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          status?: string | null
          steps?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          version?: string | null
          vertical?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_library: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          tags: string[] | null
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
          version: string | null
          vertical: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
          version?: string | null
          vertical?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          tags?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
          version?: string | null
          vertical?: string | null
        }
        Relationships: []
      }
      revenue: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          description: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          payment_date: string | null
          payment_status: string
          project_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          payment_date?: string | null
          payment_status?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          payment_date?: string | null
          payment_status?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      revos_modules: {
        Row: {
          created_at: string | null
          created_by: string
          data: Json | null
          description: string | null
          engagement_id: string
          id: string
          module_type: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          data?: Json | null
          description?: string | null
          engagement_id: string
          id?: string
          module_type: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          data?: Json | null
          description?: string | null
          engagement_id?: string
          id?: string
          module_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revos_modules_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | {
              _role: Database["public"]["Enums"]["user_role"]
              _user_id: string
            }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "rev_scientist" | "qa"
      user_role: "admin" | "scientist" | "analyst"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "rev_scientist", "qa"],
      user_role: ["admin", "scientist", "analyst"],
    },
  },
} as const
