import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

// Server-side Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function createUserProfile(userId: string, email: string) {
  try {
    // Use the admin client to create the profile, bypassing RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        role: 'user' as const,
        total_invested: 0,
        account_balance: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Failed to create user profile:', error)
    return { data: null, error }
  }
}

export async function ensureUserProfile(userId: string, email: string) {
  try {
    // First, check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return { data: existingProfile, error: null }
    }

    // If no profile exists, create one
    return await createUserProfile(userId, email)
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    return { data: null, error }
  }
}
