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
