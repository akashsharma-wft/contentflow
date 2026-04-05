/**
 * scripts/seed.ts — ContentFlow Complete Seed
 *
 * WHAT THIS DOES:
 *   1. Deletes ALL existing documents (posts, pages, siteConfig, authConfig)
 *   2. Seeds siteConfig  — navbar, sidebar, footer
 *   3. Seeds authConfig  — login/signup copy + left-panel features
 *   4. Seeds pages       — home (en/hi/kn), about, features, pricing, 404
 *   5. Seeds posts       — 4 per language (en/hi/kn) with rich body content
 *
 * USAGE:
 *   npm run seed
 *
 * REQUIRES in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_TOKEN   (Editor role — needs write + delete)
 */

import 'dotenv/config'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function key(id: string) { return id.replace(/[^a-zA-Z0-9-_]/g, '-') }

function blocks(...paragraphs: string[]) {
  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `blk-${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `sp-${i}`, text, marks: [] }],
  }))
}

// ─── 1. NUKE ──────────────────────────────────────────────────────────────────

async function deleteAll() {
  console.log('\n🗑  Deleting all existing documents...')
  const types = ['post', 'page', 'siteConfig', 'authConfig']

  for (const type of types) {
    const ids: string[] = await client.fetch(`*[_type == $type]._id`, { type })
    if (ids.length === 0) { console.log(`   ↳ no ${type} docs found`); continue }

    // Sanity mutations max 256 per batch
    const chunks: string[][] = []
    for (let i = 0; i < ids.length; i += 200) chunks.push(ids.slice(i, i + 200))

    for (const chunk of chunks) {
      await chunk.reduce((tx, id) => tx.delete(id), client.transaction()).commit()
    }
    console.log(`   ✓ deleted ${ids.length} ${type} docs`)
  }
}

// ─── 2. SITE CONFIG ───────────────────────────────────────────────────────────

async function seedSiteConfig() {
  console.log('\n⚙️  Seeding siteConfig...')
  await client.createOrReplace({
    _id: 'siteConfig',
    _type: 'siteConfig',
    siteName: 'ContentFlow',
    tagline: 'CMS-driven publishing for engineering teams.',

    // ── Public nav (header) — language-aware links use slug, fixed links use href
    publicNav: [
      { _key: 'nav-home',     label: 'Home',     slug: 'home' },
      { _key: 'nav-about',    label: 'About',    slug: 'about' },
      { _key: 'nav-features', label: 'Features', slug: 'features' },
      { _key: 'nav-pricing',  label: 'Pricing',  slug: 'pricing' },
      { _key: 'nav-studio',   label: 'Studio',   href: '/studio', openInNewTab: false },
    ],

    // ── Sidebar nav (authenticated dashboard)
    sidebarNav: [
      { _key: 'snav-dashboard',  label: 'Dashboard',  href: '/dashboard',  icon: 'LayoutDashboard', adminOnly: false },
      { _key: 'snav-posts',      label: 'Posts',      href: '/posts',      icon: 'FileText',        adminOnly: false },
      { _key: 'snav-analytics',  label: 'Analytics',  href: '/analytics',  icon: 'BarChart3',       adminOnly: false },
      { _key: 'snav-settings',   label: 'Settings',   href: '/settings',   icon: 'Settings',        adminOnly: false },
      { _key: 'snav-billing',    label: 'Billing',    href: '/billing',    icon: 'CreditCard',      adminOnly: false },
      { _key: 'snav-admin',      label: 'Admin',      href: '/admin',      icon: 'Shield',          adminOnly: true  },
    ],

    // ── Footer
    footerTagline: 'A next-generation CMS platform dedicated to storytelling and editorial excellence. Built for modern publishers.',
    footerLinks: [
      { _key: 'fl-home',     label: 'Home',          href: '/' },
      { _key: 'fl-about',    label: 'About',         href: '/about' },
      { _key: 'fl-features', label: 'Features',      href: '/features' },
      { _key: 'fl-pricing',  label: 'Pricing',       href: '/pricing' },
      { _key: 'fl-studio',   label: 'Studio',        href: '/studio' },
      { _key: 'fl-privacy',  label: 'Privacy Policy',href: '/privacy' },
      { _key: 'fl-terms',    label: 'Terms',         href: '/terms' },
    ],
    copyright: `© ${new Date().getFullYear()} ContentFlow. All rights reserved.`,
  })
  console.log('   ✓ siteConfig')
}

// ─── 3. AUTH CONFIG ───────────────────────────────────────────────────────────

async function seedAuthConfig() {
  console.log('\n🔐 Seeding authConfig...')
  await client.createOrReplace({
    _id: 'authConfig',
    _type: 'authConfig',
    showGoogleOAuth: true,
    showEmailPassword: true,

    // Login page
    loginHeading: 'Welcome back',
    loginSubheading: 'Sign in to your workspace',
    loginSubmitLabel: 'Sign in',
    loginFooterText: "Don't have an account?",
    loginFooterLinkLabel: 'Request access',
    loginFooterLinkHref: '/signup',

    // Signup page
    signupHeading: 'Create your account',
    signupSubheading: 'Join the ContentFlow workspace',
    signupSubmitLabel: 'Create account',
    signupFooterText: 'Already have an account?',
    signupFooterLinkLabel: 'Sign in',
    signupFooterLinkHref: '/login',

    // Left panel (shared by both pages)
    leftPanelHeadline: 'CMS-driven publishing for engineering teams.',
    leftPanelBadge: 'ENGINEERING FIRST',
    leftPanelFeatures: [
      { _key: 'feat-1', text: 'API-first delivery architecture',  icon: 'Zap' },
      { _key: 'feat-2', text: 'Visual Schema Builder v2.0',       icon: 'LayoutGrid' },
      { _key: 'feat-3', text: 'Multi-environment staging',        icon: 'GitBranch' },
      { _key: 'feat-4', text: 'Multilingual content (EN/HI/KN)',  icon: 'Globe' },
      { _key: 'feat-5', text: 'Live preview with Sanity Studio',  icon: 'Eye' },
    ],
  })
  console.log('   ✓ authConfig')
}

// ─── 4. PAGES ─────────────────────────────────────────────────────────────────

type Lang = 'en' | 'hi' | 'kn'
const LANGS: Lang[] = ['en', 'hi', 'kn']

// Translated labels used in page sections
const T = {
  en: {
    // Home
    homeTitle: 'Home',
    homeBadge: 'EDITORIAL CMS PLATFORM',
    homeHeroHeading: 'Ideas, Stories, and Insights',
    homeHeroSubheading: 'Crafting digital narratives with the precision of print and the agility of SaaS. Welcome to the future of content management.',
    homeCta: 'Ready to start publishing?',
    homeCtaBody: 'Sign up and start publishing content with our API-first CMS.',
    homeCtaPrimary: 'Get Started',
    homeCtaSecondary: 'Explore Studio',
    homeFeatured: 'Featured Stories',
    homeRecent: 'Recent Publications',
    homeStats: 'Platform at a glance',
    homeViewAll: 'View all posts',
    homeLoadMore: 'Load more stories',
    homeCommunity: 'JOIN OUR GLOBAL COMMUNITY OF WRITERS',
    // About
    aboutTitle: 'About',
    // Features
    featuresTitle: 'Features',
    // Pricing
    pricingTitle: 'Pricing',
  },
  hi: {
    homeTitle: 'होम',
    homeBadge: 'संपादकीय CMS प्लेटफ़ॉर्म',
    homeHeroHeading: 'विचार, कहानियाँ और अंतर्दृष्टि',
    homeHeroSubheading: 'प्रिंट की सटीकता और SaaS की चपलता के साथ डिजिटल कथाएँ तैयार करना। सामग्री प्रबंधन के भविष्य में आपका स्वागत है।',
    homeCta: 'प्रकाशन शुरू करने के लिए तैयार?',
    homeCtaBody: 'हमारे API-first CMS के साथ साइन अप करें और सामग्री प्रकाशित करना शुरू करें।',
    homeCtaPrimary: 'शुरू करें',
    homeCtaSecondary: 'स्टूडियो देखें',
    homeFeatured: 'चुनिंदा कहानियाँ',
    homeRecent: 'हाल के प्रकाशन',
    homeStats: 'प्लेटफ़ॉर्म एक नज़र में',
    homeViewAll: 'सभी पोस्ट देखें',
    homeLoadMore: 'और कहानियाँ लोड करें',
    homeCommunity: 'हमारे लेखकों के वैश्विक समुदाय से जुड़ें',
    aboutTitle: 'हमारे बारे में',
    featuresTitle: 'विशेषताएँ',
    pricingTitle: 'मूल्य निर्धारण',
  },
  kn: {
    homeTitle: 'ಮನೆ',
    homeBadge: 'ಸಂಪಾದಕೀಯ CMS ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    homeHeroHeading: 'ವಿಚಾರಗಳು, ಕಥೆಗಳು ಮತ್ತು ಒಳನೋಟಗಳು',
    homeHeroSubheading: 'ಮುದ್ರಣದ ನಿಖರತೆ ಮತ್ತು SaaS ನ ಚುರುಕುತನದಿಂದ ಡಿಜಿಟಲ್ ನಿರೂಪಣೆಗಳನ್ನು ರಚಿಸುವುದು.',
    homeCta: 'ಪ್ರಕಾಶನ ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧರಾಗಿದ್ದೀರಾ?',
    homeCtaBody: 'ನಮ್ಮ API-first CMS ನೊಂದಿಗೆ ಸೈನ್ ಅಪ್ ಮಾಡಿ ಮತ್ತು ವಿಷಯ ಪ್ರಕಟಿಸಲು ಪ್ರಾರಂಭಿಸಿ.',
    homeCtaPrimary: 'ಪ್ರಾರಂಭಿಸಿ',
    homeCtaSecondary: 'ಸ್ಟುಡಿಯೋ ನೋಡಿ',
    homeFeatured: 'ವೈಶಿಷ್ಟ್ಯ ಕಥೆಗಳು',
    homeRecent: 'ಇತ್ತೀಚಿನ ಪ್ರಕಾಶನಗಳು',
    homeStats: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಒಂದು ನೋಟದಲ್ಲಿ',
    homeViewAll: 'ಎಲ್ಲ ಪೋಸ್ಟ್ ನೋಡಿ',
    homeLoadMore: 'ಇನ್ನಷ್ಟು ಕಥೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ',
    homeCommunity: 'ನಮ್ಮ ಬರಹಗಾರರ ಜಾಗತಿಕ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ',
    aboutTitle: 'ನಮ್ಮ ಬಗ್ಗೆ',
    featuresTitle: 'ವೈಶಿಷ್ಟ್ಯಗಳು',
    pricingTitle: 'ಬೆಲೆ ನಿರ್ಧಾರ',
  },
}

async function seedHomePage(lang: Lang) {
  const t = T[lang]
  const langPrefix = lang === 'en' ? '' : `/${lang}`

  await client.createOrReplace({
    _id: `page-home-${lang}`,
    _type: 'page',
    title: t.homeTitle,
    slug: { _type: 'slug', current: 'home' },
    language: lang,
    isPublic: true,
    adminOnly: false,
    showNavbar: true,
    showSidebar: false,
    enablePosthogTracking: true,
    seoTitle: `ContentFlow — ${t.homeHeroHeading}`,
    seoDescription: t.homeHeroSubheading.slice(0, 155),
    sections: [
      // ── Hero ──────────────────────────────────────────────────────────
      {
        _type: 'heroSection',
        _key: key(`hero-${lang}`),
        heading: t.homeHeroHeading,
        subheading: t.homeHeroSubheading,
        badge: t.homeBadge,
        primaryCta:   { label: t.homeCtaPrimary,   href: '/signup' },
        secondaryCta: { label: t.homeCtaSecondary,  href: '/studio' },
        theme: 'dark',
        layout: 'split',
        communityText: t.homeCommunity,
      },

      // ── Stats ─────────────────────────────────────────────────────────
      {
        _type: 'statsSection',
        _key: key(`stats-${lang}`),
        heading: t.homeStats,
        stats: [
          { _key: key(`stat-posts-${lang}`), value: '∞',     label: lang === 'en' ? 'Published Posts' : lang === 'hi' ? 'प्रकाशित पोस्ट' : 'ಪ್ರಕಟಿತ ಪೋಸ್ಟ್',  description: lang === 'en' ? 'Live and indexed' : lang === 'hi' ? 'लाइव और इंडेक्स्ड' : 'ನೇರ ಮತ್ತು ಸೂಚಿಕೆ', useLivePostCount: true },
          { _key: key(`stat-langs-${lang}`), value: '3',     label: lang === 'en' ? 'Languages' : lang === 'hi' ? 'भाषाएँ' : 'ಭಾಷೆಗಳು', description: 'EN · HI · KN', useLivePostCount: false },
          { _key: key(`stat-ttfb-${lang}`),  value: '< 1s',  label: lang === 'en' ? 'Time to First Byte' : lang === 'hi' ? 'पहले बाइट का समय' : 'ಮೊದಲ ಬೈಟ್‌ಗೆ ಸಮಯ', description: lang === 'en' ? 'CDN-accelerated' : lang === 'hi' ? 'CDN-त्वरित' : 'CDN-ವೇಗಗೊಳಿಸಲಾಗಿದೆ', useLivePostCount: false },
          { _key: key(`stat-up-${lang}`),    value: '99.9%', label: lang === 'en' ? 'Uptime SLA' : lang === 'hi' ? 'अपटाइम SLA' : 'ಅಪ್‌ಟೈಮ್ SLA', description: lang === 'en' ? 'Globally distributed' : lang === 'hi' ? 'वैश्विक वितरण' : 'ಜಾಗತಿಕ ವಿತರಣೆ', useLivePostCount: false },
        ],
      },

      // ── Feature list ──────────────────────────────────────────────────
      {
        _type: 'featureListSection',
        _key: key(`features-${lang}`),
        heading: lang === 'en' ? 'Built for engineering teams' : lang === 'hi' ? 'इंजीनियरिंग टीमों के लिए बनाया गया' : 'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ',
        subheading: lang === 'en' ? 'Everything you need to build a modern content platform.' : lang === 'hi' ? 'एक आधुनिक सामग्री प्लेटफ़ॉर्म बनाने के लिए आपको जो कुछ चाहिए।' : 'ಆಧುನಿಕ ವಿಷಯ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅನ್ನು ನಿರ್ಮಿಸಲು ನಿಮಗೆ ಅಗತ್ಯವಾದ ಎಲ್ಲವೂ.',
        layout: 'grid-3',
        features: [
          { _key: 'fl-1', icon: 'Zap',        title: lang === 'en' ? 'API-First Architecture' : lang === 'hi' ? 'API-फर्स्ट आर्किटेक्चर' : 'API-ಮೊದಲ ವಾಸ್ತುಶಿಲ್ಪ', description: lang === 'en' ? 'Every piece of content is available via a fast, type-safe GROQ API.' : lang === 'hi' ? 'हर सामग्री तेज़, टाइप-सेफ GROQ API के माध्यम से उपलब्ध है।' : 'ಪ್ರತಿ ವಿಷಯ ತ್ವರಿತ GROQ API ಮೂಲಕ ಲಭ್ಯವಿದೆ.' },
          { _key: 'fl-2', icon: 'Globe',      title: lang === 'en' ? 'Multilingual by Default' : lang === 'hi' ? 'बहुभाषी डिफ़ॉल्ट' : 'ಬಹುಭಾಷಾ ಡೀಫಾಲ್ಟ್', description: lang === 'en' ? 'English, Hindi, and Kannada with automatic hreflang and canonicals.' : lang === 'hi' ? 'अंग्रेज़ी, हिंदी और कन्नड़ में स्वचालित hreflang के साथ।' : 'ಸ್ವಯಂಚಾಲಿತ hreflang ನೊಂದಿಗೆ ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ ಮತ್ತು ಕನ್ನಡ.' },
          { _key: 'fl-3', icon: 'Eye',        title: lang === 'en' ? 'Live Preview' : lang === 'hi' ? 'लाइव प्रीव्यू' : 'ಲೈವ್ ಪ್ರಿವ್ಯೂ', description: lang === 'en' ? 'See draft changes in real-time via Sanity Presentation tool.' : lang === 'hi' ? 'Sanity Presentation टूल के माध्यम से ड्राफ्ट परिवर्तन देखें।' : 'Sanity ಪ್ರಸ್ತುತಿ ಉಪಕರಣದ ಮೂಲಕ ಡ್ರಾಫ್ಟ್ ಬದಲಾವಣೆಗಳನ್ನು ನೋಡಿ.' },
          { _key: 'fl-4', icon: 'Shield',     title: lang === 'en' ? 'Role-Based Access' : lang === 'hi' ? 'भूमिका-आधारित पहुँच' : 'ಪಾತ್ರ-ಆಧಾರಿತ ಪ್ರವೇಶ', description: lang === 'en' ? 'Public, member, and admin roles with fine-grained page-level control.' : lang === 'hi' ? 'सार्वजनिक, सदस्य और व्यवस्थापक भूमिकाएँ।' : 'ಸಾರ್ವಜನಿಕ, ಸದಸ್ಯ ಮತ್ತು ನಿರ್ವಾಹಕ ಪಾತ್ರಗಳು.' },
          { _key: 'fl-5', icon: 'CreditCard', title: lang === 'en' ? 'Stripe Billing' : lang === 'hi' ? 'Stripe बिलिंग' : 'Stripe ಬಿಲ್ಲಿಂಗ್', description: lang === 'en' ? 'Free and Pro tiers with Stripe webhooks and customer portal.' : lang === 'hi' ? 'Stripe webhooks के साथ फ्री और प्रो टियर।' : 'Stripe webhooks ನೊಂದಿಗೆ ಉಚಿತ ಮತ್ತು ಪ್ರೊ ಹಂತಗಳು.' },
          { _key: 'fl-6', icon: 'BarChart3',  title: lang === 'en' ? 'PostHog Analytics' : lang === 'hi' ? 'PostHog एनालिटिक्स' : 'PostHog ವಿಶ್ಲೇಷಣೆ', description: lang === 'en' ? 'Real-time event tracking with live session monitoring.' : lang === 'hi' ? 'लाइव सत्र निगरानी के साथ रियल-टाइम इवेंट ट्रैकिंग।' : 'ಲೈವ್ ಅಧಿವೇಶನ ಮೇಲ್ವಿಚಾರಣೆಯೊಂದಿಗೆ ರಿಯಲ್-ಟೈಮ್ ಈವೆಂಟ್ ಟ್ರ್ಯಾಕಿಂಗ್.' },
        ],
      },

      // ── Featured posts ────────────────────────────────────────────────
      {
        _type: 'featuredPostsSection',
        _key: key(`featured-${lang}`),
        heading: t.homeFeatured,
        maxPosts: 2,
        layout: 'grid',
        showExcerpt: true,
        showTags: true,
        viewAllLabel: t.homeViewAll,
      },

      // ── Recent posts ──────────────────────────────────────────────────
      {
        _type: 'recentPostsSection',
        _key: key(`recent-${lang}`),
        heading: t.homeRecent,
        count: 6,
        layout: 'grid',
        showCoverImage: true,
        viewAllLabel: t.homeLoadMore,
        viewAllHref: langPrefix || '/',
      },

      // ── CTA ───────────────────────────────────────────────────────────
      {
        _type: 'ctaSection',
        _key: key(`cta-${lang}`),
        heading: t.homeCta,
        body: t.homeCtaBody,
        primaryButton:   { label: t.homeCtaPrimary,   href: '/signup' },
        secondaryButton: { label: t.homeCtaSecondary,  href: '/login' },
        theme: 'indigo',
        centered: true,
      },
    ],
  })
  console.log(`   ✓ home [${lang}]`)
}

async function seedAboutPage(lang: Lang) {
  const title = T[lang].aboutTitle

  await client.createOrReplace({
    _id: `page-about-${lang}`,
    _type: 'page',
    title,
    slug: { _type: 'slug', current: 'about' },
    language: lang,
    isPublic: true,
    adminOnly: false,
    showNavbar: true,
    showSidebar: false,
    enablePosthogTracking: true,
    seoTitle: `${title} — ContentFlow`,
    sections: [
      {
        _type: 'headingSection',
        _key: key(`about-h-${lang}`),
        heading: lang === 'en' ? 'We build tools for storytellers' : lang === 'hi' ? 'हम कहानीकारों के लिए उपकरण बनाते हैं' : 'ನಾವು ಕಥೆಗಾರರಿಗೆ ಉಪಕರಣಗಳನ್ನು ಮಾಡುತ್ತೇವೆ',
        subheading: lang === 'en' ? 'ContentFlow is a CMS-first publishing platform designed for engineering-minded editorial teams who demand both speed and flexibility.' : lang === 'hi' ? 'ContentFlow एक CMS-फर्स्ट पब्लिशिंग प्लेटफ़ॉर्म है जो इंजीनियरिंग-उन्मुख संपादकीय टीमों के लिए बनाया गया है।' : 'ContentFlow ಒಂದು CMS-ಮೊದಲ ಪ್ರಕಾಶನ ವೇದಿಕೆ.',
        align: 'center',
        size: 'h1',
      },
      {
        _type: 'richTextSection',
        _key: key(`about-rt-${lang}`),
        heading: lang === 'en' ? 'Our mission' : lang === 'hi' ? 'हमारा मिशन' : 'ನಮ್ಮ ಧ್ಯೇಯ',
        content: blocks(
          lang === 'en'
            ? 'ContentFlow was built out of frustration with the status quo. Traditional CMS platforms force a choice between developer flexibility and editorial power. We believe you should have both.'
            : lang === 'hi'
            ? 'ContentFlow पारंपरिक CMS प्लेटफ़ॉर्म की निराशा से बनाया गया था। हम मानते हैं कि आपके पास डेवलपर लचीलापन और संपादकीय शक्ति दोनों होनी चाहिए।'
            : 'ContentFlow ಸಾಂಪ್ರದಾಯಿಕ CMS ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗಳ ಹತಾಶೆಯಿಂದ ನಿರ್ಮಿಸಲ್ಪಟ್ಟಿದೆ.',
          lang === 'en'
            ? 'Our stack is intentional: Sanity for structured content, Next.js for performance, Supabase for auth, and Stripe for monetisation. Every layer is replaceable, every API is documented.'
            : lang === 'hi'
            ? 'हमारा स्टैक जानबूझकर है: Sanity संरचित सामग्री के लिए, Next.js प्रदर्शन के लिए, Supabase auth के लिए।'
            : 'ನಮ್ಮ ಸ್ಟಾಕ್ ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿದೆ: Sanity, Next.js, Supabase, Stripe.',
        ),
        maxWidth: 'medium',
      },
      {
        _type: 'teamSection',
        _key: key(`about-team-${lang}`),
        heading: lang === 'en' ? 'The team' : lang === 'hi' ? 'टीम' : 'ತಂಡ',
        subheading: lang === 'en' ? 'Small team, big opinions on developer experience.' : lang === 'hi' ? 'छोटी टीम, डेवलपर अनुभव पर बड़े विचार।' : 'ಸಣ್ಣ ತಂಡ, ಡೆವಲಪರ್ ಅನುಭವದ ಬಗ್ಗೆ ದೊಡ್ಡ ಅಭಿಪ್ರಾಯಗಳು.',
        columns: 3,
        members: [
          { _key: 'm-1', name: 'Akash Sharma',   role: lang === 'en' ? 'Founder & Lead Engineer' : lang === 'hi' ? 'संस्थापक और मुख्य इंजीनियर' : 'ಸಂಸ್ಥಾಪಕ ಮತ್ತು ಮುಖ್ಯ ಎಂಜಿನಿಯರ್', bio: lang === 'en' ? 'Obsessed with DX, type-safety, and shipping fast.' : 'DX, टाइप-सेफ्टी और तेज़ शिपिंग का जुनून।' },
          { _key: 'm-2', name: 'Editorial Team',  role: lang === 'en' ? 'Content & Strategy' : lang === 'hi' ? 'सामग्री और रणनीति' : 'ವಿಷಯ ಮತ್ತು ತಂತ್ರ', bio: lang === 'en' ? 'Keeping the writing quality high and the grammar tight.' : 'लेखन गुणवत्ता उच्च रखना।' },
          { _key: 'm-3', name: 'Design System',   role: lang === 'en' ? 'UI/UX & Design' : lang === 'hi' ? 'UI/UX और डिज़ाइन' : 'UI/UX ಮತ್ತು ವಿನ್ಯಾಸ', bio: lang === 'en' ? 'Every pixel in the dark theme earns its place.' : 'डार्क थीम में हर पिक्सेल की अपनी जगह है।' },
        ],
      },
      {
        _type: 'ctaSection',
        _key: key(`about-cta-${lang}`),
        heading: lang === 'en' ? 'Want to contribute?' : lang === 'hi' ? 'योगदान करना चाहते हैं?' : 'ಕೊಡುಗೆ ನೀಡಲು ಬಯಸುವಿರಾ?',
        body: lang === 'en' ? 'We welcome posts from engineers, designers, and technical writers.' : lang === 'hi' ? 'हम इंजीनियरों, डिज़ाइनरों और तकनीकी लेखकों से पोस्ट का स्वागत करते हैं।' : 'ನಾವು ಎಂಜಿನಿಯರ್‌ಗಳು, ವಿನ್ಯಾಸಕರು ಮತ್ತು ತಾಂತ್ರಿಕ ಬರಹಗಾರರಿಂದ ಪೋಸ್ಟ್‌ಗಳನ್ನು ಸ್ವಾಗತಿಸುತ್ತೇವೆ.',
        primaryButton: { label: lang === 'en' ? 'Create Account' : lang === 'hi' ? 'खाता बनाएँ' : 'ಖಾತೆ ರಚಿಸಿ', href: '/signup' },
        theme: 'indigo',
        centered: true,
      },
    ],
  })
  console.log(`   ✓ about [${lang}]`)
}

async function seedFeaturesPage(lang: Lang) {
  const title = T[lang].featuresTitle

  await client.createOrReplace({
    _id: `page-features-${lang}`,
    _type: 'page',
    title,
    slug: { _type: 'slug', current: 'features' },
    language: lang,
    isPublic: true,
    adminOnly: false,
    showNavbar: true,
    showSidebar: false,
    enablePosthogTracking: true,
    seoTitle: `${title} — ContentFlow`,
    sections: [
      {
        _type: 'headingSection',
        _key: key(`feat-h-${lang}`),
        heading: lang === 'en' ? 'Everything you need to publish at scale' : lang === 'hi' ? 'बड़े पैमाने पर प्रकाशित करने के लिए सब कुछ' : 'ದೊಡ್ಡ ಪ್ರಮಾಣದಲ್ಲಿ ಪ್ರಕಟಿಸಲು ಎಲ್ಲವೂ',
        subheading: lang === 'en' ? 'From structured content to live preview, ContentFlow covers the full editorial workflow.' : lang === 'hi' ? 'संरचित सामग्री से लाइव प्रीव्यू तक, ContentFlow पूरे संपादकीय वर्कफ़्लो को कवर करता है।' : 'ರಚನಾತ್ಮಕ ವಿಷಯದಿಂದ ಲೈವ್ ಪ್ರಿವ್ಯೂ ವರೆಗೆ, ContentFlow ಸಂಪೂರ್ಣ ಸಂಪಾದಕೀಯ ವರ್ಕ್‌ಫ್ಲೋ ಅನ್ನು ಒಳಗೊಂಡಿದೆ.',
        align: 'center',
        size: 'h1',
      },
      {
        _type: 'featureListSection',
        _key: key(`feat-list-${lang}`),
        layout: 'grid-3',
        features: [
          { _key: 'f1', icon: 'FileText',   title: lang === 'en' ? 'Page Builder' : lang === 'hi' ? 'पेज बिल्डर' : 'ಪೇಜ್ ಬಿಲ್ಡರ್', description: lang === 'en' ? '31 configurable section types — hero, CTA, grid, tabs, carousel, FAQ, pricing, and more.' : lang === 'hi' ? '31 कॉन्फ़िगर करने योग्य सेक्शन प्रकार।' : '31 ಕಾನ್ಫಿಗರ್ ಮಾಡಬಹುದಾದ ವಿಭಾಗ ಪ್ರಕಾರಗಳು.' },
          { _key: 'f2', icon: 'Globe',      title: lang === 'en' ? 'i18n Routing' : lang === 'hi' ? 'i18n रूटिंग' : 'i18n ರೂಟಿಂಗ್', description: lang === 'en' ? 'EN/HI/KN with ISR, hreflang alternates, and canonical URLs baked in.' : lang === 'hi' ? 'ISR के साथ EN/HI/KN।' : 'ISR ನೊಂದಿಗೆ EN/HI/KN.' },
          { _key: 'f3', icon: 'Eye',        title: lang === 'en' ? 'Draft Preview' : lang === 'hi' ? 'ड्राफ्ट प्रीव्यू' : 'ಡ್ರಾಫ್ಟ್ ಪ್ರಿವ್ಯೂ', description: lang === 'en' ? 'Sanity Presentation tool with Draft Mode — see edits live before publishing.' : lang === 'hi' ? 'Sanity Presentation टूल के साथ ड्राफ्ट मोड।' : 'Sanity ಪ್ರಸ್ತುತಿ ಉಪಕರಣ ಮತ್ತು ಡ್ರಾಫ್ಟ್ ಮೋಡ್.' },
          { _key: 'f4', icon: 'Users',      title: lang === 'en' ? 'Multi-Editor' : lang === 'hi' ? 'मल्टी-एडिटर' : 'ಬಹು-ಸಂಪಾದಕ', description: lang === 'en' ? 'Multiple content editors can work simultaneously in Sanity Studio.' : lang === 'hi' ? 'कई सामग्री संपादक एक साथ काम कर सकते हैं।' : 'ಅನೇಕ ಸಂಪಾದಕರು ಏಕಕಾಲದಲ್ಲಿ ಕೆಲಸ ಮಾಡಬಹುದು.' },
          { _key: 'f5', icon: 'Lock',       title: lang === 'en' ? 'Access Control' : lang === 'hi' ? 'एक्सेस कंट्रोल' : 'ಪ್ರವೇಶ ನಿಯಂತ್ರಣ', description: lang === 'en' ? 'Page-level isPublic and adminOnly flags set directly in the CMS.' : lang === 'hi' ? 'CMS में सीधे isPublic और adminOnly फ्लैग।' : 'CMS ನಲ್ಲಿ isPublic ಮತ್ತು adminOnly ಫ್ಲ್ಯಾಗ್‌ಗಳು.' },
          { _key: 'f6', icon: 'Zap',        title: lang === 'en' ? 'ISR + CDN' : lang === 'hi' ? 'ISR + CDN' : 'ISR + CDN', description: lang === 'en' ? 'Pages revalidate every 60 seconds. Content updates reach visitors in under a minute.' : lang === 'hi' ? 'पेज हर 60 सेकंड में रिवैलिडेट होते हैं।' : 'ಪ್ರತಿ 60 ಸೆಕೆಂಡ್‌ಗೆ ಪೇಜ್‌ಗಳು ಮರು-ಮೌಲ್ಯಮಾಪನಗೊಳ್ಳುತ್ತವೆ.' },
        ],
      },
      {
        _type: 'faqSection',
        _key: key(`feat-faq-${lang}`),
        heading: lang === 'en' ? 'Frequently Asked Questions' : lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು',
        layout: 'accordion',
        faqs: [
          {
            _key: 'faq-1',
            question: lang === 'en' ? 'Can I preview drafts without publishing?' : lang === 'hi' ? 'क्या मैं प्रकाशित किए बिना ड्राफ्ट प्रीव्यू कर सकता हूँ?' : 'ಪ್ರಕಟಿಸದೆ ಡ್ರಾಫ್ಟ್ ಪ್ರಿವ್ಯೂ ಮಾಡಬಹುದೇ?',
            answer: blocks(lang === 'en' ? 'Yes. The Sanity Presentation tool enables real-time draft preview via Next.js Draft Mode. Click Preview in the Studio toolbar to enter preview mode.' : lang === 'hi' ? 'हाँ। Sanity Presentation टूल Next.js Draft Mode के माध्यम से रियल-टाइम ड्राफ्ट प्रीव्यू को सक्षम करता है।' : 'ಹೌದು. Sanity ಪ್ರಸ್ತುತಿ ಉಪಕರಣ Next.js ಡ್ರಾಫ್ಟ್ ಮೋಡ್ ಮೂಲಕ ರಿಯಲ್-ಟೈಮ್ ಡ್ರಾಫ್ಟ್ ಪ್ರಿವ್ಯೂ ಅನ್ನು ಸಕ್ರಿಯಗೊಳಿಸುತ್ತದೆ.'),
          },
          {
            _key: 'faq-2',
            question: lang === 'en' ? 'How does multilingual content work?' : lang === 'hi' ? 'बहुभाषी सामग्री कैसे काम करती है?' : 'ಬಹುಭಾಷಾ ವಿಷಯ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?',
            answer: blocks(lang === 'en' ? 'Each page and post has a language field managed by the @sanity/document-internationalization plugin. English content lives at /slug, Hindi at /hi/slug, and Kannada at /kn/slug.' : lang === 'hi' ? 'प्रत्येक पेज और पोस्ट में language फ़ील्ड होता है। अंग्रेज़ी /slug पर, हिंदी /hi/slug पर और कन्नड़ /kn/slug पर।' : 'ಪ್ರತಿ ಪೇಜ್ ಮತ್ತು ಪೋಸ್ಟ್‌ಗೆ language ಕ್ಷೇತ್ರವಿದೆ.'),
          },
          {
            _key: 'faq-3',
            question: lang === 'en' ? 'Can multiple editors work at the same time?' : lang === 'hi' ? 'क्या कई संपादक एक साथ काम कर सकते हैं?' : 'ಅನೇಕ ಸಂಪಾದಕರು ಒಂದೇ ಸಮಯದಲ್ಲಿ ಕೆಲಸ ಮಾಡಬಹುದೇ?',
            answer: blocks(lang === 'en' ? 'Yes. Sanity Studio supports real-time collaborative editing. Multiple team members can edit different documents simultaneously, and the Studio shows live presence indicators.' : lang === 'hi' ? 'हाँ। Sanity Studio रियल-टाइम सहयोगी संपादन का समर्थन करता है।' : 'ಹೌದು. Sanity Studio ರಿಯಲ್-ಟೈಮ್ ಸಹಯೋಗ ಸಂಪಾದನೆಯನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.'),
          },
        ],
      },
      {
        _type: 'ctaSection',
        _key: key(`feat-cta-${lang}`),
        heading: lang === 'en' ? 'Start building today' : lang === 'hi' ? 'आज बनाना शुरू करें' : 'ಇಂದೇ ನಿರ್ಮಿಸಲು ಪ್ರಾರಂಭಿಸಿ',
        primaryButton: { label: lang === 'en' ? 'Get started free' : lang === 'hi' ? 'मुफ़्त शुरू करें' : 'ಉಚಿತ ಪ್ರಾರಂಭಿಸಿ', href: '/signup' },
        secondaryButton: { label: lang === 'en' ? 'View pricing' : lang === 'hi' ? 'मूल्य देखें' : 'ಬೆಲೆ ನೋಡಿ', href: '/pricing' },
        theme: 'indigo',
        centered: true,
      },
    ],
  })
  console.log(`   ✓ features [${lang}]`)
}

async function seedPricingPage(lang: Lang) {
  const title = T[lang].pricingTitle

  await client.createOrReplace({
    _id: `page-pricing-${lang}`,
    _type: 'page',
    title,
    slug: { _type: 'slug', current: 'pricing' },
    language: lang,
    isPublic: true,
    adminOnly: false,
    showNavbar: true,
    showSidebar: false,
    enablePosthogTracking: true,
    seoTitle: `${title} — ContentFlow`,
    sections: [
      {
        _type: 'headingSection',
        _key: key(`price-h-${lang}`),
        heading: lang === 'en' ? 'Simple, transparent pricing' : lang === 'hi' ? 'सरल, पारदर्शी मूल्य निर्धारण' : 'ಸರಳ, ಪಾರದರ್ಶಕ ಬೆಲೆ ನಿರ್ಧಾರ',
        subheading: lang === 'en' ? 'Start free, upgrade when you need more.' : lang === 'hi' ? 'मुफ़्त शुरू करें, जब आपको अधिक चाहिए तो अपग्रेड करें।' : 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ, ಹೆಚ್ಚು ಬೇಕಾದಾಗ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ.',
        align: 'center',
        size: 'h1',
      },
      {
        _type: 'pricingSection',
        _key: key(`price-plans-${lang}`),
        plans: [
          {
            _key: 'plan-free',
            name: lang === 'en' ? 'Free' : lang === 'hi' ? 'मुफ़्त' : 'ಉಚಿತ',
            price: '$0',
            priceNote: lang === 'en' ? '/month' : lang === 'hi' ? '/माह' : '/ತಿಂಗಳು',
            description: lang === 'en' ? 'For individuals starting their editorial journey.' : lang === 'hi' ? 'अपनी संपादकीय यात्रा शुरू करने वाले व्यक्तियों के लिए।' : 'ಸಂಪಾದಕೀಯ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸುವ ವ್ಯಕ್ತಿಗಳಿಗೆ.',
            highlighted: false,
            features: [
              { _key: 'ff1', text: lang === 'en' ? '5 Published Posts' : lang === 'hi' ? '5 प्रकाशित पोस्ट' : '5 ಪ್ರಕಟಿತ ಪೋಸ್ಟ್',         included: true },
              { _key: 'ff2', text: lang === 'en' ? '1,000 API Calls/mo'  : lang === 'hi' ? '1,000 API कॉल/माह'  : '1,000 API ಕರೆಗಳು/ತಿಂಗಳು',  included: true },
              { _key: 'ff3', text: lang === 'en' ? 'Community Support'   : lang === 'hi' ? 'सामुदायिक सहायता'   : 'ಸಮುದಾಯ ಬೆಂಬಲ',              included: true },
              { _key: 'ff4', text: lang === 'en' ? 'Unlimited Posts'     : lang === 'hi' ? 'असीमित पोस्ट'       : 'ಅಪರಿಮಿತ ಪೋಸ್ಟ್',             included: false },
              { _key: 'ff5', text: lang === 'en' ? 'Team Collaboration'  : lang === 'hi' ? 'टीम सहयोग'          : 'ತಂಡ ಸಹಯೋಗ',                 included: false },
            ],
            ctaLabel: lang === 'en' ? 'Get started free' : lang === 'hi' ? 'मुफ़्त शुरू करें' : 'ಉಚಿತ ಪ್ರಾರಂಭಿಸಿ',
            ctaHref: '/signup',
          },
          {
            _key: 'plan-pro',
            name: 'ContentFlow Pro',
            price: '$9',
            priceNote: lang === 'en' ? '/month' : lang === 'hi' ? '/माह' : '/ತಿಂಗಳು',
            description: lang === 'en' ? 'Unleash the full potential of high-performance content delivery.' : lang === 'hi' ? 'उच्च-प्रदर्शन सामग्री वितरण की पूर्ण क्षमता को उजागर करें।' : 'ಉನ್ನತ-ಕಾರ್ಯಕ್ಷಮತೆ ವಿಷಯ ವಿತರಣೆಯ ಸಂಪೂರ್ಣ ಸಾಮರ್ಥ್ಯವನ್ನು ಬಿಡುಗಡೆ ಮಾಡಿ.',
            badge: lang === 'en' ? 'Most Popular' : lang === 'hi' ? 'सबसे लोकप्रिय' : 'ಅತ್ಯಂತ ಜನಪ್ರಿಯ',
            highlighted: true,
            features: [
              { _key: 'pf1', text: lang === 'en' ? 'Unlimited Posts'      : lang === 'hi' ? 'असीमित पोस्ट'        : 'ಅಪರಿಮಿತ ಪೋಸ್ಟ್',              included: true },
              { _key: 'pf2', text: lang === 'en' ? '10,000 API Calls/mo'  : lang === 'hi' ? '10,000 API कॉल/माह'  : '10,000 API ಕರೆಗಳು/ತಿಂಗಳು',  included: true },
              { _key: 'pf3', text: lang === 'en' ? 'Priority Email Support': lang === 'hi' ? 'प्राथमिकता ईमेल सहायता': 'ಆದ್ಯತಾ ಇಮೇಲ್ ಬೆಂಬಲ',          included: true },
              { _key: 'pf4', text: lang === 'en' ? 'Team Collaboration (5 seats)': lang === 'hi' ? 'टीम सहयोग (5 सीटें)': 'ತಂಡ ಸಹಯೋಗ (5 ಸ್ಥಾನಗಳು)',    included: true },
              { _key: 'pf5', text: lang === 'en' ? 'Stripe Billing Portal' : lang === 'hi' ? 'Stripe बिलिंग पोर्टल' : 'Stripe ಬಿಲ್ಲಿಂಗ್ ಪೋರ್ಟಲ್',   included: true },
            ],
            ctaLabel: lang === 'en' ? 'Upgrade to Pro' : lang === 'hi' ? 'Pro में अपग्रेड करें' : 'Pro ಗೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ',
            ctaHref: '/billing',
          },
        ],
      },
      {
        _type: 'faqSection',
        _key: key(`price-faq-${lang}`),
        heading: lang === 'en' ? 'Billing FAQ' : lang === 'hi' ? 'बिलिंग FAQ' : 'ಬಿಲ್ಲಿಂಗ್ FAQ',
        layout: 'accordion',
        faqs: [
          {
            _key: 'bfaq-1',
            question: lang === 'en' ? 'Can I cancel anytime?' : lang === 'hi' ? 'क्या मैं कभी भी रद्द कर सकता हूँ?' : 'ನಾನು ಯಾವಾಗಲಾದರೂ ರದ್ದುಗೊಳಿಸಬಹುದೇ?',
            answer: blocks(lang === 'en' ? 'Yes. Cancel anytime from your Billing page. You keep Pro access until the end of the current billing period.' : lang === 'hi' ? 'हाँ। अपने Billing पेज से कभी भी रद्द करें। आपके पास वर्तमान बिलिंग अवधि के अंत तक Pro एक्सेस रहता है।' : 'ಹೌದು. ನಿಮ್ಮ ಬಿಲ್ಲಿಂಗ್ ಪೇಜ್‌ನಿಂದ ಯಾವಾಗಲಾದರೂ ರದ್ದುಗೊಳಿಸಿ.'),
          },
          {
            _key: 'bfaq-2',
            question: lang === 'en' ? 'What happens when I exceed the free post limit?' : lang === 'hi' ? 'जब मैं मुफ़्त पोस्ट सीमा से अधिक हो जाता हूँ तो क्या होता है?' : 'ಉಚಿತ ಪೋಸ್ಟ್ ಮಿತಿ ಮೀರಿದಾಗ ಏನಾಗುತ್ತದೆ?',
            answer: blocks(lang === 'en' ? 'Free plan allows 5 published posts. When you hit the limit, new posts are saved as drafts until you upgrade or remove existing published posts.' : lang === 'hi' ? 'फ्री प्लान 5 प्रकाशित पोस्ट की अनुमति देता है। जब आप सीमा तक पहुँचते हैं, नई पोस्ट ड्राफ्ट के रूप में सहेजी जाती हैं।' : 'ಉಚಿತ ಯೋಜನೆ 5 ಪ್ರಕಟಿತ ಪೋಸ್ಟ್‌ಗಳನ್ನು ಅನುಮತಿಸುತ್ತದೆ.'),
          },
        ],
      },
    ],
  })
  console.log(`   ✓ pricing [${lang}]`)
}

// ─── 5. POSTS ─────────────────────────────────────────────────────────────────

interface PostData {
  id: string
  slug: string
  lang: Lang
  title: string
  excerpt: string
  bodyParagraphs: string[]
  tags: string[]
  featured: boolean
  authorName: string
}

const POSTS: PostData[] = [
  // ── English ───────────────────────────────────────────────────────────────
  {
    id: 'post-en-1',
    slug: 'the-quantum-shift',
    lang: 'en',
    title: 'The Quantum Shift: How AI is Redefining Creative Workflows',
    excerpt: 'Exploring the intersection of generative neural networks and the traditional craft of editorial design in the modern age.',
    bodyParagraphs: [
      'The rise of generative AI has fundamentally changed how editorial teams approach creative work. The tools available today would have seemed like science fiction a decade ago.',
      'Yet the most interesting developments are not about replacing human creativity — they are about augmenting it. When a designer can generate 50 visual concepts in the time it used to take to sketch three, the creative ceiling rises dramatically.',
      'The bottleneck shifts from ideation to curation. The skill is no longer just in making things — it is in knowing which things are worth making. This is, perhaps, the most human skill of all.',
      'ContentFlow was built with this reality in mind. Every section on every page is editable in Sanity Studio. Every change can be previewed live before publishing. The workflow is designed to stay out of your way.',
    ],
    tags: ['Technology', 'AI', 'Design'],
    featured: true,
    authorName: 'Editorial Team',
  },
  {
    id: 'post-en-2',
    slug: 'minimalism-in-the-age-of-digital-abundance',
    lang: 'en',
    title: 'Minimalism in the Age of Digital Abundance',
    excerpt: 'The most refined interfaces of 2024 are those that dare to be silent and focus on core utility.',
    bodyParagraphs: [
      'As screens proliferate and attention fragments, the interfaces that cut through the noise share one characteristic: restraint. The discipline to not add a feature, to not include one more animation, to not fill every pixel with information.',
      'This is not laziness — it is the hardest kind of design work. Every element that remains has survived a rigorous audit. The question is not "should we add this?" but "does this earn its place?"',
      'The dark theme you are reading this in was not chosen for aesthetics alone. Dark backgrounds reduce cognitive load during long reading sessions. High-contrast typography improves comprehension. Every design decision on ContentFlow has a reason.',
      'Minimalism is not the absence of elements. It is the presence of the right elements, in the right proportion, at the right time.',
    ],
    tags: ['Design', 'UX', 'Philosophy'],
    featured: true,
    authorName: 'Editorial Team',
  },
  {
    id: 'post-en-3',
    slug: 'building-remote-first-design-cultures',
    lang: 'en',
    title: 'Building Remote-First Design Cultures',
    excerpt: 'Distributed teams are not a compromise — they are an opportunity to build better processes from the ground up.',
    bodyParagraphs: [
      'The pandemic forced design teams worldwide into remote work overnight. Three years on, the teams that thrived are not the ones that replicated the office environment online — they are the ones that rebuilt their processes entirely.',
      'Asynchronous collaboration is the foundation. Design reviews via recorded Loom walkthroughs. Written design rationale before the meeting, not during it. Documentation as a first-class artifact.',
      'The best remote design cultures share one quality: they write everything down. Decisions, trade-offs, rejected options, the context that future team members will need. Sanity Studio, with its structured content and version history, was built for exactly this kind of rigour.',
    ],
    tags: ['Culture', 'Remote', 'Design'],
    featured: false,
    authorName: 'Editorial Team',
  },
  {
    id: 'post-en-4',
    slug: 'sanity-schema-design-patterns',
    lang: 'en',
    title: 'Sanity Schema Design Patterns for Complex Editorial Sites',
    excerpt: 'How to structure Sanity schemas when your content model grows beyond simple blog posts.',
    bodyParagraphs: [
      'Most Sanity tutorials start with a blog. A post has a title, a slug, a body. Simple. But real editorial sites have pages, sections, singletons, internationalized content, and complex relationships.',
      'The page-builder pattern — where a page document contains an array of section blocks — is the cornerstone of ContentFlow. Each section type is a self-contained schema object with its own fields. Adding a new section requires: a schema definition, a React component, and one line in the SectionRenderer.',
      'Singletons like siteConfig and authConfig should use fixed document IDs and be excluded from the "new document" menu in Structure Tool. The Structure Tool override is where you take control of how editors experience your content model.',
      'The @sanity/document-internationalization plugin handles the complexity of multilingual documents. Each language variant is a separate document linked by translation references. Your GROQ queries need to account for language fallbacks.',
    ],
    tags: ['Sanity', 'CMS', 'Engineering'],
    featured: false,
    authorName: 'Engineering Team',
  },

  // ── Hindi ─────────────────────────────────────────────────────────────────
  {
    id: 'post-hi-1',
    slug: 'the-quantum-shift',
    lang: 'hi',
    title: 'क्वांटम शिफ्ट: AI रचनात्मक कार्यप्रवाह को कैसे पुनर्परिभाषित कर रहा है',
    excerpt: 'आधुनिक युग में जनरेटिव न्यूरल नेटवर्क और पारंपरिक संपादकीय डिजाइन के शिल्प के चौराहे की खोज।',
    bodyParagraphs: [
      'जनरेटिव AI के उदय ने संपादकीय टीमों के रचनात्मक कार्य के तरीके को मौलिक रूप से बदल दिया है। आज उपलब्ध उपकरण एक दशक पहले विज्ञान कथा जैसे लगते थे।',
      'फिर भी सबसे दिलचस्प विकास मानवीय रचनात्मकता को प्रतिस्थापित करने के बारे में नहीं है — यह उसे बढ़ाने के बारे में है। जब एक डिजाइनर तीन स्केच बनाने में लगने वाले समय में 50 दृश्य अवधारणाएं उत्पन्न कर सकता है, तो रचनात्मक छत नाटकीय रूप से ऊंची हो जाती है।',
      'बाधा विचार-मंथन से क्यूरेशन में बदल जाती है। कौशल अब केवल चीजें बनाने में नहीं है — यह यह जानने में है कि कौन सी चीजें बनाने लायक हैं। यह, शायद, सबसे मानवीय कौशल है।',
    ],
    tags: ['Technology', 'AI', 'Design'],
    featured: true,
    authorName: 'संपादकीय टीम',
  },
  {
    id: 'post-hi-2',
    slug: 'minimalism-in-the-age-of-digital-abundance',
    lang: 'hi',
    title: 'डिजिटल प्रचुरता के युग में न्यूनतावाद',
    excerpt: '2024 के सबसे परिष्कृत इंटरफेस वे हैं जो चुप रहने और मुख्य उपयोगिता पर ध्यान केंद्रित करने का साहस करते हैं।',
    bodyParagraphs: [
      'जैसे-जैसे स्क्रीन बढ़ती हैं और ध्यान बिखरता है, जो इंटरफेस शोर को काटते हैं उनमें एक विशेषता होती है: संयम। किसी फीचर को न जोड़ने, कोई और एनिमेशन न शामिल करने, हर पिक्सेल को जानकारी से न भरने का अनुशासन।',
      'यह आलस्य नहीं है — यह सबसे कठिन प्रकार का डिजाइन कार्य है। जो भी तत्व बचा रहता है वह एक कठोर ऑडिट से गुजरा होता है।',
      'न्यूनतावाद तत्वों की अनुपस्थिति नहीं है। यह सही समय पर, सही अनुपात में, सही तत्वों की उपस्थिति है।',
    ],
    tags: ['Design', 'UX', 'Philosophy'],
    featured: false,
    authorName: 'संपादकीय टीम',
  },
  {
    id: 'post-hi-3',
    slug: 'remote-first-design',
    lang: 'hi',
    title: 'रिमोट-फर्स्ट डिज़ाइन संस्कृति का निर्माण',
    excerpt: 'वितरित टीमें एक समझौता नहीं हैं — वे स्क्रैच से बेहतर प्रक्रियाएं बनाने का अवसर हैं।',
    bodyParagraphs: [
      'महामारी ने डिज़ाइन टीमों को रातोरात रिमोट काम में धकेल दिया। जो टीमें सफल रहीं वे वे नहीं थीं जिन्होंने ऑनलाइन कार्यालय वातावरण को दोहराया — वे थीं जिन्होंने अपनी प्रक्रियाओं को पूरी तरह से पुनर्निर्मित किया।',
      'असिंक्रोनस सहयोग आधार है। रिकॉर्ड किए गए Loom वॉकथ्रू के माध्यम से डिज़ाइन समीक्षाएं। बैठक के दौरान नहीं, बल्कि बैठक से पहले लिखित डिज़ाइन तर्क।',
    ],
    tags: ['Culture', 'Remote', 'Design'],
    featured: false,
    authorName: 'संपादकीय टीम',
  },
  {
    id: 'post-hi-4',
    slug: 'sanity-schema-design-patterns',
    lang: 'hi',
    title: 'जटिल संपादकीय साइटों के लिए Sanity स्कीमा डिज़ाइन पैटर्न',
    excerpt: 'जब आपका सामग्री मॉडल सरल ब्लॉग पोस्ट से परे बढ़ता है तो Sanity स्कीमा को कैसे संरचित करें।',
    bodyParagraphs: [
      'अधिकांश Sanity ट्यूटोरियल एक ब्लॉग से शुरू होते हैं। एक पोस्ट में एक शीर्षक, एक स्लग, एक बॉडी होती है। लेकिन वास्तविक संपादकीय साइटों में पेज, सेक्शन, सिंगलटन और अंतर्राष्ट्रीयकृत सामग्री होती है।',
      'पेज-बिल्डर पैटर्न — जहाँ एक पेज दस्तावेज़ में सेक्शन ब्लॉक की एक सरणी होती है — ContentFlow की आधारशिला है। प्रत्येक सेक्शन प्रकार अपने स्वयं के फ़ील्ड के साथ एक स्व-निहित स्कीमा ऑब्जेक्ट है।',
    ],
    tags: ['Sanity', 'CMS', 'Engineering'],
    featured: false,
    authorName: 'इंजीनियरिंग टीम',
  },

  // ── Kannada ───────────────────────────────────────────────────────────────
  {
    id: 'post-kn-1',
    slug: 'the-quantum-shift',
    lang: 'kn',
    title: 'ಕ್ವಾಂಟಮ್ ಶಿಫ್ಟ್: AI ಸೃಜನಾತ್ಮಕ ಕೆಲಸದ ಹರಿವನ್ನು ಹೇಗೆ ಮರುವ್ಯಾಖ್ಯಾನಿಸುತ್ತಿದೆ',
    excerpt: 'ಆಧುನಿಕ ಯುಗದಲ್ಲಿ ಜನರೇಟಿವ್ ನ್ಯೂರಲ್ ನೆಟ್‌ವರ್ಕ್‌ಗಳು ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ಸಂಪಾದಕೀಯ ವಿನ್ಯಾಸದ ಛೇದಕವನ್ನು ಅನ್ವೇಷಿಸುವುದು.',
    bodyParagraphs: [
      'ಜನರೇಟಿವ್ AI ಯ ಉದಯವು ಸಂಪಾದಕೀಯ ತಂಡಗಳು ಸೃಜನಾತ್ಮಕ ಕೆಲಸವನ್ನು ಸಮೀಪಿಸುವ ರೀತಿಯನ್ನು ಮೂಲಭೂತವಾಗಿ ಬದಲಿಸಿದೆ. ಇಂದು ಲಭ್ಯವಿರುವ ಸಾಧನಗಳು ಒಂದು ದಶಕದ ಹಿಂದೆ ವಿಜ್ಞಾನ ಕಥೆಯಂತೆ ತೋರುತ್ತಿದ್ದವು.',
      'ಆದರೆ ಅತ್ಯಂತ ಆಸಕ್ತಿದಾಯಕ ಬೆಳವಣಿಗೆಗಳು ಮಾನವ ಸೃಜನಶೀಲತೆಯನ್ನು ಬದಲಿಸುವ ಬಗ್ಗೆ ಅಲ್ಲ — ಅದನ್ನು ವರ್ಧಿಸುವ ಬಗ್ಗೆ.',
      'ತಡೆ ಕಲ್ಪನೆಯಿಂದ ಕ್ಯೂರೇಶನ್‌ಗೆ ಬದಲಾಗುತ್ತದೆ. ಕೌಶಲ್ಯ ಇನ್ನು ಮುಂದೆ ಕೇವಲ ವಿಷಯಗಳನ್ನು ತಯಾರಿಸುವುದರಲ್ಲಿ ಅಲ್ಲ — ಯಾವ ವಿಷಯಗಳು ತಯಾರಿಸಲು ಯೋಗ್ಯ ಎಂದು ತಿಳಿಯುವುದರಲ್ಲಿ.',
    ],
    tags: ['Technology', 'AI', 'Design'],
    featured: true,
    authorName: 'ಸಂಪಾದಕೀಯ ತಂಡ',
  },
  {
    id: 'post-kn-2',
    slug: 'minimalism-in-the-age-of-digital-abundance',
    lang: 'kn',
    title: 'ಡಿಜಿಟಲ್ ಸಮೃದ್ಧಿಯ ಯುಗದಲ್ಲಿ ಮಿನಿಮಲಿಸಂ',
    excerpt: '2024 ರ ಅತ್ಯಂತ ಅತ್ಯಾಧುನಿಕ ಇಂಟರ್‌ಫೇಸ್‌ಗಳು ಮೌನವಾಗಿರಲು ಮತ್ತು ಮುಖ್ಯ ಉಪಯುಕ್ತತೆಯ ಮೇಲೆ ಗಮನ ಕೇಂದ್ರೀಕರಿಸಲು ಧೈರ್ಯ ಮಾಡುವವು.',
    bodyParagraphs: [
      'ಪರದೆಗಳು ಹೆಚ್ಚಾದಂತೆ ಮತ್ತು ಗಮನ ಚದುರಿದಂತೆ, ಗದ್ದಲವನ್ನು ಕಡಿತಗೊಳಿಸುವ ಇಂಟರ್‌ಫೇಸ್‌ಗಳು ಒಂದು ಗುಣಲಕ್ಷಣವನ್ನು ಹಂಚಿಕೊಳ್ಳುತ್ತವೆ: ಸಂಯಮ.',
      'ಮಿನಿಮಲಿಸಂ ಅಂಶಗಳ ಅನುಪಸ್ಥಿತಿಯಲ್ಲ. ಇದು ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ, ಸರಿಯಾದ ಪ್ರಮಾಣದಲ್ಲಿ, ಸರಿಯಾದ ಅಂಶಗಳ ಉಪಸ್ಥಿತಿ.',
    ],
    tags: ['Design', 'UX', 'Philosophy'],
    featured: false,
    authorName: 'ಸಂಪಾದಕೀಯ ತಂಡ',
  },
  {
    id: 'post-kn-3',
    slug: 'remote-first-design',
    lang: 'kn',
    title: 'ರಿಮೋಟ್-ಫಸ್ಟ್ ಡಿಸೈನ್ ಸಂಸ್ಕೃತಿ ನಿರ್ಮಾಣ',
    excerpt: 'ವಿತರಿತ ತಂಡಗಳು ರಾಜಿಯಲ್ಲ — ಅವು ಮೊದಲಿನಿಂದ ಉತ್ತಮ ಪ್ರಕ್ರಿಯೆಗಳನ್ನು ನಿರ್ಮಿಸುವ ಅವಕಾಶ.',
    bodyParagraphs: [
      'ಸಾಂಕ್ರಾಮಿಕ ರೋಗವು ವಿಶ್ವದಾದ್ಯಂತ ಡಿಸೈನ್ ತಂಡಗಳನ್ನು ರಾತ್ರೋರಾತ್ರಿ ರಿಮೋಟ್ ಕೆಲಸಕ್ಕೆ ತಳ್ಳಿತು. ಯಶಸ್ವಿಯಾದ ತಂಡಗಳು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಕಚೇರಿ ಪರಿಸರವನ್ನು ನಕಲು ಮಾಡಿದವು ಅಲ್ಲ — ಅವು ತಮ್ಮ ಪ್ರಕ್ರಿಯೆಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಮರುನಿರ್ಮಿಸಿದ ತಂಡಗಳು.',
    ],
    tags: ['Culture', 'Remote', 'Design'],
    featured: false,
    authorName: 'ಸಂಪಾದಕೀಯ ತಂಡ',
  },
  {
    id: 'post-kn-4',
    slug: 'sanity-schema-design-patterns',
    lang: 'kn',
    title: 'ಸಂಕೀರ್ಣ ಸಂಪಾದಕೀಯ ಸೈಟ್‌ಗಳಿಗೆ Sanity ಸ್ಕೀಮಾ ವಿನ್ಯಾಸ ಮಾದರಿಗಳು',
    excerpt: 'ನಿಮ್ಮ ವಿಷಯ ಮಾದರಿ ಸರಳ ಬ್ಲಾಗ್ ಪೋಸ್ಟ್‌ಗಳನ್ನು ಮೀರಿ ಬೆಳೆದಾಗ Sanity ಸ್ಕೀಮಾಗಳನ್ನು ಹೇಗೆ ರಚಿಸಬೇಕು.',
    bodyParagraphs: [
      'ಹೆಚ್ಚಿನ Sanity ಟ್ಯುಟೋರಿಯಲ್‌ಗಳು ಬ್ಲಾಗ್‌ನಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತವೆ. ಆದರೆ ನಿಜವಾದ ಸಂಪಾದಕೀಯ ಸೈಟ್‌ಗಳಲ್ಲಿ ಪೇಜ್‌ಗಳು, ವಿಭಾಗಗಳು, ಸಿಂಗಲ್‌ಟನ್‌ಗಳು ಮತ್ತು ಅಂತರರಾಷ್ಟ್ರೀಯ ವಿಷಯವಿದೆ.',
      'ಪೇಜ್-ಬಿಲ್ಡರ್ ಮಾದರಿ — ಅಲ್ಲಿ ಒಂದು ಪೇಜ್ ದಾಖಲೆಯು ವಿಭಾಗ ಬ್ಲಾಕ್‌ಗಳ ಒಂದು ಶ್ರೇಣಿಯನ್ನು ಹೊಂದಿರುತ್ತದೆ — ContentFlow ನ ಮೂಲಾಧಾರ.',
    ],
    tags: ['Sanity', 'CMS', 'Engineering'],
    featured: false,
    authorName: 'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡ',
  },
]

async function seedPosts() {
  console.log(`\n📝 Seeding ${POSTS.length} posts...`)
  const now = new Date()

  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i]
    // Stagger publish dates so ordering is deterministic
    const daysAgo = i * 2
    const publishedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

    await client.createOrReplace({
      _id: p.id,
      _type: 'post',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      language: p.lang,
      excerpt: p.excerpt,
      body: p.bodyParagraphs.map((text, idx) => ({
        _type: 'block',
        _key: `blk-${p.id}-${idx}`,
        style: idx === 0 ? 'normal' : 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: `sp-${p.id}-${idx}`, text, marks: [] }],
      })),
      publishedAt,
      featured: p.featured,
      tags: p.tags,
      authorName: p.authorName,
      authorEmail: 'team@contentflow.dev',
    })
    console.log(`   ✓ [${p.lang}] ${p.title.slice(0, 50)}${p.title.length > 50 ? '…' : ''}`)
  }
}

// ─── RUN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗')
  console.log('║   ContentFlow — Complete Seed Script             ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log(`\nProject : ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`Dataset : ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}`)

  if (!process.env.SANITY_API_TOKEN) {
    console.error('\n❌  SANITY_API_TOKEN is missing. Add it to .env.local\n')
    process.exit(1)
  }

  try {
    // 1. Nuke
    await deleteAll()

    // 2. Singletons
    await seedSiteConfig()
    await seedAuthConfig()

    // 3. Pages (all 3 languages)
    console.log('\n📄 Seeding pages...')
    for (const lang of LANGS) await seedHomePage(lang)
    for (const lang of LANGS) await seedAboutPage(lang)
    for (const lang of LANGS) await seedFeaturesPage(lang)
    for (const lang of LANGS) await seedPricingPage(lang)

    // 4. Posts
    await seedPosts()

    console.log('\n╔══════════════════════════════════════════════════╗')
    console.log('║   ✅  Seed complete!                              ║')
    console.log('╚══════════════════════════════════════════════════╝')
    console.log('\nVerify at:')
    console.log('  http://localhost:3000          → English home')
    console.log('  http://localhost:3000/hi        → Hindi home')
    console.log('  http://localhost:3000/kn        → Kannada home')
    console.log('  http://localhost:3000/about     → About page')
    console.log('  http://localhost:3000/features  → Features page')
    console.log('  http://localhost:3000/pricing   → Pricing page')
    console.log('  http://localhost:3000/studio    → Sanity Studio')
    console.log('  http://localhost:3000/login     → Sign in')
    console.log('  http://localhost:3000/signup    → Create account')
    console.log('\nStudio tips:')
    console.log('  • Open a page in Studio → click Preview to enter live preview mode')
    console.log('  • Edit any section → see changes instantly in the preview panel')
    console.log('  • Translations tab on posts/pages → switch language variants')
    console.log('  • Presentation tool shows the full site with overlay editing\n')
  } catch (err) {
    console.error('\n❌  Seed failed:', err)
    process.exit(1)
  }
}

main()