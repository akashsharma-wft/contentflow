// sections/LoginSection.tsx
//
// Renders the full login page UI.
// Called by SectionRenderer when it encounters a 'loginSection' block.
//
// HOW IT WORKS:
//   1. Fetches authConfig singleton from Sanity (server-side)
//   2. Picks the right language variant of each text field using the lang prop
//   3. Passes all translated copy to AuthShell + LoginForm
//
// MULTILINGUAL:
//   - authConfig has per-language fields: loginHeading.en / loginHeading.hi / loginHeading.kn
//   - Every single string — heading, subheading, button label, placeholder, footer link — is translated
//   - The left panel features are also translated (features[].en / features[].hi / features[].kn)
//
// LIVE PREVIEW:
//   - Uses sanityClient (not getSanityClient) because this is called inside SectionRenderer
//     which is already fetching with the draft-aware client from the parent page.
//   - The stega-encoded text from the parent fetch is what drives click-to-edit overlays.

import { Suspense } from 'react'
import { sanityClient } from '@/lib/sanity/client'
import { AUTH_CONFIG_QUERY } from '@/lib/sanity/queries'
import { AuthShell } from '@/features/auth/components/AuthShell'
import { LoginForm } from '@/features/auth/components/LoginForm'

type Lang = 'en' | 'hi' | 'kn'

interface LangField {
  en?: string
  hi?: string
  kn?: string
}

interface AuthFeature {
  _key?: string
  en: string
  hi: string
  kn: string
  icon?: string
}

interface AuthConfig {
  showGoogleOAuth?: boolean
  showEmailPassword?: boolean
  loginHeading?: LangField
  loginSubheading?: LangField
  loginSubmitLabel?: LangField
  loginEmailPlaceholder?: LangField
  loginPasswordPlaceholder?: LangField
  loginFooterText?: LangField
  loginFooterLinkLabel?: LangField
  loginFooterLinkHref?: string
  loginGoogleLabel?: LangField
  leftPanelHeadline?: LangField
  leftPanelBadge?: LangField
  leftPanelFeatures?: AuthFeature[]
  leftPanelFooterNote?: LangField
}

// Pick correct language from a multi-lang field, fallback to English
function t(field: LangField | undefined, lang: Lang): string {
  if (!field) return ''
  return field[lang] ?? field.en ?? ''
}

interface LoginSectionProps {
  section?: {
    _type: 'loginSection'
    _key?: string
  }
  lang?: string
}

export async function LoginSection({ lang = 'en' }: LoginSectionProps) {
  const config = await sanityClient.fetch<AuthConfig | null>(AUTH_CONFIG_QUERY)
  const l = (lang as Lang) ?? 'en'

  const copy = {
    headline:            t(config?.leftPanelHeadline,        l) || 'CMS-driven publishing for engineering teams.',
    subheadline:         t(config?.loginHeading,             l) || 'Welcome back',
    badge:               t(config?.leftPanelBadge,           l) || null,
    formSubheading:      t(config?.loginSubheading,          l) || 'Sign in to your workspace',
    submitLabel:         t(config?.loginSubmitLabel,         l) || 'Sign in',
    emailPlaceholder:    t(config?.loginEmailPlaceholder,    l) || 'you@example.com',
    passwordPlaceholder: t(config?.loginPasswordPlaceholder, l) || 'Your password',
    footerText:          t(config?.loginFooterText,          l) || "Don't have an account?",
    footerLinkLabel:     t(config?.loginFooterLinkLabel,     l) || 'Request access',
    footerLinkHref:      config?.loginFooterLinkHref ?? '/signup',
    googleLabel:         t(config?.loginGoogleLabel,         l) || 'Continue with Google',
    footerNote:          t(config?.leftPanelFooterNote,      l) || 'Powered by Supabase Auth',
    showGoogleOAuth:     config?.showGoogleOAuth ?? true,
    showEmailPassword:   config?.showEmailPassword ?? true,
    features: (config?.leftPanelFeatures ?? []).map((f) => ({
      text: f[l] ?? f.en ?? '',
      icon: f.icon,
    })),
  }

  return (
    <AuthShell
      mode="signin"
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
        <LoginForm
          subheading={copy.formSubheading}
          submitLabel={copy.submitLabel}
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