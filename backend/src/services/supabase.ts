import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with service role key for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create regular client for user operations
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export class SupabaseService {
  // File upload to Supabase Storage
  static async uploadFile(bucket: string, path: string, file: Buffer, contentType?: string) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true
      })

    if (error) {
      throw new Error(`File upload failed: ${error.message}`)
    }

    return data
  }

  // Get public URL for uploaded file
  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }

  // Delete file from storage
  static async deleteFile(bucket: string, path: string) {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`File deletion failed: ${error.message}`)
    }
  }

  // Create storage bucket if it doesn't exist
  static async createBucket(bucketName: string, isPublic = true) {
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: isPublic,
      allowedMimeTypes: ['image/*', 'video/*', 'application/pdf']
    })

    if (error && !error.message.includes('already exists')) {
      throw new Error(`Bucket creation failed: ${error.message}`)
    }

    return data
  }
}

export default SupabaseService
