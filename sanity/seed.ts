// sanity/seed.ts — ContentFlow Studio Seed
//
// Seeds page documents (with inline system sections) and siteConfig for all
// three supported languages. Run via:
//
//   npm run sanity-seed
//   (calls: sanity exec ./sanity/seed.ts --with-user-token)
//
// IDEMPOTENT: uses createOrReplace with stable _id values so it is safe to run
// multiple times without creating duplicates. No documents are deleted.
//
// Stable ID conventions:
//   page:       page-{slug}-{lang}         e.g. page-home-en
//   siteConfig: site-config-{lang}         e.g. site-config-en

import { createClient } from '@sanity/client'

// ── Client ────────────────────────────────────────────────────────────────────

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID
    ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    ?? 'h2zl7fu3',
  dataset: process.env.SANITY_STUDIO_DATASET
    ?? process.env.NEXT_PUBLIC_SANITY_DATASET
    ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN ?? process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// ── Constants ─────────────────────────────────────────────────────────────────

const LANGS = ['en', 'hi', 'kn'] as const
type Lang = (typeof LANGS)[number]

// ── ID helpers ────────────────────────────────────────────────────────────────

function pageId(slug: string, lang: Lang)     { return `page-${slug}-${lang}` }
function siteConfigId(lang: Lang)             { return `site-config-${lang}`  }

// ── Site Config ───────────────────────────────────────────────────────────────

async function seedSiteConfig() {
  console.log('\n⚙️  Seeding siteConfig (one per language)...')

  for (const lang of LANGS) {
    await client.createOrReplace({
      _id:      siteConfigId(lang),
      _type:    'siteConfig',
      title:    `Site Config — ${lang.toUpperCase()}`,
      language: lang,
      siteName: 'ContentFlow',
    })
    console.log(`   ✓ siteConfig [${lang}]`)
  }
}

// ── Page definitions ──────────────────────────────────────────────────────────

interface PageDef {
  slug:     string
  access:   'guest' | 'user' | 'admin'
  layout:   'home' | 'auth' | 'dashboard'
  titles:   Record<Lang, string>
  sections: (lang: Lang) => unknown[]
}

