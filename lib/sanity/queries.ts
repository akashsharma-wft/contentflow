import { groq } from 'next-sanity'

// ── Page builder ──────────────────────────────────────────────────────────────

export const PAGE_BY_SLUG_QUERY = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    isPublic,
    adminOnly,
    seoTitle,
    seoDescription,
    "ogImage": ogImage.asset->url,
    sections[] {
      _type,
      _key,
      heading,
      subheading,
      badge,
      theme,
      centered,
      primaryCta,
      secondaryCta,
      "backgroundImage": backgroundImage.asset->url,
      maxPosts,
      layout,
      showExcerpt,
      showTags,
      showCoverImage,
      ctaLabel,
      ctaHref,
      stats,
      useLivePostCount,
      content,
      maxWidth,
      body,
      primaryButton,
      secondaryButton,
      formId,
      showGoogleOAuth,
      showEmailPassword,
      fields,
      submitLabel,
      footerText,
      footerLinkLabel,
      footerLinkHref,
    }
  }
`

export const ALL_PAGES_PUBLIC_STATUS_QUERY = groq`
  *[_type == "page"] {
    "slug": slug.current,
    isPublic,
    adminOnly
  }
`

export const SITE_CONFIG_QUERY = groq`
  *[_type == "siteConfig"][0] {
    siteName,
    siteTagline,
    "logo": logo.asset->url,
    publicNavLinks,
    sidebarNavLinks,
    footerTagline,
    footerLinks,
    footerCopyrightText,
  }
`

export const AUTH_CONFIG_QUERY = groq`
  *[_type == "authConfig"][0] {
    showGoogleOAuth,
    showEmailPassword,
    loginHeading,
    loginSubheading,
    loginSubmitLabel,
    loginFooterText,
    loginFooterLinkLabel,
    loginFooterLinkHref,
    signupHeading,
    signupSubheading,
    signupSubmitLabel,
    signupFooterText,
    signupFooterLinkLabel,
    signupFooterLinkHref,
    leftPanelHeadline,
    leftPanelBadge,
    leftPanelFeatures,
  }
`

export const FEATURED_POSTS_QUERY = groq`
  *[_type == "post" && featured == true && defined(publishedAt)] | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    tags,
    authorName,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

export const RECENT_POSTS_QUERY = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    tags,
    authorName,
    "coverImage": coverImage.asset->url
  }
`

export const POST_COUNT_QUERY = groq`
  count(*[_type == "post" && defined(publishedAt)])
`

// Main posts list — PUBLISHED ONLY + own drafts
// Regular users see all published + their own drafts
export const ALL_POSTS_QUERY = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featured,
    tags,
    authorId,
    authorName,
    authorEmail,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

// Posts for a specific user — includes their own drafts
export const MY_POSTS_QUERY = groq`
  *[_type == "post" && authorId == $userId] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featured,
    tags,
    authorId,
    authorName,
    authorEmail,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

// Single post — published only (for public detail page)
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug && defined(publishedAt)][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    body,
    publishedAt,
    featured,
    tags,
    authorId,
    authorName,
    authorEmail,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

// Preview query — all posts including drafts (server-side only)
export const ALL_POSTS_PREVIEW_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featured,
    tags,
    authorId,
    authorName,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

// Own stats
export const MY_POSTS_COUNT_QUERY = groq`
  {
    "total": count(*[_type == "post" && authorId == $userId]),
    "published": count(*[_type == "post" && authorId == $userId && defined(publishedAt)])
  }
`
