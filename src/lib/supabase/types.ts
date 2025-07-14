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
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          name: string | null
          body: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name?: string | null
          body?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name?: string | null
          body?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          update_at: string | null
          name: string | null
          type: string | null
          user_id: string | null
          body: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          update_at?: string | null
          name?: string | null
          type?: string | null
          user_id?: string | null
          body?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          update_at?: string | null
          name?: string | null
          type?: string | null
          user_id?: string | null
          body?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chats: {
        Row: {
          id: string
          created_at: string
          edited_at: string | null
          body: Json | null
          name: string | null
          profile_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          edited_at?: string | null
          body?: Json | null
          name?: string | null
          profile_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          edited_at?: string | null
          body?: Json | null
          name?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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

// Tipi specifici per i clienti
export interface ClientBody {
  piva?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  cap?: string
  province?: string
  country?: string
  companyType?: string
  notes?: string
}

export interface Client {
  id: string
  created_at: string
  updated_at: string | null
  name: string | null
  body: ClientBody | null
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// Tipi per i messaggi della chat
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Tipo per la struttura del body della chat
export interface ChatBody {
  messages: ChatMessage[]
  metadata?: {
    lastActivity?: string
    messageCount?: number
    [key: string]: unknown
  }
}

// Tipi di utilità per le chat
export type Chat = Database['public']['Tables']['chats']['Row']
export type ChatInsert = Database['public']['Tables']['chats']['Insert']
export type ChatUpdate = Database['public']['Tables']['chats']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Tipo per le chat con informazioni aggiuntive
export interface ChatWithLastMessage extends Chat {
  lastMessage?: string
  unreadCount?: number
  messageCount?: number
}
