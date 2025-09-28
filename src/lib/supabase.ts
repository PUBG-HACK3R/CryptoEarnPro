import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client component client
export const createClientSupabase = () => createClientComponentClient()

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin'
          total_invested: number
          account_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'user' | 'admin'
          total_invested?: number
          account_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'admin'
          total_invested?: number
          account_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          plan_name: string
          daily_rate_percent: number
          duration_days: number
          min_deposit_usd: number
          max_deposit_usd: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_name: string
          daily_rate_percent: number
          duration_days: number
          min_deposit_usd: number
          max_deposit_usd: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_name?: string
          daily_rate_percent?: number
          duration_days?: number
          min_deposit_usd?: number
          max_deposit_usd?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          invested_amount: number
          start_date: string
          end_date: string
          daily_earning: number
          total_earned: number
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          invested_amount: number
          start_date: string
          end_date: string
          daily_earning: number
          total_earned?: number
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          invested_amount?: number
          start_date?: string
          end_date?: string
          daily_earning?: number
          total_earned?: number
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'deposit' | 'withdrawal' | 'earning'
          amount: number
          crypto_type: string | null
          tx_hash: string | null
          wallet_address: string | null
          plan_id: string | null
          status: 'pending' | 'confirmed' | 'rejected' | 'approved'
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'deposit' | 'withdrawal' | 'earning'
          amount: number
          crypto_type?: string | null
          tx_hash?: string | null
          wallet_address?: string | null
          plan_id?: string | null
          status?: 'pending' | 'confirmed' | 'rejected' | 'approved'
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'deposit' | 'withdrawal' | 'earning'
          amount?: number
          crypto_type?: string | null
          tx_hash?: string | null
          wallet_address?: string | null
          plan_id?: string | null
          status?: 'pending' | 'confirmed' | 'rejected' | 'approved'
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      withdrawal_requests: {
        Row: {
          id: string
          user_id: string
          amount: number
          wallet_address: string
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          wallet_address: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          wallet_address?: string
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
