/**
 * TypeScript types for all Sanity CMS schemas.
 * These match the schema definitions in sanity/schemaTypes/.
 * Keep in sync with schema changes.
 */

// ─── Shared ────────────────────────────────────────────────────────────────────

export type SanityImageAsset = {
  _type: 'image'
  asset: { _ref: string; _type: 'reference' }
  hotspot?: { x: number; y: number; height: number; width: number }
  url?: string // resolved via asset->url
}

export type PortableTextBlock = {
  _type: 'block'
  _key: string
  children: Array<{ _type: 'span'; _key: string; text: string; marks?: string[] }>
  markDefs?: Array<{ _type: string; _key: string; [key: string]: unknown }>
  style?: string
}

// ─── Post ──────────────────────────────────────────────────────────────────────

export type SanityPost = {
  _id: string
  _type: 'post'
  _createdAt: string
  _updatedAt: string
  title: string
  slug: { current: string }
  language?: string
  excerpt?: string
  body?: PortableTextBlock[]
  coverImage?: SanityImageAsset
  publishedAt?: string
  featured?: boolean
  tags?: string[]
  authorId?: string
  authorName?: string
  authorEmail?: string
  authorAvatar?: string
}

export type SanityPostCard = Pick<
  SanityPost,
  | '_id'
  | 'title'
  | 'language'
  | 'excerpt'
  | 'publishedAt'
  | 'featured'
  | 'tags'
  | 'authorId'
  | 'authorName'
  | 'authorAvatar'
> & {
  slug: string        // flattened from slug.current
  coverImage?: string // resolved URL
}

// ─── Block types ───────────────────────────────────────────────────────────────

export type CtaButton = {
  label?: string
  href?: string
}

export type HeroSection = {
  _type: 'heroSection'
  _key: string
  heading: string
  subheading?: string
  badge?: string
  primaryCta?: CtaButton
  secondaryCta?: CtaButton
  backgroundImage?: SanityImageAsset
  theme?: 'dark' | 'light' | 'gradient'
  layout?: 'centered' | 'split'
  communityText?: string
}

export type CtaSection = {
  _type: 'ctaSection'
  _key: string
  heading: string
  body?: string
  primaryButton?: CtaButton
  secondaryButton?: CtaButton
  theme?: 'dark' | 'indigo' | 'subtle'
  centered?: boolean
}

export type FeaturedPostsSection = {
  _type: 'featuredPostsSection'
  _key: string
  heading?: string
  subheading?: string
  maxPosts?: number
  layout?: 'grid' | 'list' | 'featured'
  showExcerpt?: boolean
  showTags?: boolean
  viewAllLabel?: string
}

export type RecentPostsSection = {
  _type: 'recentPostsSection'
  _key: string
  heading?: string
  subheading?: string
  count?: number
  layout?: 'grid' | 'list'
  showCoverImage?: boolean
  viewAllLabel?: string
  viewAllHref?: string
}

export type RichTextSection = {
  _type: 'richTextSection'
  _key: string
  heading?: string
  content: PortableTextBlock[]
  maxWidth?: 'narrow' | 'medium' | 'full'
}

export type StatItem = {
  value: string
  label: string
  description?: string
  useLivePostCount?: boolean
}

export type StatsSection = {
  _type: 'statsSection'
  _key: string
  heading?: string
  stats?: StatItem[]
}

export type FormField = {
  fieldId: string
  label: string
  placeholder?: string
  fieldType?: 'text' | 'email' | 'password' | 'textarea' | 'url'
  required?: boolean
  readOnly?: boolean
  helperText?: string
}

export type FormSection = {
  _type: 'formSection'
  _key: string
  formId: 'login' | 'signup' | 'profile'
  heading?: string
  subheading?: string
  showGoogleOAuth?: boolean
  showEmailPassword?: boolean
  fields?: FormField[]
  submitLabel?: string
  footerText?: string
  footerLinkLabel?: string
  footerLinkHref?: string
}

// Union of all section types
export type SanitySection =
  | HeroSection
  | CtaSection
  | FeaturedPostsSection
  | RecentPostsSection
  | RichTextSection
  | StatsSection
  | FormSection

// ─── Page ──────────────────────────────────────────────────────────────────────

export type SanityPage = {
  _id: string
  _type: 'page'
  title: string
  slug: { current: string }
  language?: string
  isPublic?: boolean
  adminOnly?: boolean
  showNavbar?: boolean
  showSidebar?: boolean
  enablePosthogTracking?: boolean
  sections?: SanitySection[]
  seoTitle?: string
  seoDescription?: string
  ogImage?: SanityImageAsset
}

// ─── Singletons ────────────────────────────────────────────────────────────────

export type NavLink = {
  label: string
  href?: string
  slug?: string
  openInNewTab?: boolean
}

export type SidebarNavLink = {
  label: string
  href: string
  icon?: string
  adminOnly?: boolean
}

export type FooterLink = {
  label: string
  href: string
}

export type SanitySiteConfig = {
  _id: string
  _type: 'siteConfig'
  siteName: string
  tagline?: string
  logo?: SanityImageAsset
  favicon?: SanityImageAsset
  publicNav?: NavLink[]
  sidebarNav?: SidebarNavLink[]
  footerTagline?: string
  footerLinks?: FooterLink[]
  copyright?: string
}

export type AuthFeatureBullet = {
  text: string
  icon?: string
}

export type SanityAuthConfig = {
  _id: string
  _type: 'authConfig'
  showGoogleOAuth?: boolean
  showEmailPassword?: boolean
  loginHeading?: string
  loginSubheading?: string
  loginSubmitLabel?: string
  loginFooterText?: string
  loginFooterLinkLabel?: string
  loginFooterLinkHref?: string
  signupHeading?: string
  signupSubheading?: string
  signupSubmitLabel?: string
  signupFooterText?: string
  signupFooterLinkLabel?: string
  signupFooterLinkHref?: string
  leftPanelHeadline?: string
  leftPanelBadge?: string
  leftPanelFeatures?: AuthFeatureBullet[]
}
