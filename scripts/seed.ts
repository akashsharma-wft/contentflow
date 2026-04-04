/**
 * scripts/seed.ts
 *
 * Seeds Sanity with: siteConfig, authConfig, home pages (en/hi/kn),
 * and sample posts (2 per language, 1 featured each).
 *
 * Usage:   npm run seed
 * Safe to run multiple times — uses createOrReplace() with fixed _ids.
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

const LANGUAGES = ['en', 'hi', 'kn'] as const
type Lang = (typeof LANGUAGES)[number]

// ─── siteConfig ───────────────────────────────────────────────────────────────

async function seedSiteConfig() {
  console.log('  ↳ siteConfig...')
  await client.createOrReplace({
    _id: 'siteConfig',
    _type: 'siteConfig',
    siteName: 'ContentFlow',
    tagline: 'CMS-driven publishing for engineering teams.',
    publicNav: [
      { label: 'Home', slug: 'home', _key: 'nav-home' },
      { label: 'Studio', href: '/studio', _key: 'nav-studio' },
    ],
    sidebarNav: [
      { label: 'Home', href: '/', icon: 'Home', adminOnly: false, _key: 'snav-home' },
      { label: 'Posts', href: '/', icon: 'FileText', adminOnly: false, _key: 'snav-posts' },
    ],
    footerTagline: 'A next-generation CMS platform dedicated to the art of storytelling and editorial excellence. Built for modern publishers.',
    footerLinks: [
      { label: 'Privacy Policy', href: '#', _key: 'footer-privacy' },
      { label: 'Terms of Service', href: '#', _key: 'footer-terms' },
    ],
    copyright: '© 2026 ContentFlow. All rights reserved.',
  })
  console.log('    ✓ siteConfig')
}

// ─── authConfig ───────────────────────────────────────────────────────────────

async function seedAuthConfig() {
  console.log('  ↳ authConfig...')
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
      { text: 'API-first delivery architecture', icon: 'Zap', _key: 'feat-1' },
      { text: 'Visual Schema Builder v2.0', icon: 'LayoutGrid', _key: 'feat-2' },
      { text: 'Multi-environment staging', icon: 'GitBranch', _key: 'feat-3' },
    ],
  })
  console.log('    ✓ authConfig')
}

// ─── Home pages ───────────────────────────────────────────────────────────────

const PAGE_CONTENT: Record<Lang, {
  title: string
  heroHeading: string
  heroSubheading: string
  ctaHeading: string
}> = {
  en: {
    title: 'Home',
    heroHeading: 'Ideas, Stories, and Insights',
    heroSubheading: 'Crafting digital narratives with the precision of print and the agility of SaaS. Welcome to the future of content management.',
    ctaHeading: 'Ready to start publishing?',
  },
  hi: {
    title: 'होम',
    heroHeading: 'विचार, कहानियाँ और अंतर्दृष्टि',
    heroSubheading: 'प्रिंट की सटीकता और SaaS की चपलता के साथ डिजिटल कथाएँ तैयार करना। सामग्री प्रबंधन के भविष्य में आपका स्वागत है।',
    ctaHeading: 'प्रकाशन शुरू करने के लिए तैयार?',
  },
  kn: {
    title: 'ಮನೆ',
    heroHeading: 'ವಿಚಾರಗಳು, ಕಥೆಗಳು ಮತ್ತು ಒಳನೋಟಗಳು',
    heroSubheading: 'ಮುದ್ರಣದ ನಿಖರತೆ ಮತ್ತು SaaS ನ ಚುರುಕುತನದಿಂದ ಡಿಜಿಟಲ್ ನಿರೂಪಣೆಗಳನ್ನು ರಚಿಸುವುದು. ವಿಷಯ ನಿರ್ವಹಣೆಯ ಭವಿಷ್ಯಕ್ಕೆ ಸ್ವಾಗತ.',
    ctaHeading: 'ಪ್ರಕಾಶನ ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧರಾಗಿದ್ದೀರಾ?',
  },
}

async function seedHomePage(lang: Lang) {
  console.log(`  ↳ home page [${lang}]...`)
  const content = PAGE_CONTENT[lang]

  await client.createOrReplace({
    _id: `page-home-${lang}`,
    _type: 'page',
    title: content.title,
    slug: { _type: 'slug', current: 'home' },
    language: lang,
    isPublic: true,
    adminOnly: false,
    showNavbar: true,
    showSidebar: false,
    enablePosthogTracking: true,
    seoTitle: lang === 'en'
      ? 'ContentFlow — Ideas, Stories, and Insights'
      : lang === 'hi'
      ? 'ContentFlow — विचार, कहानियाँ और अंतर्दृष्टि'
      : 'ContentFlow — ವಿಚಾರಗಳು, ಕಥೆಗಳು ಮತ್ತು ಒಳನೋಟಗಳು',
    seoDescription: lang === 'en'
      ? 'CMS-driven publishing platform for engineering teams. API-first, high-performance content delivery.'
      : content.heroSubheading,
    sections: [
      {
        _type: 'heroSection',
        _key: `hero-${lang}`,
        heading: content.heroHeading,
        subheading: content.heroSubheading,
        badge: lang === 'en' ? 'EDITORIAL CMS PLATFORM' : lang === 'hi' ? 'संपादकीय CMS प्लेटफ़ॉर्म' : 'ಸಂಪಾದಕೀಯ CMS ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
        primaryCta: {
          label: lang === 'en' ? 'Explore Posts' : lang === 'hi' ? 'पोस्ट देखें' : 'ಪೋಸ್ಟ್ ನೋಡಿ',
          href: lang === 'en' ? '/' : `/${lang}`,
        },
        secondaryCta: {
          label: lang === 'en' ? 'View Documentation' : lang === 'hi' ? 'दस्तावेज़ देखें' : 'ದಾಖಲೆಗಳನ್ನು ನೋಡಿ',
          href: '/studio',
        },
        theme: 'dark',
        layout: 'split',
        communityText: lang === 'en'
          ? 'JOIN OUR GLOBAL COMMUNITY OF WRITERS'
          : lang === 'hi'
          ? 'हमारे लेखकों के वैश्विक समुदाय से जुड़ें'
          : 'ನಮ್ಮ ಬರಹಗಾರರ ಜಾಗತಿಕ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ',
      },
      {
        _type: 'statsSection',
        _key: `stats-${lang}`,
        heading: lang === 'en' ? 'Platform at a glance' : lang === 'hi' ? 'प्लेटफ़ॉर्म एक नज़र में' : 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಒಂದು ನೋಟದಲ್ಲಿ',
        stats: [
          { value: '∞', label: lang === 'en' ? 'Published Posts' : lang === 'hi' ? 'प्रकाशित पोस्ट' : 'ಪ್ರಕಟಿತ ಪೋಸ್ಟ್', description: lang === 'en' ? 'Live and indexed' : lang === 'hi' ? 'लाइव और इंडेक्स्ड' : 'ನೇರ ಮತ್ತು ಸೂಚಿಕೆ', useLivePostCount: true, _key: `stat-posts-${lang}` },
          { value: '3', label: lang === 'en' ? 'Languages' : lang === 'hi' ? 'भाषाएँ' : 'ಭಾಷೆಗಳು', description: 'EN · HI · KN', useLivePostCount: false, _key: `stat-langs-${lang}` },
          { value: '< 1s', label: lang === 'en' ? 'Time to First Byte' : lang === 'hi' ? 'पहले बाइट तक समय' : 'ಮೊದಲ ಬೈಟ್‌ಗೆ ಸಮಯ', description: lang === 'en' ? 'CDN-accelerated' : lang === 'hi' ? 'CDN-त्वरित' : 'CDN-ವೇಗಗೊಳಿಸಲಾಗಿದೆ', useLivePostCount: false, _key: `stat-ttfb-${lang}` },
          { value: '99.9%', label: lang === 'en' ? 'Uptime SLA' : lang === 'hi' ? 'अपटाइम SLA' : 'ಅಪ್‌ಟೈಮ್ SLA', description: lang === 'en' ? 'Globally distributed' : lang === 'hi' ? 'वैश्विक स्तर पर वितरित' : 'ಜಾಗತಿಕವಾಗಿ ವಿತರಿಸಲಾಗಿದೆ', useLivePostCount: false, _key: `stat-uptime-${lang}` },
        ],
      },
      {
        _type: 'featuredPostsSection',
        _key: `featured-${lang}`,
        heading: lang === 'en' ? 'Featured Stories' : lang === 'hi' ? 'चुनिंदा कहानियाँ' : 'ವೈಶಿಷ್ಟ್ಯ ಕಥೆಗಳು',
        maxPosts: 2,
        layout: 'grid',
        showExcerpt: true,
        showTags: true,
        viewAllLabel: lang === 'en' ? 'View all posts' : lang === 'hi' ? 'सभी पोस्ट देखें' : 'ಎಲ್ಲ ಪೋಸ್ಟ್ ನೋಡಿ',
      },
      {
        _type: 'recentPostsSection',
        _key: `recent-${lang}`,
        heading: lang === 'en' ? 'Recent Publications' : lang === 'hi' ? 'हाल के प्रकाशन' : 'ಇತ್ತೀಚಿನ ಪ್ರಕಾಶನಗಳು',
        count: 6,
        layout: 'grid',
        showCoverImage: true,
        viewAllLabel: lang === 'en' ? 'Load more stories' : lang === 'hi' ? 'और कहानियाँ लोड करें' : 'ಇನ್ನಷ್ಟು ಕಥೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಿ',
        viewAllHref: lang === 'en' ? '/' : `/${lang}`,
      },
      {
        _type: 'ctaSection',
        _key: `cta-${lang}`,
        heading: content.ctaHeading,
        body: lang === 'en'
          ? 'Sign up and start publishing content with our API-first CMS.'
          : lang === 'hi'
          ? 'साइन अप करें और हमारे API-प्रथम CMS से सामग्री प्रकाशित करना शुरू करें।'
          : 'ಸೈನ್ ಅಪ್ ಮಾಡಿ ಮತ್ತು ನಮ್ಮ API-ಮೊದಲ CMS ನೊಂದಿಗೆ ವಿಷಯ ಪ್ರಕಟಿಸಿ.',
        primaryButton: { label: lang === 'en' ? 'Get Started' : lang === 'hi' ? 'शुरू करें' : 'ಪ್ರಾರಂಭಿಸಿ', href: '/signup' },
        secondaryButton: { label: lang === 'en' ? 'Sign In' : lang === 'hi' ? 'साइन इन करें' : 'ಸೈನ್ ಇನ್', href: '/login' },
        theme: 'indigo',
        centered: true,
      },
    ],
  })
  console.log(`    ✓ home [${lang}]`)
}

// ─── Sample posts ──────────────────────────────────────────────────────────────

const SAMPLE_POSTS: Array<{
  id: string
  slug: string
  lang: Lang
  title: string
  excerpt: string
  body: string
  tags: string[]
  featured: boolean
  authorName: string
}> = [
  // ── English ──────────────────────────────────────────────────────────────────
  {
    id: 'post-en-1',
    slug: 'the-quantum-shift',
    lang: 'en',
    title: 'The Quantum Shift: How AI is Redefining Creative Workflows',
    excerpt: 'Exploring the intersection of generative neural networks and the traditional craft of editorial design in the modern age.',
    body: 'The rise of generative AI has fundamentally changed how editorial teams approach creative work. From automated layout suggestions to AI-driven content briefs, the tools available today would have seemed like science fiction a decade ago.\n\nYet the most interesting developments are not about replacing human creativity — they are about amplifying it. When a designer can generate 50 visual concepts in the time it used to take to sketch three, the creative ceiling rises dramatically.\n\nThe teams that thrive will be those who learn to direct AI like a skilled collaborator rather than fear it as a competitor.',
    tags: ['Technology', 'AI', 'Design'],
    featured: true,
    authorName: 'Editorial Team',
  },
  {
    id: 'post-en-2',
    slug: 'minimalism-in-the-age-of-digital-abundance',
    lang: 'en',
    title: 'Minimalism in the Age of Digital Abundance',
    excerpt: 'Why the most sophisticated interfaces of 2024 are the ones that dare to stay silent and focus on core utility.',
    body: 'As screens multiply and attention fragments, the interfaces that cut through the noise share one characteristic: restraint. The discipline to not add a feature, not include another animation, not fill every pixel with information.\n\nThis is not laziness — it is the hardest kind of design work. Every element that remains has survived a rigorous audit. Every white space was deliberately chosen over something that could have filled it.\n\nThe paradox of digital abundance is that the most powerful tools are often the ones that do less, but do it with exceptional clarity.',
    tags: ['Design', 'UX', 'Philosophy'],
    featured: false,
    authorName: 'Editorial Team',
  },
  {
    id: 'post-en-3',
    slug: 'building-remote-first-design-cultures',
    lang: 'en',
    title: 'Building Remote-First Design Cultures',
    excerpt: 'How leading tech companies are maintaining creative synergy across continents and time zones.',
    body: 'Remote design work is no longer a temporary accommodation — it is the default operating mode for a growing proportion of the world\'s best design teams. The organisations that adapted earliest are now seeing the competitive advantages compound.\n\nThe key insight: remote-first is not the same as office-work-but-online. It requires rethinking every ritual, every decision-making process, every feedback loop from first principles.\n\nDocumented decisions replace unrecorded hallway conversations. Asynchronous critique replaces real-time meetings that exclude anyone not in the right timezone.',
    tags: ['Culture', 'Remote', 'Design'],
    featured: true,
    authorName: 'Editorial Team',
  },
  {
    id: 'post-en-4',
    slug: 'evolution-of-webgl-frameworks',
    lang: 'en',
    title: 'The Evolution of WebGL Frameworks',
    excerpt: 'Breaking down the barriers of browser-based 3D rendering for next-gen interactive experiences.',
    body: 'WebGL entered the browser nearly fifteen years ago and immediately promised a future where the web could match native applications for immersive, hardware-accelerated graphics. That promise has taken longer to materialise than many predicted — but 2024 marks an inflection point.\n\nThree.js lowered the barrier significantly. React Three Fiber made it composable. WebGPU is now shipping in major browsers and represents a generational leap in what client-side graphics can achieve.\n\nThe creative possibilities for editorial teams building interactive data stories, immersive product showcases, or educational simulations are expanding faster than most teams can absorb.',
    tags: ['Tech', 'WebGL', 'Frontend'],
    featured: false,
    authorName: 'Engineering Team',
  },
  {
    id: 'post-en-5',
    slug: 'psychology-of-color-in-saas',
    lang: 'en',
    title: 'Psychology of Color in SaaS Branding',
    excerpt: 'How subtle tonal shifts influence user trust and retention in high-stakes enterprise software.',
    body: 'Enterprise software has for decades defaulted to blue. The psychology is not accidental: blue signals trustworthiness, stability, and competence — exactly what procurement teams need to feel when signing multi-year contracts.\n\nBut a new generation of SaaS products is challenging this orthodoxy. Notion\'s warm neutrals. Linear\'s deep purples. Vercel\'s stark monochrome. Each is a deliberate signal to a specific buyer persona: we are not your father\'s enterprise software.\n\nThe interesting question is not which colour palette to choose, but what emotional state you are designing your users into when they open your product first thing in the morning.',
    tags: ['Design', 'Branding', 'SaaS'],
    featured: false,
    authorName: 'Editorial Team',
  },
  {
    id: 'post-en-6',
    slug: 'art-of-curation-in-saas',
    lang: 'en',
    title: 'The Art of Curation in SaaS',
    excerpt: 'How to build a content engine that creates long-term value for your users and your brand.',
    body: 'Every SaaS company is now a media company. The question is not whether to produce content, but how to produce content that compounds in value rather than expires within 48 hours of publication.\n\nThe answer lies in curation strategy — a deliberate framework for deciding what to create, what to amplify, and what to let go. The best content engines are built around a point of view, not a production quota.\n\nWhen you publish from a consistent perspective, readers develop a relationship with your editorial voice. That relationship is an asset that no algorithm update can deprecate.',
    tags: ['Strategy', 'Content', 'SaaS'],
    featured: false,
    authorName: 'Editorial Team',
  },

  // ── Hindi ─────────────────────────────────────────────────────────────────────
  {
    id: 'post-hi-1',
    slug: 'the-quantum-shift',
    lang: 'hi',
    title: 'क्वांटम शिफ्ट: AI रचनात्मक कार्यप्रवाह को कैसे पुनर्परिभाषित कर रहा है',
    excerpt: 'आधुनिक युग में जनरेटिव न्यूरल नेटवर्क और पारंपरिक संपादकीय डिजाइन के शिल्प के चौराहे की खोज।',
    body: 'जनरेटिव AI के उदय ने संपादकीय टीमों के रचनात्मक कार्य के तरीके को मौलिक रूप से बदल दिया है। आज उपलब्ध उपकरण एक दशक पहले विज्ञान कथा जैसे लगते थे।\n\nफिर भी सबसे दिलचस्प विकास मानवीय रचनात्मकता को प्रतिस्थापित करने के बारे में नहीं है — यह उसे बढ़ाने के बारे में है। जब एक डिजाइनर तीन स्केच बनाने में लगने वाले समय में 50 दृश्य अवधारणाएं उत्पन्न कर सकता है, तो रचनात्मक छत नाटकीय रूप से ऊंची हो जाती है।',
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
    body: 'जैसे-जैसे स्क्रीन बढ़ती हैं और ध्यान बिखरता है, जो इंटरफेस शोर को काटते हैं उनमें एक विशेषता होती है: संयम। किसी फीचर को न जोड़ने, कोई और एनिमेशन न शामिल करने, हर पिक्सेल को जानकारी से न भरने का अनुशासन।\n\nयह आलस्य नहीं है — यह सबसे कठिन प्रकार का डिजाइन कार्य है। जो भी तत्व बचा रहता है वह एक कठोर ऑडिट से गुजरा होता है।',
    tags: ['Design', 'UX', 'Philosophy'],
    featured: false,
    authorName: 'संपादकीय टीम',
  },

  // ── Kannada ───────────────────────────────────────────────────────────────────
  {
    id: 'post-kn-1',
    slug: 'the-quantum-shift',
    lang: 'kn',
    title: 'ಕ್ವಾಂಟಮ್ ಶಿಫ್ಟ್: AI ಸೃಜನಾತ್ಮಕ ಕೆಲಸದ ಹರಿವನ್ನು ಹೇಗೆ ಮರುವ್ಯಾಖ್ಯಾನಿಸುತ್ತಿದೆ',
    excerpt: 'ಆಧುನಿಕ ಯುಗದಲ್ಲಿ ಜನರೇಟಿವ್ ನ್ಯೂರಲ್ ನೆಟ್‌ವರ್ಕ್‌ಗಳು ಮತ್ತು ಸಂಪಾದಕೀಯ ವಿನ್ಯಾಸದ ಸಾಂಪ್ರದಾಯಿಕ ಕಲೆಯ ಛೇದಕವನ್ನು ಅನ್ವೇಷಿಸುವುದು.',
    body: 'ಜನರೇಟಿವ್ AI ಯ ಉದಯವು ಸಂಪಾದಕೀಯ ತಂಡಗಳು ಸೃಜನಾತ್ಮಕ ಕೆಲಸವನ್ನು ಸಮೀಪಿಸುವ ರೀತಿಯನ್ನು ಮೂಲಭೂತವಾಗಿ ಬದಲಿಸಿದೆ. ಇಂದು ಲಭ್ಯವಿರುವ ಸಾಧನಗಳು ಒಂದು ದಶಕದ ಹಿಂದೆ ವಿಜ್ಞಾನ ಕಥೆಯಂತೆ ತೋರುತ್ತಿದ್ದವು.\n\nಆದರೆ ಅತ್ಯಂತ ಆಸಕ್ತಿದಾಯಕ ಬೆಳವಣಿಗೆಗಳು ಮಾನವ ಸೃಜನಶೀಲತೆಯನ್ನು ಬದಲಿಸುವ ಬಗ್ಗೆ ಅಲ್ಲ — ಅದನ್ನು ವರ್ಧಿಸುವ ಬಗ್ಗೆ.',
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
    body: 'ಪರದೆಗಳು ಹೆಚ್ಚಾದಂತೆ ಮತ್ತು ಗಮನ ಚದುರಿದಂತೆ, ಗದ್ದಲವನ್ನು ಕಡಿತಗೊಳಿಸುವ ಇಂಟರ್‌ಫೇಸ್‌ಗಳು ಒಂದು ಗುಣಲಕ್ಷಣವನ್ನು ಹಂಚಿಕೊಳ್ಳುತ್ತವೆ: ಸಂಯಮ. ವೈಶಿಷ್ಟ್ಯವನ್ನು ಸೇರಿಸದಿರುವ, ಮತ್ತೊಂದು ಅನಿಮೇಷನ್ ಸೇರಿಸದಿರುವ, ಪ್ರತಿ ಪಿಕ್ಸೆಲ್ ಅನ್ನು ಮಾಹಿತಿಯಿಂದ ತುಂಬಿಸದಿರುವ ಶಿಸ್ತು.',
    tags: ['Design', 'UX', 'Philosophy'],
    featured: false,
    authorName: 'ಸಂಪಾದಕೀಯ ತಂಡ',
  },
]

async function seedPosts() {
  console.log(`  ↳ ${SAMPLE_POSTS.length} sample posts...`)
  const now = new Date()

  for (let i = 0; i < SAMPLE_POSTS.length; i++) {
    const p = SAMPLE_POSTS[i]
    // Stagger publishedAt so ordering is predictable
    const publishedAt = new Date(now.getTime() - i * 3 * 24 * 60 * 60 * 1000).toISOString()

    await client.createOrReplace({
      _id: p.id,
      _type: 'post',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      language: p.lang,
      excerpt: p.excerpt,
      body: [
        {
          _type: 'block',
          _key: `body-${p.id}`,
          style: 'normal',
          children: p.body.split('\n\n').map((text, idx) => ({
            _type: 'span',
            _key: `span-${p.id}-${idx}`,
            text,
            marks: [],
          })),
          markDefs: [],
        },
      ],
      publishedAt,
      featured: p.featured,
      tags: p.tags,
      authorName: p.authorName,
      authorEmail: 'team@contentflow.dev',
    })
    console.log(`    ✓ [${p.lang}] ${p.title.substring(0, 48)}…`)
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 ContentFlow — Seed Script\n')
  console.log(`Project : ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`Dataset : ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}\n`)

  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌  SANITY_API_TOKEN is missing. Add it to .env.local and try again.')
    process.exit(1)
  }

  try {
    console.log('Seeding singletons...')
    await seedSiteConfig()
    await seedAuthConfig()

    console.log('\nSeeding home pages...')
    for (const lang of LANGUAGES) {
      await seedHomePage(lang)
    }

    console.log('\nSeeding sample posts...')
    await seedPosts()

    console.log('\n✅  Seed complete!\n')
    console.log('Verify at:')
    console.log('  http://localhost:3000        — English homepage')
    console.log('  http://localhost:3000/hi     — Hindi homepage')
    console.log('  http://localhost:3000/kn     — Kannada homepage')
    console.log('  http://localhost:3000/studio — Sanity Studio\n')
  } catch (err) {
    console.error('❌  Seed failed:', err)
    process.exit(1)
  }
}

main()
