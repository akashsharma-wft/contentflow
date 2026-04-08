// scripts/seed.ts — ContentFlow Complete Seed
//
// WHAT THIS DOES:
//   1. Deletes ALL existing documents
//   2. Seeds siteConfig    — navbar, sidebar, footer
//   3. Seeds authConfig    — multilingual login/signup copy (en/hi/kn for every string)
//   4. Seeds app singletons — postsPageConfig, analyticsConfig, settingsPageConfig, etc.
//   5. Seeds page documents — home (en/hi/kn), login (en/hi/kn), signup (en/hi/kn)
//                             + all other app pages
//   6. Seeds posts          — 4 per language
//
// USAGE:   npm run seed
// REQUIRES: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN

import 'dotenv/config'
import { createClient } from '@sanity/client'
import { APP_NAV_ITEMS } from '../lib/navigation'

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
  const types = [
    'post', 'page',
    'siteConfig', 'authConfig',
    'postsPageConfig', 'analyticsConfig', 'settingsPageConfig',
    'billingPageConfig', 'adminPageConfig',
    'loginPageConfig', 'signupPageConfig', 'postDetailPageConfig',
  ]

  for (const type of types) {
    const ids: string[] = await client.fetch(`*[_type == $type]._id`, { type })
    if (ids.length === 0) { console.log(`   ↳ no ${type} docs found`); continue }
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
  const sidebarNav = APP_NAV_ITEMS.map((item, i) => ({ ...item, _key: `snav-${i}` }))

  await client.createOrReplace({
    _id: 'siteConfig',
    _type: 'siteConfig',
    siteName: 'ContentFlow',
    tagline: 'CMS-driven publishing for engineering teams.',
    publicNav: [
      { _key: 'nav-home', label: 'Home', slug: 'home' },
      { _key: 'nav-login', label: 'Sign in', href: '/login' },
      { _key: 'nav-signup', label: 'Get Started', href: '/signup' },
      { _key: 'nav-studio', label: 'Studio', href: '/studio', openInNewTab: false },
    ],
    sidebarNav,
    footerTagline: 'A next-generation CMS platform dedicated to storytelling and editorial excellence.',
    footerLinks: [
      { _key: 'fl-home', label: 'Home', href: '/' },
      { _key: 'fl-login', label: 'Sign in', href: '/login' },
      { _key: 'fl-signup', label: 'Sign up', href: '/signup' },
      { _key: 'fl-studio', label: 'Studio', href: '/studio' },
    ],
    copyright: `© ${new Date().getFullYear()} ContentFlow. All rights reserved.`,
  })
  console.log('   ✓ siteConfig')
}

// ─── 3. AUTH CONFIG — fully multilingual ──────────────────────────────────────
// Every single string has en/hi/kn variants.
// When the site is in Hindi, everything on login/signup is in Hindi.

