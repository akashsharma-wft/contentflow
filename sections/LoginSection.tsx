import { Suspense } from 'react'
import { sanityClient } from '@/lib/sanity/client'
import { AUTH_CONFIG_QUERY } from '@/lib/sanity/queries'
import type { SanityAuthConfig } from '@/types/sanity'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { LoginForm } from '@/features/auth/components/LoginForm'

interface LoginSectionProps {
  section?: {
    _type: 'loginSection'
    _key?: string
    // Allow optional overrides from Sanity
    heading?: string
    subheading?: string
    badge?: string | null
  }
}

export async function LoginSection({ section }: LoginSectionProps) {
  const authConfig = await sanityClient.fetch<SanityAuthConfig | null>(AUTH_CONFIG_QUERY)

  // Use Sanity section data if provided, fallback to authConfig, then defaults
  const headline = section?.heading ?? authConfig?.loginHeading ?? 'CMS-driven publishing for engineering teams.'
  const subheadline = section?.subheading ?? authConfig?.loginSubheading ?? 'Welcome back'
  const badge = section?.badge !== undefined ? section.badge : null

  return (
    <AuthShell
      mode="signin"
      headline={headline}
      subheadline={subheadline}
      badge={badge}
    >
      {/* Suspense required because LoginForm uses useSearchParams */}
      <Suspense
        fallback={
          <div className="bg-[#13141c] border border-white/8 rounded-2xl p-8 animate-pulse h-80" />
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