const PAGES: PageDef[] = [

  // ── Home ──────────────────────────────────────────────────────────────────
  {
    slug:   'home',
    access: 'guest',
    layout: 'home',
    titles: { en: 'Home', hi: 'होम', kn: 'ಮುಖಪುಟ' },
    sections: (lang) => [
      // ── Hero (split layout — left copy + right decorative panel) ──────────
      {
        _type:         'heroSection',
        _key:          `hero-${lang}`,
        layout:        'split',
        theme:         'dark',
        badge:         lang === 'hi' ? '✦ नया — Sanity + Supabase'
                     : lang === 'kn' ? '✦ ಹೊಸದು — Sanity + Supabase'
                     :                 '✦ New — Sanity + Supabase',
        heading:       lang === 'hi' ? 'इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन।'
                     : lang === 'kn' ? 'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗಾಗಿ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ.'
                     :                 'CMS-driven publishing for engineering teams.',
        subheading:    lang === 'hi' ? 'Sanity Studio में पेज बनाएं, Supabase से उपयोगकर्ता प्रबंधित करें, और एक सुसंगत डैशबोर्ड में सब कुछ प्रकाशित करें।'
                     : lang === 'kn' ? 'Sanity Studio ನಲ್ಲಿ ಪೇಜ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಿ, Supabase ನೊಂದಿಗೆ ಬಳಕೆದಾರರನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಒಂದೇ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಎಲ್ಲವನ್ನೂ ಪ್ರಕಾಶಿಸಿ.'
                     :                 'Build pages in Sanity Studio, manage users with Supabase, and publish everything from a single cohesive dashboard.',
        primaryCta: {
          label: lang === 'hi' ? 'मुफ़्त शुरू करें'  : lang === 'kn' ? 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ' : 'Start for free',
          href:  '/signup',
        },
        secondaryCta: {
          label: lang === 'hi' ? 'पोस्ट एक्सप्लोर करें' : lang === 'kn' ? 'ಪೋಸ್ಟ್‌ಗಳನ್ನು ಅನ್ವೇಷಿಸಿ' : 'Explore posts',
          href:  '/posts',
        },
        communityText: lang === 'hi' ? '2,000+ प्रकाशकों द्वारा विश्वसनीय'
                     : lang === 'kn' ? '2,000+ ಪ್ರಕಾಶಕರು ನಂಬುತ್ತಾರೆ'
                     :                 'Trusted by 2,000+ publishers',
      },

      // ── Featured Posts ────────────────────────────────────────────────────
      {
        _type:        'featuredPostsSection',
        _key:         `featured-posts-${lang}`,
        heading:      lang === 'hi' ? 'चुनिंदा कहानियां'   : lang === 'kn' ? 'ವಿಶೇಷ ಕಥೆಗಳು'   : 'Featured Stories',
        subheading:   lang === 'hi' ? 'हमारी टीम द्वारा संपादकीय रूप से चुनी गई।'
                    : lang === 'kn' ? 'ನಮ್ಮ ತಂಡದಿಂದ ಸಂಪಾದಕೀಯವಾಗಿ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ.'
                    : 'Editorially selected by our team.',
        maxPosts:     2,
        showExcerpt:  true,
        showTags:     true,
        viewAllLabel: lang === 'hi' ? 'सभी कहानियां →' : lang === 'kn' ? 'ಎಲ್ಲಾ ಕಥೆಗಳು →' : 'All stories →',
      },

      // ── Recent Posts ──────────────────────────────────────────────────────
      {
        _type:        'recentPostsSection',
        _key:         `recent-posts-${lang}`,
        heading:      lang === 'hi' ? 'हाल के प्रकाशन' : lang === 'kn' ? 'ಇತ್ತೀಚಿನ ಪ್ರಕಾಶನಗಳು' : 'Recent Publications',
        subheading:   lang === 'hi' ? 'सर्च और फिल्टर से खोजें।'
                    : lang === 'kn' ? 'ಹುಡುಕಿ ಮತ್ತು ಫಿಲ್ಟರ್ ಮಾಡಿ.'
                    : 'Search and filter to find what you need.',
        count:        12,
        viewAllLabel: lang === 'hi' ? 'सभी पोस्ट देखें' : lang === 'kn' ? 'ಎಲ್ಲಾ ಪೋಸ್ಟ್‌ಗಳನ್ನು ನೋಡಿ' : 'View all posts',
      },

      // ── CTA ───────────────────────────────────────────────────────────────
      {
        _type:    'ctaSection',
        _key:     `cta-${lang}`,
        theme:    'indigo',
        centered: true,
        heading:  lang === 'hi' ? 'प्रकाशन का भविष्य यहां है।'
                : lang === 'kn' ? 'ಪ್ರಕಾಶನದ ಭವಿಷ್ಯ ಇಲ್ಲಿದೆ.'
                : 'The future of publishing is here.',
        body:     lang === 'hi' ? 'आज ही ContentFlow में शामिल हों और देखें कि एक आधुनिक CMS आपकी टीम को कैसे बदल सकता है।'
                : lang === 'kn' ? 'ಇಂದೇ ContentFlow ಗೆ ಸೇರಿ ಮತ್ತು ಆಧುನಿಕ CMS ನಿಮ್ಮ ತಂಡವನ್ನು ಹೇಗೆ ಬದಲಾಯಿಸಬಹುದು ಎಂಬುದನ್ನು ನೋಡಿ.'
                : 'Join ContentFlow today and see how a modern CMS can transform the way your team creates and publishes content.',
        primaryButton: {
          label: lang === 'hi' ? 'आज ही शुरू करें'      : lang === 'kn' ? 'ಇಂದೇ ಪ್ರಾರಂಭಿಸಿ'      : 'Get started today',
          href:  '/signup',
        },
        secondaryButton: {
          label: lang === 'hi' ? 'Studio खोलें'         : lang === 'kn' ? 'Studio ತೆರೆಯಿರಿ'       : 'Open Studio',
          href:  '/studio',
        },
      },
    ],
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  {
    slug:   'login',
    access: 'guest',
    layout: 'auth',
    titles: { en: 'Login', hi: 'लॉगिन', kn: 'ಲಾಗಿನ್' },
    sections: (lang) => [

      // LEFT — branding panel (hidden on mobile, sticky 45% on desktop)
      {
        _type:     'authHeroSection',
        _key:      `auth-hero-login-${lang}`,
        mode:      'login',
        badge:     lang === 'hi' ? 'ContentFlow तक पहुंच' : lang === 'kn' ? 'ContentFlow ಪ್ರವೇಶ' : 'ContentFlow Access',
        headline:  lang === 'hi' ? 'इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन।'
                 : lang === 'kn' ? 'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗಾಗಿ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ.'
                 : 'CMS-driven publishing for engineering teams.',
        features: [
          {
            icon: '⚡',
            text: lang === 'hi' ? 'Sanity Studio में रीयल-टाइम प्रीव्यू'
                : lang === 'kn' ? 'Sanity Studio ನಲ್ಲಿ ರಿಯಲ್-ಟೈಮ್ ಪ್ರಿವ್ಯೂ'
                : 'Real-time preview in Sanity Studio',
          },
          {
            icon: '🔐',
            text: lang === 'hi' ? 'Supabase-संचालित सुरक्षित प्रमाणीकरण'
                : lang === 'kn' ? 'Supabase-ಚಾಲಿತ ಸುರಕ್ಷಿತ ದೃಢೀಕರಣ'
                : 'Supabase-powered secure authentication',
          },
          {
            icon: '🌐',
            text: lang === 'hi' ? 'EN, HI और KN में बहुभाषी सामग्री'
                : lang === 'kn' ? 'EN, HI ಮತ್ತು KN ನಲ್ಲಿ ಬಹುಭಾಷಾ ವಿಷಯ'
                : 'Multilingual content in EN, HI, and KN',
          },
        ],
        footerNote: lang === 'hi' ? 'Supabase Auth द्वारा संचालित'
                  : lang === 'kn' ? 'Supabase Auth ನಿಂದ ಚಾಲಿತ'
                  : 'Powered by Supabase Auth',
      },

      // RIGHT — form card (mobile: full-width with logo bar + heading)
      {
        _type:               'authSection',
        _key:                `auth-form-login-${lang}`,
        mode:                'login',
        heading:             lang === 'hi' ? 'वापस स्वागत है'       : lang === 'kn' ? 'ಮರಳಿ ಸ್ವಾಗತ'         : 'Welcome back',
        googleLabel:         lang === 'hi' ? 'Google से जारी रखें'  : lang === 'kn' ? 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ' : 'Continue with Google',
        dividerLabel:        lang === 'hi' ? 'या'                   : lang === 'kn' ? 'ಅಥವಾ'               : 'or',
        emailLabel:          lang === 'hi' ? 'ईमेल'                 : lang === 'kn' ? 'ಇಮೇಲ್'              : 'Email',
        emailPlaceholder:    lang === 'hi' ? 'aap@example.com'      : lang === 'kn' ? 'nimma@example.com'   : 'you@example.com',
        passwordLabel:       lang === 'hi' ? 'पासवर्ड'             : lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್'         : 'Password',
        passwordPlaceholder: lang === 'hi' ? 'आपका पासवर्ड'        : lang === 'kn' ? 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್'    : 'Your password',
        submitLabel:         lang === 'hi' ? 'साइन इन करें'         : lang === 'kn' ? 'ಸೈನ್ ಇನ್ ಮಾಡಿ'     : 'Sign in',
        footerText:          lang === 'hi' ? 'अकाउंट नहीं है?'      : lang === 'kn' ? 'ಖಾತೆ ಇಲ್ಲವೇ?'        : "Don't have an account?",
        footerLinkLabel:     lang === 'hi' ? 'अकाउंट बनाएं'         : lang === 'kn' ? 'ಖಾತೆ ರಚಿಸಿ'          : 'Create account',
        footerLinkHref:      '/signup',
        showGoogleOAuth:     true,
        showEmailPassword:   true,
      },

      // BOTTOM — legal links (wraps to full-width row below hero + form on desktop)
      {
        _type: 'authLegalSection',
        _key:  `auth-legal-login-${lang}`,
        links: [
          {
            label: lang === 'hi' ? 'सेवा की शर्तें' : lang === 'kn' ? 'ಸೇವಾ ನಿಯಮಗಳು' : 'Terms of Service',
            href:  '#',
          },
          {
            label: lang === 'hi' ? 'गोपनीयता नीति' : lang === 'kn' ? 'ಗೌಪ್ಯತಾ ನೀತಿ'  : 'Privacy Policy',
            href:  '#',
          },
          {
            label: lang === 'hi' ? 'सुरक्षा'       : lang === 'kn' ? 'ಭದ್ರತೆ'          : 'Security',
            href:  '#',
          },
        ],
      },
    ],
  },

  // ── Sign Up ───────────────────────────────────────────────────────────────
  {
    slug:   'signup',
    access: 'guest',
    layout: 'auth',
    titles: { en: 'Sign Up', hi: 'साइन अप', kn: 'ಸೈನ್ ಅಪ್' },
    sections: (lang) => [

      // LEFT — branding panel
      {
        _type:     'authHeroSection',
        _key:      `auth-hero-signup-${lang}`,
        mode:      'signup',
        badge:     lang === 'hi' ? 'ContentFlow में शामिल हों' : lang === 'kn' ? 'ContentFlow ಸೇರಿ' : 'Join ContentFlow',
        headline:  lang === 'hi' ? 'इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन।'
                 : lang === 'kn' ? 'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗಾಗಿ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ.'
                 : 'CMS-driven publishing for engineering teams.',
        features: [
          {
            icon: '📄',
            text: lang === 'hi' ? 'बहुभाषी पोस्ट प्रकाशित करें'
                : lang === 'kn' ? 'ಬಹುಭಾಷಾ ಪೋಸ್ಟ್‌ಗಳನ್ನು ಪ್ರಕಾಶಿಸಿ'
                : 'Publish multilingual posts',
          },
          {
            icon: '🎛️',
            text: lang === 'hi' ? 'Studio में पेज बिल्डर से पेज बनाएं'
                : lang === 'kn' ? 'Studio ನಲ್ಲಿ ಪೇಜ್ ಬಿಲ್ಡರ್ ಬಳಸಿ ಪೇಜ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಿ'
                : 'Build pages with the page builder in Studio',
          },
          {
            icon: '📊',
            text: lang === 'hi' ? 'PostHog एनालिटिक्स से इनसाइट्स पाएं'
                : lang === 'kn' ? 'PostHog ಅನಾಲಿಟಿಕ್ಸ್‌ನಿಂದ ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಿರಿ'
                : 'Get insights from PostHog analytics',
          },
        ],
        footerNote: lang === 'hi' ? 'Supabase Auth द्वारा संचालित'
                  : lang === 'kn' ? 'Supabase Auth ನಿಂದ ಚಾಲಿತ'
                  : 'Powered by Supabase Auth',
      },

      // RIGHT — signup form card
      {
        _type:               'authSection',
        _key:                `auth-form-signup-${lang}`,
        mode:                'signup',
        heading:             lang === 'hi' ? 'अपना अकाउंट बनाएं'         : lang === 'kn' ? 'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ'           : 'Create your account',
        googleLabel:         lang === 'hi' ? 'Google से जारी रखें'        : lang === 'kn' ? 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ' : 'Continue with Google',
        dividerLabel:        lang === 'hi' ? 'या'                         : lang === 'kn' ? 'ಅಥವಾ'                       : 'or',
        nameLabel:           lang === 'hi' ? 'नाम'                        : lang === 'kn' ? 'ಹೆಸರು'                      : 'Name',
        namePlaceholder:     lang === 'hi' ? 'आपका पूरा नाम'              : lang === 'kn' ? 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು'           : 'Your full name',
        emailLabel:          lang === 'hi' ? 'ईमेल'                       : lang === 'kn' ? 'ಇಮೇಲ್'                      : 'Email',
        emailPlaceholder:    lang === 'hi' ? 'aap@example.com'            : lang === 'kn' ? 'nimma@example.com'           : 'you@example.com',
        passwordLabel:       lang === 'hi' ? 'पासवर्ड'                   : lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್'                 : 'Password',
        passwordPlaceholder: lang === 'hi' ? 'कम से कम 8 अक्षर'          : lang === 'kn' ? 'ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು'           : 'Min 8 characters',
        submitLabel:         lang === 'hi' ? 'अकाउंट बनाएं'              : lang === 'kn' ? 'ಖಾತೆ ರಚಿಸಿ'                  : 'Create account',
        footerText:          lang === 'hi' ? 'पहले से अकाउंट है?'         : lang === 'kn' ? 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?'          : 'Already have an account?',
        footerLinkLabel:     lang === 'hi' ? 'साइन इन करें'               : lang === 'kn' ? 'ಸೈನ್ ಇನ್ ಮಾಡಿ'              : 'Sign in',
        footerLinkHref:      '/login',
        showGoogleOAuth:     true,
        showEmailPassword:   true,
      },

      // BOTTOM — legal links
      {
        _type: 'authLegalSection',
        _key:  `auth-legal-signup-${lang}`,
        links: [
          {
            label: lang === 'hi' ? 'सेवा की शर्तें' : lang === 'kn' ? 'ಸೇವಾ ನಿಯಮಗಳು' : 'Terms of Service',
            href:  '#',
          },
          {
            label: lang === 'hi' ? 'गोपनीयता नीति' : lang === 'kn' ? 'ಗೌಪ್ಯತಾ ನೀತಿ'  : 'Privacy Policy',
            href:  '#',
          },
          {
            label: lang === 'hi' ? 'सुरक्षा'       : lang === 'kn' ? 'ಭದ್ರತೆ'          : 'Security',
            href:  '#',
          },
        ],
      },
    ],
  },

  // ── Posts ─────────────────────────────────────────────────────────────────
  {
    slug:   'posts',
    access: 'user',
    layout: 'dashboard',
    titles: { en: 'Posts', hi: 'पोस्ट', kn: 'ಪೋಸ್ಟ್‌ಗಳು' },
    sections: (lang) => [
      {
        _type:   'postsSection',
        _key:    `posts-${lang}`,
        heading: lang === 'hi' ? 'मेरी पोस्ट' : lang === 'kn' ? 'ನನ್ನ ಪೋಸ್ಟ್‌ಗಳು' : 'My Posts',
        limit:   20,
      },
    ],
  },

  // ── Settings ─────────────────────────────────────────────────────────────
  {
    slug:   'settings',
    access: 'user',
    layout: 'dashboard',
    titles: { en: 'Settings', hi: 'सेटिंग्स', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
    sections: (_lang) => [
      { _type: 'settingsPageSection', _key: 'settings-section' },
    ],
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  {
    slug:   'billing',
    access: 'user',
    layout: 'dashboard',
    titles: { en: 'Billing', hi: 'बिलिंग', kn: 'ಬಿಲ್ಲಿಂಗ್' },
    sections: (_lang) => [
      { _type: 'billingPageSection', _key: 'billing-section' },
    ],
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    slug:   'admin',
    access: 'admin',
    layout: 'dashboard',
    titles: { en: 'Admin', hi: 'एडमिन', kn: 'ಅಡ್ಮಿನ್' },
    sections: (lang) => [
      {
        _type:   'analyticsSection',
        _key:    `analytics-${lang}`,
        heading: lang === 'hi' ? 'एनालिटिक्स' : lang === 'kn' ? 'ವಿಶ್ಲೇಷಣೆ' : 'Analytics',
      },
      { _type: 'adminPageSection', _key: 'admin-section' },
    ],
  },
]

// ── Seed pages ─────────────────────────────────────────────────────────────────

async function seedPages() {
  console.log('\n📄  Seeding pages...')

  for (const def of PAGES) {
    for (const lang of LANGS) {
      await client.createOrReplace({
        _id:      pageId(def.slug, lang),
        _type:    'page',
        title:    def.titles[lang],
        slug:     { _type: 'slug', current: def.slug },
        language: lang,
        access:   def.access,
        layout:   def.layout,
        sections: def.sections(lang),
      })
      console.log(`   ✓ page/${def.slug} [${lang}]`)
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  ContentFlow Studio Seed')
  console.log(`   project : ${client.config().projectId}`)
  console.log(`   dataset : ${client.config().dataset}`)
  console.log('   strategy: upsert (createOrReplace) — safe to re-run\n')

  await seedSiteConfig()
  await seedPages()

  console.log('\n✅  Done.\n')
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err.message ?? err)
  process.exit(1)
})
