// sanity/seed.ts — ContentFlow Studio Seed
//
// Seeds section documents and page documents for all three supported languages.
// Run via:
//
//   npm run sanity-seed
//   (calls: sanity exec ./sanity/seed.ts --with-user-token)
//
// ARCHITECTURE:
//   1. Section documents are created first with stable IDs.
//   2. Page documents reference those sections via { _type: 'reference', _ref: id }.
//
// IDEMPOTENT: uses createOrReplace — safe to run multiple times.
//
// Stable ID conventions:
//   section:    section-{page}-{type}-{lang}     e.g. section-home-hero-en
//   page:       page-{slug}-{lang}               e.g. page-home-en
//   siteConfig: site-config                      (single, language-agnostic)

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

function sectionId(page: string, type: string, lang: Lang) { return `section-${page}-${type}-${lang}` }
function pageId(slug: string, lang: Lang)                  { return `page-${slug}-${lang}` }
/** Sanity array items require a _key field to be stable and addressable. */
function ref(id: string)                                   { return { _key: id, _type: 'reference' as const, _ref: id } }

// ── Translations helper ────────────────────────────────────────────────────────

function t(lang: Lang, en: string, hi: string, kn: string): string {
  if (lang === 'hi') return hi
  if (lang === 'kn') return kn
  return en
}

// ── Site Config ───────────────────────────────────────────────────────────────

async function seedSiteConfig() {
  console.log('\n⚙️  Seeding siteConfig (single document)...')

  await client.createOrReplace({
    _id:      'site-config',
    _type:    'siteConfig',
    title:    'ContentFlow',
    siteName: 'ContentFlow',
  })
  console.log('   ✓ siteConfig')
}

// ── Section documents ─────────────────────────────────────────────────────────

