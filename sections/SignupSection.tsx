import { sanityClient } from '@/lib/sanity/client'
import { AUTH_CONFIG_QUERY } from '@/lib/sanity/queries'
import type { SanityAuthConfig } from '@/types/sanity'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { SignupForm } from '@/features/auth/components/SignupForm'

interface SignupSectionProps {
  section?: {
    _type: 'signupSection'
    _key?: string
    // Allow optional overrides from Sanity
    heading?: string
    subheading?: string
    badge?: string | null
  }
}

export async function SignupSection({ section }: SignupSectionProps) {
  const authConfig = await sanityClient.fetch<SanityAuthConfig | null>(AUTH_CONFIG_QUERY)

  // Use Sanity section data if provided, fallback to authConfig, then defaults
  const headline = section?.heading ?? authConfig?.signupHeading ?? 'CMS-driven publishing for engineering teams.'
  const subheadline = section?.subheading ?? authConfig?.signupSubheading ?? 'Create your account'
  const badge = section?.badge !== undefined ? section.badge : authConfig?.leftPanelBadge ?? 'ENGINEERING FIRST'

  return (
    <AuthShell
      mode="signup"
      headline={headline}
      subheadline={subheadline}
      badge={badge}
    >
      <SignupForm />
    </AuthShell>
  )
}
