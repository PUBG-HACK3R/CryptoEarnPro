'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClientSupabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  profile: any
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClientSupabase()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
        } finally {
          setLoading(false)
        }
      }
    )

    // Auto sign-out when tab/window is closed
    const handleBeforeUnload = () => {
      // Only sign out if user is authenticated
      if (user) {
        supabase.auth.signOut()
      }
    }

    // Auto sign-out on page visibility change (when tab becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden && user) {
        // Sign out when tab becomes hidden (user switched tabs or minimized)
        setTimeout(() => {
          if (document.hidden && user) {
            supabase.auth.signOut()
          }
        }, 30000) // 30 seconds delay before auto sign-out
      }
    }

    // Add event listeners for auto sign-out
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create...')
          try {
            const user = await supabase.auth.getUser()
            if (user.data.user?.email) {
              const response = await fetch('/api/auth/create-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  email: user.data.user.email,
                }),
              })
              if (response.ok) {
                // Retry fetching the profile
                const { data: newData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', userId)
                  .single()
                if (newData) setProfile(newData)
              }
            }
          } catch (createError) {
            console.error('Failed to create profile:', createError)
          }
        }
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        return { error }
      }

      // If signup was successful and we have a user, ensure profile is created
      if (data.user) {
        try {
          // Call our API route to create the profile
          const response = await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
            }),
          })

          if (!response.ok) {
            console.error('Failed to create user profile via API')
          }
        } catch (profileError) {
          console.error('Error creating user profile:', profileError)
          // Don't return this as an error since the user was created successfully
        }
      }

      return { error: null }
    } catch (err) {
      console.error('Signup error:', err)
      return { error: err }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Supabase signout error:', error)
      }
      
      // Clear local state regardless of Supabase response
      setUser(null)
      setSession(null)
      setProfile(null)
      
      // Clear any stored tokens
      localStorage.clear()
      sessionStorage.clear()
      
      // Force redirect to landing page
      window.location.replace('/')
    } catch (error) {
      console.error('Error signing out:', error)
      // Force clear state and redirect even on error
      setUser(null)
      setSession(null)
      setProfile(null)
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = profile?.role === 'admin'

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    profile,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
