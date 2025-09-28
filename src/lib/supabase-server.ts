import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './supabase'

// Server component client - only use in server components
export const createServerSupabase = () => createServerComponentClient<Database>({ cookies })
