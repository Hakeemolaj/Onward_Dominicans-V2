import { createClient } from '@supabase/supabase-js'

// Compatible with both Vite and Next.js
const getEnvVar = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[key];
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://zrsfmghkjhxkjjzkigck.supabase.co'
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjQwMDcsImV4cCI6MjA2NTE0MDAwN30.HGkX4r3NCfsyzk0pMsLS0N40K904zWA2CZyZ3Pr-bxM'

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
