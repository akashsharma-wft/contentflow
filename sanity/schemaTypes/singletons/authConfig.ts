// sanity/schemaTypes/singletons/authConfig.ts
//
// SINGLETON: Auth Configuration
//
// Controls ALL text on login and signup pages.
// Has per-language fields for every string so the auth pages
// are fully translated — not just headings, but every label,
// placeholder, button text, and helper note.
//
// In Studio: Auth Configuration → Login Copy / Signup Copy / Left Panel / Settings
// On site: LoginSection + SignupSection read from this via AUTH_CONFIG_QUERY

import { defineType, defineField } from 'sanity'

// Helper: create a language group of copy fields (en / hi / kn)
function langCopyFields(name: string, title: string, defaults: { en: string; hi: string; kn: string }) {
  return defineField({
    name,
    title,
    type: 'object',
    options: { collapsible: true, collapsed: false },
    fields: [
      defineField({ name: 'en', title: 'English', type: 'string', initialValue: defaults.en }),
      defineField({ name: 'hi', title: 'Hindi',   type: 'string', initialValue: defaults.hi }),
      defineField({ name: 'kn', title: 'Kannada', type: 'string', initialValue: defaults.kn }),
    ],
  })
}

export const authConfig = defineType({
  name: 'authConfig',
  title: 'Auth Configuration',
  type: 'document',
  groups: [
    { name: 'providers', title: '🔑 Auth Providers', default: true },
    { name: 'login',     title: '📝 Login Page Copy' },
    { name: 'signup',    title: '✍️ Signup Page Copy' },
    { name: 'panel',     title: '🖼 Left Panel' },
  ],

  fields: [
    // ── Auth provider toggles ──────────────────────────────────────────
    defineField({
      name: 'showGoogleOAuth',
      title: 'Show "Continue with Google" button?',
      group: 'providers',
      description: 'Supabase must also have Google OAuth enabled in its dashboard.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showEmailPassword',
      title: 'Show email + password form?',
      group: 'providers',
      type: 'boolean',
      initialValue: true,
    }),

    // ── Login page copy — all 3 languages ─────────────────────────────
    langCopyFields('loginHeading',         'Login Page — Main Heading',   { en: 'Welcome back',             hi: 'वापस स्वागत है',               kn: 'ಮರಳಿ ಸ್ವಾಗತ'                      }),
    langCopyFields('loginSubheading',      'Login Page — Subheading',     { en: 'Sign in to your workspace',hi: 'अपने वर्कस्पेस में साइन इन करें', kn: 'ನಿಮ್ಮ ವರ್ಕ್‌ಸ್ಪೇಸ್‌ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ' }),
    langCopyFields('loginSubmitLabel',     'Login Button Label',          { en: 'Sign in',                  hi: 'साइन इन करें',                kn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ'                   }),
    langCopyFields('loginEmailPlaceholder','Email Placeholder',           { en: 'you@example.com',          hi: 'आप@उदाहरण.com',                kn: 'ನೀವು@ಉದಾಹರಣೆ.com'                }),
    langCopyFields('loginPasswordPlaceholder','Password Placeholder',     { en: 'Your password',            hi: 'आपका पासवर्ड',                 kn: 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್'                  }),
    langCopyFields('loginFooterText',      'Footer Prompt',               { en: "Don't have an account?",   hi: 'खाता नहीं है?',                kn: 'ಖಾತೆ ಇಲ್ಲವೇ?'                     }),
    langCopyFields('loginFooterLinkLabel', 'Footer Link Label',           { en: 'Request access',           hi: 'एक्सेस अनुरोध करें',           kn: 'ಪ್ರವೇಶ ವಿನಂತಿಸಿ'                  }),
    langCopyFields('loginGoogleLabel',     '"Continue with Google" Label',{ en: 'Continue with Google',     hi: 'Google से जारी रखें',          kn: 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ'      }),

    defineField({
      name: 'loginFooterLinkHref',
      title: 'Login Footer Link URL',
      group: 'login',
      type: 'string',
      initialValue: '/signup',
      description: 'URL the footer link points to. Usually /signup.',
    }),

    // ── Signup page copy — all 3 languages ────────────────────────────
    langCopyFields('signupHeading',           'Signup Page — Main Heading',  { en: 'Create your account',          hi: 'अपना खाता बनाएं',                kn: 'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ'                }),
    langCopyFields('signupSubheading',        'Signup Page — Subheading',    { en: 'Join the ContentFlow workspace',hi: 'ContentFlow वर्कस्पेस में शामिल हों', kn: 'ContentFlow ವರ್ಕ್‌ಸ್ಪೇಸ್‌ಗೆ ಸೇರಿ' }),
    langCopyFields('signupSubmitLabel',       'Signup Button Label',         { en: 'Create account',               hi: 'खाता बनाएं',                    kn: 'ಖಾತೆ ರಚಿಸಿ'                     }),
    langCopyFields('signupNamePlaceholder',   'Name Placeholder',            { en: 'Your full name',               hi: 'आपका पूरा नाम',                 kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು'               }),
    langCopyFields('signupEmailPlaceholder',  'Email Placeholder',           { en: 'you@example.com',              hi: 'आप@उदाहरण.com',                 kn: 'ನೀವು@ಉದಾಹರಣೆ.com'              }),
    langCopyFields('signupPasswordPlaceholder','Password Placeholder',       { en: 'Min 8 characters',             hi: 'कम से कम 8 अक्षर',              kn: 'ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು'              }),
    langCopyFields('signupFooterText',        'Footer Prompt',               { en: 'Already have an account?',     hi: 'पहले से खाता है?',              kn: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?'            }),
    langCopyFields('signupFooterLinkLabel',   'Footer Link Label',           { en: 'Sign in',                      hi: 'साइन इन करें',                  kn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ'                 }),
    langCopyFields('signupGoogleLabel',       '"Continue with Google" Label',{ en: 'Continue with Google',         hi: 'Google से जारी रखें',           kn: 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ'   }),

    defineField({
      name: 'signupFooterLinkHref',
      title: 'Signup Footer Link URL',
      group: 'signup',
      type: 'string',
      initialValue: '/login',
      description: 'URL the footer link points to. Usually /login.',
    }),

    // ── Left panel ─────────────────────────────────────────────────────
    langCopyFields('leftPanelHeadline', 'Left Panel Headline', {
      en: 'CMS-driven publishing for engineering teams.',
      hi: 'इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन।',
      kn: 'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗೆ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ.',
    }),

    langCopyFields('leftPanelBadge', 'Left Panel Badge', {
      en: 'ENGINEERING FIRST',
      hi: 'इंजीनियरिंग सर्वप्रथम',
      kn: 'ಎಂಜಿನಿಯರಿಂಗ್ ಮೊದಲು',
    }),

    // Feature bullets — each bullet has text in all 3 languages
    defineField({
      name: 'leftPanelFeatures',
      title: 'Left Panel Feature Bullets',
      group: 'panel',
      description: 'Up to 5 feature bullets. Each has text in all 3 languages.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'en',   title: 'English', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'hi',   title: 'Hindi',   type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'kn',   title: 'Kannada', type: 'string', validation: (R) => R.required() }),
            defineField({
              name: 'icon',
              title: 'Icon (Lucide name)',
              type: 'string',
              description: 'e.g. Zap, Shield, LayoutGrid, GitBranch, Globe, Eye',
            }),
          ],
          preview: {
            select: { title: 'en' },
            prepare({ title }) { return { title } },
          },
        },
      ],
      validation: (Rule) => Rule.max(5),
    }),

    // Left panel footer note — "Backed by Supabase Auth" etc.
    langCopyFields('leftPanelFooterNote', 'Left Panel Footer Note', {
      en: 'Powered by Supabase Auth',
      hi: 'Supabase Auth द्वारा संचालित',
      kn: 'Supabase Auth ಮೂಲಕ ನಡೆಸಲ್ಪಡುತ್ತದೆ',
    }),
  ],

  preview: {
    prepare() {
      return { title: 'Auth Configuration' }
    },
  },
})