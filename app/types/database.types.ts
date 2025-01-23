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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      oauth_connections: {
        Row: {
          id: string
          user_id: string
          provider: string
          provider_user_id: string
          access_token: string | null
          refresh_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          provider_user_id: string
          access_token?: string | null
          refresh_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          provider_user_id?: string
          access_token?: string | null
          refresh_token?: string | null
          created_at?: string
        }
      }
      wallet_connections: {
        Row: {
          id: string
          user_id: string
          wallet_type: string
          wallet_address: string
          connected: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_type: string
          wallet_address: string
          connected?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_type?: string
          wallet_address?: string
          connected?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_chats: {
        Row: {
          id: string
          user_id: string
          chat_type: string
          messages: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chat_type: string
          messages: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chat_type?: string
          messages?: Json
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          config: Json
          github_repo: string | null
          deployment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          config: Json
          github_repo?: string | null
          deployment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          config?: Json
          github_repo?: string | null
          deployment_url?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
} 