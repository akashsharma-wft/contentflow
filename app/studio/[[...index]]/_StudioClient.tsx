'use client'

import { useEffect } from 'react'
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

interface StudioClientProps {
  token: string
}

// Sanity Studio stores its auth token in localStorage under this key.
// Format: JSON.stringify({ token, time: ISO string })
// Using unstable_noAuthBoundary skips the Sanity.io login screen entirely —
// our app's server-side role check is the only gate.
const SANITY_TOKEN_KEY = `__studio_auth_token_${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'h2zl7fu3'}`

export function StudioClient({ token }: StudioClientProps) {
  useEffect(() => {
    try {
      localStorage.setItem(SANITY_TOKEN_KEY, JSON.stringify({ token, time: new Date().toISOString() }))
    } catch {
      // localStorage may be unavailable in some environments — studio will fall back to its own auth
    }
  }, [token])

  return <NextStudio config={config} unstable_noAuthBoundary />
}
