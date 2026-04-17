/**
 * ContentFlow — Seed script
 * Usage: npx dotenv -e .env.local tsx scripts/seed.ts
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'h2zl7fu3',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production',
  apiVersion: '2024-01-01',
  token:      process.env.SANITY_API_TOKEN,
  useCdn:     false,
})

if (!process.env.SANITY_API_TOKEN) {
  console.error('❌  SANITY_API_TOKEN not set in .env.local')
  process.exit(1)
}

// ── Constants ──────────────────────────────────────────────────────────────────

const AUTHOR = {
  authorId:    '726b5d7b-f770-47a6-bf7b-4ac5be8201b9',
  authorName:  'Akash Sharma',
  authorEmail: 'akash.sharma@weframetech.com',
}

const LANGS = ['en', 'hi', 'kn'] as const
type Lang = typeof LANGS[number]

// 10 picsum image IDs to cycle through for post covers
const PICSUM_IDS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

// ── ID helpers ─────────────────────────────────────────────────────────────────

const sid  = (page: string, type: string, lang: Lang) => `seed-section-${page}-${type}-${lang}`
const pid  = (slug: string, lang: Lang)               => `seed-page-${slug}-${lang}`
const poid = (lang: Lang, n: number)                  => `seed-post-${lang}-${String(n).padStart(2, '0')}`
const ref  = (_ref: string)                           => ({ _type: 'reference' as const, _ref })
const k    = ()                                       => Math.random().toString(36).slice(2, 9)

// ── Image upload ───────────────────────────────────────────────────────────────

async function uploadImages(): Promise<string[]> {
  console.log('📸  Uploading cover images...')
  const ids: string[] = []
  for (const picsumId of PICSUM_IDS) {
    try {
      const res  = await fetch(`https://picsum.photos/id/${picsumId}/1200/630`)
      const buf  = Buffer.from(await res.arrayBuffer())
      const asset = await client.assets.upload('image', buf, {
        filename:    `seed-cover-${picsumId}.jpg`,
        contentType: 'image/jpeg',
      })
      ids.push(asset._id)
    } catch {
      // fallback: skip and reuse previous if any
      if (ids.length > 0) ids.push(ids[ids.length - 1])
    }
  }
  console.log(`   ✓ ${ids.length} images uploaded`)
  return ids
}

// ── Cleanup ────────────────────────────────────────────────────────────────────

async function deleteAll(label: string, filter: string) {
  // Also remove any draft versions (drafts.ID)
  const docs = await client.fetch<{ _id: string }[]>(`*[${filter}]{ _id }`)
  if (docs.length === 0) return
  const CHUNK = 200
  for (let i = 0; i < docs.length; i += CHUNK) {
    const tx = client.transaction()
    docs.slice(i, i + CHUNK).forEach(d => {
      tx.delete(d._id)
      tx.delete(`drafts.${d._id}`)
    })
    await tx.commit({ visibility: 'sync' })
  }
  console.log(`   ✓ deleted ${docs.length} ${label}`)
}

async function cleanup() {
  console.log('🧹  Wiping existing pages, sections, posts and config...')
  // Wipe ALL docs of each type so old naming conventions don't leave stale duplicates
  await deleteAll('posts',       `_type == "post"      && !(_id in path("drafts.**"))`)
  await deleteAll('pages',       `_type == "page"      && !(_id in path("drafts.**"))`)
  await deleteAll('sections',    `_type == "section"   && !(_id in path("drafts.**"))`)
  await deleteAll('components',  `_type == "component" && !(_id in path("drafts.**"))`)
  await deleteAll('site config', `_id == "site-config"`)
  console.log()
}

// ── Site Config ────────────────────────────────────────────────────────────────

function buildSiteConfig() {
  const year = new Date().getFullYear()
  return {
    _id:   'site-config',
    _type: 'siteConfig',
    title:    'ContentFlow',
    siteName: 'ContentFlow',

    navbarConfig: {
      brandName:          'ContentFlow',
      showLanguageSwitcher: true,
      ctaButton: { label: 'Get Started', href: '/signup' },
      items: [
        { _key: k(), label: { en: 'Posts',     hi: 'पोस्ट',      kn: 'ಪೋಸ್ಟ್‌ಗಳು'     }, href: '/posts',     visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Settings',  hi: 'सेटिंग्स',   kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'  }, href: '/settings',  visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Billing',   hi: 'बिलिंग',     kn: 'ಬಿಲ್ಲಿಂಗ್'      }, href: '/billing',   visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Analytics', hi: 'विश्लेषण',   kn: 'ವಿಶ್ಲೇಷಣೆ'      }, href: '/analytics', visibleFor: ['admin'] },
        { _key: k(), label: { en: 'Admin',     hi: 'एडमिन',      kn: 'ಅಡ್ಮಿನ್'         }, href: '/admin',     visibleFor: ['admin'] },
      ],
    },

    footerConfig: {
      brandName:     'ContentFlow',
      showBrandLogo: true,
      tagline:       'CMS-driven content at the speed of thought.',
      copyright:     `© ${year} ContentFlow. All rights reserved.`,
      socialLinks: [
        { _key: k(), platform: 'github',   label: 'GitHub',   href: 'https://github.com' },
        { _key: k(), platform: 'twitter',  label: 'Twitter',  href: 'https://twitter.com' },
        { _key: k(), platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
      ],
      columns: [
        {
          _key: k(), heading: 'Product',
          links: [
            { _key: k(), label: 'Features', href: '/', external: false },
            { _key: k(), label: 'Pricing',  href: '/billing', external: false },
          ],
        },
        {
          _key: k(), heading: 'Company',
          links: [
            { _key: k(), label: 'About',   href: '/',  external: false },
            { _key: k(), label: 'Contact', href: '/',  external: false },
          ],
        },
      ],
      bottomLinks: [
        { _key: k(), label: 'Privacy Policy', href: '/', external: false },
        { _key: k(), label: 'Terms of Service', href: '/', external: false },
      ],
    },

    sidebarConfig: {
      brandName:     'ContentFlow',
      brandSubtitle: 'Engineering CMS',
      statusText:    'Built with ContentFlow SDK',
      statusBadge:   'System Status: Nominal',
      ctaButton: { label: 'Upgrade to Pro', href: '/billing' },
      navItems: [
        { _key: k(), label: { en: 'Posts',     hi: 'पोस्ट',       kn: 'ಪೋಸ್ಟ್‌ಗಳು'     }, href: '/posts',     icon: 'FileText',  visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Analytics', hi: 'विश्लेषण',    kn: 'ವಿಶ್ಲೇಷಣೆ'      }, href: '/analytics', icon: 'BarChart2', visibleFor: ['admin'] },
        { _key: k(), label: { en: 'Settings',  hi: 'सेटिंग',      kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'   }, href: '/settings',  icon: 'Settings',  visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Billing',   hi: 'बिलिंग',      kn: 'ಬಿಲ್ಲಿಂಗ್'       }, href: '/billing',   icon: 'CreditCard',visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Admin',     hi: 'एडमिन',       kn: 'ಅಡ್ಮಿನ್'         }, href: '/admin',     icon: 'Users',     visibleFor: ['admin'] },
      ],
      footerLinks: [
        { _key: k(), label: 'Help', href: '/', icon: 'HelpCircle', external: false },
      ],
    },

    mobileNavConfig: {
      showLabels: true,
      items: [
        { _key: k(), label: { en: 'Posts',     hi: 'पोस्ट',    kn: 'ಪೋಸ್ಟ್‌ಗಳು'  }, href: '/posts',     icon: 'FileText',   visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Analytics', hi: 'विश्लेषण', kn: 'ವಿಶ್ಲೇಷಣೆ'   }, href: '/analytics', icon: 'BarChart2',  visibleFor: ['admin'] },
        { _key: k(), label: { en: 'Settings',  hi: 'सेटिंग',   kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'}, href: '/settings',  icon: 'Settings',   visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Billing',   hi: 'बिलिंग',   kn: 'ಬಿಲ್ಲಿಂಗ್'    }, href: '/billing',   icon: 'CreditCard', visibleFor: ['user','admin'] },
        { _key: k(), label: { en: 'Admin',     hi: 'एडमिन',    kn: 'ಅಡ್ಮಿನ್'      }, href: '/admin',     icon: 'Users',      visibleFor: ['admin'] },
      ],
    },
  }
}

// ── Section builders ───────────────────────────────────────────────────────────

function buildSections(lang: Lang) {
  const t = {
    en: {
      // Home
      heroHeading:    'Ship content faster with ContentFlow',
      heroSub:        'A CMS-driven SaaS dashboard built with Next.js, Sanity, and Supabase.',
      heroBadge:      'Now with multi-language support',
      heroPrimary:    'Get started',
      heroSecondary:  'View docs',
      heroCommunity:  'Join 500+ developers',
      featuredHead:   'Featured Stories',
      featuredSub:    'Hand-picked articles from our editorial team.',
      recentHead:     'Recent Publications',
      recentSub:      'Stay up to date with the latest posts.',
      ctaHead:        'Ready to publish faster?',
      ctaBody:        'Start your free account today and manage all your content in one place.',
      ctaPrimary:     'Start for free',
      ctaSecondary:   'Learn more',
      // Auth
      authBadge:      'Secure · Fast · Reliable',
      loginHeadline:  'Welcome back to ContentFlow',
      signupHeadline: 'Start publishing today',
      googleLabel:    'Continue with Google',
      loginHeading:   'Sign in to your account',
      signupHeading:  'Create your account',
      loginSubmit:    'Sign in',
      signupSubmit:   'Create account',
      loginFooter:    "Don't have an account?",
      loginFooterLink:'Request access',
      signupFooter:   'Already have an account?',
      signupFooterLink:'Sign in',
      // Posts
      postsHead:      'Blog Posts',
      postsSub:       'Manage your technical documentation and editorial content.',
      groqBadge:      'via Sanity GROQ',
      myPostsLabel:   'My Posts',
      publishedLabel: 'Published',
      draftsLabel:    'Drafts',
      syncLabel:      'Sync',
      newPostLabel:   'New Post',
      searchPlaceholder: 'Search posts...',
      // Settings
      settingsHead:   'Account Settings',
      settingsSub:    'Manage your profile and preferences.',
      uploadPhoto:    'Upload photo',
      saveLabel:      'Save changes',
      discardLabel:   'Discard',
      deleteHead:     'Danger Zone',
      deleteBody:     'Permanently delete your account and all associated data.',
      deleteLabel:    'Delete Account',
      // Billing
      billingHead:    'Billing & Plans',
      billingSub:     'Manage your subscription, view usage, and upgrade your workspace.',
      billingSuccessIcon:        'CheckCircle',
      billingSuccessHead:        'Subscription Activated!',
      billingSuccessSub:         'Your Pro plan is now active.',
      billingSuccessBody:        'Thank you for upgrading. Unlimited posts, priority support, and all Pro features are now unlocked for your workspace.',
      billingSuccessPrimaryCta:  'Go to Posts',
      billingSuccessSecondaryCta:'Manage Subscription',
      // Analytics
      analyticsHead:  'PostHog Events',
      analyticsSub:   'Real-time Telemetry / Production Pipeline',
      // Admin
      adminHead:      'Admin Panel',
      adminSub:       'All users and their subscription tiers — admin access only.',
    },
    hi: {
      heroHeading:    'ContentFlow के साथ तेज़ी से कंटेंट प्रकाशित करें',
      heroSub:        'Next.js, Sanity और Supabase के साथ बना CMS-संचालित SaaS डैशबोर्ड।',
      heroBadge:      'अब बहु-भाषा समर्थन के साथ',
      heroPrimary:    'शुरू करें',
      heroSecondary:  'डॉक्स देखें',
      heroCommunity:  '500+ डेवलपर्स से जुड़ें',
      featuredHead:   'चुनिंदा लेख',
      featuredSub:    'हमारी संपादकीय टीम के चुने हुए लेख।',
      recentHead:     'हाल के प्रकाशन',
      recentSub:      'नवीनतम पोस्ट के साथ अपडेट रहें।',
      ctaHead:        'तेज़ी से प्रकाशित करने के लिए तैयार हैं?',
      ctaBody:        'आज अपना मुफ्त खाता शुरू करें और सभी कंटेंट एक जगह प्रबंधित करें।',
      ctaPrimary:     'मुफ्त में शुरू करें',
      ctaSecondary:   'अधिक जानें',
      authBadge:      'सुरक्षित · तेज़ · विश्वसनीय',
      loginHeadline:  'ContentFlow में वापस स्वागत है',
      signupHeadline: 'आज प्रकाशन शुरू करें',
      googleLabel:    'Google से जारी रखें',
      loginHeading:   'अपने खाते में साइन इन करें',
      signupHeading:  'अपना खाता बनाएं',
      loginSubmit:    'साइन इन करें',
      signupSubmit:   'खाता बनाएं',
      loginFooter:    'खाता नहीं है?',
      loginFooterLink:'एक्सेस का अनुरोध करें',
      signupFooter:   'पहले से खाता है?',
      signupFooterLink:'साइन इन करें',
      postsHead:      'ब्लॉग पोस्ट',
      postsSub:       'अपनी तकनीकी दस्तावेज़ीकरण और संपादकीय सामग्री प्रबंधित करें।',
      groqBadge:      'Sanity GROQ के माध्यम से',
      myPostsLabel:   'मेरी पोस्ट',
      publishedLabel: 'प्रकाशित',
      draftsLabel:    'ड्राफ्ट',
      syncLabel:      'सिंक करें',
      newPostLabel:   'नई पोस्ट',
      searchPlaceholder: 'पोस्ट खोजें...',
      settingsHead:   'खाता सेटिंग',
      settingsSub:    'अपनी प्रोफ़ाइल और प्राथमिकताएं प्रबंधित करें।',
      uploadPhoto:    'फोटो अपलोड करें',
      saveLabel:      'परिवर्तन सहेजें',
      discardLabel:   'छोड़ें',
      deleteHead:     'खतरनाक क्षेत्र',
      deleteBody:     'अपना खाता और सभी संबंधित डेटा स्थायी रूप से हटाएं।',
      deleteLabel:    'खाता हटाएं',
      billingHead:    'बिलिंग और योजनाएं',
      billingSub:     'अपनी सदस्यता प्रबंधित करें, उपयोग देखें और अपना कार्यक्षेत्र अपग्रेड करें।',
      billingSuccessIcon:        'CheckCircle',
      billingSuccessHead:        'सदस्यता सक्रिय!',
      billingSuccessSub:         'आपकी Pro योजना अब सक्रिय है।',
      billingSuccessBody:        'अपग्रेड करने के लिए धन्यवाद। असीमित पोस्ट, प्राथमिकता सहायता और सभी Pro सुविधाएं अब आपके वर्कस्पेस के लिए उपलब्ध हैं।',
      billingSuccessPrimaryCta:  'पोस्ट पर जाएं',
      billingSuccessSecondaryCta:'सदस्यता प्रबंधित करें',
      analyticsHead:  'PostHog इवेंट',
      analyticsSub:   'रियल-टाइम टेलीमेट्री / प्रोडक्शन पाइपलाइन',
      adminHead:      'एडमिन पैनल',
      adminSub:       'सभी उपयोगकर्ता और उनके सदस्यता स्तर — केवल एडमिन एक्सेस।',
    },
    kn: {
      heroHeading:    'ContentFlow ನೊಂದಿಗೆ ವೇಗವಾಗಿ ವಿಷಯ ಪ್ರಕಟಿಸಿ',
      heroSub:        'Next.js, Sanity ಮತ್ತು Supabase ನೊಂದಿಗೆ ನಿರ್ಮಿಸಿದ CMS-ಚಾಲಿತ SaaS ಡ್ಯಾಶ್‌ಬೋರ್ಡ್.',
      heroBadge:      'ಈಗ ಬಹು-ಭಾಷಾ ಬೆಂಬಲದೊಂದಿಗೆ',
      heroPrimary:    'ಪ್ರಾರಂಭಿಸಿ',
      heroSecondary:  'ಡಾಕ್ಸ್ ನೋಡಿ',
      heroCommunity:  '500+ ಡೆವಲಪರ್‌ಗಳನ್ನು ಸೇರಿ',
      featuredHead:   'ಆಯ್ದ ಲೇಖನಗಳು',
      featuredSub:    'ನಮ್ಮ ಸಂಪಾದಕೀಯ ತಂಡದ ಆಯ್ದ ಲೇಖನಗಳು.',
      recentHead:     'ಇತ್ತೀಚಿನ ಪ್ರಕಟಣೆಗಳು',
      recentSub:      'ಇತ್ತೀಚಿನ ಪೋಸ್ಟ್‌ಗಳೊಂದಿಗೆ ಅಪ್‌ಡೇಟ್ ಆಗಿರಿ.',
      ctaHead:        'ವೇಗವಾಗಿ ಪ್ರಕಟಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
      ctaBody:        'ಇಂದೇ ನಿಮ್ಮ ಉಚಿತ ಖಾತೆ ಪ್ರಾರಂಭಿಸಿ ಮತ್ತು ಎಲ್ಲಾ ವಿಷಯವನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ನಿರ್ವಹಿಸಿ.',
      ctaPrimary:     'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ',
      ctaSecondary:   'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
      authBadge:      'ಸುರಕ್ಷಿತ · ವೇಗ · ವಿಶ್ವಾಸಾರ್ಹ',
      loginHeadline:  'ContentFlow ಗೆ ಮರಳಿ ಸ್ವಾಗತ',
      signupHeadline: 'ಇಂದೇ ಪ್ರಕಟಿಸಲು ಪ್ರಾರಂಭಿಸಿ',
      googleLabel:    'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ',
      loginHeading:   'ನಿಮ್ಮ ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
      signupHeading:  'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ',
      loginSubmit:    'ಸೈನ್ ಇನ್',
      signupSubmit:   'ಖಾತೆ ರಚಿಸಿ',
      loginFooter:    'ಖಾತೆ ಇಲ್ಲವೇ?',
      loginFooterLink:'ಪ್ರವೇಶ ವಿನಂತಿಸಿ',
      signupFooter:   'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
      signupFooterLink:'ಸೈನ್ ಇನ್',
      postsHead:      'ಬ್ಲಾಗ್ ಪೋಸ್ಟ್‌ಗಳು',
      postsSub:       'ನಿಮ್ಮ ತಾಂತ್ರಿಕ ದಾಖಲಾತಿ ಮತ್ತು ಸಂಪಾದಕೀಯ ವಿಷಯ ನಿರ್ವಹಿಸಿ.',
      groqBadge:      'Sanity GROQ ಮೂಲಕ',
      myPostsLabel:   'ನನ್ನ ಪೋಸ್ಟ್‌ಗಳು',
      publishedLabel: 'ಪ್ರಕಟಿಸಲಾಗಿದೆ',
      draftsLabel:    'ಕರಡುಗಳು',
      syncLabel:      'ಸಿಂಕ್',
      newPostLabel:   'ಹೊಸ ಪೋಸ್ಟ್',
      searchPlaceholder: 'ಪೋಸ್ಟ್‌ಗಳನ್ನು ಹುಡುಕಿ...',
      settingsHead:   'ಖಾತೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      settingsSub:    'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.',
      uploadPhoto:    'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      saveLabel:      'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
      discardLabel:   'ತ್ಯಜಿಸಿ',
      deleteHead:     'ಅಪಾಯದ ವಲಯ',
      deleteBody:     'ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಎಲ್ಲಾ ಸಂಬಂಧಿತ ಡೇಟಾವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ.',
      deleteLabel:    'ಖಾತೆ ಅಳಿಸಿ',
      billingHead:    'ಬಿಲ್ಲಿಂಗ್ ಮತ್ತು ಯೋಜನೆಗಳು',
      billingSub:     'ನಿಮ್ಮ ಚಂದಾದಾರಿಕೆ ನಿರ್ವಹಿಸಿ, ಬಳಕೆ ನೋಡಿ ಮತ್ತು ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ.',
      billingSuccessIcon:        'CheckCircle',
      billingSuccessHead:        'ಚಂದಾದಾರಿಕೆ ಸಕ್ರಿಯ!',
      billingSuccessSub:         'ನಿಮ್ಮ Pro ಯೋಜನೆ ಈಗ ಸಕ್ರಿಯವಾಗಿದೆ.',
      billingSuccessBody:        'ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದ. ಅಸೀಮಿತ ಪೋಸ್ಟ್‌ಗಳು, ಆದ್ಯತೆ ಬೆಂಬಲ ಮತ್ತು ಎಲ್ಲಾ Pro ವೈಶಿಷ್ಟ್ಯಗಳು ಈಗ ಅನ್‌ಲಾಕ್ ಆಗಿವೆ.',
      billingSuccessPrimaryCta:  'ಪೋಸ್ಟ್‌ಗಳಿಗೆ ಹೋಗಿ',
      billingSuccessSecondaryCta:'ಚಂದಾದಾರಿಕೆ ನಿರ್ವಹಿಸಿ',
      analyticsHead:  'PostHog ಘಟನೆಗಳು',
      analyticsSub:   'ರಿಯಲ್-ಟೈಮ್ ಟೆಲಿಮೆಟ್ರಿ / ಪ್ರೊಡಕ್ಷನ್ ಪೈಪ್‌ಲೈನ್',
      adminHead:      'ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್',
      adminSub:       'ಎಲ್ಲಾ ಬಳಕೆದಾರರು ಮತ್ತು ಅವರ ಚಂದಾದಾರಿಕೆ ಹಂತಗಳು — ಅಡ್ಮಿನ್ ಪ್ರವೇಶ ಮಾತ್ರ.',
    },
  }[lang]

  const docs: Record<string, unknown>[] = []

  // ── HOME sections ────────────────────────────────────────────────────────────
  docs.push({
    _id: sid('home', 'hero', lang), _type: 'section',
    title: `Hero · ${lang.toUpperCase()}`, page: 'home', language: lang, sectionType: 'hero',
    hero: {
      heading: t.heroHeading, subheading: t.heroSub, badge: t.heroBadge,
      primaryCta: { label: t.heroPrimary, href: '/signup' },
      secondaryCta: { label: t.heroSecondary, href: '/' },
      communityText: t.heroCommunity, layout: 'centered',
    },
  })

  docs.push({
    _id: sid('home', 'featuredPosts', lang), _type: 'section',
    title: `Featured Posts · ${lang.toUpperCase()}`, page: 'home', language: lang, sectionType: 'featuredPosts',
    featuredPosts: {
      heading: t.featuredHead, subheading: t.featuredSub,
      maxPosts: 3, showExcerpt: true, showTags: true,
      viewAllLabel: lang === 'en' ? 'View all stories' : lang === 'hi' ? 'सभी लेख देखें' : 'ಎಲ್ಲಾ ಲೇಖನಗಳನ್ನು ನೋಡಿ',
    },
  })

  docs.push({
    _id: sid('home', 'recentPosts', lang), _type: 'section',
    title: `Recent Posts · ${lang.toUpperCase()}`, page: 'home', language: lang, sectionType: 'recentPosts',
    recentPosts: {
      heading: t.recentHead, subheading: t.recentSub,
      count: 6,
      viewAllLabel: lang === 'en' ? 'View all posts' : lang === 'hi' ? 'सभी पोस्ट देखें' : 'ಎಲ್ಲಾ ಪೋಸ್ಟ್‌ಗಳನ್ನು ನೋಡಿ',
    },
  })

  docs.push({
    _id: sid('home', 'cta', lang), _type: 'section',
    title: `CTA · ${lang.toUpperCase()}`, page: 'home', language: lang, sectionType: 'cta',
    cta: {
      heading: t.ctaHead, body: t.ctaBody,
      primaryButton: { label: t.ctaPrimary, href: '/signup' },
      secondaryButton: { label: t.ctaSecondary, href: '/' },
      theme: 'indigo', centered: true,
    },
  })

  // ── LOGIN sections ───────────────────────────────────────────────────────────
  docs.push({
    _id: sid('login', 'authHero', lang), _type: 'section',
    title: `Login Hero · ${lang.toUpperCase()}`, page: 'login', language: lang, sectionType: 'authHero',
    authHero: {
      badge: t.authBadge, headline: t.loginHeadline,
      features: [
        { _key: k(), icon: 'Shield',    text: lang === 'en' ? 'Enterprise-grade security' : lang === 'hi' ? 'एंटरप्राइज़-ग्रेड सुरक्षा' : 'ಎಂಟರ್‌ಪ್ರೈಸ್-ಶ್ರೇಣಿಯ ಭದ್ರತೆ' },
        { _key: k(), icon: 'Zap',       text: lang === 'en' ? 'Lightning fast publishing' : lang === 'hi' ? 'बिजली जैसी तेज़ पब्लिशिंग'  : 'ಮಿಂಚಿನ ವೇಗದ ಪ್ರಕಟಣೆ' },
        { _key: k(), icon: 'Globe',     text: lang === 'en' ? 'Multi-language content'    : lang === 'hi' ? 'बहु-भाषा कंटेंट'             : 'ಬಹು-ಭಾಷಾ ವಿಷಯ' },
        { _key: k(), icon: 'BarChart2', text: lang === 'en' ? 'Built-in analytics'        : lang === 'hi' ? 'बिल्ट-इन एनालिटिक्स'        : 'ಅಂತರ್ನಿರ್ಮಿತ ವಿಶ್ಲೇಷಣೆ' },
      ],
      footerNote: lang === 'en' ? 'Powered by Supabase Auth' : lang === 'hi' ? 'Supabase Auth द्वारा संचालित' : 'Supabase Auth ನಿಂದ ಚಾಲಿತ',
    },
  })

  docs.push({
    _id: sid('login', 'authForm', lang), _type: 'section',
    title: `Login Form · ${lang.toUpperCase()}`, page: 'login', language: lang, sectionType: 'authForm',
    authForm: {
      mode: 'login', heading: t.loginHeading,
      googleLabel: t.googleLabel,
      dividerLabel: lang === 'en' ? 'or' : lang === 'hi' ? 'या' : 'ಅಥವಾ',
      nameLabel: lang === 'en' ? 'Name' : lang === 'hi' ? 'नाम' : 'ಹೆಸರು',
      namePlaceholder: lang === 'en' ? 'Your full name' : lang === 'hi' ? 'आपका पूरा नाम' : 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು',
      emailLabel: lang === 'en' ? 'Email' : lang === 'hi' ? 'ईमेल' : 'ಇಮೇಲ್',
      emailPlaceholder: 'you@example.com',
      passwordLabel: lang === 'en' ? 'Password' : lang === 'hi' ? 'पासवर्ड' : 'ಪಾಸ್‌ವರ್ಡ್',
      passwordPlaceholder: lang === 'en' ? 'Your password' : lang === 'hi' ? 'आपका पासवर्ड' : 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್',
      submitLabel: t.loginSubmit,
      footerText: t.loginFooter,
      footerLinkLabel: t.loginFooterLink,
      footerLinkHref: '/signup',
      showGoogleOAuth: true, showEmailPassword: true,
    },
  })

  // ── SIGNUP sections ──────────────────────────────────────────────────────────
  docs.push({
    _id: sid('signup', 'authHero', lang), _type: 'section',
    title: `Signup Hero · ${lang.toUpperCase()}`, page: 'signup', language: lang, sectionType: 'authHero',
    authHero: {
      badge: t.authBadge, headline: t.signupHeadline,
      features: [
        { _key: k(), icon: 'FileText',  text: lang === 'en' ? '5 posts free forever'      : lang === 'hi' ? '5 पोस्ट हमेशा के लिए मुफ्त' : '5 ಪೋಸ್ಟ್‌ಗಳು ಯಾವಾಗಲೂ ಉಚಿತ' },
        { _key: k(), icon: 'Layers',    text: lang === 'en' ? 'Full CMS access'            : lang === 'hi' ? 'पूर्ण CMS एक्सेस'            : 'ಸಂಪೂರ್ಣ CMS ಪ್ರವೇಶ' },
        { _key: k(), icon: 'Lock',      text: lang === 'en' ? 'No credit card required'    : lang === 'hi' ? 'क्रेडिट कार्ड की जरूरत नहीं' : 'ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ' },
        { _key: k(), icon: 'TrendingUp',text: lang === 'en' ? 'Upgrade anytime to Pro'     : lang === 'hi' ? 'कभी भी Pro में अपग्रेड करें' : 'ಯಾವಾಗ ಬೇಕಾದರೂ Pro ಗೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ' },
      ],
      footerNote: lang === 'en' ? 'Powered by Supabase Auth' : lang === 'hi' ? 'Supabase Auth द्वारा संचालित' : 'Supabase Auth ನಿಂದ ಚಾಲಿತ',
    },
  })

  docs.push({
    _id: sid('signup', 'authForm', lang), _type: 'section',
    title: `Signup Form · ${lang.toUpperCase()}`, page: 'signup', language: lang, sectionType: 'authForm',
    authForm: {
      mode: 'signup', heading: t.signupHeading,
      googleLabel: t.googleLabel,
      dividerLabel: lang === 'en' ? 'or' : lang === 'hi' ? 'या' : 'ಅಥವಾ',
      nameLabel: lang === 'en' ? 'Name' : lang === 'hi' ? 'नाम' : 'ಹೆಸರು',
      namePlaceholder: lang === 'en' ? 'Your full name' : lang === 'hi' ? 'आपका पूरा नाम' : 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು',
      emailLabel: lang === 'en' ? 'Email' : lang === 'hi' ? 'ईमेल' : 'ಇಮೇಲ್',
      emailPlaceholder: 'you@example.com',
      passwordLabel: lang === 'en' ? 'Password' : lang === 'hi' ? 'पासवर्ड' : 'ಪಾಸ್‌ವರ್ಡ್',
      passwordPlaceholder: lang === 'en' ? 'Your password' : lang === 'hi' ? 'आपका पासवर्ड' : 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್',
      submitLabel: t.signupSubmit,
      footerText: t.signupFooter,
      footerLinkLabel: t.signupFooterLink,
      footerLinkHref: '/login',
      showGoogleOAuth: true, showEmailPassword: true,
    },
  })

  // ── POSTS sections ───────────────────────────────────────────────────────────
  docs.push({
    _id: sid('posts', 'postsHeader', lang), _type: 'section',
    title: `Posts Header · ${lang.toUpperCase()}`, page: 'posts', language: lang, sectionType: 'postsHeader',
    postsHeader: { heading: t.postsHead, subheading: t.postsSub, groqBadgeLabel: t.groqBadge },
  })

  docs.push({
    _id: sid('posts', 'postsStats', lang), _type: 'section',
    title: `Posts Stats · ${lang.toUpperCase()}`, page: 'posts', language: lang, sectionType: 'postsStats',
    postsStats: { myPostsLabel: t.myPostsLabel, publishedLabel: t.publishedLabel, draftsLabel: t.draftsLabel },
  })

  docs.push({
    _id: sid('posts', 'postsActions', lang), _type: 'section',
    title: `Posts Actions · ${lang.toUpperCase()}`, page: 'posts', language: lang, sectionType: 'postsActions',
    postsActions: { syncButtonLabel: t.syncLabel, newPostButtonLabel: t.newPostLabel },
  })

  docs.push({
    _id: sid('posts', 'postsSearch', lang), _type: 'section',
    title: `Posts Search · ${lang.toUpperCase()}`, page: 'posts', language: lang, sectionType: 'postsSearch',
    postsSearch: { searchPlaceholder: t.searchPlaceholder },
  })

  docs.push({
    _id: sid('posts', 'postsTable', lang), _type: 'section',
    title: `Posts Table · ${lang.toUpperCase()}`, page: 'posts', language: lang, sectionType: 'postsTable',
    postsTable: {
      colTitle:       lang === 'en' ? 'Post Title'    : lang === 'hi' ? 'पोस्ट शीर्षक'       : 'ಪೋಸ್ಟ್ ಶೀರ್ಷಿಕೆ',
      colStatus:      lang === 'en' ? 'Status'        : lang === 'hi' ? 'स्थिति'              : 'ಸ್ಥಿತಿ',
      colImage:       lang === 'en' ? 'Cover'         : lang === 'hi' ? 'कवर'                : 'ಕವರ್',
      colTags:        lang === 'en' ? 'Tags'          : lang === 'hi' ? 'टैग'                : 'ಟ್ಯಾಗ್‌ಗಳು',
      colLastModified:lang === 'en' ? 'Last Modified' : lang === 'hi' ? 'अंतिम संशोधित'      : 'ಕೊನೆಯ ಬದಲಾವಣೆ',
      emptyTitle:     lang === 'en' ? 'No posts found': lang === 'hi' ? 'कोई पोस्ट नहीं मिली': 'ಯಾವುದೇ ಪೋಸ್ಟ್ ಕಂಡುಬಂದಿಲ್ಲ',
      emptyBody:      lang === 'en' ? 'Sync from Sanity to populate your workspace.' : lang === 'hi' ? 'अपने वर्कस्पेस को भरने के लिए Sanity से सिंक करें।' : 'ನಿಮ್ಮ ವರ್ಕ್‌ಸ್ಪೇಸ್ ತುಂಬಲು Sanity ನಿಂದ ಸಿಂಕ್ ಮಾಡಿ.',
      emptyCtaLabel:  lang === 'en' ? 'Sync from Sanity' : lang === 'hi' ? 'Sanity से सिंक करें' : 'Sanity ನಿಂದ ಸಿಂಕ್ ಮಾಡಿ',
      showingLabel:   lang === 'en' ? 'Showing' : lang === 'hi' ? 'दिखा रहे हैं' : 'ತೋರಿಸಲಾಗುತ್ತಿದೆ',
      loadMoreLabel:  lang === 'en' ? 'Load more' : lang === 'hi' ? 'अधिक लोड करें' : 'ಇನ್ನಷ್ಟು ಲೋಡ್ ಮಾಡಿ',
      connectedLabel: lang === 'en' ? 'Sanity API Connected' : lang === 'hi' ? 'Sanity API कनेक्टेड' : 'Sanity API ಸಂಪರ್ಕಿತ',
      viewPostLabel:  lang === 'en' ? 'View post'   : lang === 'hi' ? 'पोस्ट देखें'   : 'ಪೋಸ್ಟ್ ನೋಡಿ',
      editPostLabel:  lang === 'en' ? 'Edit post'   : lang === 'hi' ? 'पोस्ट संपादित करें' : 'ಪೋಸ್ಟ್ ಸಂಪಾದಿಸಿ',
      deletePostLabel:lang === 'en' ? 'Delete post' : lang === 'hi' ? 'पोस्ट हटाएं'   : 'ಪೋಸ್ಟ್ ಅಳಿಸಿ',
      deleteDialogTitle:   lang === 'en' ? 'Delete Post'    : lang === 'hi' ? 'पोस्ट हटाएं'    : 'ಪೋಸ್ಟ್ ಅಳಿಸಿ',
      deleteDialogBody:    lang === 'en' ? 'Are you sure you want to delete "{title}"? This cannot be undone.' : lang === 'hi' ? 'क्या आप "{title}" को हटाना चाहते हैं? यह पूर्ववत नहीं किया जा सकता।' : '"{title}" ಅಳಿಸಲು ಖಚಿತವಾಗಿ ಬಯಸುತ್ತೀರಾ? ಇದನ್ನು ರದ್ದು ಮಾಡಲಾಗುವುದಿಲ್ಲ.',
      deleteDialogConfirmLabel: lang === 'en' ? 'Delete Post' : lang === 'hi' ? 'पोस्ट हटाएं' : 'ಪೋಸ್ಟ್ ಅಳಿಸಿ',
      deleteDialogCancelLabel:  lang === 'en' ? 'Cancel'      : lang === 'hi' ? 'रद्द करें'   : 'ರದ್ದುಮಾಡಿ',
      // Featured banner — full configuration
      featuredLabel:      lang === 'en' ? 'Featured Post' : lang === 'hi' ? 'चुनिंदा पोस्ट' : 'ಆಯ್ದ ಪೋಸ್ಟ್',
      featuredOfLabel:    lang === 'en' ? 'of'            : lang === 'hi' ? 'का'              : 'ರಲ್ಲಿ',
      featuredReadLabel:  lang === 'en' ? 'Read now'      : lang === 'hi' ? 'अभी पढ़ें'       : 'ಈಗ ಓದಿ',
      featuredBannerIcon: 'Star',
    },
  })

  // ── POST DETAIL config sections ──────────────────────────────────────────────
  docs.push({
    _id: sid('postDetail', 'postDetailHeader', lang), _type: 'section',
    title: `Post Detail Header · ${lang.toUpperCase()}`, page: 'postDetail', language: lang, sectionType: 'postDetailHeader',
    postDetailHeader: {
      heading: lang === 'en' ? 'Post Detail' : lang === 'hi' ? 'पोस्ट विवरण' : 'ಪೋಸ್ಟ್ ವಿವರ',
      featuredBadgeLabel: lang === 'en' ? 'Featured'  : lang === 'hi' ? 'चुनिंदा'     : 'ಆಯ್ದ',
      languageBadgeLabel: lang === 'en' ? 'Language'  : lang === 'hi' ? 'भाषा'        : 'ಭಾಷೆ',
      editInStudioLabel:  lang === 'en' ? 'Edit in Sanity Studio →' : lang === 'hi' ? 'Sanity Studio में संपादित करें →' : 'Sanity Studio ನಲ್ಲಿ ಸಂಪಾದಿಸಿ →',
    },
  })

  docs.push({
    _id: sid('postDetail', 'postDetailMeta', lang), _type: 'section',
    title: `Post Detail Meta · ${lang.toUpperCase()}`, page: 'postDetail', language: lang, sectionType: 'postDetailMeta',
    postDetailMeta: {
      authorLabel:      lang === 'en' ? 'Author'      : lang === 'hi' ? 'लेखक'       : 'ಲೇಖಕ',
      dateFormatLabel:  lang === 'en' ? 'Published'   : lang === 'hi' ? 'प्रकाशित'   : 'ಪ್ರಕಟಿಸಲಾಗಿದೆ',
      unpublishedLabel: lang === 'en' ? 'Unpublished' : lang === 'hi' ? 'अप्रकाशित'  : 'ಅಪ್ರಕಟಿತ',
    },
  })

  docs.push({
    _id: sid('postDetail', 'postDetailBody', lang), _type: 'section',
    title: `Post Detail Body · ${lang.toUpperCase()}`, page: 'postDetail', language: lang, sectionType: 'postDetailBody',
    postDetailBody: {
      emptyBodyText: lang === 'en' ? 'No content yet.' : lang === 'hi' ? 'अभी तक कोई सामग्री नहीं।' : 'ಇನ್ನೂ ವಿಷಯವಿಲ್ಲ.',
      shareLabel:    lang === 'en' ? 'Share'           : lang === 'hi' ? 'शेयर करें'                   : 'ಹಂಚಿಕೊಳ್ಳಿ',
      linkCopiedText:lang === 'en' ? 'Link copied!'    : lang === 'hi' ? 'लिंक कॉपी हो गया!'           : 'ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ!',
    },
  })

  docs.push({
    _id: sid('postDetail', 'postDetailTags', lang), _type: 'section',
    title: `Post Detail Tags · ${lang.toUpperCase()}`, page: 'postDetail', language: lang, sectionType: 'postDetailTags',
    postDetailTags: {
      tagsHeading:  lang === 'en' ? 'Tags'    : lang === 'hi' ? 'टैग'         : 'ಟ್ಯಾಗ್‌ಗಳು',
      emptyTagsText:lang === 'en' ? 'No tags' : lang === 'hi' ? 'कोई टैग नहीं': 'ಯಾವುದೇ ಟ್ಯಾಗ್‌ಗಳಿಲ್ಲ',
    },
  })

  docs.push({
    _id: sid('postDetail', 'postDetailBackLink', lang), _type: 'section',
    title: `Post Detail Back Link · ${lang.toUpperCase()}`, page: 'postDetail', language: lang, sectionType: 'postDetailBackLink',
    postDetailBackLink: {
      backLabel:    lang === 'en' ? 'Back to Posts' : lang === 'hi' ? 'पोस्ट पर वापस'   : 'ಪೋಸ್ಟ್‌ಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
      allPostsLabel:lang === 'en' ? 'All Posts'     : lang === 'hi' ? 'सभी पोस्ट'        : 'ಎಲ್ಲಾ ಪೋಸ್ಟ್‌ಗಳು',
      prevLabel:    lang === 'en' ? 'Previous'      : lang === 'hi' ? 'पिछला'            : 'ಹಿಂದಿನ',
      nextLabel:    lang === 'en' ? 'Next'          : lang === 'hi' ? 'अगला'             : 'ಮುಂದಿನ',
      backHref:     '/posts',
    },
  })

  // ── SETTINGS sections ────────────────────────────────────────────────────────
  docs.push({
    _id: sid('settings', 'settingsHeader', lang), _type: 'section',
    title: `Settings Header · ${lang.toUpperCase()}`, page: 'settings', language: lang, sectionType: 'settingsHeader',
    settingsHeader: { heading: t.settingsHead, subheading: t.settingsSub },
  })

  docs.push({
    _id: sid('settings', 'settingsInfo', lang), _type: 'section',
    title: `Settings Info · ${lang.toUpperCase()}`, page: 'settings', language: lang, sectionType: 'settingsInfo',
    settingsInfo: { uploadPhotoLabel: t.uploadPhoto },
  })

  docs.push({
    _id: sid('settings', 'settingsForm', lang), _type: 'section',
    title: `Settings Form · ${lang.toUpperCase()}`, page: 'settings', language: lang, sectionType: 'settingsForm',
    settingsForm: {
      profileSectionLabel: lang === 'en' ? 'Profile'       : lang === 'hi' ? 'प्रोफ़ाइल'   : 'ಪ್ರೊಫೈಲ್',
      metadataLabel:       'Metadata ID: CF-9921',
      displayNameLabel:    lang === 'en' ? 'Display name'  : lang === 'hi' ? 'प्रदर्शन नाम': 'ಪ್ರದರ್ಶನ ಹೆಸರು',
      emailLabel:          lang === 'en' ? 'Email address' : lang === 'hi' ? 'ईमेल पता'    : 'ಇಮೇಲ್ ವಿಳಾಸ',
      emailHelperText:     lang === 'en' ? 'Managed by Supabase Auth' : lang === 'hi' ? 'Supabase Auth द्वारा प्रबंधित' : 'Supabase Auth ನಿಂದ ನಿರ್ವಹಿಸಲಾಗಿದೆ',
      bioLabel:            lang === 'en' ? 'Bio'           : lang === 'hi' ? 'बायो'         : 'ಜೀವನಚರಿತ್ರೆ',
      bioPlaceholder:      lang === 'en' ? 'Write a short bio...' : lang === 'hi' ? 'एक छोटी बायो लिखें...' : 'ಒಂದು ಸಣ್ಣ ಜೀವನಚರಿತ್ರೆ ಬರೆಯಿರಿ...',
      bioMaxLength:        200,
      websiteLabel:        lang === 'en' ? 'Website'       : lang === 'hi' ? 'वेबसाइट'     : 'ವೆಬ್‌ಸೈಟ್',
      websitePlaceholder:  'https://yourwebsite.com',
      websiteErrorText:    lang === 'en' ? 'Must be a valid URL' : lang === 'hi' ? 'एक वैध URL होना चाहिए' : 'ಮಾನ್ಯ URL ಆಗಿರಬೇಕು',
      saveLabel:           t.saveLabel,
      discardLabel:        t.discardLabel,
    },
  })

  docs.push({
    _id: sid('settings', 'settingsDanger', lang), _type: 'section',
    title: `Settings Danger · ${lang.toUpperCase()}`, page: 'settings', language: lang, sectionType: 'settingsDanger',
    settingsDanger: {
      heading:     t.deleteHead,
      body:        t.deleteBody,
      warningText: lang === 'en' ? 'Warning: All API keys will be invalidated.' : lang === 'hi' ? 'चेतावनी: सभी API कुंजियां अमान्य हो जाएंगी।' : 'ಎಚ್ಚರಿಕೆ: ಎಲ್ಲಾ API ಕೀಗಳು ರದ್ದಾಗುತ್ತವೆ.',
      deleteLabel: t.deleteLabel,
    },
  })

  // ── BILLING sections ─────────────────────────────────────────────────────────
  docs.push({
    _id: sid('billing', 'billingHeader', lang), _type: 'section',
    title: `Billing Header · ${lang.toUpperCase()}`, page: 'billing', language: lang, sectionType: 'billingHeader',
    billingHeader: { heading: t.billingHead, subheading: t.billingSub },
  })

  docs.push({
    _id: sid('billing', 'billingCurrentPlan', lang), _type: 'section',
    title: `Billing Current Plan · ${lang.toUpperCase()}`, page: 'billing', language: lang, sectionType: 'billingCurrentPlan',
    billingCurrentPlan: {
      currentPlanLabel:    lang === 'en' ? 'Current Plan'   : lang === 'hi' ? 'वर्तमान योजना'  : 'ಪ್ರಸ್ತುತ ಯೋಜನೆ',
      activeBadgeLabel:    lang === 'en' ? 'Active'         : lang === 'hi' ? 'सक्रिय'          : 'ಸಕ್ರಿಯ',
      cancellingBadgeLabel:lang === 'en' ? 'Cancelling'     : lang === 'hi' ? 'रद्द हो रहा है' : 'ರದ್ದು ಮಾಡಲಾಗುತ್ತಿದೆ',
      freeTierBadgeLabel:  lang === 'en' ? 'Free Tier'      : lang === 'hi' ? 'फ्री टियर'      : 'ಉಚಿತ ಶ್ರೇಣಿ',
      manageLabel:         lang === 'en' ? 'Manage subscription' : lang === 'hi' ? 'सदस्यता प्रबंधित करें' : 'ಚಂದಾದಾರಿಕೆ ನಿರ್ವಹಿಸಿ',
      cancelLabel:         lang === 'en' ? 'Cancel'         : lang === 'hi' ? 'रद्द करें'      : 'ರದ್ದುಮಾಡಿ',
      reactivateLabel:     lang === 'en' ? 'Reactivate'     : lang === 'hi' ? 'पुनः सक्रिय करें': 'ಮರು-ಸಕ್ರಿಯಗೊಳಿಸಿ',
      upgradeLabel:        lang === 'en' ? 'Upgrade to Pro' : lang === 'hi' ? 'Pro में अपग्रेड करें' : 'Pro ಗೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ',
      cancellingNote:      lang === 'en' ? 'After that, your account reverts to Free.' : lang === 'hi' ? 'उसके बाद, आपका खाता Free में वापस आ जाएगा।' : 'ನಂತರ, ನಿಮ್ಮ ಖಾತೆ Free ಗೆ ಮರಳುತ್ತದೆ.',
    },
  })

  docs.push({
    _id: sid('billing', 'billingUsage', lang), _type: 'section',
    title: `Billing Usage · ${lang.toUpperCase()}`, page: 'billing', language: lang, sectionType: 'billingUsage',
    billingUsage: {
      usageHeading:    lang === 'en' ? 'Usage this month'    : lang === 'hi' ? 'इस महीने का उपयोग'     : 'ಈ ತಿಂಗಳ ಬಳಕೆ',
      postsUsageLabel: lang === 'en' ? 'Posts Published'     : lang === 'hi' ? 'प्रकाशित पोस्ट'         : 'ಪ್ರಕಟಿಸಿದ ಪೋಸ್ಟ್‌ಗಳು',
      apiUsageLabel:   lang === 'en' ? 'API Requests'        : lang === 'hi' ? 'API अनुरोध'             : 'API ವಿನಂತಿಗಳು',
      storageUsageLabel:lang==='en' ? 'Storage Utilization' : lang === 'hi' ? 'स्टोरेज उपयोग'          : 'ಶೇಖರಣಾ ಬಳಕೆ',
      seatsUsageLabel: lang === 'en' ? 'Team Seats'          : lang === 'hi' ? 'टीम सीटें'              : 'ತಂಡದ ಆಸನಗಳು',
    },
  })

  docs.push({
    _id: sid('billing', 'billingPlansGrid', lang), _type: 'section',
    title: `Billing Plans Grid · ${lang.toUpperCase()}`, page: 'billing', language: lang, sectionType: 'billingPlansGrid',
    billingPlansGrid: {
      plansHeading:    lang === 'en' ? 'Plans'   : lang === 'hi' ? 'योजनाएं'  : 'ಯೋಜನೆಗಳು',
      freePlanName:    lang === 'en' ? 'Free'    : lang === 'hi' ? 'मुफ्त'    : 'ಉಚಿತ',
      freePlanTagline: lang === 'en' ? 'For individuals starting their editorial journey.' : lang === 'hi' ? 'अपनी संपादकीय यात्रा शुरू करने वाले व्यक्तियों के लिए।' : 'ತಮ್ಮ ಸಂಪಾದಕೀಯ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸುವವರಿಗೆ.',
      freePlanPrice:   '$0',
      freePlanFeatures: [
        lang === 'en' ? '5 Published Posts'    : lang === 'hi' ? '5 प्रकाशित पोस्ट'  : '5 ಪ್ರಕಟಿಸಿದ ಪೋಸ್ಟ್‌ಗಳು',
        lang === 'en' ? '1,000 API calls'      : lang === 'hi' ? '1,000 API कॉल'     : '1,000 API ಕರೆಗಳು',
        lang === 'en' ? 'Community Support'    : lang === 'hi' ? 'सामुदायिक सहायता'  : 'ಸಮುದಾಯ ಬೆಂಬಲ',
      ],
      proPlanName:     lang === 'en' ? 'Pro'    : lang === 'hi' ? 'प्रो'     : 'ಪ್ರೊ',
      proPlanTagline:  lang === 'en' ? 'Unleash the full potential of high-performance content delivery.' : lang === 'hi' ? 'हाई-परफॉर्मेंस कंटेंट डिलीवरी की पूरी क्षमता उजागर करें।' : 'ಹೈ-ಪರ್ಫಾರ್ಮೆನ್ಸ್ ಕಂಟೆಂಟ್ ಡೆಲಿವರಿಯ ಸಂಪೂರ್ಣ ಸಾಮರ್ಥ್ಯ ಬಳಸಿ.',
      proPlanBadge:    lang === 'en' ? 'Most Popular' : lang === 'hi' ? 'सबसे लोकप्रिय' : 'ಅತ್ಯಂತ ಜನಪ್ರಿಯ',
      proPlanFeatures: [
        lang === 'en' ? 'Unlimited Posts'                  : lang === 'hi' ? 'असीमित पोस्ट'                          : 'ಅಸೀಮಿತ ಪೋಸ್ಟ್‌ಗಳು',
        lang === 'en' ? '10,000 API calls'                 : lang === 'hi' ? '10,000 API कॉल'                       : '10,000 API ಕರೆಗಳು',
        lang === 'en' ? 'Priority Email Support'            : lang === 'hi' ? 'प्राथमिकता ईमेल सहायता'              : 'ಆದ್ಯತೆ ಇಮೇಲ್ ಬೆಂಬಲ',
        lang === 'en' ? 'Team Collaboration (5 seats)'      : lang === 'hi' ? 'टीम सहयोग (5 सीटें)'                : 'ತಂಡ ಸಹಯೋಗ (5 ಆಸನಗಳು)',
      ],
      upgradeLabel:              lang === 'en' ? 'Upgrade to Pro'       : lang === 'hi' ? 'Pro में अपग्रेड करें'    : 'Pro ಗೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ',
      downgradeLabel:            lang === 'en' ? 'Downgrade'            : lang === 'hi' ? 'डाउनग्रेड'              : 'ಡೌನ್‌ಗ್ರೇಡ್',
      downgradeScheduledLabel:   lang === 'en' ? 'Downgrade scheduled'  : lang === 'hi' ? 'डाउनग्रेड निर्धारित'    : 'ಡೌನ್‌ಗ್ರೇಡ್ ನಿಗದಿಯಾಗಿದೆ',
      currentPlanButtonLabel:    lang === 'en' ? 'Current Plan'         : lang === 'hi' ? 'वर्तमान योजना'          : 'ಪ್ರಸ್ತುತ ಯೋಜನೆ',
    },
  })

  docs.push({
    _id: sid('billing', 'billingFooter', lang), _type: 'section',
    title: `Billing Footer · ${lang.toUpperCase()}`, page: 'billing', language: lang, sectionType: 'billingFooter',
    billingFooter: {
      stripeNote:  'Billing Portal Powered by Stripe',
      webhookNote: 'Webhook: /api/webhooks/stripe',
    },
  })

  // ── BILLING SUCCESS sections ─────────────────────────────────────────────────
  docs.push({
    _id: sid('billing-success', 'billingSuccessHero', lang), _type: 'section',
    title: `Billing Success — Hero · ${lang.toUpperCase()}`, page: 'billing-success', language: lang, sectionType: 'billingSuccessHero',
    billingSuccessHero: {
      icon:       t.billingSuccessIcon,
      heading:    t.billingSuccessHead,
      subheading: t.billingSuccessSub,
      body:       t.billingSuccessBody,
    },
  })
  docs.push({
    _id: sid('billing-success', 'billingSuccessActions', lang), _type: 'section',
    title: `Billing Success — Actions · ${lang.toUpperCase()}`, page: 'billing-success', language: lang, sectionType: 'billingSuccessActions',
    billingSuccessActions: {
      primaryLabel:   t.billingSuccessPrimaryCta,
      primaryHref:    '/posts',
      secondaryLabel: t.billingSuccessSecondaryCta,
      secondaryHref:  '/billing',
    },
  })

  // ── ANALYTICS section ────────────────────────────────────────────────────────
  docs.push({
    _id: sid('analytics', 'analytics', lang), _type: 'section',
    title: `Analytics · ${lang.toUpperCase()}`, page: 'analytics', language: lang, sectionType: 'analytics',
    analytics: {
      heading:    t.analyticsHead,
      subheading: t.analyticsSub,
      eventsLabel:       lang === 'en' ? 'Events Today'    : lang === 'hi' ? 'आज के इवेंट'       : 'ಇಂದಿನ ಘಟನೆಗಳು',
      usersLabel:        lang === 'en' ? 'Unique Users'    : lang === 'hi' ? 'अद्वितीय उपयोगकर्ता': 'ಅನನ್ಯ ಬಳಕೆದಾರರು',
      avgSessionLabel:   lang === 'en' ? 'Avg. Session'   : lang === 'hi' ? 'औसत सत्र'           : 'ಸರಾಸರಿ ಅಧಿವೇಶನ',
      liveStreamLabel:   lang === 'en' ? 'Live event stream'  : lang === 'hi' ? 'लाइव इवेंट स्ट्रीम'  : 'ಲೈವ್ ಈವೆಂಟ್ ಸ್ಟ್ರೀಮ್',
      refreshLabel:      lang === 'en' ? 'Refresh'            : lang === 'hi' ? 'रिफ्रेश'             : 'ರಿಫ್ರೆಶ್',
      emptyTitle:        lang === 'en' ? 'No events yet'      : lang === 'hi' ? 'अभी तक कोई इवेंट नहीं': 'ಇನ್ನೂ ಯಾವುದೇ ಘಟನೆಗಳಿಲ್ಲ',
      emptyBody:         lang === 'en' ? 'Events will appear here as users interact with your app.' : lang === 'hi' ? 'उपयोगकर्ताओं के इंटरैक्ट करने पर इवेंट यहां दिखाई देंगे।' : 'ಬಳಕೆದಾರರು ಅಪ್ಲಿಕೇಶನ್‌ನೊಂದಿಗೆ ಸಂವಹಿಸಿದಾಗ ಘಟನೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
      featureFlagLabel:         'Feature flag: show-featured-banner',
      featureFlagEnabledNote:   'Enabled — evaluated server-side via PostHog Node SDK',
      featureFlagDisabledNote:  'Disabled — toggle in PostHog dashboard to enable',
      showingLabel: lang === 'en' ? 'Showing' : lang === 'hi' ? 'दिखा रहे हैं' : 'ತೋರಿಸಲಾಗುತ್ತಿದೆ',
      prevLabel:    lang === 'en' ? 'Prev'    : lang === 'hi' ? 'पिछला'        : 'ಹಿಂದಿನ',
      nextLabel:    lang === 'en' ? 'Next'    : lang === 'hi' ? 'अगला'         : 'ಮುಂದಿನ',
      connectedLabel: lang === 'en' ? 'Connected to PostHog' : lang === 'hi' ? 'PostHog से कनेक्टेड' : 'PostHog ಗೆ ಸಂಪರ್ಕಿತ',
      ctaLabel: 'Configure_PostHog',
    },
  })

  // ── ADMIN section ────────────────────────────────────────────────────────────
  docs.push({
    _id: sid('admin', 'admin', lang), _type: 'section',
    title: `Admin · ${lang.toUpperCase()}`, page: 'admin', language: lang, sectionType: 'admin',
    admin: {
      heading:    t.adminHead,
      subheading: t.adminSub,
      totalUsersLabel: lang === 'en' ? 'total users' : lang === 'hi' ? 'कुल उपयोगकर्ता' : 'ಒಟ್ಟು ಬಳಕೆದಾರರು',
      proLabel:   lang === 'en' ? 'pro'  : lang === 'hi' ? 'प्रो' : 'ಪ್ರೊ',
      freeLabel:  lang === 'en' ? 'free' : lang === 'hi' ? 'मुफ्त': 'ಉಚಿತ',
      colUser:    lang === 'en' ? 'User'   : lang === 'hi' ? 'उपयोगकर्ता': 'ಬಳಕೆದಾರ',
      colPlan:    lang === 'en' ? 'Plan'   : lang === 'hi' ? 'योजना'     : 'ಯೋಜನೆ',
      colRole:    lang === 'en' ? 'Role'   : lang === 'hi' ? 'भूमिका'    : 'ಪಾತ್ರ',
      colJoined:  lang === 'en' ? 'Joined' : lang === 'hi' ? 'जुड़े'     : 'ಸೇರಿದ ದಿನ',
      emptyLabel: lang === 'en' ? 'No users found' : lang === 'hi' ? 'कोई उपयोगकर्ता नहीं मिला' : 'ಯಾವುದೇ ಬಳಕೆದಾರರು ಕಂಡುಬಂದಿಲ್ಲ',
      footerNote: 'Data fetched via Supabase service role key — server-side only',
      inviteSectionHeading: lang === 'en' ? 'Admin Access'       : lang === 'hi' ? 'एडमिन एक्सेस'        : 'ಅಡ್ಮಿನ್ ಪ್ರವೇಶ',
      inviteFormTitle:      lang === 'en' ? 'Invite User to Admin': lang === 'hi' ? 'एडमिन में आमंत्रित करें': 'ಅಡ್ಮಿನ್‌ಗೆ ಬಳಕೆದಾರರನ್ನು ಆಹ್ವಾನಿಸಿ',
      inviteEmailLabel:     lang === 'en' ? 'Email address'       : lang === 'hi' ? 'ईमेल पता'            : 'ಇಮೇಲ್ ವಿಳಾಸ',
      inviteEmailPlaceholder: 'user@example.com',
      inviteMessageLabel:   lang === 'en' ? 'Note (optional)'     : lang === 'hi' ? 'नोट (वैकल्पिक)'       : 'ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)',
      inviteSendLabel:      lang === 'en' ? 'Send Invite'         : lang === 'hi' ? 'आमंत्रण भेजें'        : 'ಆಹ್ವಾನ ಕಳುಹಿಸಿ',
      pendingInvitesHeading:lang === 'en' ? 'Pending Invites'     : lang === 'hi' ? 'लंबित आमंत्रण'       : 'ಬಾಕಿ ಆಹ್ವಾನಗಳು',
      inviteEmptyLabel:     lang === 'en' ? 'No pending invites'  : lang === 'hi' ? 'कोई लंबित आमंत्रण नहीं': 'ಬಾಕಿ ಆಹ್ವಾನಗಳಿಲ್ಲ',
      cancelInviteLabel:    lang === 'en' ? 'Cancel'              : lang === 'hi' ? 'रद्द करें'            : 'ರದ್ದುಮಾಡಿ',
      pendingRequestsHeading:lang==='en' ? 'Access Requests'     : lang === 'hi' ? 'एक्सेस अनुरोध'       : 'ಪ್ರವೇಶ ವಿನಂತಿಗಳು',
      requestEmptyLabel:    lang === 'en' ? 'No pending access requests' : lang === 'hi' ? 'कोई लंबित एक्सेस अनुरोध नहीं' : 'ಬಾಕಿ ಪ್ರವೇಶ ವಿನಂತಿಗಳಿಲ್ಲ',
      approveLabel: lang === 'en' ? 'Approve' : lang === 'hi' ? 'स्वीकृत करें' : 'ಅನುಮೋದಿಸಿ',
      rejectLabel:  lang === 'en' ? 'Reject'  : lang === 'hi' ? 'अस्वीकार करें': 'ತಿರಸ್ಕರಿಸಿ',
      colEmail:   lang === 'en' ? 'Email' : lang === 'hi' ? 'ईमेल' : 'ಇಮೇಲ್',
      colType:    lang === 'en' ? 'Type'  : lang === 'hi' ? 'प्रकार': 'ಪ್ರಕಾರ',
      colSentAt:  lang === 'en' ? 'Date'  : lang === 'hi' ? 'तारीख' : 'ದಿನಾಂಕ',
      colActions: lang === 'en' ? 'Actions': lang === 'hi' ? 'क्रियाएं': 'ಕ್ರಿಯೆಗಳು',
    },
  })

  return docs
}

// ── Page builders ──────────────────────────────────────────────────────────────

function buildPages(lang: Lang) {
  return [
    {
      _id: pid('home', lang), _type: 'page',
      title: lang === 'en' ? 'Home' : lang === 'hi' ? 'होम' : 'ಮುಖಪುಟ',
      slug: { _type: 'slug', current: 'home' },
      language: lang, access: 'guest', layout: 'home',
      seoTitle: lang === 'en' ? 'ContentFlow — CMS-driven publishing' : lang === 'hi' ? 'ContentFlow — CMS-संचालित प्रकाशन' : 'ContentFlow — CMS-ಚಾಲಿತ ಪ್ರಕಟಣೆ',
      seoDescription: lang === 'en' ? 'ContentFlow is a CMS-driven SaaS dashboard built with Next.js, Sanity, and Supabase.' : lang === 'hi' ? 'ContentFlow Next.js, Sanity और Supabase के साथ बना CMS-संचालित SaaS डैशबोर्ड है।' : 'ContentFlow Next.js, Sanity ಮತ್ತು Supabase ನೊಂದಿಗೆ ನಿರ್ಮಿಸಿದ CMS-ಚಾಲಿತ SaaS ಡ್ಯಾಶ್‌ಬೋರ್ಡ್.',
      sections: [
        ref(sid('home', 'hero', lang)),
        ref(sid('home', 'featuredPosts', lang)),
        ref(sid('home', 'recentPosts', lang)),
        ref(sid('home', 'cta', lang)),
      ],
    },
    {
      _id: pid('login', lang), _type: 'page',
      title: lang === 'en' ? 'Login' : lang === 'hi' ? 'लॉगिन' : 'ಲಾಗಿನ್',
      slug: { _type: 'slug', current: 'login' },
      language: lang, access: 'guest', layout: 'auth',
      sections: [
        ref(sid('login', 'authHero', lang)),
        ref(sid('login', 'authForm', lang)),
      ],
    },
    {
      _id: pid('signup', lang), _type: 'page',
      title: lang === 'en' ? 'Sign Up' : lang === 'hi' ? 'साइन अप' : 'ಸೈನ್ ಅಪ್',
      slug: { _type: 'slug', current: 'signup' },
      language: lang, access: 'guest', layout: 'auth',
      sections: [
        ref(sid('signup', 'authHero', lang)),
        ref(sid('signup', 'authForm', lang)),
      ],
    },
    {
      _id: pid('posts', lang), _type: 'page',
      title: lang === 'en' ? 'Posts' : lang === 'hi' ? 'पोस्ट' : 'ಪೋಸ್ಟ್‌ಗಳು',
      slug: { _type: 'slug', current: 'posts' },
      language: lang, access: 'user', layout: 'dashboard',
      sections: [
        ref(sid('posts', 'postsHeader', lang)),
        ref(sid('posts', 'postsStats', lang)),
        ref(sid('posts', 'postsActions', lang)),
        ref(sid('posts', 'postsSearch', lang)),
        ref(sid('posts', 'postsTable', lang)),
      ],
    },
    {
      _id: pid('settings', lang), _type: 'page',
      title: lang === 'en' ? 'Settings' : lang === 'hi' ? 'सेटिंग' : 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      slug: { _type: 'slug', current: 'settings' },
      language: lang, access: 'user', layout: 'dashboard',
      sections: [
        ref(sid('settings', 'settingsHeader', lang)),
        ref(sid('settings', 'settingsInfo', lang)),
        ref(sid('settings', 'settingsForm', lang)),
        ref(sid('settings', 'settingsDanger', lang)),
      ],
    },
    {
      _id: pid('billing', lang), _type: 'page',
      title: lang === 'en' ? 'Billing' : lang === 'hi' ? 'बिलिंग' : 'ಬಿಲ್ಲಿಂಗ್',
      slug: { _type: 'slug', current: 'billing' },
      language: lang, access: 'user', layout: 'dashboard',
      sections: [
        ref(sid('billing', 'billingHeader', lang)),
        ref(sid('billing', 'billingCurrentPlan', lang)),
        ref(sid('billing', 'billingUsage', lang)),
        ref(sid('billing', 'billingPlansGrid', lang)),
        ref(sid('billing', 'billingFooter', lang)),
      ],
    },
    {
      _id: pid('billing-success', lang), _type: 'page',
      title: lang === 'en' ? 'Billing Success' : lang === 'hi' ? 'बिलिंग सफलता' : 'ಬಿಲ್ಲಿಂಗ್ ಯಶಸ್ಸು',
      slug: { _type: 'slug', current: 'billing-success' },
      language: lang, access: 'user', layout: 'dashboard',
      sections: [
        ref(sid('billing-success', 'billingSuccessHero', lang)),
        ref(sid('billing-success', 'billingSuccessActions', lang)),
      ],
    },
    {
      _id: pid('analytics', lang), _type: 'page',
      title: lang === 'en' ? 'Analytics' : lang === 'hi' ? 'विश्लेषण' : 'ವಿಶ್ಲೇಷಣೆ',
      slug: { _type: 'slug', current: 'analytics' },
      language: lang, access: 'admin', layout: 'dashboard',
      sections: [ref(sid('analytics', 'analytics', lang))],
    },
    {
      _id: pid('admin', lang), _type: 'page',
      title: lang === 'en' ? 'Admin' : lang === 'hi' ? 'एडमिन' : 'ಅಡ್ಮಿನ್',
      slug: { _type: 'slug', current: 'admin' },
      language: lang, access: 'admin', layout: 'dashboard',
      sections: [ref(sid('admin', 'admin', lang))],
    },
  ]
}

// ── Post data ──────────────────────────────────────────────────────────────────

interface PostDef {
  n: number
  slug: string
  title: string
  excerpt: string
  tags: string[]
  featured: boolean
  daysAgo: number
  draft: boolean
}

const EN_POSTS: PostDef[] = [
  { n:1,  slug:'getting-started-with-nextjs-app-router',      title:'Getting Started with Next.js App Router',            excerpt:'A comprehensive guide to building web apps with the Next.js App Router — covering layouts, loading states, and server components.',          tags:['nextjs','react','webdev'],             featured:true,  daysAgo:180, draft:false },
  { n:2,  slug:'understanding-react-server-components',        title:'Understanding React Server Components',               excerpt:'Dive deep into React Server Components and learn how they differ from Client Components, and when to use each.',                          tags:['react','server','performance'],         featured:true,  daysAgo:170, draft:false },
  { n:3,  slug:'building-saas-dashboard-with-tailwind',        title:'Building a SaaS Dashboard with Tailwind CSS',         excerpt:'Step-by-step walkthrough of building a polished SaaS dashboard using Tailwind CSS v4, shadcn/ui, and Lucide icons.',                    tags:['tailwind','saas','design'],            featured:true,  daysAgo:160, draft:false },
  { n:4,  slug:'sanity-cms-deep-dive-groq-queries',            title:'Sanity CMS: Deep Dive into GROQ Queries',             excerpt:'Master GROQ — the query language powering Sanity CMS. Learn projections, filters, joins, and parameterized queries.',                  tags:['sanity','cms','groq'],                 featured:true,  daysAgo:150, draft:false },
  { n:5,  slug:'typescript-best-practices-modern-react',       title:'TypeScript Best Practices for Modern React Apps',     excerpt:'From generics to discriminated unions, learn how to write safer, more maintainable React code with TypeScript strict mode.',             tags:['typescript','react','bestpractices'],   featured:true,  daysAgo:140, draft:false },
  { n:6,  slug:'supabase-authentication-guide',                title:'Supabase Authentication: Complete Guide',             excerpt:'Set up email/password login, Google OAuth, and role-based access control with Supabase Auth in a Next.js application.',               tags:['supabase','auth','security'],          featured:false, daysAgo:130, draft:false },
  { n:7,  slug:'posthog-analytics-track-user-behavior',        title:'PostHog Analytics: Track User Behavior',             excerpt:'Integrate PostHog into your Next.js app to capture events, build funnels, run A/B tests, and manage feature flags.',                  tags:['analytics','posthog','saas'],          featured:false, daysAgo:120, draft:false },
  { n:8,  slug:'stripe-billing-integration-nextjs',            title:'Stripe Billing Integration in Next.js',              excerpt:'Full walkthrough: create checkout sessions, handle webhooks, manage subscriptions, and build a customer portal with Stripe.',          tags:['stripe','billing','nextjs'],           featured:false, daysAgo:110, draft:false },
  { n:9,  slug:'zustand-vs-redux-state-management',            title:'Zustand vs Redux: State Management Showdown',         excerpt:'Compare Zustand and Redux for React state management. Benchmarks, bundle size, DX, and real-world use cases explored.',              tags:['zustand','redux','state'],             featured:false, daysAgo:100, draft:false },
  { n:10, slug:'tanstack-query-server-state-management',       title:'TanStack Query for Server State Management',         excerpt:'Replace useEffect + useState boilerplate with TanStack Query for data fetching, caching, and background synchronization.',            tags:['tanstack','query','react'],            featured:false, daysAgo:95,  draft:false },
  { n:11, slug:'building-multilanguage-apps-nextjs',           title:'Building Multi-language Apps with Next.js',           excerpt:'Implement i18n in Next.js using the App Router — supporting EN, HI, and KN with Sanity-driven translations and hreflang tags.',       tags:['i18n','nextjs','localization'],         featured:false, daysAgo:90,  draft:false },
  { n:12, slug:'schema-design-patterns-sanity-cms',            title:'Schema Design Patterns in Sanity CMS',               excerpt:'Learn how to design scalable Sanity schemas: singleton documents, discriminated unions, section builders, and reference patterns.',       tags:['sanity','schema','cms'],               featured:false, daysAgo:85,  draft:false },
  { n:13, slug:'nextjs-middleware-route-protection',           title:'Next.js Middleware: Route Protection Patterns',       excerpt:'Use Next.js middleware to protect routes, redirect unauthenticated users, enforce role-based access, and manage session tokens.',       tags:['nextjs','middleware','auth'],          featured:false, daysAgo:80,  draft:false },
  { n:14, slug:'react-hook-form-zod-validation',               title:'React Hook Form with Zod Validation',                excerpt:'Build robust forms with React Hook Form and Zod schema validation. Covers complex field types, async validation, and error messages.',  tags:['forms','zod','validation'],            featured:false, daysAgo:75,  draft:false },
  { n:15, slug:'tailwind-css-v4-whats-new',                    title:"Tailwind CSS v4: What's New",                         excerpt:"Tailwind CSS v4 drops config files in favor of CSS-first configuration. Here's everything that changed and how to migrate.",              tags:['tailwind','css','webdev'],             featured:false, daysAgo:70,  draft:false },
  { n:16, slug:'deploying-nextjs-apps-vercel',                 title:'Deploying Next.js Apps on Vercel',                   excerpt:'The definitive guide to deploying Next.js: environment variables, Edge Functions, ISR, preview deployments, and custom domains.',       tags:['vercel','deployment','devops'],         featured:false, daysAgo:65,  draft:false },
  { n:17, slug:'edge-runtime-optimization-strategies',         title:'Edge Runtime Optimization Strategies',               excerpt:'Run Next.js route handlers on the Edge runtime for near-zero cold starts. Learn what APIs are supported and what to avoid.',            tags:['edge','performance','nextjs'],         featured:false, daysAgo:60,  draft:false },
  { n:18, slug:'server-actions-nextjs',                        title:'Server Actions in Next.js',                          excerpt:'Server Actions let you run server code directly from client components. Explore mutations, form submissions, and optimistic updates.',    tags:['nextjs','server','mutations'],         featured:false, daysAgo:55,  draft:false },
  { n:19, slug:'cms-driven-blog-architecture',                 title:'Building a CMS-Driven Blog Architecture',            excerpt:'Design a scalable blog where every page, section, and label is managed in Sanity — no code changes needed for content updates.',        tags:['cms','architecture','blog'],           featured:false, daysAgo:50,  draft:false },
  { n:20, slug:'dark-mode-implementation-next-themes',         title:'Dark Mode Implementation with next-themes',          excerpt:'Add dark mode to any Next.js app using next-themes — covering SSR hydration, system preference detection, and Tailwind integration.',    tags:['darkmode','nextjs','ui'],              featured:false, daysAgo:45,  draft:false },
  { n:21, slug:'content-workflow-automation-sanity',           title:'Content Workflow Automation with Sanity',            excerpt:'Draft post covering automated publishing workflows, scheduled content, and webhook-driven CI/CD integrations with Sanity CMS.',         tags:['sanity','workflow','automation'],      featured:false, daysAgo:30,  draft:true  },
  { n:22, slug:'advanced-groq-query-patterns',                 title:'Advanced GROQ Query Patterns',                       excerpt:'Draft post on advanced GROQ: coalesce, pt::text, conditional projections, portable text queries, and performance optimization.',       tags:['groq','sanity','advanced'],           featured:false, daysAgo:25,  draft:true  },
  { n:23, slug:'webhook-handling-patterns-nextjs',             title:'Webhook Handling Patterns in Next.js',               excerpt:'Draft post on receiving, validating, and processing webhooks from Stripe, GitHub, and Sanity in Next.js API routes.',                  tags:['webhooks','nextjs','backend'],         featured:false, daysAgo:20,  draft:true  },
  { n:24, slug:'internationalization-strategies-saas',         title:'Internationalization Strategies for SaaS',           excerpt:'Draft post exploring URL-based i18n, cookie-based locale detection, and CMS-driven translations for multi-market SaaS products.',     tags:['i18n','saas','localization'],          featured:false, daysAgo:15,  draft:true  },
  { n:25, slug:'api-route-security-best-practices',            title:'API Route Security Best Practices',                  excerpt:'Draft post covering input validation, rate limiting, CORS configuration, and auth token verification in Next.js API routes.',          tags:['security','api','nextjs'],             featured:false, daysAgo:10,  draft:true  },
]

function makeHiPost(en: PostDef): PostDef {
  const hiTitles: Record<number, string> = {
    1:  'Next.js App Router के साथ शुरुआत',
    2:  'React Server Components को समझें',
    3:  'Tailwind CSS के साथ SaaS डैशबोर्ड बनाएं',
    4:  'Sanity CMS: GROQ क्वेरी में गहरी डाइव',
    5:  'आधुनिक React के लिए TypeScript सर्वोत्तम प्रथाएं',
    6:  'Supabase प्रमाणीकरण: पूर्ण गाइड',
    7:  'PostHog Analytics: उपयोगकर्ता व्यवहार ट्रैक करें',
    8:  'Next.js में Stripe बिलिंग एकीकरण',
    9:  'Zustand बनाम Redux: State Management तुलना',
    10: 'Server State Management के लिए TanStack Query',
    11: 'Next.js के साथ बहु-भाषा ऐप बनाएं',
    12: 'Sanity CMS में Schema डिज़ाइन पैटर्न',
    13: 'Next.js Middleware: Route Protection',
    14: 'React Hook Form और Zod Validation',
    15: 'Tailwind CSS v4 में क्या नया है',
    16: 'Vercel पर Next.js ऐप डेप्लॉय करें',
    17: 'Edge Runtime ऑप्टिमाइज़ेशन रणनीतियां',
    18: 'Next.js में Server Actions',
    19: 'CMS-संचालित Blog Architecture बनाएं',
    20: 'next-themes के साथ Dark Mode',
    21: 'Sanity के साथ Content Workflow Automation',
    22: 'उन्नत GROQ Query पैटर्न',
    23: 'Next.js में Webhook Handling',
    24: 'SaaS के लिए Internationalization रणनीतियां',
    25: 'API Route Security सर्वोत्तम प्रथाएं',
  }
  return {
    ...en,
    slug: `hi-${en.slug}`,
    title: hiTitles[en.n] ?? en.title,
    excerpt: `${hiTitles[en.n] ?? en.title} — यह लेख ${en.tags.join(', ')} के बारे में गहराई से जानकारी प्रदान करता है।`,
  }
}

function makeKnPost(en: PostDef): PostDef {
  const knTitles: Record<number, string> = {
    1:  'Next.js App Router ನೊಂದಿಗೆ ಪ್ರಾರಂಭ',
    2:  'React Server Components ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳಿ',
    3:  'Tailwind CSS ನೊಂದಿಗೆ SaaS ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    4:  'Sanity CMS: GROQ ಕ್ವೆರಿ ಆಳವಾದ ಅಧ್ಯಯನ',
    5:  'ಆಧುನಿಕ React ಗೆ TypeScript ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು',
    6:  'Supabase ಪ್ರಮಾಣೀಕರಣ: ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ',
    7:  'PostHog Analytics: ಬಳಕೆದಾರ ನಡವಳಿಕೆ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    8:  'Next.js ನಲ್ಲಿ Stripe ಬಿಲ್ಲಿಂಗ್ ಸಂಯೋಜನೆ',
    9:  'Zustand ವಿರುದ್ಧ Redux: State Management ಹೋಲಿಕೆ',
    10: 'Server State ಗೆ TanStack Query',
    11: 'Next.js ನೊಂದಿಗೆ ಬಹು-ಭಾಷಾ ಅಪ್ಲಿಕೇಶನ್',
    12: 'Sanity CMS ನಲ್ಲಿ Schema ವಿನ್ಯಾಸ ಮಾದರಿಗಳು',
    13: 'Next.js Middleware: Route ರಕ್ಷಣೆ',
    14: 'React Hook Form ಮತ್ತು Zod Validation',
    15: 'Tailwind CSS v4 ರಲ್ಲಿ ಹೊಸದೇನಿದೆ',
    16: 'Vercel ನಲ್ಲಿ Next.js ನಿಯೋಜಿಸಿ',
    17: 'Edge Runtime ಆಪ್ಟಿಮೈಸೇಶನ್ ತಂತ್ರಗಳು',
    18: 'Next.js ನಲ್ಲಿ Server Actions',
    19: 'CMS-ಚಾಲಿತ Blog Architecture ನಿರ್ಮಿಸಿ',
    20: 'next-themes ನೊಂದಿಗೆ Dark Mode',
    21: 'Sanity ನೊಂದಿಗೆ Content Workflow Automation',
    22: 'ಸುಧಾರಿತ GROQ Query ಮಾದರಿಗಳು',
    23: 'Next.js ನಲ್ಲಿ Webhook Handling',
    24: 'SaaS ಗೆ Internationalization ತಂತ್ರಗಳು',
    25: 'API Route ಭದ್ರತೆ ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು',
  }
  return {
    ...en,
    slug: `kn-${en.slug}`,
    title: knTitles[en.n] ?? en.title,
    excerpt: `${knTitles[en.n] ?? en.title} — ಈ ಲೇಖನ ${en.tags.join(', ')} ಬಗ್ಗೆ ಆಳವಾದ ಮಾಹಿತಿ ನೀಡುತ್ತದೆ.`,
  }
}

function buildPostDoc(
  def: PostDef,
  lang: Lang,
  assetIds: string[],
): Record<string, unknown> {
  const assetId = assetIds[(def.n - 1) % assetIds.length]
  const publishedAt = def.draft
    ? undefined
    : new Date(Date.now() - def.daysAgo * 86400 * 1000).toISOString()

  return {
    _id: poid(lang, def.n),
    _type: 'post',
    title: def.title,
    slug: { _type: 'slug', current: def.slug },
    language: lang,
    excerpt: def.excerpt,
    coverImage: assetId ? { _type: 'image', asset: { _type: 'reference', _ref: assetId } } : undefined,
    publishedAt,
    featured: def.featured,
    tags: def.tags,
    ...AUTHOR,
    body: [
      {
        _key: k(),
        _type: 'block',
        style: 'h2',
        markDefs: [],
        children: [{ _key: k(), _type: 'span', text: def.title, marks: [] }],
      },
      {
        _key: k(),
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [{ _key: k(), _type: 'span', text: def.excerpt, marks: [] }],
      },
      {
        _key: k(),
        _type: 'block',
        style: 'h3',
        markDefs: [],
        children: [{ _key: k(), _type: 'span', text: lang === 'en' ? 'Introduction' : lang === 'hi' ? 'परिचय' : 'ಪರಿಚಯ', marks: [] }],
      },
      {
        _key: k(),
        _type: 'block',
        style: 'normal',
        markDefs: [],
        children: [{
          _key: k(), _type: 'span', marks: [],
          text: lang === 'en'
            ? `This post explores ${def.tags.join(', ')} in depth. Whether you're a beginner or an experienced developer, this guide will help you understand the concepts and apply them in your projects.`
            : lang === 'hi'
            ? `यह पोस्ट ${def.tags.join(', ')} को गहराई से समझाती है। चाहे आप शुरुआती हों या अनुभवी डेवलपर, यह गाइड आपको अवधारणाओं को समझने और उन्हें अपने प्रोजेक्ट में लागू करने में मदद करेगी।`
            : `ಈ ಪೋಸ್ಟ್ ${def.tags.join(', ')} ಅನ್ನು ಆಳವಾಗಿ ಅಧ್ಯಯನ ಮಾಡುತ್ತದೆ. ನೀವು ಆರಂಭಿಕರಾಗಿರಲಿ ಅಥವಾ ಅನುಭವಿ ಡೆವಲಪರ್ ಆಗಿರಲಿ, ಈ ಮಾರ್ಗದರ್ಶಿ ಪರಿಕಲ್ಪನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.`,
        }],
      },
    ],
  }
}

// ── Transaction helpers ────────────────────────────────────────────────────────

async function createDocs(docs: Record<string, unknown>[], label: string) {
  console.log(`📄  Creating ${docs.length} ${label}...`)
  // Sanity transactions support max 1000 mutations; chunk if needed
  const CHUNK = 200
  let count = 0
  for (let i = 0; i < docs.length; i += CHUNK) {
    const chunk = docs.slice(i, i + CHUNK)
    const tx = client.transaction()
    chunk.forEach(doc => tx.createOrReplace(doc as Parameters<typeof tx.createOrReplace>[0]))
    await tx.commit({ visibility: 'sync' })
    count += chunk.length
  }
  console.log(`   ✓ ${count} ${label} created`)
  return count
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  ContentFlow Seed Script')
  console.log(`   Project: ${client.config().projectId} / ${client.config().dataset}\n`)

  // 1. Cleanup
  await cleanup()
  console.log()

  // 2. Upload cover images
  const assetIds = await uploadImages()
  console.log()

  // 3. Site config
  const siteConfig = buildSiteConfig()
  await createDocs([siteConfig], 'site config docs')
  console.log()

  // 4. Sections (all langs)
  const allSections: Record<string, unknown>[] = []
  for (const lang of LANGS) {
    allSections.push(...buildSections(lang))
  }
  const sectionCount = await createDocs(allSections, 'section docs')
  console.log()

  // 5. Pages (all langs)
  const allPages: Record<string, unknown>[] = []
  for (const lang of LANGS) {
    allPages.push(...buildPages(lang))
  }
  const pageCount = await createDocs(allPages, 'page docs')
  console.log()

  // 6. Posts (all langs)
  const HI_POSTS = EN_POSTS.map(makeHiPost)
  const KN_POSTS = EN_POSTS.map(makeKnPost)

  const allPosts: Record<string, unknown>[] = []
  for (const def of EN_POSTS) allPosts.push(buildPostDoc(def, 'en', assetIds))
  for (const def of HI_POSTS) allPosts.push(buildPostDoc(def, 'hi', assetIds))
  for (const def of KN_POSTS) allPosts.push(buildPostDoc(def, 'kn', assetIds))
  const postCount = await createDocs(allPosts, 'post docs')

  // ── Summary ────────────────────────────────────────────────────────────────
  const published = EN_POSTS.filter(p => !p.draft).length * LANGS.length
  const drafts    = EN_POSTS.filter(p => p.draft).length  * LANGS.length

  console.log('\n✅  Seed complete!')
  console.log('─'.repeat(40))
  console.log(`   Site config docs : 1`)
  console.log(`   Section docs     : ${sectionCount}  (${sectionCount / LANGS.length} per language × ${LANGS.length} languages)`)
  console.log(`   Page docs        : ${pageCount}  (${pageCount / LANGS.length} per language × ${LANGS.length} languages)`)
  console.log(`   Post docs        : ${postCount}  (${EN_POSTS.length} per language × ${LANGS.length} languages)`)
  console.log(`     ↳ published    : ${published}`)
  console.log(`     ↳ drafts       : ${drafts}`)
  console.log(`   Languages        : ${LANGS.join(', ')}`)
  console.log('─'.repeat(40))
  console.log()
}

main().catch(err => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
