export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      deck: {
        Row: {
          created_at: string
          id: number
          league_id: number
          moxfield_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          league_id: number
          moxfield_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          league_id?: number
          moxfield_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_league_id_fkey"
            columns: ["league_id"]
            referencedRelation: "league"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      keztest: {
        Row: {
          created_at: string
          data: string | null
          id: number
        }
        Insert: {
          created_at?: string
          data?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          data?: string | null
          id?: number
        }
        Relationships: []
      }
      league: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
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