async function seedAuthConfig() {
  console.log('\n🔐 Seeding authConfig (multilingual)...')

  await client.createOrReplace({
    _id: 'authConfig',
    _type: 'authConfig',

    // ── Auth provider toggles ────────────────────────────────────────────────
    showGoogleOAuth: true,
    showEmailPassword: true,

    // ── Login page copy (all 3 languages) ────────────────────────────────────
    loginHeading:            { en: 'Welcome back',               hi: 'वापस स्वागत है',                     kn: 'ಮರಳಿ ಸ್ವಾಗತ' },
    loginSubheading:         { en: 'Sign in to your workspace',  hi: 'अपने वर्कस्पेस में साइन इन करें',      kn: 'ನಿಮ್ಮ ವರ್ಕ್‌ಸ್ಪೇಸ್‌ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ' },
    loginSubmitLabel:        { en: 'Sign in',                    hi: 'साइन इन करें',                        kn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ' },
    loginEmailPlaceholder:   { en: 'you@example.com',            hi: 'आप@उदाहरण.com',                      kn: 'ನೀವು@ಉದಾಹರಣೆ.com' },
    loginPasswordPlaceholder:{ en: 'Your password',              hi: 'आपका पासवर्ड',                        kn: 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್' },
    loginFooterText:         { en: "Don't have an account?",     hi: 'खाता नहीं है?',                       kn: 'ಖಾತೆ ಇಲ್ಲವೇ?' },
    loginFooterLinkLabel:    { en: 'Request access',             hi: 'एक्सेस अनुरोध करें',                  kn: 'ಪ್ರವೇಶ ವಿನಂತಿಸಿ' },
    loginGoogleLabel:        { en: 'Continue with Google',       hi: 'Google से जारी रखें',                 kn: 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ' },
    loginFooterLinkHref: '/signup',

    // ── Signup page copy (all 3 languages) ───────────────────────────────────
    signupHeading:            { en: 'Create your account',           hi: 'अपना खाता बनाएं',                     kn: 'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ' },
    signupSubheading:         { en: 'Join the ContentFlow workspace', hi: 'ContentFlow वर्कस्पेस में शामिल हों',  kn: 'ContentFlow ವರ್ಕ್‌ಸ್ಪೇಸ್‌ಗೆ ಸೇರಿ' },
    signupSubmitLabel:        { en: 'Create account',                hi: 'खाता बनाएं',                           kn: 'ಖಾತೆ ರಚಿಸಿ' },
    signupNamePlaceholder:    { en: 'Your full name',                hi: 'आपका पूरा नाम',                        kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು' },
    signupEmailPlaceholder:   { en: 'you@example.com',               hi: 'आप@उदाहरण.com',                       kn: 'ನೀವು@ಉದಾಹರಣೆ.com' },
    signupPasswordPlaceholder:{ en: 'Min 8 characters',              hi: 'कम से कम 8 अक्षर',                    kn: 'ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು' },
    signupFooterText:         { en: 'Already have an account?',      hi: 'पहले से खाता है?',                    kn: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?' },
    signupFooterLinkLabel:    { en: 'Sign in',                       hi: 'साइन इन करें',                        kn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ' },
    signupGoogleLabel:        { en: 'Continue with Google',          hi: 'Google से जारी रखें',                 kn: 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ' },
    signupFooterLinkHref: '/login',

    // ── Left panel (shared by login + signup, all 3 languages) ───────────────
    leftPanelHeadline: {
      en: 'CMS-driven publishing for engineering teams.',
      hi: 'इंजीनियरिंग टीमों के लिए CMS-संचालित प्रकाशन।',
      kn: 'ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡಗಳಿಗೆ CMS-ಚಾಲಿತ ಪ್ರಕಾಶನ.',
    },
    leftPanelBadge: {
      en: 'ENGINEERING FIRST',
      hi: 'इंजीनियरिंग सर्वप्रथम',
      kn: 'ಎಂಜಿನಿಯರಿಂಗ್ ಮೊದಲು',
    },
    leftPanelFooterNote: {
      en: 'Powered by Supabase Auth',
      hi: 'Supabase Auth द्वारा संचालित',
      kn: 'Supabase Auth ಮೂಲಕ ನಡೆಸಲ್ಪಡುತ್ತದೆ',
    },

    // Feature bullets — each has text in all 3 languages
    leftPanelFeatures: [
      {
        _key: 'feat-1',
        icon: 'Zap',
        en: 'API-first delivery architecture',
        hi: 'API-फर्स्ट डिलीवरी आर्किटेक्चर',
        kn: 'API-ಮೊದಲ ವಿತರಣಾ ವಾಸ್ತುಶಿಲ್ಪ',
      },
      {
        _key: 'feat-2',
        icon: 'LayoutGrid',
        en: 'Visual Schema Builder v2.0',
        hi: 'विजुअल स्कीमा बिल्डर v2.0',
        kn: 'ವಿಷ್ಯುಅಲ್ ಸ್ಕೀಮಾ ಬಿಲ್ಡರ್ v2.0',
      },
      {
        _key: 'feat-3',
        icon: 'GitBranch',
        en: 'Multi-environment staging',
        hi: 'मल्टी-एनवायरनमेंट स्टेजिंग',
        kn: 'ಬಹು-ಪರಿಸರ ಸ್ಟೇಜಿಂಗ್',
      },
      {
        _key: 'feat-4',
        icon: 'Globe',
        en: 'Multilingual content (EN/HI/KN)',
        hi: 'बहुभाषी सामग्री (EN/HI/KN)',
        kn: 'ಬಹುಭಾಷಾ ವಿಷಯ (EN/HI/KN)',
      },
      {
        _key: 'feat-5',
        icon: 'Eye',
        en: 'Live preview with Sanity Studio',
        hi: 'Sanity Studio के साथ लाइव प्रीव्यू',
        kn: 'Sanity Studio ನೊಂದಿಗೆ ಲೈವ್ ಪ್ರಿವ್ಯೂ',
      },
    ],
  })
  console.log('   ✓ authConfig (en/hi/kn for every field)')
}

// ─── 4. APP PAGE SINGLETONS ───────────────────────────────────────────────────

async function seedAppPageSingletons() {
  console.log('\n📄 Seeding app page singletons...')

  await client.createOrReplace({
    _id: 'postsPageConfig', _type: 'postsPageConfig',
    heading: 'Blog Posts', subheading: 'Manage your technical documentation and editorial content.',
    groqBadgeLabel: 'via Sanity GROQ', syncButtonLabel: 'Sync', newPostButtonLabel: 'New Post',
    myPostsLabel: 'My Posts', publishedLabel: 'Published', draftsLabel: 'Drafts',
    searchPlaceholder: 'Search posts...', colTitle: 'Post Title', colStatus: 'Status',
    colTags: 'Tags', colLastModified: 'Last Modified',
    emptyTitle: 'No posts found', emptyBody: 'Sync from Sanity to populate your workspace.', emptyCtaLabel: 'Sync from Sanity',
  })
  console.log('   ✓ postsPageConfig')

  await client.createOrReplace({
    _id: 'analyticsConfig', _type: 'analyticsConfig',
    heading: 'PostHog Events', subheading: 'Real-time Telemetry / Production Pipeline',
    eventsLabel: 'Events Today', usersLabel: 'Unique Users', avgSessionLabel: 'Avg. Session',
    liveStreamLabel: 'Live event stream', refreshLabel: 'Refresh',
    emptyTitle: 'No events yet', emptyBody: 'Events appear as users interact with your app.',
    featureFlagLabel: 'Feature flag: show-featured-banner',
  })
  console.log('   ✓ analyticsConfig')

  await client.createOrReplace({
    _id: 'settingsPageConfig', _type: 'settingsPageConfig',
    heading: 'Account Settings', subheading: 'Manage your architectural preferences and profile identity.',
    profileSectionLabel: 'Profile', displayNameLabel: 'Display name', emailLabel: 'Email address',
    emailHelperText: 'Managed by Supabase Auth', bioLabel: 'Bio', bioMaxLength: 200,
    websiteLabel: 'Website', uploadPhotoLabel: 'Upload photo', saveLabel: 'Save changes',
    discardLabel: 'Discard', dangerZoneHeading: 'Danger Zone',
    dangerZoneBody: 'Permanently delete your account and all associated data. This action cannot be undone.',
    dangerZoneWarning: 'Warning: All API keys will be invalidated.', deleteAccountLabel: 'Delete Account',
  })
  console.log('   ✓ settingsPageConfig')

  await client.createOrReplace({
    _id: 'billingPageConfig', _type: 'billingPageConfig',
    heading: 'Billing & Plans', subheading: 'Manage your subscription, view usage metrics, and upgrade your workspace.',
    currentPlanLabel: 'Current Plan', manageLabel: 'Manage subscription', cancelLabel: 'Cancel',
    reactivateLabel: 'Reactivate', upgradeLabel: 'Upgrade to Pro', usageHeading: 'Usage this month',
    postsUsageLabel: 'Posts Published', apiUsageLabel: 'API Requests',
    storageUsageLabel: 'Storage Utilization', seatsUsageLabel: 'Team Seats', plansHeading: 'Plans',
    freePlanName: 'Free', freePlanTagline: 'For individuals starting their editorial journey.',
    freePlanPrice: '$0', freePlanFeatures: ['5 Published Posts', '1,000 API calls', 'Community Support'],
    proPlanName: 'ContentFlow Pro', proPlanTagline: 'Unleash the full potential of high-performance content delivery.',
    proPlanBadge: 'Most Popular', proPlanFeatures: ['Unlimited Posts', '10,000 API calls', 'Priority Email Support', 'Team Collaboration (5 seats)'],
    downgradeLabel: 'Downgrade', currentPlanButtonLabel: 'Current Plan',
  })
  console.log('   ✓ billingPageConfig')

  await client.createOrReplace({
    _id: 'adminPageConfig', _type: 'adminPageConfig',
    heading: 'Admin Panel', subheading: 'All users and their subscription tiers — admin access only.',
    totalUsersLabel: 'total users', colUser: 'User', colPlan: 'Plan', colRole: 'Role', colJoined: 'Joined',
    footerNote: 'Data fetched via Supabase service role key — server-side only', emptyLabel: 'No users found',
  })
  console.log('   ✓ adminPageConfig')

  // loginPageConfig + signupPageConfig are now handled via authConfig — these are stubs
  await client.createOrReplace({
    _id: 'loginPageConfig', _type: 'loginPageConfig',
    heading: 'CMS-driven publishing for engineering teams.',
    subheading: 'Welcome back', badge: 'ENGINEERING FIRST',
  })
  await client.createOrReplace({
    _id: 'signupPageConfig', _type: 'signupPageConfig',
    heading: 'CMS-driven publishing for engineering teams.',
    subheading: 'Create your account', badge: 'ENGINEERING FIRST',
  })
  await client.createOrReplace({
    _id: 'postDetailPageConfig', _type: 'postDetailPageConfig',
    showComments: false, relatedPostsCount: 3,
  })
  console.log('   ✓ loginPageConfig, signupPageConfig, postDetailPageConfig')
}

// ─── 5. PAGE DOCUMENTS ────────────────────────────────────────────────────────

type Lang = 'en' | 'hi' | 'kn'
const LANGS: Lang[] = ['en', 'hi', 'kn']

async function seedHomePage(lang: Lang) {
  const titles:      Record<Lang, string> = { en: 'Home',                  hi: 'होम',                      kn: 'ಮನೆ' }
  const headings:    Record<Lang, string> = { en: 'Ideas, Stories, and Insights', hi: 'विचार, कहानियाँ और अंतर्दृष्टि', kn: 'ವಿಚಾರಗಳು, ಕಥೆಗಳು ಮತ್ತು ಒಳನೋಟಗಳು' }
  const subheadings: Record<Lang, string> = {
    en: 'Crafting digital narratives with the precision of print and the agility of SaaS. Welcome to the future of content management.',
    hi: 'प्रिंट की सटीकता और SaaS की चपलता के साथ डिजिटल कथाएँ तैयार करना। सामग्री प्रबंधन के भविष्य में आपका स्वागत है।',
    kn: 'ಮುದ್ರಣದ ನಿಖರತೆ ಮತ್ತು SaaS ನ ಚುರುಕುತನದಿಂದ ಡಿಜಿಟಲ್ ನಿರೂಪಣೆಗಳನ್ನು ರಚಿಸುವುದು. ವಿಷಯ ನಿರ್ವಹಣೆಯ ಭವಿಷ್ಯಕ್ಕೆ ಸ್ವಾಗತ.',
  }
  const badges: Record<Lang, string> = {
    en: 'EDITORIAL CMS PLATFORM', hi: 'संपादकीय CMS प्लेटफ़ॉर्म', kn: 'ಸಂಪಾದಕೀಯ CMS ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
  }
  const ctaPrimary:   Record<Lang, string> = { en: 'Get Started',   hi: 'शुरू करें',      kn: 'ಪ್ರಾರಂಭಿಸಿ' }
  const ctaSecondary: Record<Lang, string> = { en: 'Explore Studio',hi: 'स्टूडियो देखें',  kn: 'ಸ್ಟುಡಿಯೋ ನೋಡಿ' }
  const community:    Record<Lang, string> = {
    en: 'JOIN OUR GLOBAL COMMUNITY OF WRITERS',
    hi: 'हमारे लेखकों के वैश्विक समुदाय से जुड़ें',
    kn: 'ನಮ್ಮ ಬರಹಗಾರರ ಜಾಗತಿಕ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ',
  }
  const featuredHeading: Record<Lang, string> = { en: 'Featured Stories', hi: 'चुनिंदा कहानियाँ',  kn: 'ವೈಶಿಷ್ಟ್ಯ ಕಥೆಗಳು' }
  const recentHeading:   Record<Lang, string> = { en: 'Recent Publications', hi: 'हाल के प्रकाशन', kn: 'ಇತ್ತೀಚಿನ ಪ್ರಕಾಶನಗಳು' }
  const viewAll:         Record<Lang, string> = { en: 'View all posts', hi: 'सभी पोस्ट देखें',  kn: 'ಎಲ್ಲ ಪೋಸ್ಟ್ ನೋಡಿ' }
  const ctaHeading:      Record<Lang, string> = { en: 'Ready to start publishing?', hi: 'प्रकाशन शुरू करने के लिए तैयार?', kn: 'ಪ್ರಕಾಶನ ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧರಾಗಿದ್ದೀರಾ?' }
  const ctaBody:         Record<Lang, string> = {
    en: 'Sign up and start publishing content with our API-first CMS.',
    hi: 'हमारे API-first CMS के साथ साइन अप करें और सामग्री प्रकाशित करना शुरू करें।',
    kn: 'ನಮ್ಮ API-first CMS ನೊಂದಿಗೆ ಸೈನ್ ಅಪ್ ಮಾಡಿ ಮತ್ತು ವಿಷಯ ಪ್ರಕಟಿಸಲು ಪ್ರಾರಂಭಿಸಿ.',
  }

  await client.createOrReplace({
    _id: `page-home-${lang}`,
    _type: 'page',
    title: titles[lang],
    slug: { _type: 'slug', current: 'home' },
    language: lang,
    access: 'public',
    layout: 'public',
    enablePosthogTracking: true,
    seoTitle: `ContentFlow — ${headings[lang]}`,
    seoDescription: subheadings[lang].slice(0, 155),
    sections: [
      {
        _type: 'heroSection',
        _key: key(`hero-${lang}`),
        heading: headings[lang],
        subheading: subheadings[lang],
        badge: badges[lang],
        primaryCta:   { label: ctaPrimary[lang],   href: '/signup' },
        secondaryCta: { label: ctaSecondary[lang],  href: '/studio' },
        theme: 'dark',
        layout: 'split',
        communityText: community[lang],
      },
      {
        _type: 'featuredPostsSection',
        _key: key(`featured-${lang}`),
        heading: featuredHeading[lang],
        maxPosts: 2,
        layout: 'grid',
        showExcerpt: true,
        showTags: true,
        viewAllLabel: viewAll[lang],
      },
      {
        _type: 'recentPostsSection',
        _key: key(`recent-${lang}`),
        heading: recentHeading[lang],
        count: 4,
        layout: 'grid',
        showCoverImage: true,
        viewAllLabel: viewAll[lang],
      },
      {
        _type: 'ctaSection',
        _key: key(`cta-${lang}`),
        heading: ctaHeading[lang],
        body: ctaBody[lang],
        primaryButton:   { label: ctaPrimary[lang],   href: '/signup' },
        secondaryButton: { label: ctaSecondary[lang],  href: '/studio' },
        theme: 'indigo',
        centered: true,
      },
    ],
  })
  console.log(`   ✓ page: home (${lang})`)
}

async function seedLoginPage(lang: Lang) {
  const titles: Record<Lang, string> = { en: 'Login', hi: 'लॉगिन', kn: 'ಲಾಗಿನ್' }

  await client.createOrReplace({
    _id: `page-login-${lang}`,
    _type: 'page',
    title: titles[lang],
    slug: { _type: 'slug', current: 'login' },
    language: lang,
    access: 'public',
    layout: 'auth',     // auth layout = no Navbar, no Footer, no Sidebar
    enablePosthogTracking: false,
    seoTitle: `Sign in — ContentFlow`,
    sections: [
      {
        // loginSection fetches authConfig and picks the right language variant
        _type: 'loginSection',
        _key: key(`login-section-${lang}`),
      },
    ],
  })
  console.log(`   ✓ page: login (${lang})`)
}

async function seedSignupPage(lang: Lang) {
  const titles: Record<Lang, string> = { en: 'Sign Up', hi: 'साइन अप', kn: 'ಸೈನ್ ಅಪ್' }

  await client.createOrReplace({
    _id: `page-signup-${lang}`,
    _type: 'page',
    title: titles[lang],
    slug: { _type: 'slug', current: 'signup' },
    language: lang,
    access: 'public',
    layout: 'auth',
    enablePosthogTracking: false,
    seoTitle: `Create account — ContentFlow`,
    sections: [
      {
        _type: 'signupSection',
        _key: key(`signup-section-${lang}`),
      },
    ],
  })
  console.log(`   ✓ page: signup (${lang})`)
}

async function seedAppPageDocuments() {
  console.log('\n🗂  Seeding app page documents...')

  type PageDef = {
    slug: string
    title: Record<Lang, string>
    section: string
    access: string
    layout: string
  }

  const pageTypes: PageDef[] = [
    { slug: 'posts',    title: { en: 'Posts',    hi: 'पोस्ट',        kn: 'ಪೋಸ್ಟ್‌ಗಳು'   }, section: 'postsPageSection',    access: 'member', layout: 'dashboard' },
    { slug: 'settings', title: { en: 'Settings', hi: 'सेटिंग्स',     kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' }, section: 'settingsPageSection', access: 'member', layout: 'dashboard' },
    { slug: 'billing',  title: { en: 'Billing',  hi: 'बिलिंग',       kn: 'ಬಿಲ್ಲಿಂಗ್'      }, section: 'billingPageSection',  access: 'member', layout: 'dashboard' },
    { slug: 'analytics',title: { en: 'Analytics',hi: 'विश्लेषण',     kn: 'ವಿಶ್ಲೇಷಣ'     }, section: 'analyticsPageSection',access: 'admin',  layout: 'dashboard' },
    { slug: 'admin',    title: { en: 'Admin',    hi: 'एडमिन',        kn: 'ಆಡ್ಮಿನ್'       }, section: 'adminPageSection',    access: 'admin',  layout: 'dashboard' },
  ]

  let count = 0
  for (const pt of pageTypes) {
    for (const lang of LANGS) {
      await client.createOrReplace({
        _id: `page-${pt.slug}-${lang}`,
        _type: 'page',
        title: pt.title[lang],
        slug: { _type: 'slug', current: pt.slug },
        language: lang,
        access: pt.access,
        layout: pt.layout,
        enablePosthogTracking: true,
        sections: [{ _type: pt.section, _key: key(`${pt.slug}-section-${lang}`) }],
      })
      count++
    }
  }
  console.log(`   ✓ Created ${count} app page docs (5 types × 3 languages)`)
}

// ─── 6. POSTS ─────────────────────────────────────────────────────────────────

const POST_DATA: Record<Lang, Array<{ title: string; slug: string; excerpt: string; tags: string[]; featured: boolean }>> = {
  en: [
    { title: 'The Quantum Shift: How AI is Redefining Creative Workflows',      slug: 'quantum-shift-ai-creative-workflows', excerpt: 'Exploring the intersection of generative neural networks and the traditional craft of editorial design.', tags: ['Technology', 'AI'],    featured: true },
    { title: 'Minimalism in the Age of Digital Abundance',                       slug: 'minimalism-digital-abundance',        excerpt: 'How constraints breed creativity and why less continues to be more in an era of infinite content.',    tags: ['Design', 'UX'],        featured: true },
    { title: 'Building Remote-First Design Cultures',                            slug: 'remote-first-design-cultures',        excerpt: 'Practical strategies for maintaining design coherence across distributed teams and time zones.',        tags: ['Culture', 'Remote'],    featured: false },
    { title: 'Sanity Schema Design Patterns for Complex Editorial Systems',      slug: 'sanity-schema-design-patterns',       excerpt: 'Advanced techniques for structuring flexible, maintainable schemas in Sanity CMS.',                   tags: ['Sanity', 'CMS'],        featured: false },
  ],
  hi: [
    { title: 'क्वांटम शिफ्ट: AI रचनात्मक कार्यप्रवाह को कैसे पुनर्परिभाषित कर रहा है', slug: 'quantum-shift-ai-creative-workflows', excerpt: 'आधुनिक युग में जनरेटिव न्यूरल नेटवर्क और संपादकीय डिज़ाइन की पारंपरिक कला का प्रतिच्छेदन।', tags: ['Technology', 'AI'],    featured: true },
    { title: 'डिजिटल प्रचुरता के युग में न्यूनतावाद',                                    slug: 'minimalism-digital-abundance',        excerpt: 'कैसे बाधाएं रचनात्मकता को जन्म देती हैं और क्यों अनंत सामग्री के युग में कम अधिक बना हुआ है।', tags: ['Design', 'UX'],        featured: false },
    { title: 'रिमोट-फर्स्ट डिज़ाइन संस्कृति का निर्माण',                                slug: 'remote-first-design-cultures',        excerpt: 'वितरित टीमों और समय क्षेत्रों में डिज़ाइन सुसंगतता बनाए रखने की व्यावहारिक रणनीतियाँ।',      tags: ['Culture', 'Remote'],    featured: false },
    { title: 'जटिल संपादकीय प्रणालियों के लिए Sanity स्कीमा डिज़ाइन पैटर्न',            slug: 'sanity-schema-design-patterns',       excerpt: 'Sanity CMS में लचीले, रखरखाव योग्य स्कीमा की संरचना के लिए उन्नत तकनीकें।',                   tags: ['Sanity', 'CMS'],        featured: false },
  ],
  kn: [
    { title: 'ಕ್ವಾಂಟಮ್ ಶಿಫ್ಟ್: AI ಸೃಜನಾತ್ಮಕ ಕಾರ್ಯಪ್ರವಾಹವನ್ನು ಹೇಗೆ ಮರು ವ್ಯಾಖ್ಯಾನಿಸುತ್ತಿದೆ', slug: 'quantum-shift-ai-creative-workflows', excerpt: 'ಆಧುನಿಕ ಯುಗದಲ್ಲಿ ಜನರೇಟಿವ್ ನ್ಯೂರಲ್ ನೆಟ್‌ವರ್ಕ್‌ಗಳು ಮತ್ತು ಸಂಪಾದಕೀಯ ವಿನ್ಯಾಸದ ಸಾಂಪ್ರದಾಯಿಕ ಕ್ರಾಫ್ಟ್.', tags: ['Technology', 'AI'],    featured: true },
    { title: 'ಡಿಜಿಟಲ್ ಸಮೃದ್ಧಿಯ ಯುಗದಲ್ಲಿ ಮಿನಿಮಲಿಸಂ',                                     slug: 'minimalism-digital-abundance',        excerpt: 'ಮಿತಿಗಳು ಹೇಗೆ ಸೃಜನಶೀಲತೆಯನ್ನು ಬೆಳೆಸುತ್ತವೆ ಮತ್ತು ಅನಂತ ವಿಷಯದ ಯುಗದಲ್ಲಿ ಕಡಿಮೆ ಹೆಚ್ಚು ಏಕೆ.',        tags: ['Design', 'UX'],        featured: false },
    { title: 'ರಿಮೋಟ್-ಫಸ್ಟ್ ಡಿಸೈನ್ ಸಂಸ್ಕೃತಿಗಳ ನಿರ್ಮಾಣ',                                   slug: 'remote-first-design-cultures',        excerpt: 'ವಿತರಿಸಿದ ತಂಡಗಳಾದ್ಯಂತ ವಿನ್ಯಾಸ ಸಂಗತಿಯನ್ನು ನಿರ್ವಹಿಸಲು ಪ್ರಾಯೋಗಿಕ ತಂತ್ರಗಳು.',                     tags: ['Culture', 'Remote'],    featured: false },
    { title: 'ಸಂಕೀರ್ಣ ಸಂಪಾದಕೀಯ ವ್ಯವಸ್ಥೆಗಳಿಗಾಗಿ Sanity ಸ್ಕೀಮಾ ವಿನ್ಯಾಸ ಮಾದರಿಗಳು',           slug: 'sanity-schema-design-patterns',       excerpt: 'Sanity CMS ನಲ್ಲಿ ಹೊಂದಿಕೊಳ್ಳುವ, ನಿರ್ವಹಣೆ ಯೋಗ್ಯ ಸ್ಕೀಮಾಗಳ ರಚನೆಗಾಗಿ ಸುಧಾರಿತ ತಂತ್ರಗಳು.',         tags: ['Sanity', 'CMS'],        featured: false },
  ],
}

async function seedPosts() {
  console.log('\n📝 Seeding posts (4 × 3 languages)...')
  const now = new Date()

  for (const lang of LANGS) {
    for (let i = 0; i < POST_DATA[lang].length; i++) {
      const p = POST_DATA[lang][i]
      const publishedAt = new Date(now.getTime() - i * 2 * 24 * 60 * 60 * 1000).toISOString()
      await client.createOrReplace({
        _id: `post-${p.slug}-${lang}`,
        _type: 'post',
        title: p.title,
        slug: { _type: 'slug', current: p.slug },
        language: lang,
        excerpt: p.excerpt,
        publishedAt,
        featured: p.featured,
        tags: p.tags,
        authorId: 'seed-author',
        authorName: lang === 'en' ? 'ContentFlow Team' : lang === 'hi' ? 'ContentFlow टीम' : 'ContentFlow ತಂಡ',
        authorEmail: 'hello@contentflow.io',
        body: blocks(
          p.excerpt,
          lang === 'en'
            ? 'This article explores the nuances of modern content management and how teams can leverage cutting-edge tools to deliver exceptional editorial experiences.'
            : lang === 'hi'
            ? 'यह लेख आधुनिक सामग्री प्रबंधन की बारीकियों को उजागर करता है और टीमें असाधारण संपादकीय अनुभव प्रदान करने के लिए अत्याधुनिक टूल का उपयोग कैसे कर सकती हैं।'
            : 'ಈ ಲೇಖನವು ಆಧುನಿಕ ವಿಷಯ ನಿರ್ವಹಣೆಯ ಸೂಕ್ಷ್ಮತೆಗಳನ್ನು ಅನ್ವೇಷಿಸುತ್ತದೆ ಮತ್ತು ತಂಡಗಳು ಅಸಾಧಾರಣ ಸಂಪಾದಕೀಯ ಅನುಭವಗಳನ್ನು ನೀಡಲು ಅತ್ಯಾಧುನಿಕ ಸಾಧನಗಳನ್ನು ಹೇಗೆ ಬಳಸಬಹುದು.',
        ),
      })
    }
    console.log(`   ✓ ${POST_DATA[lang].length} posts (${lang})`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗')
  console.log('║   ContentFlow — Complete Seed Script                 ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log(`\n   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}`)

  if (!process.env.SANITY_API_TOKEN) {
    console.error('\n❌  SANITY_API_TOKEN is missing. Add it to .env.local\n')
    process.exit(1)
  }

  await deleteAll()
  await seedSiteConfig()
  await seedAuthConfig()
  await seedAppPageSingletons()

  console.log('\n📄 Seeding page documents...')
  for (const lang of LANGS) await seedHomePage(lang)
  for (const lang of LANGS) await seedLoginPage(lang)
  for (const lang of LANGS) await seedSignupPage(lang)
  await seedAppPageDocuments()

  await seedPosts()

  console.log('\n╔══════════════════════════════════════════════════════╗')
  console.log('║   ✅  Seed complete!                                  ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log('\nVerify:')
  console.log('  http://localhost:3000         → English home (Navbar + Footer)')
  console.log('  http://localhost:3000/hi      → Hindi home')
  console.log('  http://localhost:3000/kn      → Kannada home')
  console.log('  http://localhost:3000/login   → Login (auth layout, no chrome)')
  console.log('  http://localhost:3000/signup  → Signup (auth layout, no chrome)')
  console.log('  http://localhost:3000/hi/login → Login in Hindi')
  console.log('  http://localhost:3000/kn/signup → Signup in Kannada')
  console.log('  http://localhost:3000/studio  → Sanity Studio')
  console.log('\nStudio tips:')
  console.log('  • Open Pages → click Home Page → click "Preview" tab next to "Editor"')
  console.log('  • The Presentation tab at the top shows the full site with edit overlays')
  console.log('  • Language dropdown (top bar) filters docs to that language')
  console.log('  • Translations tab inside each doc links to other language variants\n')
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})