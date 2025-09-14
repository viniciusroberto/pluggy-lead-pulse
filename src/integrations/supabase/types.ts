export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chat_pluggy: {
        Row: {
          created_at: string
          encerrado: boolean | null
          id: number
          mensagem: string | null
          nome: string | null
          telefone: number | null
          timestamp: string | null
          tipo_msg: string | null
        }
        Insert: {
          created_at?: string
          encerrado?: boolean | null
          id?: number
          mensagem?: string | null
          nome?: string | null
          telefone?: number | null
          timestamp?: string | null
          tipo_msg?: string | null
        }
        Update: {
          created_at?: string
          encerrado?: boolean | null
          id?: number
          mensagem?: string | null
          nome?: string | null
          telefone?: number | null
          timestamp?: string | null
          tipo_msg?: string | null
        }
        Relationships: []
      }
      controle_leads: {
        Row: {
          atividade: string | null
          criado_no_hubspot: boolean | null
          data_criacao: string | null
          email: string | null
          followup_status: number | null
          id: number
          nome: string | null
          nps: number | null
          nps_feedback: string | null
          nps_score: number | null
          origem: string | null
          solucao: string | null
          tamanho: string | null
          telefone: number
          timestamp: string | null
          ultima_msg: string | null
          ultimo_tipo_msg: string | null
        }
        Insert: {
          atividade?: string | null
          criado_no_hubspot?: boolean | null
          data_criacao?: string | null
          email?: string | null
          followup_status?: number | null
          id?: number
          nome?: string | null
          nps?: number | null
          nps_feedback?: string | null
          nps_score?: number | null
          origem?: string | null
          solucao?: string | null
          tamanho?: string | null
          telefone: number
          timestamp?: string | null
          ultima_msg?: string | null
          ultimo_tipo_msg?: string | null
        }
        Update: {
          atividade?: string | null
          criado_no_hubspot?: boolean | null
          data_criacao?: string | null
          email?: string | null
          followup_status?: number | null
          id?: number
          nome?: string | null
          nps?: number | null
          nps_feedback?: string | null
          nps_score?: number | null
          origem?: string | null
          solucao?: string | null
          tamanho?: string | null
          telefone?: number
          timestamp?: string | null
          ultima_msg?: string | null
          ultimo_tipo_msg?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name: string
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      follow_up_mensagens_sem_intervalo: {
        Row: {
          created_at: string | null
          encerrado: boolean | null
          id: number | null
          mensagem: string | null
          nome: string | null
          telefone: number | null
          timestamp: string | null
          tipo_msg: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_daily_leads: {
        Args: Record<PropertyKey, never>
        Returns: {
          dia: string
          leads: number
        }[]
      }
      get_hourly_volume: {
        Args: Record<PropertyKey, never>
        Returns: {
          hora: number
          volume: number
        }[]
      }
      get_leads_by_period: {
        Args: { end_date: string; granularity?: string; start_date: string }
        Returns: {
          leads: number
          periodo: string
        }[]
      }
      get_mensagens_processadas: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_taxa_abandono: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_total_leads: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
