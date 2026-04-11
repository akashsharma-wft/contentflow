// lib/sanity/queries.ts
import { groq } from 'next-sanity'

// ─── Shared projection fragments ──────────────────────────────────────────────

/** Fields returned for every post card (list views, dashboard, search). */
const POST_CARD_FIELDS = groq`
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
`

/** Full post fields — includes body (detail / preview pages). */
const POST_FULL_FIELDS = groq`
  ${POST_CARD_FIELDS},
  body
`

/**
 * Sections projection.
 *
 * Handles two cases that live in the same array:
 *   a) Inline system section objects (heroSection, featuresSection, …)
 *      → spread all fields with `...`
 *   b) References to custom section documents
 *      → dereference with @-> and project section + its component refs
 *
 * Image fields (e.g. backgroundImage) are returned as full Sanity image
 * objects so that @sanity/image-url can resolve them client-side.
 */
const SECTIONS_PROJECTION = groq`
  sections[] {
    ...,
    _type == "reference" => @-> {
      _id,
      _type,
      title,
      language,
      "components": components[]-> {
        _id,
        name,
        type,
        config
      }
    }
  }
`

// ─── Post queries ──────────────────────────────────────────────────────────────

/**
 * All published posts — no language filter.
 * Used by the dashboard to show all posts regardless of language.
 */
export const ALL_POSTS_QUERY = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
    ${POST_CARD_FIELDS}
  }
`

/**
 * All published posts with pagination — no language filter.
 * Params: { from: number, to: number }
 */
export const ALL_POSTS_PAGINATED_QUERY = groq`
  *[_type == "post" && defined(publishedAt)]
    | order(publishedAt desc)
    [$from...$to] {
    ${POST_CARD_FIELDS}
  }
`

/** Total published post count (all languages). */
export const ALL_POSTS_COUNT_QUERY = groq`
  count(*[_type == "post" && defined(publishedAt)])
`

/** Posts for a specific user — includes unpublished drafts. Params: { userId } */
export const MY_POSTS_QUERY = groq`
  *[_type == "post" && authorId == $userId] | order(publishedAt desc) {
    ${POST_CARD_FIELDS}
  }
`

/**
 * Posts for a specific user with pagination.
 * Params: { userId, from: number, to: number }
 */
export const MY_POSTS_PAGINATED_QUERY = groq`
  *[_type == "post" && authorId == $userId]
    | order(publishedAt desc)
    [$from...$to] {
    ${POST_CARD_FIELDS}
  }
`

/** Published + draft counts for a user. Params: { userId } */
export const MY_POSTS_COUNT_QUERY = groq`
  {
    "total":     count(*[_type == "post" && authorId == $userId]),
    "published": count(*[_type == "post" && authorId == $userId && defined(publishedAt)])
  }
`

/** Single published post by slug (language-agnostic). Params: { slug } */
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug && defined(publishedAt)][0] {
    ${POST_FULL_FIELDS}
  }
`

/** All posts including drafts — preview / admin only. */
export const ALL_POSTS_PREVIEW_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    ${POST_CARD_FIELDS}
  }
`

// ─── i18n post queries ─────────────────────────────────────────────────────────

/**
 * Published posts for a given language.
 * Params: { lang: string }
 */
export const POSTS_BY_LANG_QUERY = groq`
  *[_type == "post" && language == $lang && defined(publishedAt)]
    | order(publishedAt desc) {
    ${POST_CARD_FIELDS}
  }
`

/**
 * Published posts for a given language with cursor-based pagination.
 * Params: { lang: string, from: number, to: number }
 */
export const POSTS_BY_LANG_PAGINATED_QUERY = groq`
  *[_type == "post" && language == $lang && defined(publishedAt)]
    | order(publishedAt desc)
    [$from...$to] {
    ${POST_CARD_FIELDS}
  }
`

/**
 * Total published post count for a language.
 * Params: { lang: string }
 */
export const POSTS_BY_LANG_COUNT_QUERY = groq`
  count(*[_type == "post" && language == $lang && defined(publishedAt)])
`

/**
 * Single published post by slug + language.
 * Falls back to English if no document exists in the requested language.
 * Params: { slug: string, lang: string }
 */
export const POST_BY_SLUG_AND_LANG_QUERY = groq`
  *[
    _type == "post"
    && slug.current == $slug
    && language in [$lang, "en"]
    && defined(publishedAt)
  ] | order(select(language == $lang => 0, 1) asc) [0] {
    ${POST_FULL_FIELDS}
  }
`

/**
 * All language variants of a post by slug — for hreflang links.
 * Params: { slug: string }
 */
export const POST_LANG_VARIANTS_QUERY = groq`
  *[_type == "post" && slug.current == $slug && defined(publishedAt)] {
    language,
    "slug": slug.current
  }
