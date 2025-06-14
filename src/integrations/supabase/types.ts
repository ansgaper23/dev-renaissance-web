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
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password?: string
        }
        Relationships: []
      }
      featured_movies: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          movie_id: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          id?: string
          movie_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          movie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_movies_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: true
            referencedRelation: "most_viewed_movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_movies_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: true
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_views: {
        Row: {
          id: string
          ip_address: unknown | null
          movie_id: string
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          movie_id: string
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          movie_id?: string
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_views_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "most_viewed_movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_views_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          backdrop_path: string | null
          created_at: string | null
          genre_ids: number[] | null
          genres: string[] | null
          id: string
          original_title: string | null
          overview: string | null
          poster_path: string | null
          rating: number | null
          release_date: string | null
          runtime: number | null
          slug: string | null
          stream_servers: Json | null
          stream_url: string | null
          title: string
          tmdb_id: number | null
          trailer_url: string | null
          updated_at: string | null
        }
        Insert: {
          backdrop_path?: string | null
          created_at?: string | null
          genre_ids?: number[] | null
          genres?: string[] | null
          id?: string
          original_title?: string | null
          overview?: string | null
          poster_path?: string | null
          rating?: number | null
          release_date?: string | null
          runtime?: number | null
          slug?: string | null
          stream_servers?: Json | null
          stream_url?: string | null
          title: string
          tmdb_id?: number | null
          trailer_url?: string | null
          updated_at?: string | null
        }
        Update: {
          backdrop_path?: string | null
          created_at?: string | null
          genre_ids?: number[] | null
          genres?: string[] | null
          id?: string
          original_title?: string | null
          overview?: string | null
          poster_path?: string | null
          rating?: number | null
          release_date?: string | null
          runtime?: number | null
          slug?: string | null
          stream_servers?: Json | null
          stream_url?: string | null
          title?: string
          tmdb_id?: number | null
          trailer_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      secrets: {
        Row: {
          id: number
          omdb_api_key: string | null
          tmdb_api_key: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          omdb_api_key?: string | null
          tmdb_api_key: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          omdb_api_key?: string | null
          tmdb_api_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          backdrop_path: string | null
          created_at: string | null
          first_air_date: string | null
          genres: string[] | null
          id: string
          number_of_episodes: number | null
          number_of_seasons: number | null
          original_title: string | null
          overview: string | null
          poster_path: string | null
          rating: number | null
          seasons: Json | null
          status: string | null
          stream_servers: Json | null
          title: string
          tmdb_id: number | null
          updated_at: string | null
        }
        Insert: {
          backdrop_path?: string | null
          created_at?: string | null
          first_air_date?: string | null
          genres?: string[] | null
          id?: string
          number_of_episodes?: number | null
          number_of_seasons?: number | null
          original_title?: string | null
          overview?: string | null
          poster_path?: string | null
          rating?: number | null
          seasons?: Json | null
          status?: string | null
          stream_servers?: Json | null
          title: string
          tmdb_id?: number | null
          updated_at?: string | null
        }
        Update: {
          backdrop_path?: string | null
          created_at?: string | null
          first_air_date?: string | null
          genres?: string[] | null
          id?: string
          number_of_episodes?: number | null
          number_of_seasons?: number | null
          original_title?: string | null
          overview?: string | null
          poster_path?: string | null
          rating?: number | null
          seasons?: Json | null
          status?: string | null
          stream_servers?: Json | null
          title?: string
          tmdb_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      series_views: {
        Row: {
          id: string
          ip_address: unknown | null
          series_id: string
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          series_id: string
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          series_id?: string
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_views_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "most_viewed_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_views_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          ads_code: string | null
          id: number
          logo_url: string | null
          site_description: string | null
          site_name: string | null
          updated_at: string | null
        }
        Insert: {
          ads_code?: string | null
          id?: number
          logo_url?: string | null
          site_description?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Update: {
          ads_code?: string | null
          id?: number
          logo_url?: string | null
          site_description?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      most_viewed_movies: {
        Row: {
          backdrop_path: string | null
          created_at: string | null
          genre_ids: number[] | null
          genres: string[] | null
          id: string | null
          original_title: string | null
          overview: string | null
          poster_path: string | null
          rating: number | null
          release_date: string | null
          runtime: number | null
          stream_servers: Json | null
          stream_url: string | null
          title: string | null
          tmdb_id: number | null
          trailer_url: string | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: []
      }
      most_viewed_series: {
        Row: {
          backdrop_path: string | null
          created_at: string | null
          first_air_date: string | null
          genres: string[] | null
          id: string | null
          number_of_episodes: number | null
          number_of_seasons: number | null
          original_title: string | null
          overview: string | null
          poster_path: string | null
          rating: number | null
          seasons: Json | null
          status: string | null
          stream_servers: Json | null
          title: string | null
          tmdb_id: number | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
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
