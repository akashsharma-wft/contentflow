// scripts/seed.ts — ContentFlow Complete Seed
//
// WHAT THIS DOES:
//   1. Deletes ALL existing documents (posts, pages, siteConfig, authConfig + app page configs)
//   2. Seeds siteConfig  — navbar, sidebar, footer
//   3. Seeds authConfig  — login/signup copy + left-panel features
//   4. Seeds app page singletons — postsPageConfig, analyticsConfig, settingsPageConfig,
//                                  billingPageConfig, adminPageConfig
//   5. Seeds pages       — home (en/hi/kn), about, features, pricing, 404
//                        + app pages: posts, analytics, settings, billing, admin (en only)
//   6. Seeds posts       — 4 per language (en/hi/kn) with rich body content
//
// USAGE:
//   npm run seed
//
// REQUIRES in .env.local:
//   NEXT_PUBLIC_SANITY_PROJECT_ID
//   NEXT_PUBLIC_SANITY_DATASET
//   SANITY_API_TOKEN   (Editor role — needs write + delete)

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
    'postsPageConfig', 'analyticsConfig', 'settingsPageConfig', 'billingPageConfig', 'adminPageConfig',
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
  
  // Convert APP_NAV_ITEMS to Sanity format with _key fields
  const sidebarNav = APP_NAV_ITEMS.map((item, i) => ({
    ...item,
    _key: `snav-${i}`,
  }))

  await client.createOrReplace({
    _id: 'siteConfig',
    _type: 'siteConfig',
    siteName: 'ContentFlow',
    tagline: 'CMS-driven publishing for engineering teams.',
    publicNav: [], // Navbar now uses APP_NAV_ITEMS directly
    sidebarNav,
    footerTagline: 'A next-generation CMS platform dedicated to storytelling and editorial excellence.',
    footerLinks: [], // Footer now uses APP_NAV_ITEMS directly
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
    loginHeading: 'Welcome back',
    loginSubheading: 'Sign in to your workspace',
    loginSubmitLabel: 'Sign in',
    loginFooterText: "Don't have an account?",
    loginFooterLinkLabel: 'Request access',
    loginFooterLinkHref: '/signup',
    signupHeading: 'Create your account',
    signupSubheading: 'Join the ContentFlow workspace',
    signupSubmitLabel: 'Create account',
    signupFooterText: 'Already have an account?',
    signupFooterLinkLabel: 'Sign in',
    signupFooterLinkHref: '/login',
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

// ─── 4. APP PAGE SINGLETONS ───────────────────────────────────────────────────

async function seedAppPageSingletons() {
  console.log('\n📄 Seeding app page singletons...')

  await client.createOrReplace({
    _id: 'postsPageConfig',
    _type: 'postsPageConfig',
    heading: 'Blog Posts',
    subheading: 'Manage your technical documentation and editorial content.',
    groqBadgeLabel: 'via Sanity GROQ',
    syncButtonLabel: 'Sync',
    newPostButtonLabel: 'New Post',
    myPostsLabel: 'My Posts',
    publishedLabel: 'Published',
    draftsLabel: 'Drafts',
    searchPlaceholder: 'Search posts...',
    colTitle: 'Post Title',
    colStatus: 'Status',
    colTags: 'Tags',
    colLastModified: 'Last Modified',
    emptyTitle: 'No posts found',
    emptyBody: 'Try adjusting your search or sync from Sanity to populate your workspace.',
    emptyCtaLabel: 'Sync from Sanity',
  })
  console.log('   ✓ postsPageConfig')

  await client.createOrReplace({
    _id: 'analyticsConfig',
    _type: 'analyticsConfig',
    heading: 'PostHog Events',
    subheading: 'Real-time Telemetry / Production Pipeline',
    eventsLabel: 'Events Today',
    usersLabel: 'Unique Users',
    avgSessionLabel: 'Avg. Session',
    liveStreamLabel: 'Live event stream',
    refreshLabel: 'Refresh',
    emptyTitle: 'No events yet',
    emptyBody: 'Events will appear here as users interact with your app. Make sure PostHog is initialized correctly.',
    featureFlagLabel: 'Feature flag: show-featured-banner',
  })
  console.log('   ✓ analyticsConfig')

  await client.createOrReplace({
    _id: 'settingsPageConfig',
    _type: 'settingsPageConfig',
    heading: 'Account Settings',
    subheading: 'Manage your architectural preferences and profile identity.',
    profileSectionLabel: 'Profile',
    displayNameLabel: 'Display name',
    emailLabel: 'Email address',
    emailHelperText: 'Managed by Supabase Auth',
    bioLabel: 'Bio',
    bioMaxLength: 200,
    websiteLabel: 'Website',
    uploadPhotoLabel: 'Upload photo',
    saveLabel: 'Save changes',
    discardLabel: 'Discard',
    dangerZoneHeading: 'Danger Zone',
    dangerZoneBody: 'Permanently delete your account and all associated architectural data. This action cannot be undone.',
    dangerZoneWarning: 'Warning: All API keys will be invalidated.',
    deleteAccountLabel: 'Delete Account',
  })
  console.log('   ✓ settingsPageConfig')

  await client.createOrReplace({
    _id: 'billingPageConfig',
    _type: 'billingPageConfig',
    heading: 'Billing & Plans',
    subheading: 'Manage your subscription, view usage metrics, and upgrade your workspace.',
    currentPlanLabel: 'Current Plan',
    manageLabel: 'Manage subscription',
    cancelLabel: 'Cancel',
    reactivateLabel: 'Reactivate',
    upgradeLabel: 'Upgrade to Pro',
    usageHeading: 'Usage this month',
    postsUsageLabel: 'Posts Published',
    apiUsageLabel: 'API Requests',
    storageUsageLabel: 'Storage Utilization',
    seatsUsageLabel: 'Team Seats',
    plansHeading: 'Plans',
    freePlanName: 'Free',
    freePlanTagline: 'For individuals starting their editorial journey.',
    freePlanPrice: '$0',
    freePlanFeatures: ['5 Published Posts', '1,000 API calls', 'Community Support'],
    proPlanName: 'ContentFlow Pro',
    proPlanTagline: 'Unleash the full potential of high-performance content delivery.',
    proPlanBadge: 'Most Popular',
    proPlanFeatures: ['Unlimited Posts', '10,000 API calls', 'Priority Email Support', 'Team Collaboration (5 seats)'],
    downgradeLabel: 'Downgrade',
    currentPlanButtonLabel: 'Current Plan',
  })
  console.log('   ✓ billingPageConfig')

  await client.createOrReplace({
    _id: 'adminPageConfig',
    _type: 'adminPageConfig',
    heading: 'Admin Panel',
    subheading: 'All users and their subscription tiers — admin access only.',
    totalUsersLabel: 'total users',
    colUser: 'User',
    colPlan: 'Plan',
    colRole: 'Role',
    colJoined: 'Joined',
    footerNote: 'Data fetched via Supabase service role key — server-side only',
    emptyLabel: 'No users found',
  })
  console.log('   ✓ adminPageConfig')

  await client.createOrReplace({
    _id: 'loginPageConfig',
    _type: 'loginPageConfig',
    heading: 'CMS-driven publishing for engineering teams.',
    subheading: 'Welcome back',
    badge: 'ENGINEERING FIRST',
  })
  console.log('   ✓ loginPageConfig')

  await client.createOrReplace({
    _id: 'signupPageConfig',
    _type: 'signupPageConfig',
    heading: 'CMS-driven publishing for engineering teams.',
    subheading: 'Create your account',
    badge: 'ENGINEERING FIRST',
  })
  console.log('   ✓ signupPageConfig')

  await client.createOrReplace({
    _id: 'postDetailPageConfig',
    _type: 'postDetailPageConfig',
    showComments: false,
    relatedPostsCount: 3,
  })
  console.log('   ✓ postDetailPageConfig')
}

// ─── 5. APP PAGE DOCUMENTS ────────────────────────────────────────────────────
// These are `page` documents for the 8 app page types in 3 languages = 24 pages total.
// Each contains a single marker block that SectionRenderer renders.
// Access control (isPublic, adminOnly) is configurable per page in Sanity.

async function seedAppPageDocuments() {
  console.log('\n🗂  Seeding 24 app page documents (8 types × 3 languages)...')

  type Lang = 'en' | 'hi' | 'kn'
  const LANGS: Lang[] = ['en', 'hi', 'kn']

  // Define all 8 page types with their default access control
  const pageTypes = [
    // ── Public pages ───────────────────────────────────────────────────────
    { slug: 'login', title: { en: 'Login', hi: 'लॉगिन', kn: 'ಲಾಗಿನ್' }, section: 'loginPageSection', access: 'public', layout: 'auth' },
    { slug: 'signup', title: { en: 'Signup', hi: 'साइन अप', kn: 'ಸೈನ್ ಅಪ್' }, section: 'signupPageSection', access: 'public', layout: 'auth' },
    { slug: 'posts', title: { en: 'Posts', hi: 'पोस्ट', kn: 'ಪೋಸ್ಟ್‌ಗಳು' }, section: 'postsPageSection', access: 'member', layout: 'dashboard' },
    { slug: 'post-detail', title: { en: 'Post Detail', hi: 'पोस्ट विवरण', kn: 'ಪೋಸ್ಟ್ ಪ್ರಸ್ತಾವನೆ' }, section: 'postDetailPageSection', access: 'public', layout: 'public' },

    // ── Private (authenticated) pages ───────────────────────────────────────
    { slug: 'settings', title: { en: 'Settings', hi: 'सेटिंग्स', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' }, section: 'settingsPageSection', access: 'member', layout: 'dashboard' },
    { slug: 'billing', title: { en: 'Billing', hi: 'बिलिंग', kn: 'ಬಿಲಿಂಗ್‌' }, section: 'billingPageSection', access: 'member', layout: 'dashboard' },

    // ── Admin only pages ───────────────────────────────────────────────────
    { slug: 'admin', title: { en: 'Admin', hi: 'एडमिन', kn: 'ಆಡ್ಮಿನ್' }, section: 'adminPageSection', access: 'admin', layout: 'dashboard' },
    { slug: 'analytics', title: { en: 'Analytics', hi: 'विश्लेषण', kn: 'ವಿಶ್ಲೇಷಣ' }, section: 'analyticsPageSection', access: 'admin', layout: 'dashboard' },
  ]

  let pageCount = 0
  for (const pageType of pageTypes) {
    for (const lang of LANGS) {
      const pageId = `page-${pageType.slug}-${lang}`
      await client.createOrReplace({
        _id: pageId,
        _type: 'page',
        title: pageType.title[lang],
        slug: { _type: 'slug', current: pageType.slug },
        language: lang,
        access: pageType.access,
        layout: pageType.layout,
        enablePosthogTracking: true,
        sections: [
          {
            _type: pageType.section,
            _key: key(`${pageType.slug}-section`),
          },
        ],
      })
      pageCount++
    }
  }
  console.log(`   ✓ Created ${pageCount} pages (8 types × 3 languages)`)
  console.log('     Access control (access, layout) is configurable per page in Sanity')
}

// ─── 6. PUBLIC PAGES (home, about, features, pricing, 404) ───────────────────
// (Keeping the existing seedPages logic from dump2 — abbreviated here)
// The full implementation is in the existing seed.ts. These are the
// public-facing pages that use the CMS sections system.

type Lang = 'en' | 'hi' | 'kn'
const LANGS: Lang[] = ['en', 'hi', 'kn']

async function seedHomePage(lang: Lang) {
  const titles: Record<Lang, string> = { en: 'Home', hi: 'होम', kn: 'ಮನೆ' }
  const headings: Record<Lang, string> = {
    en: 'Ideas, Stories, and Insights',
    hi: 'विचार, कहानियाँ और अंतर्दृष्टि',
    kn: 'ವಿಚಾರಗಳು, ಕಥೆಗಳು ಮತ್ತು ಒಳನೋಟಗಳು',
  }
  const subheadings: Record<Lang, string> = {
    en: 'Crafting digital narratives with the precision of print and the agility of SaaS. Welcome to the future of content management.',
    hi: 'प्रिंट की सटीकता और SaaS की चपलता के साथ डिजिटल कथाएँ तैयार करना। सामग्री प्रबंधन के भविष्य में आपका स्वागत है।',
    kn: 'ಮುದ್ರಣದ ನಿಖರತೆ ಮತ್ತು SaaS ನ ಚುರುಕುತನದಿಂದ ಡಿಜಿಟಲ್ ನಿರೂಪಣೆಗಳನ್ನು ರಚಿಸುವುದು.',
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
        badge: lang === 'en' ? 'EDITORIAL CMS PLATFORM' : lang === 'hi' ? 'संपादकीय CMS प्लेटफ़ॉर्म' : 'ಸಂಪಾದಕೀಯ CMS ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
        primaryCta:   { label: lang === 'en' ? 'Get Started' : lang === 'hi' ? 'शुरू करें' : 'ಪ್ರಾರಂಭಿಸಿ', href: '/signup' },
        secondaryCta: { label: lang === 'en' ? 'Explore Studio' : lang === 'hi' ? 'स्टूडियो देखें' : 'ಸ್ಟುಡಿಯೋ ನೋಡಿ', href: '/studio' },
        theme: 'dark',
        layout: 'split',
        communityText: lang === 'en' ? 'JOIN OUR GLOBAL COMMUNITY OF WRITERS' : lang === 'hi' ? 'हमारे लेखकों के वैश्विक समुदाय से जुड़ें' : 'ನಮ್ಮ ಬರಹಗಾರರ ಜಾಗತಿಕ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ',
      },
      {
        _type: 'featuredPostsSection',
        _key: key(`featured-${lang}`),
        heading: lang === 'en' ? 'Featured Stories' : lang === 'hi' ? 'चुनिंदा कहानियाँ' : 'ವೈಶಿಷ್ಟ್ಯ ಕಥೆಗಳು',
        maxPosts: 2,
        layout: 'grid',
        showExcerpt: true,
        showTags: true,
        viewAllLabel: lang === 'en' ? 'View all posts' : lang === 'hi' ? 'सभी पोस्ट देखें' : 'ಎಲ್ಲ ಪೋಸ್ಟ್ ನೋಡಿ',
      },
      {
        _type: 'recentPostsSection',
        _key: key(`recent-${lang}`),
        heading: lang === 'en' ? 'Recent Publications' : lang === 'hi' ? 'हाल के प्रकाशन' : 'ಇತ್ತೀಚಿನ ಪ್ರಕಾಶನಗಳು',
        count: 4,
        layout: 'grid',
        showCoverImage: true,
        viewAllLabel: lang === 'en' ? 'View all posts' : lang === 'hi' ? 'सभी पोस्ट देखें' : 'ಎಲ್ಲ ಪೋಸ್ಟ್ ನೋಡಿ',
      },
      {
        _type: 'ctaSection',
        _key: key(`cta-${lang}`),
        heading: lang === 'en' ? 'Ready to start publishing?' : lang === 'hi' ? 'प्रकाशन शुरू करने के लिए तैयार?' : 'ಪ್ರಕಾಶನ ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧರಾಗಿದ್ದೀರಾ?',
        body: lang === 'en' ? 'Sign up and start publishing content with our API-first CMS.' : lang === 'hi' ? 'हमारे API-first CMS के साथ साइन अप करें और सामग्री प्रकाशित करना शुरू करें।' : 'ನಮ್ಮ API-first CMS ನೊಂದಿಗೆ ಸೈನ್ ಅಪ್ ಮಾಡಿ ಮತ್ತು ವಿಷಯ ಪ್ರಕಟಿಸಲು ಪ್ರಾರಂಭಿಸಿ.',
        primaryButton: { label: lang === 'en' ? 'Get Started' : lang === 'hi' ? 'शुरू करें' : 'ಪ್ರಾರಂಭಿಸಿ', href: '/signup' },
        secondaryButton: { label: lang === 'en' ? 'Explore Studio' : lang === 'hi' ? 'स्टूडियो देखें' : 'ಸ್ಟುಡಿಯೋ ನೋಡಿ', href: '/studio' },
        theme: 'indigo',
        centered: true,
      },
    ],
  })
  console.log(`   ✓ page: home (${lang})`)
}

async function seedPublicPages() {
  console.log('\n🌐 Seeding public pages...')
  for (const lang of LANGS) {
    await seedHomePage(lang)
  }

  // Simple stub pages for about, features, pricing, 404
  const stubs = [
    { slug: 'about',    title: { en: 'About', hi: 'हमारे बारे में', kn: 'ನಮ್ಮ ಬಗ್ಗೆ' } },
    { slug: 'features', title: { en: 'Features', hi: 'विशेषताएँ', kn: 'ವೈಶಿಷ್ಟ್ಯಗಳು' } },
    { slug: 'pricing',  title: { en: 'Pricing', hi: 'मूल्य निर्धारण', kn: 'ಬೆಲೆ ನಿರ್ಧಾರ' } },
    { slug: '404',      title: { en: '404', hi: '404', kn: '404' } },
  ]

  for (const { slug, title } of stubs) {
    for (const lang of LANGS) {
      await client.createOrReplace({
        _id: `page-${slug}-${lang}`,
        _type: 'page',
        title: title[lang],
        slug: { _type: 'slug', current: slug },
        language: lang,
        access: 'public',
        layout: 'public',
        enablePosthogTracking: true,
        sections: [
          {
            _type: 'heroSection',
            _key: key(`hero-${slug}-${lang}`),
            heading: title[lang],
            theme: 'dark',
            layout: 'centered',
          },
        ],
      })
    }
    console.log(`   ✓ page: ${slug} (en/hi/kn)`)
  }
}

// ─── 7. POSTS ────────────────────────────────────────────────────────────────

const POST_DATA: Record<Lang, Array<{ title: string; slug: string; excerpt: string; tags: string[]; featured: boolean }>> = {
  en: [
    { title: 'The Quantum Shift: How AI is Redefining Creative Workflows', slug: 'quantum-shift-ai-creative-workflows', excerpt: 'Exploring the intersection of generative neural networks and the traditional craft of editorial design in the modern age.', tags: ['Technology', 'AI'], featured: true },
    { title: 'Minimalism in the Age of Digital Abundance', slug: 'minimalism-digital-abundance', excerpt: 'How constraints breed creativity and why less continues to be more in an era of infinite content.', tags: ['Design', 'UX'], featured: true },
    { title: 'Building Remote-First Design Cultures', slug: 'remote-first-design-cultures', excerpt: 'Practical strategies for maintaining design coherence across distributed teams and time zones.', tags: ['Culture', 'Remote'], featured: false },
    { title: 'Sanity Schema Design Patterns for Complex Editorial Systems', slug: 'sanity-schema-design-patterns', excerpt: 'Advanced techniques for structuring flexible, maintainable schemas in Sanity CMS.', tags: ['Sanity', 'CMS'], featured: false },
  ],
  hi: [
    { title: 'क्वांटम शिफ्ट: AI रचनात्मक कार्यप्रवाह को कैसे पुनर्परिभाषित कर रहा है', slug: 'quantum-shift-ai-creative-workflows', excerpt: 'आधुनिक युग में जनरेटिव न्यूरल नेटवर्क और संपादकीय डिज़ाइन की पारंपरिक कला का प्रतिच्छेदन।', tags: ['Technology', 'AI'], featured: true },
    { title: 'डिजिटल प्रचुरता के युग में न्यूनतावाद', slug: 'minimalism-digital-abundance', excerpt: 'कैसे बाधाएं रचनात्मकता को जन्म देती हैं और क्यों अनंत सामग्री के युग में कम अधिक बना हुआ है।', tags: ['Design', 'UX'], featured: false },
    { title: 'रिमोट-फर्स्ट डिज़ाइन संस्कृति का निर्माण', slug: 'remote-first-design-cultures', excerpt: 'वितरित टीमों और समय क्षेत्रों में डिज़ाइन सुसंगतता बनाए रखने की व्यावहारिक रणनीतियाँ।', tags: ['Culture', 'Remote'], featured: false },
    { title: 'जटिल संपादकीय प्रणालियों के लिए Sanity स्कीमा डिज़ाइन पैटर्न', slug: 'sanity-schema-design-patterns', excerpt: 'Sanity CMS में लचीले, रखरखाव योग्य स्कीमा की संरचना के लिए उन्नत तकनीकें।', tags: ['Sanity', 'CMS'], featured: false },
  ],
  kn: [
    { title: 'ಕ್ವಾಂಟಮ್ ಶಿಫ್ಟ್: AI ಸೃಜನಾತ್ಮಕ ಕಾರ್ಯಪ್ರವಾಹವನ್ನು ಹೇಗೆ ಮರು ವ್ಯಾಖ್ಯಾನಿಸುತ್ತಿದೆ', slug: 'quantum-shift-ai-creative-workflows', excerpt: 'ಆಧುನಿಕ ಯುಗದಲ್ಲಿ ಜನರೇಟಿವ್ ನ್ಯೂರಲ್ ನೆಟ್‌ವರ್ಕ್‌ಗಳು ಮತ್ತು ಸಂಪಾದಕೀಯ ವಿನ್ಯಾಸದ ಸಾಂಪ್ರದಾಯಿಕ ಕ್ರಾಫ್ಟ್ ಛೇದಿಸುವಿಕೆ.', tags: ['Technology', 'AI'], featured: true },
    { title: 'ಡಿಜಿಟಲ್ ಸಮೃದ್ಧಿಯ ಯುಗದಲ್ಲಿ ಮಿನಿಮಲಿಸಂ', slug: 'minimalism-digital-abundance', excerpt: 'ಮಿತಿಗಳು ಹೇಗೆ ಸೃಜನಶೀಲತೆಯನ್ನು ಬೆಳೆಸುತ್ತವೆ ಮತ್ತು ಅನಂತ ವಿಷಯದ ಯುಗದಲ್ಲಿ ಕಡಿಮೆ ಹೆಚ್ಚು ಏಕೆ ಮುಂದುವರಿಯುತ್ತದೆ.', tags: ['Design', 'UX'], featured: false },
    { title: 'ರಿಮೋಟ್-ಫಸ್ಟ್ ಡಿಸೈನ್ ಸಂಸ್ಕೃತಿಗಳ ನಿರ್ಮಾಣ', slug: 'remote-first-design-cultures', excerpt: 'ವಿತರಿಸಿದ ತಂಡಗಳಾದ್ಯಂತ ವಿನ್ಯಾಸ ಸಂಗತಿಯನ್ನು ನಿರ್ವಹಿಸಲು ಪ್ರಾಯೋಗಿಕ ತಂತ್ರಗಳು.', tags: ['Culture', 'Remote'], featured: false },
    { title: 'ಸಂಕೀರ್ಣ ಸಂಪಾದಕೀಯ ವ್ಯವಸ್ಥೆಗಳಿಗಾಗಿ Sanity ಸ್ಕೀಮಾ ವಿನ್ಯಾಸ ಮಾದರಿಗಳು', slug: 'sanity-schema-design-patterns', excerpt: 'Sanity CMS ನಲ್ಲಿ ಹೊಂದಿಕೊಳ್ಳುವ, ನಿರ್ವಹಣೆ ಯೋಗ್ಯ ಸ್ಕೀಮಾಗಳ ರಚನೆಗಾಗಿ ಸುಧಾರಿತ ತಂತ್ರಗಳು.', tags: ['Sanity', 'CMS'], featured: false },
  ],
}

async function seedPosts() {
  console.log('\n📝 Seeding posts...')
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
        authorName: 'ContentFlow Team',
        authorEmail: 'hello@contentflow.io',
        body: blocks(
          p.excerpt,
          lang === 'en'
            ? 'This article explores the nuances of modern content management and how teams can leverage cutting-edge tools to deliver exceptional editorial experiences.'
            : lang === 'hi'
            ? 'यह लेख आधुनिक सामग्री प्रबंधन की बारीकियों को उजागर करता है।'
            : 'ಈ ಲೇಖನವು ಆಧುನಿಕ ವಿಷಯ ನಿರ್ವಹಣೆಯ ಸೂಕ್ಷ್ಮತೆಗಳನ್ನು ಅನ್ವೇಷಿಸುತ್ತದೆ.',
          lang === 'en'
            ? 'The intersection of design thinking, technical architecture, and editorial strategy creates opportunities for innovation that were previously impossible.'
            : lang === 'hi'
            ? 'डिज़ाइन थिंकिंग, तकनीकी वास्तुकला और संपादकीय रणनीति का प्रतिच्छेदन नवाचार के अवसर बनाता है।'
            : 'ವಿನ್ಯಾಸ ಚಿಂತನೆ, ತಾಂತ್ರಿಕ ವಾಸ್ತುಶಿಲ್ಪ ಮತ್ತು ಸಂಪಾದಕೀಯ ತಂತ್ರದ ಛೇದನವು ಆವಿಷ್ಕಾರಕ್ಕೆ ಅವಕಾಶಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ.'
        ),
      })
    }
    console.log(`   ✓ ${POST_DATA[lang].length} posts (${lang})`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 ContentFlow Seed Script\n')
  console.log(`   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}`)

  await deleteAll()
  await seedSiteConfig()
  await seedAuthConfig()
  await seedAppPageSingletons()
  await seedAppPageDocuments()
  await seedPublicPages()
  await seedPosts()

  console.log('\n✅ Seed complete!')
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})