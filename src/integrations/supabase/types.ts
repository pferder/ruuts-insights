export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      cattle: {
        Row: {
          average_weight: number;
          cattle_type: string;
          created_at: string;
          farm_id: string;
          id: string;
          method_of_raising: string;
          total_head: number;
          updated_at: string;
        };
        Insert: {
          average_weight: number;
          cattle_type: string;
          created_at?: string;
          farm_id: string;
          id?: string;
          method_of_raising: string;
          total_head: number;
          updated_at?: string;
        };
        Update: {
          average_weight?: number;
          cattle_type?: string;
          created_at?: string;
          farm_id?: string;
          id?: string;
          method_of_raising?: string;
          total_head?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cattle_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          }
        ];
      };
      farms: {
        Row: {
          contact_email: string | null;
          coordinates: Json;
          created_at: string;
          id: string;
          location: string;
          name: string;
          owner_name: string;
          size: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          contact_email?: string | null;
          coordinates: Json;
          created_at?: string;
          id?: string;
          location: string;
          name: string;
          owner_name: string;
          size: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          contact_email?: string | null;
          coordinates?: Json;
          created_at?: string;
          id?: string;
          location?: string;
          name?: string;
          owner_name?: string;
          size?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      pastures: {
        Row: {
          average_pasture_size: number;
          created_at: string;
          current_forage_density: number | null;
          farm_id: string;
          grass_types: string[];
          id: string;
          resting_days_per_pasture: number;
          rotations_per_season: number;
          soil_health_score: number | null;
          total_pastures: number;
          updated_at: string;
        };
        Insert: {
          average_pasture_size: number;
          created_at?: string;
          current_forage_density?: number | null;
          farm_id: string;
          grass_types: string[];
          id?: string;
          resting_days_per_pasture: number;
          rotations_per_season: number;
          soil_health_score?: number | null;
          total_pastures: number;
          updated_at?: string;
        };
        Update: {
          average_pasture_size?: number;
          created_at?: string;
          current_forage_density?: number | null;
          farm_id?: string;
          grass_types?: string[];
          id?: string;
          resting_days_per_pasture?: number;
          rotations_per_season?: number;
          soil_health_score?: number | null;
          total_pastures?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pastures_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          company_name: string | null;
          created_at: string;
          email: string;
          farm_count: number | null;
          id: string;
          location: string | null;
          name: string | null;
          phone_number: string | null;
          updated_at: string;
          user_type: string | null;
        };
        Insert: {
          company_name?: string | null;
          created_at?: string;
          email: string;
          farm_count?: number | null;
          id: string;
          location?: string | null;
          name?: string | null;
          phone_number?: string | null;
          updated_at?: string;
          user_type?: string | null;
        };
        Update: {
          company_name?: string | null;
          created_at?: string;
          email?: string;
          farm_count?: number | null;
          id?: string;
          location?: string | null;
          name?: string | null;
          phone_number?: string | null;
          updated_at?: string;
          user_type?: string | null;
        };
        Relationships: [];
      };
      farm_geospatial: {
        Row: {
          id: string;
          farm_id: string;
          file_name: string;
          file_type: string;
          geometry: any; // PostGIS geometry type
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          file_name: string;
          file_type: string;
          geometry: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          farm_id?: string;
          file_name?: string;
          file_type?: string;
          geometry?: any;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "farm_geospatial_farm_id_fkey";
            columns: ["farm_id"];
            isOneToOne: false;
            referencedRelation: "farms";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      st_centroid: {
        Args: {
          geom: any; // PostGIS geometry type
        };
        Returns: {
          x: number;
          y: number;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
