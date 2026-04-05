// lib/sanity/queries.ts
import { groq } from 'next-sanity'

// ─── Post queries ──────────────────────────────────────────────────────────────

/** All published posts — no language filter (used in dashboard) */
export const ALL_POSTS_QUERY = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    language,
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

/** Posts for a specific user — includes their own drafts */
export const MY_POSTS_QUERY = groq`
  *[_type == "post" && authorId == $userId] | order(publishedAt desc) {
    _id,
    title,
    language,
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

/** Single published post by slug */
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug && defined(publishedAt)][0] {
    _id,
    title,
    language,
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

/** All posts including drafts — preview/admin use only */
export const ALL_POSTS_PREVIEW_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    language,
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

/** Author post counts */
export const MY_POSTS_COUNT_QUERY = groq`
  {
    "total": count(*[_type == "post" && authorId == $userId]),
    "published": count(*[_type == "post" && authorId == $userId && defined(publishedAt)])
  }
`

// ─── i18n-aware post queries ───────────────────────────────────────────────────

/** Published posts for a given language. Params: { lang: string } */
export const POSTS_BY_LANG_QUERY = groq`
  *[
    _type == "post"
    && language == $lang
    && defined(publishedAt)
  ] | order(publishedAt desc) {
    _id,
    title,
    language,
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

/**
 * Single published post by slug + language.
 * Falls back to English ('en') if no document exists in the requested language.
 */
export const POST_BY_SLUG_AND_LANG_QUERY = groq`
  *[
    _type == "post"
    && slug.current == $slug
    && language in [$lang, "en"]
    && defined(publishedAt)
  ] | order(select(language == $lang => 0, 1) asc) [0] {
    _id,
    title,
    language,
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

/** All language variants of a post by slug — for hreflang links */
export const POST_LANG_VARIANTS_QUERY = groq`
  *[_type == "post" && slug.current == $slug && defined(publishedAt)] {
    language,
    "slug": slug.current
  }
`

// ─── Featured posts ────────────────────────────────────────────────────────────

/** Featured published posts, limited. Params: { lang: string, limit: number } */
export const FEATURED_POSTS_QUERY = groq`
  *[
    _type == "post"
    && featured == true
    && defined(publishedAt)
    && language == $lang
  ] | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    language,
    "slug": slug.current,
    excerpt,
    publishedAt,
    tags,
    authorName,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

/** Recent published posts, limited. Params: { lang: string, limit: number } */
export const RECENT_POSTS_QUERY = groq`
  *[
    _type == "post"
    && defined(publishedAt)
    && language == $lang
  ] | order(publishedAt desc) [0...$limit] {
    _id,
    title,
    language,
    "slug": slug.current,
    excerpt,
    publishedAt,
    tags,
    authorName,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

/** Live post count — used by StatsSection with useLivePostCount = true */
export const PUBLISHED_POST_COUNT_QUERY = groq`
  count(*[_type == "post" && defined(publishedAt)])
`

// ─── Page queries ──────────────────────────────────────────────────────────────

/**
 * Fetch a page document by slug + language, including all sections.
 * Falls back to English if no document exists in the requested language.
 */
export const PAGE_BY_SLUG_AND_LANG_QUERY = groq`
  *[
    _type == "page"
    && slug.current == $slug
    && language in [$lang, "en"]
  ] | order(select(language == $lang => 0, 1) asc) [0] {
    _id,
    title,
    language,
    "slug": slug.current,
    isPublic,
    adminOnly,
    showNavbar,
    showSidebar,
    enablePosthogTracking,
    sections,
    seoTitle,
    seoDescription,
    "ogImage": ogImage.asset->url
  }
`

/** All page slugs for generateStaticParams. */
export const ALL_PAGE_SLUGS_QUERY = groq`
  *[_type == "page" && defined(slug.current) && defined(language)] {
    "slug": slug.current,
    language
  }
`

/** All page slugs + access flags — used by middleware to cache public/protected routes */
export const ALL_PAGES_ACCESS_QUERY = groq`
  *[_type == "page" && defined(slug.current)] {
    "slug": slug.current,
    language,
    isPublic,
    adminOnly
  }
`

// ─── All post slugs ────────────────────────────────────────────────────────────

/** All published post slugs for generateStaticParams */
export const ALL_POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(publishedAt) && defined(slug.current) && defined(language)] {
    "slug": slug.current,
    language
  }
`

// ─── Singleton queries ─────────────────────────────────────────────────────────

/** Site-wide configuration (singleton). */
export const SITE_CONFIG_QUERY = groq`
  *[_type == "siteConfig" && _id == "siteConfig"][0] {
    _id,
    siteName,
    tagline,
    "logo": logo.asset->url,
    publicNav[] {
      label,
      slug,
      href,
      openInNewTab
    },
    sidebarNav,
    footerTagline,
    footerLinks,
    copyright
  }
`

/** Auth UI configuration (singleton). */
export const AUTH_CONFIG_QUERY = groq`
  *[_type == "authConfig" && _id == "authConfig"][0] {
    _id,
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
    leftPanelFeatures
  }
`

/** Posts page config singleton. */
export const POSTS_PAGE_CONFIG_QUERY = groq`
  *[_type == "postsPageConfig" && _id == "postsPageConfig"][0] {
    heading, subheading, groqBadgeLabel, syncButtonLabel,
    newPostButtonLabel, myPostsLabel, publishedLabel, draftsLabel,
    searchPlaceholder, colTitle, colStatus, colTags, colLastModified,
    emptyTitle, emptyBody, emptyCtaLabel
  }
`

/** Analytics page config singleton. */
export const ANALYTICS_CONFIG_QUERY = groq`
  *[_type == "analyticsConfig" && _id == "analyticsConfig"][0] {
    heading, subheading, eventsLabel, usersLabel, avgSessionLabel,
    liveStreamLabel, refreshLabel, emptyTitle, emptyBody, featureFlagLabel
  }
`

/** Settings page config singleton. */
export const SETTINGS_PAGE_CONFIG_QUERY = groq`
  *[_type == "settingsPageConfig" && _id == "settingsPageConfig"][0] {
    heading, subheading, profileSectionLabel, displayNameLabel,
    emailLabel, emailHelperText, bioLabel, bioMaxLength, websiteLabel,
    uploadPhotoLabel, saveLabel, discardLabel,
    dangerZoneHeading, dangerZoneBody, dangerZoneWarning, deleteAccountLabel
  }
`

/** Billing page config singleton. */
export const BILLING_PAGE_CONFIG_QUERY = groq`
  *[_type == "billingPageConfig" && _id == "billingPageConfig"][0] {
    heading, subheading, currentPlanLabel, manageLabel, cancelLabel,
    reactivateLabel, upgradeLabel, usageHeading, postsUsageLabel,
    apiUsageLabel, storageUsageLabel, seatsUsageLabel, plansHeading,
    freePlanName, freePlanTagline, freePlanPrice, freePlanFeatures,
    proPlanName, proPlanTagline, proPlanBadge, proPlanFeatures,
    downgradeLabel, currentPlanButtonLabel
  }
`

/** Admin page config singleton. */
export const ADMIN_PAGE_CONFIG_QUERY = groq`
  *[_type == "adminPageConfig" && _id == "adminPageConfig"][0] {
    heading, subheading, totalUsersLabel,
    colUser, colPlan, colRole, colJoined, footerNote, emptyLabel
  }
`