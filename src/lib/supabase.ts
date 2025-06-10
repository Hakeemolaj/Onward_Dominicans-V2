import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (you can generate these with Supabase CLI later)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          firstName: string | null
          lastName: string | null
          role: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER'
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          password: string
          firstName?: string | null
          lastName?: string | null
          role?: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER'
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          password?: string
          firstName?: string | null
          lastName?: string | null
          role?: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER'
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      // Add other table types as needed
    }
  }
}
