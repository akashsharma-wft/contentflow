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

// ─── Content Blocks ────────────────────────────────────────────────────────

export type HeadingSection = {
  _type: 'headingSection'
  _key: string
  heading: string
  subheading?: string
  badge?: string
  align?: 'left' | 'center' | 'right'
  size?: 'h1' | 'h2' | 'h3'
}

export type Feature = {
  icon?: string
  title: string
  description?: string
}

export type FeatureListSection = {
  _type: 'featureListSection'
  _key: string
  heading?: string
  subheading?: string
  layout?: 'list' | 'grid-2' | 'grid-3'
  features?: Feature[]
}

export type Testimonial = {
  quote: string
  name: string
  title?: string
  avatar?: SanityImageAsset
  rating?: number
}

export type TestimonialsSection = {
  _type: 'testimonialsSection'
  _key: string
  heading?: string
  testimonials?: Testimonial[]
  layout?: 'grid' | 'carousel' | 'single'
}

export type FaqItem = {
  question: string
  answer: PortableTextBlock[]
}

export type FaqSection = {
  _type: 'faqSection'
  _key: string
  heading?: string
  subheading?: string
  faqs?: FaqItem[]
  layout?: 'accordion' | 'open' | 'two-col'
}

export type PricingPlan = {
  name: string
  price?: string
  priceNote?: string
  description?: string
  badge?: string
  highlighted?: boolean
  features?: { text: string; included?: boolean }[]
  ctaLabel?: string
  ctaHref?: string
}

export type PricingSection = {
  _type: 'pricingSection'
  _key: string
  heading?: string
  subheading?: string
  plans?: PricingPlan[]
}

export type TeamMember = {
  name: string
  role?: string
  bio?: string
  avatar?: SanityImageAsset
  linkedIn?: string
  twitter?: string
}

export type TeamSection = {
  _type: 'teamSection'
  _key: string
  heading?: string
  subheading?: string
  members?: TeamMember[]
  columns?: 2 | 3 | 4
}

export type LogoBarSection = {
  _type: 'logoBarSection'
  _key: string
  heading?: string
  logos?: { image: SanityImageAsset; alt: string; href?: string }[]
  scrolling?: boolean
}

export type CarouselSlide = {
  image?: SanityImageAsset
  heading?: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
}

export type CarouselSection = {
  _type: 'carouselSection'
  _key: string
  heading?: string
  slides?: CarouselSlide[]
  autoplay?: boolean
  showDots?: boolean
  showArrows?: boolean
}

export type TableSection = {
  _type: 'tableSection'
  _key: string
  heading?: string
  headers: string[]
  rows?: { cells: string[] }[]
  striped?: boolean
  bordered?: boolean
}

export type TimelineEvent = {
  date: string
  title: string
  description?: string
  icon?: string
  highlight?: boolean
}

export type TimelineSection = {
  _type: 'timelineSection'
  _key: string
  heading?: string
  events?: TimelineEvent[]
  orientation?: 'vertical' | 'horizontal'
}

export type BannerSection = {
  _type: 'bannerSection'
  _key: string
  text: string
  ctaLabel?: string
  ctaHref?: string
  dismissible?: boolean
  color?: 'indigo' | 'amber' | 'red' | 'emerald'
}

export type TabsItem = {
  label: string
  icon?: string
  content?: PortableTextBlock[]
  image?: SanityImageAsset
}

export type TabsSection = {
  _type: 'tabsSection'
  _key: string
  heading?: string
  tabs?: TabsItem[]
}

// ─── Media & Interactive Blocks ────────────────────────────────────────────

export type ImageSection = {
  _type: 'imageSection'
  _key: string
  image: SanityImageAsset
  alt: string
  caption?: string
  maxWidth?: 'narrow' | 'medium' | 'wide' | 'full'
  rounded?: boolean
  shadow?: boolean
}

export type GalleryImage = {
  image: SanityImageAsset
  alt: string
  caption?: string
}

export type GallerySection = {
  _type: 'gallerySection'
  _key: string
  heading?: string
  images: GalleryImage[]
  layout?: 'masonry' | 'grid' | 'carousel'
  columns?: 2 | 3 | 4
  lightbox?: boolean
}

export type VideoSection = {
  _type: 'videoSection'
  _key: string
  heading?: string
  subheading?: string
  url: string
  posterImage?: SanityImageAsset
  maxWidth?: 'medium' | 'wide' | 'full'
}

export type NewsletterSection = {
  _type: 'newsletterSection'
  _key: string
  heading?: string
  subheading?: string
  placeholder?: string
  buttonLabel?: string
  successMessage?: string
  privacyText?: string
  layout?: 'centered' | 'split' | 'bar'
}

export type ContactFormField = {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
}

export type ContactSection = {
  _type: 'contactSection'
  _key: string
  heading?: string
  subheading?: string
  email?: string
  phone?: string
  address?: string
  showForm?: boolean
  formFields?: ContactFormField[]
  submitLabel?: string
  successMessage?: string
}

export type AuthHeroFeature = {
  icon?: string
  text: string
}

export type AuthHeroSection = {
  _type: 'authHeroSection'
  _key: string
  headline?: string
  badge?: string
  features?: AuthHeroFeature[]
  mode?: 'signin' | 'signup' | 'both'
}

export type LoginSection = {
  _type: 'loginSection'
  _key: string
  heading?: string
  subheading?: string
  badge?: string | null
}

