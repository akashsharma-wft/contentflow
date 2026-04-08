// sections/SignupSection.tsx
//
// Same pattern as LoginSection — fetches authConfig, picks correct language variant.
// Called by SectionRenderer when it encounters a 'signupSection' block.

import { Suspense } from 'react'
import { sanityClient } from '@/lib/sanity/client'
import { AUTH_CONFIG_QUERY } from '@/lib/sanity/queries'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { SignupForm } from '@/features/auth/components/SignupForm'

type Lang = 'en' | 'hi' | 'kn'

interface LangField { en?: string; hi?: string; kn?: string }
interface AuthFeature { _key?: string; en: string; hi: string; kn: string; icon?: string }

interface AuthConfig {
  showGoogleOAuth?: boolean
  showEmailPassword?: boolean
  signupHeading?: LangField
  signupSubheading?: LangField
  signupSubmitLabel?: LangField
  signupNamePlaceholder?: LangField
  signupEmailPlaceholder?: LangField
  signupPasswordPlaceholder?: LangField
  signupFooterText?: LangField
  signupFooterLinkLabel?: LangField
  signupFooterLinkHref?: string
  signupGoogleLabel?: LangField
  leftPanelHeadline?: LangField
  leftPanelBadge?: LangField
  leftPanelFeatures?: AuthFeature[]
  leftPanelFooterNote?: LangField
}

function t(field: LangField | undefined, lang: Lang): string {
  if (!field) return ''
  return field[lang] ?? field.en ?? ''
}

interface SignupSectionProps {
  section?: {
    _type: 'signupSection'
    _key?: string
  }
  lang?: string
}

export async function SignupSection({ lang = 'en' }: SignupSectionProps) {
  const config = await sanityClient.fetch<AuthConfig | null>(AUTH_CONFIG_QUERY)
  const l = (lang as Lang) ?? 'en'

  const copy = {
    headline:            t(config?.leftPanelHeadline,          l) || 'CMS-driven publishing for engineering teams.',
    subheadline:         t(config?.signupHeading,              l) || 'Create your account',
    badge:               t(config?.leftPanelBadge,             l) || null,
    formSubheading:      t(config?.signupSubheading,           l) || 'Join the ContentFlow workspace',
    submitLabel:         t(config?.signupSubmitLabel,          l) || 'Create account',
    namePlaceholder:     t(config?.signupNamePlaceholder,      l) || 'Your full name',
    emailPlaceholder:    t(config?.signupEmailPlaceholder,     l) || 'you@example.com',
    passwordPlaceholder: t(config?.signupPasswordPlaceholder,  l) || 'Min 8 characters',
    footerText:          t(config?.signupFooterText,           l) || 'Already have an account?',
    footerLinkLabel:     t(config?.signupFooterLinkLabel,      l) || 'Sign in',
    footerLinkHref:      config?.signupFooterLinkHref ?? '/login',
    googleLabel:         t(config?.signupGoogleLabel,          l) || 'Continue with Google',
    footerNote:          t(config?.leftPanelFooterNote,        l) || 'Powered by Supabase Auth',
    showGoogleOAuth:     config?.showGoogleOAuth ?? true,
    showEmailPassword:   config?.showEmailPassword ?? true,
    features: (config?.leftPanelFeatures ?? []).map((f) => ({
      text: f[l] ?? f.en ?? '',
      icon: f.icon,
    })),
  }

  return (
    <AuthShell
      mode="signup"
      headline={copy.headline}
      subheadline={copy.subheadline}
      badge={copy.badge}
      features={copy.features}
      footerNote={copy.footerNote}
    >
      <Suspense
        fallback={
          <div className="bg-[#13141c] border border-white/8 rounded-2xl p-8 animate-pulse h-80" />
        }
      >
        <SignupForm
          subheading={copy.formSubheading}
          submitLabel={copy.submitLabel}
          namePlaceholder={copy.namePlaceholder}
          emailPlaceholder={copy.emailPlaceholder}
          passwordPlaceholder={copy.passwordPlaceholder}
          footerText={copy.footerText}
          footerLinkLabel={copy.footerLinkLabel}
          footerLinkHref={copy.footerLinkHref}
          googleLabel={copy.googleLabel}
          showGoogleOAuth={copy.showGoogleOAuth}
          showEmailPassword={copy.showEmailPassword}
        />
      </Suspense>
    </AuthShell>
  )
}