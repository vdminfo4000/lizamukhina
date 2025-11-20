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
      asset_comments: {
        Row: {
          asset_id: string
          asset_type: string
          company_id: string
          created_at: string
          id: string
          message: string
          user_id: string
          user_name: string
        }
        Insert: {
          asset_id: string
          asset_type: string
          company_id: string
          created_at?: string
          id?: string
          message: string
          user_id: string
          user_name: string
        }
        Update: {
          asset_id?: string
          asset_type?: string
          company_id?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          module: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          module: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          module?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          director: string | null
          email: string | null
          id: string
          inn: string | null
          legal_address: string | null
          name: string
          ogrn: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          director?: string | null
          email?: string | null
          id?: string
          inn?: string | null
          legal_address?: string | null
          name: string
          ogrn?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          director?: string | null
          email?: string | null
          id?: string
          inn?: string | null
          legal_address?: string | null
          name?: string
          ogrn?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_contacts: {
        Row: {
          address: string | null
          company_id: string
          contact_type: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          organization: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          contact_type: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          contact_type?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_documents: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          tags: string[] | null
          uploaded_by: string
          uploader_name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          tags?: string[] | null
          uploaded_by: string
          uploader_name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          tags?: string[] | null
          uploaded_by?: string
          uploader_name?: string
        }
        Relationships: []
      }
      crm_emails: {
        Row: {
          attachments: Json | null
          body: string
          company_id: string
          created_at: string
          direction: string
          from_email: string
          id: string
          is_read: boolean | null
          subject: string
          to_email: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          body: string
          company_id: string
          created_at?: string
          direction: string
          from_email: string
          id?: string
          is_read?: boolean | null
          subject: string
          to_email: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          body?: string
          company_id?: string
          created_at?: string
          direction?: string
          from_email?: string
          id?: string
          is_read?: boolean | null
          subject?: string
          to_email?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_messages: {
        Row: {
          channel_id: string | null
          company_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string | null
          sender_id: string
          sender_name: string
        }
        Insert: {
          channel_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id?: string | null
          sender_id: string
          sender_name: string
        }
        Update: {
          channel_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string | null
          sender_id?: string
          sender_name?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          company_id: string
          content: string
          created_at: string | null
          created_by: string
          file_url: string | null
          id: string
          is_file_template: boolean | null
          name: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string | null
          created_by: string
          file_url?: string | null
          id?: string
          is_file_template?: boolean | null
          name: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string | null
          created_by?: string
          file_url?: string | null
          id?: string
          is_file_template?: boolean | null
          name?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          company_id: string
          created_at: string
          id: string
          model: string | null
          name: string
          status: string | null
          type: string
          updated_at: string
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          model?: string | null
          name: string
          status?: string | null
          type: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          model?: string | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          address: string | null
          capacity: string | null
          company_id: string
          created_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          name: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          capacity?: string | null
          company_id: string
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name: string
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          capacity?: string | null
          company_id?: string
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string
          created_by_name: string
          file_name: string
          file_url: string
          filled_data: Json | null
          id: string
          template_id: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by: string
          created_by_name: string
          file_name: string
          file_url: string
          filled_data?: Json | null
          id?: string
          template_id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string
          created_by_name?: string
          file_name?: string
          file_url?: string
          filled_data?: Json | null
          id?: string
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          api_key: string | null
          api_secret: string | null
          company_id: string
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          platform_name: string
          platform_type: string
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          company_id: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform_name: string
          platform_type: string
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          company_id?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform_name?: string
          platform_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_listings: {
        Row: {
          additional_info: string | null
          category: string | null
          company_id: string
          contact_info: Json | null
          created_at: string
          crop: string
          description: string | null
          harvest_year: number | null
          id: string
          inquiries: number
          listing_type: string | null
          location: string | null
          price: number
          quality: string | null
          quantity: number
          status: string
          title: string | null
          unit: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          additional_info?: string | null
          category?: string | null
          company_id: string
          contact_info?: Json | null
          created_at?: string
          crop: string
          description?: string | null
          harvest_year?: number | null
          id?: string
          inquiries?: number
          listing_type?: string | null
          location?: string | null
          price: number
          quality?: string | null
          quantity: number
          status?: string
          title?: string | null
          unit?: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          additional_info?: string | null
          category?: string | null
          company_id?: string
          contact_info?: Json | null
          created_at?: string
          crop?: string
          description?: string | null
          harvest_year?: number | null
          id?: string
          inquiries?: number
          listing_type?: string | null
          location?: string | null
          price?: number
          quality?: string | null
          quantity?: number
          status?: string
          title?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_sensors: {
        Row: {
          alert_enabled: boolean | null
          battery_level: number | null
          calibration_date: string | null
          created_at: string
          id: string
          last_reading: Json | null
          name: string
          sensor_type: string
          serial_number: string | null
          status: string | null
          threshold_max: number | null
          threshold_min: number | null
          updated_at: string
          zone_id: string
        }
        Insert: {
          alert_enabled?: boolean | null
          battery_level?: number | null
          calibration_date?: string | null
          created_at?: string
          id?: string
          last_reading?: Json | null
          name: string
          sensor_type: string
          serial_number?: string | null
          status?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          updated_at?: string
          zone_id: string
        }
        Update: {
          alert_enabled?: boolean | null
          battery_level?: number | null
          calibration_date?: string | null
          created_at?: string
          id?: string
          last_reading?: Json | null
          name?: string
          sensor_type?: string
          serial_number?: string | null
          status?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          updated_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_sensors_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "monitoring_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_zones: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          plot_id: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          plot_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          plot_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_zones_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_zones_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string
          description: string | null
          details: Json | null
          end_date: string | null
          id: string
          name: string
          plan_type: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          details?: Json | null
          end_date?: string | null
          id?: string
          name: string
          plan_type: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          details?: Json | null
          end_date?: string | null
          id?: string
          name?: string
          plan_type?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plots: {
        Row: {
          address: string | null
          area: number
          cadastral_number: string
          company_id: string
          created_at: string
          crop: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          name: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          area: number
          cadastral_number: string
          company_id: string
          created_at?: string
          crop?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: number
          cadastral_number?: string
          company_id?: string
          created_at?: string
          crop?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          inn: string | null
          last_name: string | null
          phone: string | null
          position: string | null
          snils: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          inn?: string | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          snils?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          inn?: string | null
          last_name?: string | null
          phone?: string | null
          position?: string | null
          snils?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string
          fields: Json | null
          id: string
          name: string
          template_url: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by: string
          fields?: Json | null
          id?: string
          name: string
          template_url?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string
          fields?: Json | null
          id?: string
          name?: string
          template_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          created_at: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string | null
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
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      get_user_inn: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "closed" | "view" | "edit"
      app_role: "admin" | "user"
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
      access_level: ["closed", "view", "edit"],
      app_role: ["admin", "user"],
    },
  },
} as const
