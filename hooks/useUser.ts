import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import posthog from 'posthog-js'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useUser() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)

        // Identify user in PostHog — required by assignment
        // This links all events to this specific user
        if (profile) {
          posthog.identify(user.id, {
            email: user.email,
            name: profile.display_name,
            subscription_tier: profile.subscription_tier,
            role: profile.role,
          })
        }
      } else {
        // Reset PostHog identity on logout
        posthog.reset()
      }

      setIsLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) {
          setProfile(null)
          posthog.reset()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, profile, isLoading }
}