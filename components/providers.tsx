'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import posthog from 'posthog-js'
import PostHogProvider from './posthog-provider'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

// ── Auth Context ──────────────────────────────────────────────────────────────
// Single Supabase subscription at the app root. All components read from here.
// This eliminates per-component auth re-fetches and prevents nav flicker on
// page transitions — the context instance persists for the lifetime of the app.

export interface AuthState {
  user:      User | null
  profile:   Profile | null
  isLoading: boolean
}

const AuthContext = createContext<AuthState>({
  user: null, profile: null, isLoading: true,
})

export function useAuthContext(): AuthState {
  return useContext(AuthContext)
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, isLoading: true })

  useEffect(() => {
    const supabase = createClient()

    // Load profile after user is already shown — non-blocking.
    async function hydrateProfile(userId: string, email?: string) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        posthog.identify(userId, {
          email,
          name:              profile.display_name,
          subscription_tier: profile.subscription_tier,
          role:              profile.role,
        })
      }

      // Functional update — merges into whatever user state is current
      setState(prev =>
        prev.user?.id === userId
          ? { ...prev, profile: profile ?? null }
          : prev
      )
    }

    // ── Step 1: getSession() ─────────────────────────────────────────────
    // Reads the cached token from localStorage — no network call, no lock.
    // This gives us immediate auth state before onAuthStateChange fires.
    // If the token is expired it triggers a background refresh, which arrives
    // via onAuthStateChange (TOKEN_REFRESHED) handled below.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Set user immediately — navbar becomes authenticated right away
        setState({ user: session.user, profile: null, isLoading: false })
        hydrateProfile(session.user.id, session.user.email)
      } else {
        // No cached session — confirmed guest
        setState({ user: null, profile: null, isLoading: false })
      }
    })

    // ── Step 2: onAuthStateChange ────────────────────────────────────────
    // Handles ongoing events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
    // INITIAL_SESSION is skipped — getSession() already covered initial state.
    // No getUser() call here, so no competing lock with step 1.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION') return  // Handled by getSession() above

        if (session?.user) {
          // Set user immediately — profile hydrates in background
          setState(prev => ({ ...prev, user: session.user, isLoading: false }))
          hydrateProfile(session.user.id, session.user.email)
        } else {
          posthog.reset()
          setState({ user: null, profile: null, isLoading: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

// ── Root Providers ────────────────────────────────────────────────────────────

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000,
          refetchOnWindowFocus: true,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </PostHogProvider>
    </QueryClientProvider>
  )
}