export type SignupSection = {
  _type: 'signupSection'
  _key: string
  heading?: string
  subheading?: string
  badge?: string | null
}

export type NotFoundSection = {
  _type: 'notFoundSection'
  _key: string
  heading?: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
  showSearch?: boolean
}

// ─── Layout Blocks ────────────────────────────────────────────────────────

export type GridCard = {
  heading: string
  body?: string
  image?: SanityImageAsset
  icon?: string
  linkLabel?: string
  linkHref?: string
}

export type GridSection = {
  _type: 'gridSection'
  _key: string
  heading?: string
  subheading?: string
  columns?: 2 | 3 | 4
  items?: GridCard[]
  cardStyle?: 'bordered' | 'filled' | 'plain'
}

export type ColumnsSection = {
  _type: 'columnsSection'
  _key: string
  left?: PortableTextBlock[]
  right?: PortableTextBlock[]
  ratio?: '1/1' | '3/2' | '2/3' | '7/3'
  reverseOnMobile?: boolean
}

export type SpacerSection = {
  _type: 'spacerSection'
  _key: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export type DividerSection = {
  _type: 'dividerSection'
  _key: string
  style?: 'line' | 'dots' | 'invisible'
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
  | HeadingSection
  | FeatureListSection
  | TestimonialsSection
  | FaqSection
  | PricingSection
  | TeamSection
  | LogoBarSection
  | CarouselSection
  | TableSection
  | TimelineSection
  | BannerSection
  | TabsSection
  | ImageSection
  | GallerySection
  | VideoSection
  | NewsletterSection
  | ContactSection
  | AuthHeroSection
  | LoginSection
  | SignupSection
  | NotFoundSection
  | GridSection
  | ColumnsSection
  | SpacerSection
  | DividerSection
  | PostsPageSection
  | AnalyticsPageSection
  | SettingsPageSection
  | BillingPageSection
  | AdminPageSection
  | LoginPageSection
  | SignupPageSection
  | PostDetailPageSection

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
  requireAdmin?: boolean
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

// types/sanity.ts — add these new types at the bottom of your existing file
// (keep everything that's already there, just append these)

// ─── App Page Config Singletons ────────────────────────────────────────────────

export type SanityPostsPageConfig = {
  heading?: string
  subheading?: string
  groqBadgeLabel?: string
  syncButtonLabel?: string
  newPostButtonLabel?: string
  myPostsLabel?: string
  publishedLabel?: string
  draftsLabel?: string
  searchPlaceholder?: string
  colTitle?: string
  colStatus?: string
  colTags?: string
  colLastModified?: string
  emptyTitle?: string
  emptyBody?: string
  emptyCtaLabel?: string
}

export type SanityAnalyticsConfig = {
  heading?: string
  subheading?: string
  eventsLabel?: string
  usersLabel?: string
  avgSessionLabel?: string
  liveStreamLabel?: string
  refreshLabel?: string
  emptyTitle?: string
  emptyBody?: string
  featureFlagLabel?: string
}

export type SanitySettingsPageConfig = {
  heading?: string
  subheading?: string
  profileSectionLabel?: string
  displayNameLabel?: string
  emailLabel?: string
  emailHelperText?: string
  bioLabel?: string
  bioMaxLength?: number
  websiteLabel?: string
  uploadPhotoLabel?: string
  saveLabel?: string
  discardLabel?: string
  dangerZoneHeading?: string
  dangerZoneBody?: string
  dangerZoneWarning?: string
  deleteAccountLabel?: string
}

export type SanityBillingPageConfig = {
  heading?: string
  subheading?: string
  currentPlanLabel?: string
  manageLabel?: string
  cancelLabel?: string
  reactivateLabel?: string
  upgradeLabel?: string
  usageHeading?: string
  postsUsageLabel?: string
  apiUsageLabel?: string
  storageUsageLabel?: string
  seatsUsageLabel?: string
  plansHeading?: string
  freePlanName?: string
  freePlanTagline?: string
  freePlanPrice?: string
  freePlanFeatures?: string[]
  proPlanName?: string
  proPlanTagline?: string
  proPlanBadge?: string
  proPlanFeatures?: string[]
  downgradeLabel?: string
  currentPlanButtonLabel?: string
}

export type SanityAdminPageConfig = {
  heading?: string
  subheading?: string
  totalUsersLabel?: string
  colUser?: string
  colPlan?: string
  colRole?: string
  colJoined?: string
  footerNote?: string
  emptyLabel?: string
}

// ─── App page marker section types ─────────────────────────────────────────────
// Add these to your SanitySection union type too

export type PostsPageSection   = { _type: 'postsPageSection';   _key: string }
export type AnalyticsPageSection = { _type: 'analyticsPageSection'; _key: string }
export type SettingsPageSection = { _type: 'settingsPageSection'; _key: string }
export type BillingPageSection  = { _type: 'billingPageSection';  _key: string }
export type AdminPageSection    = { _type: 'adminPageSection';    _key: string }
export type LoginPageSection    = { _type: 'loginPageSection';    _key: string; heading?: string; description?: string }
export type SignupPageSection   = { _type: 'signupPageSection';   _key: string; heading?: string; description?: string }
export type PostDetailPageSection = { _type: 'postDetailPageSection'; _key: string; heading?: string; description?: string }