`

// ─── Featured / recent post queries ───────────────────────────────────────────

/**
 * Featured published posts, limited.
 * Params: { lang: string, limit: number }
 */
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

/**
 * Recent published posts, limited.
 * Params: { lang: string, limit: number }
 */
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

/** Live published post count across all languages. */
export const PUBLISHED_POST_COUNT_QUERY = groq`
  count(*[_type == "post" && defined(publishedAt)])
`

// ─── Page queries ──────────────────────────────────────────────────────────────

/**
 * Fetch a page by slug + language, including all sections.
 *
 * Sections can be:
 *   - Inline system section objects (heroSection, featuresSection, …)
 *   - References to custom section documents (dereferenced inline)
 *
 * Falls back to English if no document exists in the requested language.
 * Params: { slug: string, lang: string }
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
    slug,
    access,
    layout,
    ${SECTIONS_PROJECTION},
    seoTitle,
    seoDescription,
    "ogImage": ogImage.asset->url
  }
`

/**
 * Navigation pages for the public Navbar.
 * Returns pages with home or auth layout (public-facing), excluding the home
 * slug itself (linked via the logo). Filtered by language.
 * Params: { lang: string }
 */
export const NAV_PAGES_QUERY = groq`
  *[
    _type == "page"
    && language == $lang
    && defined(slug.current)
    && layout in ["home", "auth"]
    && slug.current != "home"
  ] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    access,
    layout
  }
`

/** All page slugs for generateStaticParams. */
export const ALL_PAGE_SLUGS_QUERY = groq`
  *[_type == "page" && defined(slug.current) && defined(language)] {
    "slug": slug.current,
    language
  }
`

/**
 * All page slugs + access level — used by middleware to determine
 * which routes require authentication.
 * Returns: { slug, language, access: 'guest' | 'user' | 'admin' }
 */
export const ALL_PAGES_ACCESS_QUERY = groq`
  *[_type == "page" && defined(slug.current)] {
    "slug": slug.current,
    language,
    access
  }
`

// ─── Post slug queries ─────────────────────────────────────────────────────────

/** All published post slugs for generateStaticParams. */
export const ALL_POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(publishedAt) && defined(slug.current) && defined(language)] {
    "slug": slug.current,
    language
  }
`

// ─── Site config ───────────────────────────────────────────────────────────────

/**
 * Site configuration for a given language.
 * New schema: one document per language with title, language, siteName.
 * Params: { lang: string }
 */
export const SITE_CONFIG_QUERY = groq`
  *[_type == "siteConfig" && language == $lang][0] {
    _id,
    title,
    language,
    siteName
  }
`

// ─── Legacy singleton queries (kept for backward compatibility) ────────────────
// These query document types removed in the schema refactor.
// They still function if the legacy documents remain in the Sanity dataset.

/** @deprecated Auth UI configuration singleton. */
export const AUTH_CONFIG_QUERY = groq`
  *[_type == "authConfig" && _id == "authConfig"][0] {
    _id,
    showGoogleOAuth, showEmailPassword,
    loginHeading, loginSubheading, loginSubmitLabel,
    loginFooterText, loginFooterLinkLabel, loginFooterLinkHref,
    signupHeading, signupSubheading, signupSubmitLabel,
    signupFooterText, signupFooterLinkLabel, signupFooterLinkHref,
    leftPanelHeadline, leftPanelBadge, leftPanelFeatures
  }
`

/** @deprecated Posts page config singleton. */
export const POSTS_PAGE_CONFIG_QUERY = groq`
  *[_type == "postsPageConfig" && _id == "postsPageConfig"][0] {
    heading, subheading, groqBadgeLabel, syncButtonLabel,
    newPostButtonLabel, myPostsLabel, publishedLabel, draftsLabel,
    searchPlaceholder, colTitle, colStatus, colTags, colLastModified,
    emptyTitle, emptyBody, emptyCtaLabel
  }
`

/** @deprecated Analytics page config singleton. */
export const ANALYTICS_CONFIG_QUERY = groq`
  *[_type == "analyticsConfig" && _id == "analyticsConfig"][0] {
    heading, subheading, eventsLabel, usersLabel, avgSessionLabel,
    liveStreamLabel, refreshLabel, emptyTitle, emptyBody, featureFlagLabel
  }
`

/** @deprecated Settings page config singleton. */
export const SETTINGS_PAGE_CONFIG_QUERY = groq`
  *[_type == "settingsPageConfig" && _id == "settingsPageConfig"][0] {
    heading, subheading, profileSectionLabel, displayNameLabel,
    emailLabel, emailHelperText, bioLabel, bioMaxLength, websiteLabel,
    uploadPhotoLabel, saveLabel, discardLabel,
    dangerZoneHeading, dangerZoneBody, dangerZoneWarning, deleteAccountLabel
  }
`

/** @deprecated Billing page config singleton. */
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

/** @deprecated Admin page config singleton. */
export const ADMIN_PAGE_CONFIG_QUERY = groq`
  *[_type == "adminPageConfig" && _id == "adminPageConfig"][0] {
    heading, subheading, totalUsersLabel,
    colUser, colPlan, colRole, colJoined, footerNote, emptyLabel
  }
`