async function seedSections() {
  console.log('\n🧩  Seeding section documents...')

  for (const lang of LANGS) {

    // ══════════════════════════════════════════════════════════════════════════
    // HOME — 4 sections
    // ══════════════════════════════════════════════════════════════════════════

    // Home — Hero
    await client.createOrReplace({
      _id:         sectionId('home', 'hero', lang),
      _type:       'section',
      title:       t(lang, 'Home Hero', 'होम हीरो', 'ಹೋಮ್ ಹೀರೋ'),
      page:        'home',
      language:    lang,
      sectionType: 'hero',
      hero: {
        layout:  'split',
        theme:   'dark',
        badge:   t(lang, '✦ New — Sanity + Supabase', '✦ नया — Sanity + Supabase', '✦ ಹೊಸದು — Sanity + Supabase'),
        heading: t(
          lang,
          'CMS-driven publishing for engineering teams.',
          'इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन।',
          'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗಾಗಿ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ.',
        ),
        subheading: t(
          lang,
          'Build pages in Sanity Studio, manage users with Supabase, and publish everything from a single cohesive dashboard.',
          'Sanity Studio में पेज बनाएं, Supabase से उपयोगकर्ता प्रबंधित करें, और एक सुसंगत डैशबोर्ड में सब कुछ प्रकाशित करें।',
          'Sanity Studio ನಲ್ಲಿ ಪೇಜ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಿ, Supabase ನೊಂದಿಗೆ ಬಳಕೆದಾರರನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಒಂದೇ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಎಲ್ಲವನ್ನೂ ಪ್ರಕಾಶಿಸಿ.',
        ),
        primaryCta: {
          label: t(lang, 'Start for free', 'मुफ़्त शुरू करें', 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ'),
          href:  '/signup',
        },
        secondaryCta: {
          label: t(lang, 'Explore posts', 'पोस्ट एक्सप्लोर करें', 'ಪೋಸ್ಟ್‌ಗಳನ್ನು ಅನ್ವೇಷಿಸಿ'),
          href:  '/posts',
        },
        communityText: t(lang, 'Trusted by 2,000+ publishers', '2,000+ प्रकाशकों द्वारा विश्वसनीय', '2,000+ ಪ್ರಕಾಶಕರು ನಂಬುತ್ತಾರೆ'),
      },
    })

    // Home — Featured Posts
    await client.createOrReplace({
      _id:         sectionId('home', 'featured-posts', lang),
      _type:       'section',
      title:       t(lang, 'Home Featured Posts', 'होम चुनिंदा पोस्ट', 'ಹೋಮ್ ವಿಶೇಷ ಪೋಸ್ಟ್‌ಗಳು'),
      page:        'home',
      language:    lang,
      sectionType: 'featuredPosts',
      featuredPosts: {
        heading:      t(lang, 'Featured Stories', 'चुनिंदा कहानियां', 'ವಿಶೇಷ ಕಥೆಗಳು'),
        subheading:   t(lang, 'Editorially selected by our team.', 'हमारी टीम द्वारा संपादकीय रूप से चुनी गई।', 'ನಮ್ಮ ತಂಡದಿಂದ ಸಂಪಾದಕೀಯವಾಗಿ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ.'),
        maxPosts:     2,
        showExcerpt:  true,
        showTags:     true,
        viewAllLabel: t(lang, 'All stories →', 'सभी कहानियां →', 'ಎಲ್ಲಾ ಕಥೆಗಳು →'),
      },
    })

    // Home — Recent Posts
    await client.createOrReplace({
      _id:         sectionId('home', 'recent-posts', lang),
      _type:       'section',
      title:       t(lang, 'Home Recent Posts', 'होम हाल के पोस्ट', 'ಹೋಮ್ ಇತ್ತೀಚಿನ ಪೋಸ್ಟ್‌ಗಳು'),
      page:        'home',
      language:    lang,
      sectionType: 'recentPosts',
      recentPosts: {
        heading:      t(lang, 'Recent Publications', 'हाल के प्रकाशन', 'ಇತ್ತೀಚಿನ ಪ್ರಕಾಶನಗಳು'),
        subheading:   t(lang, 'Search and filter to find what you need.', 'सर्च और फिल्टर से खोजें।', 'ಹುಡುಕಿ ಮತ್ತು ಫಿಲ್ಟರ್ ಮಾಡಿ.'),
        count:        12,
        viewAllLabel: t(lang, 'View all posts', 'सभी पोस्ट देखें', 'ಎಲ್ಲಾ ಪೋಸ್ಟ್‌ಗಳನ್ನು ನೋಡಿ'),
      },
    })

    // Home — CTA
    await client.createOrReplace({
      _id:         sectionId('home', 'cta', lang),
      _type:       'section',
      title:       t(lang, 'Home CTA', 'होम CTA', 'ಹೋಮ್ CTA'),
      page:        'home',
      language:    lang,
      sectionType: 'cta',
      cta: {
        theme:    'indigo',
        centered: true,
        heading:  t(lang, 'The future of publishing is here.', 'प्रकाशन का भविष्य यहां है।', 'ಪ್ರಕಾಶನದ ಭವಿಷ್ಯ ಇಲ್ಲಿದೆ.'),
        body:     t(
          lang,
          'Join ContentFlow today and see how a modern CMS can transform the way your team creates and publishes content.',
          'आज ही ContentFlow में शामिल हों और देखें कि एक आधुनिक CMS आपकी टीम को कैसे बदल सकता है।',
          'ಇಂದೇ ContentFlow ಗೆ ಸೇರಿ ಮತ್ತು ಆಧುನಿಕ CMS ನಿಮ್ಮ ತಂಡವನ್ನು ಹೇಗೆ ಬದಲಾಯಿಸಬಹುದು ಎಂಬುದನ್ನು ನೋಡಿ.',
        ),
        primaryButton:   { label: t(lang, 'Get started today', 'आज ही शुरू करें', 'ಇಂದೇ ಪ್ರಾರಂಭಿಸಿ'), href: '/signup' },
        secondaryButton: { label: t(lang, 'Open Studio', 'Studio खोलें', 'Studio ತೆರೆಯಿರಿ'), href: '/studio' },
      },
    })

    console.log(`   ✓ home sections [${lang}]`)

    // ══════════════════════════════════════════════════════════════════════════
    // LOGIN — 3 sections
    // ══════════════════════════════════════════════════════════════════════════

    // Login — Auth Hero
    await client.createOrReplace({
      _id:         sectionId('login', 'auth-hero', lang),
      _type:       'section',
      title:       t(lang, 'Login Auth Hero', 'लॉगिन Auth हीरो', 'ಲಾಗಿನ್ Auth ಹೀರೋ'),
      page:        'login',
      language:    lang,
      sectionType: 'authHero',
      authHero: {
        mode:      'login',
        badge:     t(lang, 'ContentFlow Access', 'ContentFlow तक पहुंच', 'ContentFlow ಪ್ರವೇಶ'),
        headline:  t(
          lang,
          'CMS-driven publishing for engineering teams.',
          'इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन।',
          'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗಾಗಿ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ.',
        ),
        features: [
          { _key: 'f1', icon: '⚡', text: t(lang, 'Real-time preview in Sanity Studio', 'Sanity Studio में रीयल-टाइम प्रीव्यू', 'Sanity Studio ನಲ್ಲಿ ರಿಯಲ್-ಟೈಮ್ ಪ್ರಿವ್ಯೂ') },
          { _key: 'f2', icon: '🔐', text: t(lang, 'Supabase-powered secure authentication', 'Supabase-संचालित सुरक्षित प्रमाणीकरण', 'Supabase-ಚಾಲಿತ ಸುರಕ್ಷಿತ ದೃಢೀಕರಣ') },
          { _key: 'f3', icon: '🌐', text: t(lang, 'Multilingual content in EN, HI, and KN', 'EN, HI और KN में बहुभाषी सामग्री', 'EN, HI ಮತ್ತು KN ನಲ್ಲಿ ಬಹುಭಾಷಾ ವಿಷಯ') },
        ],
        footerNote: t(lang, 'Powered by Supabase Auth', 'Supabase Auth द्वारा संचालित', 'Supabase Auth ನಿಂದ ಚಾಲಿತ'),
      },
    })

    // Login — Auth Form
    await client.createOrReplace({
      _id:         sectionId('login', 'auth-form', lang),
      _type:       'section',
      title:       t(lang, 'Login Auth Form', 'लॉगिन Auth फॉर्म', 'ಲಾಗಿನ್ Auth ಫಾರ್ಮ್'),
      page:        'login',
      language:    lang,
      sectionType: 'authForm',
      authForm: {
        mode:                'login',
        heading:             t(lang, 'Welcome back', 'वापस स्वागत है', 'ಮರಳಿ ಸ್ವಾಗತ'),
        googleLabel:         t(lang, 'Continue with Google', 'Google से जारी रखें', 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ'),
        dividerLabel:        t(lang, 'or', 'या', 'ಅಥವಾ'),
        emailLabel:          t(lang, 'Email', 'ईमेल', 'ಇಮೇಲ್'),
        emailPlaceholder:    t(lang, 'you@example.com', 'aap@example.com', 'nimma@example.com'),
        passwordLabel:       t(lang, 'Password', 'पासवर्ड', 'ಪಾಸ್‌ವರ್ಡ್'),
        passwordPlaceholder: t(lang, 'Your password', 'आपका पासवर्ड', 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್'),
        submitLabel:         t(lang, 'Sign in', 'साइन इन करें', 'ಸೈನ್ ಇನ್ ಮಾಡಿ'),
        footerText:          t(lang, "Don't have an account?", 'अकाउंट नहीं है?', 'ಖಾತೆ ಇಲ್ಲವೇ?'),
        footerLinkLabel:     t(lang, 'Create account', 'अकाउंट बनाएं', 'ಖಾತೆ ರಚಿಸಿ'),
        footerLinkHref:      '/signup',
        showGoogleOAuth:     true,
        showEmailPassword:   true,
      },
    })

    // Login — Auth Legal
    await client.createOrReplace({
      _id:         sectionId('login', 'auth-legal', lang),
      _type:       'section',
      title:       t(lang, 'Login Auth Legal', 'लॉगिन Auth लीगल', 'ಲಾಗಿನ್ Auth ಕಾನೂನು'),
      page:        'login',
      language:    lang,
      sectionType: 'authLegal',
      authLegal: {
        links: [
          { _key: 'l1', label: t(lang, 'Terms of Service', 'सेवा की शर्तें', 'ಸೇವಾ ನಿಯಮಗಳು'), href: '#' },
          { _key: 'l2', label: t(lang, 'Privacy Policy',   'गोपनीयता नीति',  'ಗೌಪ್ಯತಾ ನೀತಿ'),  href: '#' },
          { _key: 'l3', label: t(lang, 'Security',         'सुरक्षा',        'ಭದ್ರತೆ'),          href: '#' },
        ],
      },
    })

    console.log(`   ✓ login sections [${lang}]`)

    // ══════════════════════════════════════════════════════════════════════════
    // SIGNUP — 3 sections
    // ══════════════════════════════════════════════════════════════════════════

    // Signup — Auth Hero
    await client.createOrReplace({
      _id:         sectionId('signup', 'auth-hero', lang),
      _type:       'section',
      title:       t(lang, 'Signup Auth Hero', 'साइनअप Auth हीरो', 'ಸೈನ್‌ಅಪ್ Auth ಹೀರೋ'),
      page:        'signup',
      language:    lang,
      sectionType: 'authHero',
      authHero: {
        mode:      'signup',
        badge:     t(lang, 'Join ContentFlow', 'ContentFlow में शामिल हों', 'ContentFlow ಸೇರಿ'),
        headline:  t(
          lang,
          'CMS-driven publishing for engineering teams.',
          'इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन।',
          'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗಾಗಿ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ.',
        ),
        features: [
          { _key: 'f1', icon: '📄', text: t(lang, 'Publish multilingual posts', 'बहुभाषी पोस्ट प्रकाशित करें', 'ಬಹುಭಾಷಾ ಪೋಸ್ಟ್‌ಗಳನ್ನು ಪ್ರಕಾಶಿಸಿ') },
          { _key: 'f2', icon: '🎛️', text: t(lang, 'Build pages with the page builder in Studio', 'Studio में पेज बिल्डर से पेज बनाएं', 'Studio ನಲ್ಲಿ ಪೇಜ್ ಬಿಲ್ಡರ್ ಬಳಸಿ ಪೇಜ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಿ') },
          { _key: 'f3', icon: '📊', text: t(lang, 'Get insights from PostHog analytics', 'PostHog एनालिटिक्स से इनसाइट्स पाएं', 'PostHog ಅನಾಲಿಟಿಕ್ಸ್‌ನಿಂದ ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಿರಿ') },
        ],
        footerNote: t(lang, 'Powered by Supabase Auth', 'Supabase Auth द्वारा संचालित', 'Supabase Auth ನಿಂದ ಚಾಲಿತ'),
      },
    })

    // Signup — Auth Form
    await client.createOrReplace({
      _id:         sectionId('signup', 'auth-form', lang),
      _type:       'section',
      title:       t(lang, 'Signup Auth Form', 'साइनअप Auth फॉर्म', 'ಸೈನ್‌ಅಪ್ Auth ಫಾರ್ಮ್'),
      page:        'signup',
      language:    lang,
      sectionType: 'authForm',
      authForm: {
        mode:                'signup',
        heading:             t(lang, 'Create your account', 'अपना अकाउंट बनाएं', 'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ'),
        googleLabel:         t(lang, 'Continue with Google', 'Google से जारी रखें', 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ'),
        dividerLabel:        t(lang, 'or', 'या', 'ಅಥವಾ'),
        nameLabel:           t(lang, 'Name', 'नाम', 'ಹೆಸರು'),
        namePlaceholder:     t(lang, 'Your full name', 'आपका पूरा नाम', 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು'),
        emailLabel:          t(lang, 'Email', 'ईमेल', 'ಇಮೇಲ್'),
        emailPlaceholder:    t(lang, 'you@example.com', 'aap@example.com', 'nimma@example.com'),
        passwordLabel:       t(lang, 'Password', 'पासवर्ड', 'ಪಾಸ್‌ವರ್ಡ್'),
        passwordPlaceholder: t(lang, 'Min 8 characters', 'कम से कम 8 अक्षर', 'ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು'),
        submitLabel:         t(lang, 'Create account', 'अकाउंट बनाएं', 'ಖಾತೆ ರಚಿಸಿ'),
        footerText:          t(lang, 'Already have an account?', 'पहले से अकाउंट है?', 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?'),
        footerLinkLabel:     t(lang, 'Sign in', 'साइन इन करें', 'ಸೈನ್ ಇನ್ ಮಾಡಿ'),
        footerLinkHref:      '/login',
        showGoogleOAuth:     true,
        showEmailPassword:   true,
      },
    })

    // Signup — Auth Legal
    await client.createOrReplace({
      _id:         sectionId('signup', 'auth-legal', lang),
      _type:       'section',
      title:       t(lang, 'Signup Auth Legal', 'साइनअप Auth लीगल', 'ಸೈನ್‌ಅಪ್ Auth ಕಾನೂನು'),
      page:        'signup',
      language:    lang,
      sectionType: 'authLegal',
      authLegal: {
        links: [
          { _key: 'l1', label: t(lang, 'Terms of Service', 'सेवा की शर्तें', 'ಸೇವಾ ನಿಯಮಗಳು'), href: '#' },
          { _key: 'l2', label: t(lang, 'Privacy Policy',   'गोपनीयता नीति',  'ಗೌಪ್ಯತಾ ನೀತಿ'),  href: '#' },
          { _key: 'l3', label: t(lang, 'Security',         'सुरक्षा',        'ಭದ್ರತೆ'),          href: '#' },
        ],
      },
    })

    console.log(`   ✓ signup sections [${lang}]`)

    // ══════════════════════════════════════════════════════════════════════════
    // APP PAGES (dashboard) — marker sections
    // ══════════════════════════════════════════════════════════════════════════

    // Posts
    await client.createOrReplace({
      _id:         sectionId('posts', 'posts-list', lang),
      _type:       'section',
      title:       t(lang, 'Posts List', 'पोस्ट सूची', 'ಪೋಸ್ಟ್ ಪಟ್ಟಿ'),
      page:        'posts',
      language:    lang,
      sectionType: 'postsList',
      postsList: { heading: t(lang, 'My Posts', 'मेरी पोस्ट', 'ನನ್ನ ಪೋಸ್ಟ್‌ಗಳು'), limit: 20 },
    })

    // Settings
    await client.createOrReplace({
      _id:         sectionId('settings', 'settings', lang),
      _type:       'section',
      title:       t(lang, 'Settings', 'सेटिंग्स', 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'),
      page:        'settings',
      language:    lang,
      sectionType: 'settings',
      settingsMarker: { heading: t(lang, 'Settings', 'सेटिंग्स', 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು') },
    })

    // Billing
    await client.createOrReplace({
      _id:         sectionId('billing', 'billing', lang),
      _type:       'section',
      title:       t(lang, 'Billing', 'बिलिंग', 'ಬಿಲ್ಲಿಂಗ್'),
      page:        'billing',
      language:    lang,
      sectionType: 'billing',
      billingMarker: { heading: t(lang, 'Billing', 'बिलिंग', 'ಬಿಲ್ಲಿಂಗ್') },
    })

    // Admin — analytics + admin table
    await client.createOrReplace({
      _id:         sectionId('admin', 'analytics', lang),
      _type:       'section',
      title:       t(lang, 'Admin Analytics', 'एडमिन एनालिटिक्स', 'ಅಡ್ಮಿನ್ ಅನಾಲಿಟಿಕ್ಸ್'),
      page:        'admin',
      language:    lang,
      sectionType: 'analytics',
      analyticsMarker: { heading: t(lang, 'Analytics', 'एनालिटिक्स', 'ವಿಶ್ಲೇಷಣೆ') },
    })

    await client.createOrReplace({
      _id:         sectionId('admin', 'admin', lang),
      _type:       'section',
      title:       t(lang, 'Admin Users', 'एडमिन यूजर्स', 'ಅಡ್ಮಿನ್ ಬಳಕೆದಾರರು'),
      page:        'admin',
      language:    lang,
      sectionType: 'admin',
      adminMarker: { heading: t(lang, 'Admin', 'एडमिन', 'ಅಡ್ಮಿನ್') },
    })

    console.log(`   ✓ app page sections [${lang}]`)
  }
}

// ── Page documents ────────────────────────────────────────────────────────────

interface PageDef {
  slug:        string
  access:      'guest' | 'user' | 'admin'
  layout:      'home' | 'auth' | 'dashboard'
  titles:      Record<Lang, string>
  seoTitles:   Record<Lang, string>
  seoDescs:    Record<Lang, string>
  sectionIds:  (lang: Lang) => string[]
}

const PAGES: PageDef[] = [
  {
    slug:    'home',
    access:  'guest',
    layout:  'home',
    titles:      { en: 'Home',    hi: 'होम',        kn: 'ಮುಖಪುಟ'          },
    seoTitles:   {
      en: 'ContentFlow — CMS-driven publishing for engineering teams',
      hi: 'ContentFlow — इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन',
      kn: 'ContentFlow — ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗಾಗಿ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ',
    },
    seoDescs:    {
      en: 'Build pages with Sanity Studio, manage users with Supabase, and publish multilingual content from one cohesive dashboard.',
      hi: 'Sanity Studio में पेज बनाएं, Supabase से यूज़र्स मैनेज करें और एक डैशबोर्ड से बहुभाषी कंटेंट प्रकाशित करें।',
      kn: 'Sanity Studio ನಲ್ಲಿ ಪೇಜ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಿ, Supabase ನಿಂದ ಬಳಕೆದಾರರನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಒಂದು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ಬಹುಭಾಷಾ ವಿಷಯ ಪ್ರಕಾಶಿಸಿ.',
    },
    sectionIds: (lang) => [
      sectionId('home', 'hero', lang),
      sectionId('home', 'featured-posts', lang),
      sectionId('home', 'recent-posts', lang),
      sectionId('home', 'cta', lang),
    ],
  },
  {
    slug:    'login',
    access:  'guest',
    layout:  'auth',
    titles:      { en: 'Login',    hi: 'लॉगिन',       kn: 'ಲಾಗಿನ್'           },
    seoTitles:   {
      en: 'Sign in to ContentFlow',
      hi: 'ContentFlow में साइन इन करें',
      kn: 'ContentFlow ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    },
    seoDescs:    {
      en: 'Sign in to your ContentFlow account to manage posts, settings, and billing.',
      hi: 'अपने ContentFlow खाते में साइन इन करें — पोस्ट, सेटिंग्स और बिलिंग मैनेज करें।',
      kn: 'ನಿಮ್ಮ ContentFlow ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ — ಪೋಸ್ಟ್‌ಗಳು, ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಬಿಲ್ಲಿಂಗ್ ನಿರ್ವಹಿಸಿ.',
    },
    sectionIds: (lang) => [
      sectionId('login', 'auth-hero', lang),
      sectionId('login', 'auth-form', lang),
      sectionId('login', 'auth-legal', lang),
    ],
  },
  {
    slug:    'signup',
    access:  'guest',
    layout:  'auth',
    titles:      { en: 'Sign Up',  hi: 'साइन अप',     kn: 'ಸೈನ್ ಅಪ್'         },
    seoTitles:   {
      en: 'Create your ContentFlow account',
      hi: 'अपना ContentFlow खाता बनाएं',
      kn: 'ನಿಮ್ಮ ContentFlow ಖಾತೆ ರಚಿಸಿ',
    },
    seoDescs:    {
      en: 'Join ContentFlow to publish multilingual content, manage your team, and grow your audience.',
      hi: 'ContentFlow से जुड़ें — बहुभाषी कंटेंट प्रकाशित करें, टीम मैनेज करें और अपना ऑडियंस बढ़ाएं।',
      kn: 'ContentFlow ಗೆ ಸೇರಿ — ಬಹುಭಾಷಾ ವಿಷಯ ಪ್ರಕಾಶಿಸಿ, ನಿಮ್ಮ ತಂಡವನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಪ್ರೇಕ್ಷಕರನ್ನು ಬೆಳೆಸಿ.',
    },
    sectionIds: (lang) => [
      sectionId('signup', 'auth-hero', lang),
      sectionId('signup', 'auth-form', lang),
      sectionId('signup', 'auth-legal', lang),
    ],
  },
  {
    slug:    'posts',
    access:  'user',
    layout:  'dashboard',
    titles:      { en: 'Posts',    hi: 'पोस्ट',        kn: 'ಪೋಸ್ಟ್‌ಗಳು'       },
    seoTitles:   {
      en: 'My Posts — ContentFlow Dashboard',
      hi: 'मेरी पोस्ट — ContentFlow डैशबोर्ड',
      kn: 'ನನ್ನ ಪೋಸ್ಟ್‌ಗಳು — ContentFlow ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    },
    seoDescs:    {
      en: 'Create, edit, and manage all your published and draft posts from the ContentFlow dashboard.',
      hi: 'ContentFlow डैशबोर्ड से अपने सभी प्रकाशित और ड्राफ़्ट पोस्ट बनाएं, संपादित करें और मैनेज करें।',
      kn: 'ContentFlow ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ನಿಮ್ಮ ಎಲ್ಲಾ ಪ್ರಕಾಶಿತ ಮತ್ತು ಡ್ರಾಫ್ಟ್ ಪೋಸ್ಟ್‌ಗಳನ್ನು ರಚಿಸಿ, ಸಂಪಾದಿಸಿ ಮತ್ತು ನಿರ್ವಹಿಸಿ.',
    },
    sectionIds: (lang) => [sectionId('posts', 'posts-list', lang)],
  },
  {
    slug:    'settings',
    access:  'user',
    layout:  'dashboard',
    titles:      { en: 'Settings', hi: 'सेटिंग्स',     kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'    },
    seoTitles:   {
      en: 'Account Settings — ContentFlow',
      hi: 'खाता सेटिंग्स — ContentFlow',
      kn: 'ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು — ContentFlow',
    },
    seoDescs:    {
      en: 'Update your profile, display name, bio, and account preferences in ContentFlow.',
      hi: 'ContentFlow में अपना प्रोफ़ाइल, डिस्प्ले नेम, बायो और अकाउंट प्रेफरेंस अपडेट करें।',
      kn: 'ContentFlow ನಲ್ಲಿ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್, ಹೆಸರು, ಬಯೋ ಮತ್ತು ಖಾತೆ ಆದ್ಯತೆಗಳನ್ನು ನವೀಕರಿಸಿ.',
    },
    sectionIds: (lang) => [sectionId('settings', 'settings', lang)],
  },
  {
    slug:    'billing',
    access:  'user',
    layout:  'dashboard',
    titles:      { en: 'Billing',  hi: 'बिलिंग',       kn: 'ಬಿಲ್ಲಿಂಗ್'        },
    seoTitles:   {
      en: 'Billing & Subscription — ContentFlow',
      hi: 'बिलिंग और सदस्यता — ContentFlow',
      kn: 'ಬಿಲ್ಲಿಂಗ್ ಮತ್ತು ಚಂದಾದಾರಿಕೆ — ContentFlow',
    },
    seoDescs:    {
      en: 'Manage your ContentFlow subscription plan, view usage, and update billing details.',
      hi: 'अपना ContentFlow सब्स्क्रिप्शन प्लान मैनेज करें, उपयोग देखें और बिलिंग विवरण अपडेट करें।',
      kn: 'ನಿಮ್ಮ ContentFlow ಚಂದಾದಾರಿಕೆ ಯೋಜನೆ ನಿರ್ವಹಿಸಿ, ಬಳಕೆ ವೀಕ್ಷಿಸಿ ಮತ್ತು ಬಿಲ್ಲಿಂಗ್ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಿ.',
    },
    sectionIds: (lang) => [sectionId('billing', 'billing', lang)],
  },
  {
    slug:    'admin',
    access:  'admin',
    layout:  'dashboard',
    titles:      { en: 'Admin',    hi: 'एडमिन',        kn: 'ಅಡ್ಮಿನ್'          },
    seoTitles:   {
      en: 'Admin Panel — ContentFlow',
      hi: 'एडमिन पैनल — ContentFlow',
      kn: 'ಅಡ್ಮಿನ್ ಪ್ಯಾನಲ್ — ContentFlow',
    },
    seoDescs:    {
      en: 'Admin-only dashboard for managing users, roles, analytics, and platform health.',
      hi: 'यूज़र्स, रोल्स, एनालिटिक्स और प्लेटफ़ॉर्म हेल्थ मैनेज करने के लिए एडमिन-ओनली डैशबोर्ड।',
      kn: 'ಬಳಕೆದಾರರು, ಪಾತ್ರಗಳು, ಅನಾಲಿಟಿಕ್ಸ್ ಮತ್ತು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಆರೋಗ್ಯ ನಿರ್ವಹಿಸಲು ಅಡ್ಮಿನ್-ಮಾತ್ರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್.',
    },
    sectionIds: (lang) => [
      sectionId('admin', 'analytics', lang),
      sectionId('admin', 'admin', lang),
    ],
  },
]

async function seedPages() {
  console.log('\n📄  Seeding page documents...')

  for (const def of PAGES) {
    for (const lang of LANGS) {
      const id = pageId(def.slug, lang)
      await client.createOrReplace({
        _id:            id,
        _type:          'page',
        title:          def.titles[lang],
        slug:           { _type: 'slug', current: def.slug },
        language:       lang,
        access:         def.access,
        layout:         def.layout,
        sections:       def.sectionIds(lang).map((sid) => ref(sid)),
        seoTitle:       def.seoTitles[lang],
        seoDescription: def.seoDescs[lang],
      })
      // Delete any stale draft — a Studio-saved draft with empty sections would
      // override the freshly seeded published doc in both Studio view and preview.
      await client.delete(`drafts.${id}`).catch(() => { /* no draft to delete — fine */ })
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
  await seedSections()
  await seedPages()

  console.log('\n✅  Done.\n')
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err.message ?? err)
  process.exit(1)
})
