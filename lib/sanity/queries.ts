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
  "authorAvatar": authorAvatar.asset->url,
  "coverImage": coverImage.asset->url
`

/** Full post fields — includes body (detail / preview pages). */
const POST_FULL_FIELDS = groq`
  ${POST_CARD_FIELDS},
  body
`

/**
 * Sections + Components projection.
 *
 * page.sections[] can reference either `section` OR `component` documents.
 * GROQ dereferences both with []->. Consumers check _type:
 *   • _type === 'section'   → handled by SectionRenderer (sectionType discriminator)
 *   • _type === 'component' → handled by ComponentRenderer (componentType discriminator)
 *
 * backgroundImage inside hero is expanded so @sanity/image-url can resolve it.
 * Image fields inside component sub-objects get asset-> expansion for URL resolution.
 */
const SECTIONS_PROJECTION = groq`
  "sections": sections[]-> {
    _id,
    _type,

    // ── Section document fields ───────────────────────────────────────────────
    sectionType,
    title,
    language,
    hero {
      ...,
      backgroundImage { ..., asset-> }
    },
    featuredPosts,
    recentPosts,
    cta,
    authHero {
      ...,
      features[] { _key, icon, text }
    },
    authForm,
    features {
      ...,
      features[] { _key, title, description, icon }
    },
    postsList,
    postDetail,
    // Post Detail sub-sections
    postDetailHeader { heading, featuredBadgeLabel, languageBadgeLabel, editInStudioLabel },
    postDetailMeta { authorLabel, dateFormatLabel, unpublishedLabel },
    postDetailBody { emptyBodyText, shareLabel, linkCopiedText },
    postDetailTags { tagsHeading, emptyTagsText },
    postDetailBackLink { backLabel, allPostsLabel, prevLabel, nextLabel, backHref },
    analytics {
      heading, subheading,
      eventsLabel, usersLabel, avgSessionLabel,
      liveStreamLabel, refreshLabel,
      emptyTitle, emptyBody,
      featureFlagLabel, featureFlagEnabledNote, featureFlagDisabledNote,
      connectedLabel, ctaLabel,
      showingLabel, prevLabel, nextLabel
    },
    // Billing sub-sections
    billingHeader { heading, subheading },
    billingCurrentPlan {
      currentPlanLabel, activeBadgeLabel, cancellingBadgeLabel, freeTierBadgeLabel,
      manageLabel, cancelLabel, reactivateLabel, upgradeLabel, cancellingNote
    },
    billingUsage {
      usageHeading, postsUsageLabel, apiUsageLabel, storageUsageLabel, seatsUsageLabel
    },
    billingPlansGrid {
      plansHeading,
      freePlanName, freePlanTagline, freePlanPrice, freePlanFeatures[],
      proPlanName, proPlanTagline, proPlanBadge, proPlanFeatures[],
      upgradeLabel, downgradeLabel, downgradeScheduledLabel, currentPlanButtonLabel
    },
    billingFooter { stripeNote, webhookNote },
    billingSuccessHero { icon, heading, subheading, body },
    billingSuccessActions { primaryLabel, primaryHref, secondaryLabel, secondaryHref },
    // Settings sub-sections
    settingsHeader { heading, subheading },
    settingsInfo { uploadPhotoLabel },
    settingsForm {
      profileSectionLabel, metadataLabel,
      displayNameLabel, emailLabel, emailHelperText,
      bioLabel, bioPlaceholder, bioMaxLength,
      websiteLabel, websitePlaceholder, websiteErrorText,
      saveLabel, discardLabel
    },
    settingsDanger { heading, body, warningText, deleteLabel },
    // Posts sub-sections
    postsHeader { heading, subheading, groqBadgeLabel },
    postsStats { myPostsLabel, publishedLabel, draftsLabel },
    postsActions { syncButtonLabel, newPostButtonLabel },
    postsSearch { searchPlaceholder },
    postsTable {
      colTitle, colStatus, colImage, colTags, colLastModified,
      emptyTitle, emptyBody, emptyCtaLabel,
      showingLabel, loadMoreLabel, connectedLabel,
      viewPostLabel, editPostLabel, deletePostLabel,
      deleteDialogTitle, deleteDialogBody, deleteDialogConfirmLabel, deleteDialogCancelLabel,
      featuredLabel, featuredOfLabel, featuredReadLabel, featuredBannerIcon
    },
    admin {
      heading, subheading,
      totalUsersLabel, proLabel, freeLabel,
      colUser, colPlan, colRole, colJoined,
      emptyLabel, footerNote,
      inviteSectionHeading, inviteFormTitle,
      inviteEmailLabel, inviteEmailPlaceholder,
      inviteMessageLabel, inviteSendLabel,
      pendingInvitesHeading, inviteEmptyLabel, cancelInviteLabel,
      pendingRequestsHeading, requestEmptyLabel,
      approveLabel, rejectLabel,
      colEmail, colType, colSentAt, colActions
    },

    // ── Component document fields ─────────────────────────────────────────────
    name,
    componentType,
    // Layout chrome
    navbar {
      logoText, variant, showAuth,
      links[] { label, href, external },
      ctaButton { label, href }
    },
    footer {
      logoText, tagline, copyright, showLogo,
      columns[] {
        heading,
        links[] { label, href, external }
      },
      socialLinks[] { platform, href }
    },
    sidebar {
      logoText, logoHref, collapsible, showUserProfile, defaultCollapsed,
      navItems[]    { label, href, icon, adminOnly },
      footerItems[] { label, href, icon, adminOnly }
    },
    mobileNavTop {
      logoText, showLogo, showMenuButton,
      actions[] { type, label }
    },
    mobileNavBottom {
      showLabels,
      items[] { label, href, icon, activeIcon, adminOnly }
    },
    // Content blocks
    form {
      heading, subheading, method, action, submitLabel, successMessage,
      fields[] {
        name, label, fieldType, placeholder, required, helperText,
        options[] { label, value }
      }
    },
    grid {
      heading, subheading, columns, cardStyle,
      items[] {
        heading, body, icon, linkLabel, linkHref,
        image { ..., asset-> }
      }
    },
    cards {
      heading, layout,
      items[] {
        heading, body, badge, tags, ctaLabel, ctaHref,
        image { ..., asset-> }
      }
    },
    pricingTable {
      heading, subheading, currency, billingToggle,
      plans[] {
        name, description, monthlyPrice, yearlyPrice, priceNote,
        badge, highlighted, ctaLabel, ctaHref,
        features[] { text, included }
      }
    },
    dataTable {
      heading, description, striped, bordered, pagination, pageSize,
      columns[] { key, label, sortable, align },
      rows[]    { cells[] { key, value } }
    },
    list {
      heading, style, columns,
      items[] { text, description, icon, badge }
    },
    flex {
      heading, direction, wrap, gap, align, justify,
      items[] {
        heading, body, width,
        image { ..., asset-> }
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
 * Single site configuration document.
 * Stable ID: 'site-config' — no per-language duplication.
 * No params required.
 */
export const SITE_CONFIG_QUERY = groq`
  *[_type == "siteConfig" && _id == "site-config"][0] {
    _id,
    title,
    siteName,

    navbarConfig {
      brandName,
      showLanguageSwitcher,
      ctaButton { label, href },
      items[] { _key, label { en, hi, kn }, href, icon, visibleFor }
    },

    footerConfig {
      brandName,
      showBrandLogo,
      tagline,
      copyright,
      socialLinks[] { _key, platform, label, href },
      columns[] {
        _key,
        heading,
        links[] { _key, label, href, external }
      },
      bottomLinks[] { _key, label, href, external }
    },

    sidebarConfig {
      brandName,
      brandSubtitle,
      ctaButton { label, href },
      statusText,
      statusBadge,
      navItems[]    { _key, label { en, hi, kn }, href, icon, visibleFor },
      footerLinks[] { _key, label, href, icon, external }
    },

    mobileNavConfig {
      showLabels,
      items[] { _key, label { en, hi, kn }, href, icon, visibleFor }
    }
  }
`

// ─── Component queries ─────────────────────────────────────────────────────────

/**
 * All component documents for a given language.
 * Params: { lang: string }
 */
export const COMPONENTS_BY_LANG_QUERY = groq`
  *[_type == "component" && language == $lang] | order(name asc) {
    _id,
    _type,
    name,
    language,
    componentType
  }
`

/**
 * Single component document by ID.
 * Params: { id: string }
 */
export const COMPONENT_BY_ID_QUERY = groq`
  *[_type == "component" && _id == $id][0] {
    _id,
    _type,
    name,
    language,
    componentType,
    navbar, footer, sidebar, mobileNavTop, mobileNavBottom,
    form, grid, cards, pricingTable, dataTable, list, flex
  }
`

// ─── Post detail section config queries ───────────────────────────────────────

/**
 * Fetch all post detail section config documents for a given language.
 * The route file uses these to assemble label props for PostDetail.
 * Params: { lang: string }
 */
export const POST_DETAIL_SECTIONS_QUERY = groq`
  *[
    _type == "section"
    && page == "postDetail"
    && language == $lang
    && !(_id in path("drafts.**"))
  ] {
    _id,
    sectionType,
    postDetailHeader { heading, featuredBadgeLabel, languageBadgeLabel, editInStudioLabel },
    postDetailMeta { authorLabel, dateFormatLabel, unpublishedLabel },
    postDetailBody { emptyBodyText, shareLabel, linkCopiedText },
    postDetailTags { tagsHeading, emptyTagsText },
    postDetailBackLink { backLabel, allPostsLabel, prevLabel, nextLabel, backHref }
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

// ─── Draft post check ──────────────────────────────────────────────────────────

/**
 * Returns true if the post exists but has no publishedAt (i.e. it is a draft).
 * Used to distinguish "post not found" from "post is a draft" so we can show
 * a helpful toast instead of a 404.
 * Params: { slug: string, lang: string }
 */
export const IS_POST_DRAFT_QUERY = groq`
  defined(
    *[
      _type == "post"
      && slug.current == $slug
      && language == $lang
      && !defined(publishedAt)
      && !(_id in path("drafts.**"))
    ][0]._id
  )
`
