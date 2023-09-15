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
      card_pool: {
        Row: {
          created_at: string
          deck_id: number
          scryfall_id: string
        }
        Insert: {
          created_at?: string
          deck_id: number
          scryfall_id: string
        }
        Update: {
          created_at?: string
          deck_id?: number
          scryfall_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_pool_deck_id_fkey"
            columns: ["deck_id"]
            referencedRelation: "deck"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_pool_deck_id_fkey"
            columns: ["deck_id"]
            referencedRelation: "card_pool_oracle_with_username"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_pool_deck_id_fkey"
            columns: ["deck_id"]
            referencedRelation: "card_pool_with_username"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_pool_deck_id_fkey"
            columns: ["deck_id"]
            referencedRelation: "decks_with_username"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_pool_scryfall_id_fkey"
            columns: ["scryfall_id"]
            referencedRelation: "scryfall_card"
            referencedColumns: ["id"]
          }
        ]
      }
      card_pool_oracle: {
        Row: {
          created_at: string
          deck_id: number
          oracle_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          deck_id?: number
          oracle_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          deck_id?: number
          oracle_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_pool_oracle_deck_id_fkey"
            columns: ["deck_id"]
            referencedRelation: "deck"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_pool_oracle_deck_id_fkey"
            columns: ["deck_id"]
            referencedRelation: "card_pool_oracle_with_username"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_pool_oracle_deck_id_fkey"
            columns: ["deck_id"]
            referencedRelation: "card_pool_with_username"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_pool_oracle_deck_id_fkey"
            columns: ["deck_id"]
            referencedRelation: "decks_with_username"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_pool_oracle_oracle_id_fkey"
            columns: ["oracle_id"]
            referencedRelation: "oracle_card"
            referencedColumns: ["id"]
          }
        ]
      }
      deck: {
        Row: {
          created_at: string
          id: number
          league_id: number
          moxfield_id: string
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          league_id: number
          moxfield_id: string
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          league_id?: number
          moxfield_id?: string
          name?: string | null
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
      oracle_card: {
        Row: {
          colors: Json | null
          created_at: string
          id: string
          image_uri: string | null
          mana_cost: string | null
          name: string
          oracle_text: string | null
          scryfall_id: string
          type_line: string | null
        }
        Insert: {
          colors?: Json | null
          created_at?: string
          id: string
          image_uri?: string | null
          mana_cost?: string | null
          name: string
          oracle_text?: string | null
          scryfall_id: string
          type_line?: string | null
        }
        Update: {
          colors?: Json | null
          created_at?: string
          id?: string
          image_uri?: string | null
          mana_cost?: string | null
          name?: string
          oracle_text?: string | null
          scryfall_id?: string
          type_line?: string | null
        }
        Relationships: []
      }
      scryfall_card: {
        Row: {
          colors: Json | null
          created_at: string
          id: string
          image_uri: string | null
          mana_cost: string | null
          name: string
          oracle_id: string
          oracle_text: string | null
          type_line: string | null
        }
        Insert: {
          colors?: Json | null
          created_at?: string
          id: string
          image_uri?: string | null
          mana_cost?: string | null
          name: string
          oracle_id: string
          oracle_text?: string | null
          type_line?: string | null
        }
        Update: {
          colors?: Json | null
          created_at?: string
          id?: string
          image_uri?: string | null
          mana_cost?: string | null
          name?: string
          oracle_id?: string
          oracle_text?: string | null
          type_line?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      card_pool_oracle_with_username: {
        Row: {
          discord_name: string | null
          id: number | null
          league_id: number | null
          moxfield_id: string | null
          name: string | null
          oracle_id: string | null
          quantity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "card_pool_oracle_oracle_id_fkey"
            columns: ["oracle_id"]
            referencedRelation: "oracle_card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_league_id_fkey"
            columns: ["league_id"]
            referencedRelation: "league"
            referencedColumns: ["id"]
          }
        ]
      }
      card_pool_with_username: {
        Row: {
          discord_name: string | null
          id: number | null
          league_id: number | null
          moxfield_id: string | null
          name: string | null
          scryfall_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_pool_scryfall_id_fkey"
            columns: ["scryfall_id"]
            referencedRelation: "scryfall_card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_league_id_fkey"
            columns: ["league_id"]
            referencedRelation: "league"
            referencedColumns: ["id"]
          }
        ]
      }
      decks_with_username: {
        Row: {
          discord_name: string | null
          id: number | null
          league_id: number | null
          moxfield_id: string | null
          name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_league_id_fkey"
            columns: ["league_id"]
            referencedRelation: "league"
            referencedColumns: ["id"]
          }
        ]
      }
      distinct_oracle_id_by_league_id: {
        Row: {
          league_id: number | null
          oracle_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_pool_oracle_oracle_id_fkey"
            columns: ["oracle_id"]
            referencedRelation: "oracle_card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_league_id_fkey"
            columns: ["league_id"]
            referencedRelation: "league"
            referencedColumns: ["id"]
          }
        ]
      }
      distinct_scryfall_id_by_league_id: {
        Row: {
          league_id: number | null
          scryfall_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_pool_scryfall_id_fkey"
            columns: ["scryfall_id"]
            referencedRelation: "scryfall_card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_league_id_fkey"
            columns: ["league_id"]
            referencedRelation: "league"
            referencedColumns: ["id"]
          }
        ]
      }
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
