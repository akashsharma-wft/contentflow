import { Suspense } from 'react'
import { sanityClient } from '@/lib/sanity/client'
import { AUTH_CONFIG_QUERY } from '@/lib/sanity/queries'
import type { SanityAuthConfig } from '@/types/sanity'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { LoginForm } from '@/features/auth/components/LoginForm'

export const metadata = { title: 'Sign in — ContentFlow' }

export default async function LoginPage() {
  const authConfig = await sanityClient.fetch<SanityAuthConfig | null>(AUTH_CONFIG_QUERY)

  return (
    <AuthShell
      mode="signin"
      headline={authConfig?.leftPanelHeadline ?? 'CMS-driven publishing for engineering teams.'}
      subheadline={authConfig?.loginSubheading ?? 'Welcome back'}
      badge={null}
    >
      {/* Suspense required because LoginForm uses useSearchParams */}
      <Suspense fallback={
        <div className="bg-[#13141c] border border-white/8 rounded-2xl p-8 animate-pulse h-80" />
      }>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
