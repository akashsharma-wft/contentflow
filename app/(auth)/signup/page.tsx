import { sanityClient } from '@/lib/sanity/client'
import { AUTH_CONFIG_QUERY } from '@/lib/sanity/queries'
import type { SanityAuthConfig } from '@/types/sanity'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { SignupForm } from '@/features/auth/components/SignupForm'

export const metadata = { title: 'Create account — ContentFlow' }

export default async function SignupPage() {
  const authConfig = await sanityClient.fetch<SanityAuthConfig | null>(AUTH_CONFIG_QUERY)

  return (
    <AuthShell
      mode="signup"
      headline={authConfig?.leftPanelHeadline ?? 'CMS-driven publishing for engineering teams.'}
      subheadline={authConfig?.signupSubheading ?? 'Create your account'}
      badge={authConfig?.leftPanelBadge ?? 'ENGINEERING FIRST'}
    >
      <SignupForm />
    </AuthShell>
  )
}
