# ContentFlow — Claude Code Reference

## Project Overview

ContentFlow is a **CMS-driven SaaS dashboard** built as an internship assignment. It combines a public marketing/blog site with a protected user dashboard, all powered by Sanity CMS for content management.

- **Live demo**: https://contentflow--akash-sharma-weframetech.vercel.app
- **Stack**: Next.js 16.2.1 (App Router), React 19, Sanity v4.22, Supabase Auth, Stripe, PostHog
- **Languages**: TypeScript strict mode throughout
- **Path alias**: `@/` maps to project root

---

## Complete Directory Tree

```
contentflow/
├── app/
│   ├── layout.tsx                        # Root layout — Providers, Toaster, DraftModeVisualEditing. No Navbar/Footer (each page controls its own)
│   ├── page.tsx                          # English homepage (/). Fetches 'home' Sanity page, renders with Navbar+Footer
│   ├── [lang]/
│   │   ├── page.tsx                      # Polymorphic: lang homepages (/hi, /kn), EN slug pages (/login, /signup, /posts, etc.), EN post detail
│   │   └── [slug]/
│   │       └── page.tsx                  # Post detail with language variants. Renders <PostDetail> in <DashboardLayout>
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                  # OAuth (Google) + email OTP callback. Handles `code` (OAuth) and `token_hash` (email verify)
│   ├── studio/
│   │   └── [[...index]]/
│   │       ├── page.tsx                  # Sanity Studio at /studio. Checks auth+role, renders StudioClient or StudioAccessRequest
│   │       ├── _StudioClient.tsx         # Client wrapper for Sanity <Studio>. Pre-seeds localStorage with token
│   │       └── _StudioAccessRequest.tsx  # UI for non-admins: shows pending invite status or access request form
│   └── api/
│       ├── posts/
│       │   ├── route.ts                  # POST: Create post. Checks subscription limit (free=5, pro=unlimited). Uploads image+avatar to Sanity
│       │   └── [id]/route.ts             # GET/PUT/DELETE: Single post CRUD
│       ├── create-checkout-session/
│       │   └── route.ts                  # POST: Creates Stripe checkout session. Requires auth + valid plan
│       ├── stripe/
│       │   ├── prices/route.ts           # GET: Fetches active Stripe prices. Returns empty array if Stripe not configured
│       │   ├── cancel/route.ts           # POST: Cancels subscription immediately
│       │   └── portal/route.ts           # POST: Redirects to Stripe customer portal
│       ├── webhooks/
│       │   └── stripe/route.ts           # POST: Stripe webhook. Events: subscription.updated/deleted → updates profiles.subscription_tier
│       ├── analytics/
│       │   └── events/route.ts           # GET: Fetches last 50 PostHog events for auth'd user. Returns configured:false if env vars missing
│       ├── admin/
│       │   ├── invite/route.ts           # POST: Admin invites user by email → inserts into admin_invites (type='invite', status='pending')
│       │   ├── invites/
│       │   │   ├── route.ts              # GET: Lists all admin invites/requests. Joins with profiles for display names
│       │   │   └── [id]/route.ts         # PUT: Admin approves/rejects invites. Updates status + sets role in profiles
│       ├── studio/
│       │   └── request-access/route.ts   # POST: Non-admin requests studio access → inserts admin_invites (type='request')
│       ├── preview/
│       │   ├── enable/route.ts           # GET: Enables Next.js Draft Mode for Presentation Tool
│       │   └── disable/route.ts          # POST: Disables Draft Mode
│       └── delete-account/route.ts       # POST: Deletes user from Supabase auth + cascades to Sanity posts

├── features/
│   ├── admin/
│   │   ├── AdminInvitePanel.tsx          # Form: invite users by email. Calls /api/admin/invite
│   │   └── AdminUsersTable.tsx           # Table of all profiles. Columns: email, role, subscription, joined. Allows role updates
│   ├── auth/
│   │   ├── AuthShell.tsx                 # Layout wrapper centering the auth form on desktop
│   │   ├── LoginForm.tsx                 # Email/password login + Google OAuth. react-hook-form. Calls Supabase auth
│   │   └── SignupForm.tsx                # Email/password signup. Terms checkbox. Auto-creates profile
│   ├── analytics/
│   │   └── PostHogEventsClient.tsx       # Client component polling /api/analytics/events. Shows events list + metrics (live users, avg session)
│   ├── billing/
│   │   ├── BillingPageClient.tsx         # Master page: orchestrates CurrentPlanCard, PlansGrid, UsageCard. Fetches Stripe prices
│   │   ├── PlansGrid.tsx                 # Free vs pro plan cards. Upgrade/downgrade buttons. Fetches pricing from API or CMS fallback
│   │   ├── CurrentPlanCard.tsx           # Shows current subscription (free/pro/cancelling). Manage/Cancel/Reactivate buttons
│   │   ├── UsageCard.tsx                 # Usage meters: posts published, API calls, storage, team seats
│   │   └── CancelSubscriptionDialog.tsx  # Confirmation before subscription cancellation
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx           # Main layout for auth'd pages. Renders Sidebar, MobileTopBar, MobileBottomNav. Uses useUIStore
│   │   ├── Sidebar.tsx                   # Left nav. Links: Posts, Analytics, Settings, Billing, Admin (admin-only). Collapsible
│   │   ├── SidebarNav.tsx                # Navigation items list. Highlights active route
│   │   ├── SidebarFooter.tsx             # User avatar + name + sign-out at sidebar bottom
│   │   ├── SidebarLogo.tsx               # Logo/branding at sidebar top
│   │   ├── MobileTopBar.tsx              # Mobile top bar: logo + menu toggle + user avatar
│   │   ├── MobileBottomNav.tsx           # Mobile bottom tab nav: Posts, Analytics, Settings, Billing, Admin
│   │   ├── DashboardHeader.tsx           # Page title + breadcrumbs
│   │   ├── DashboardStats.tsx            # Stats cards: total posts, published, drafts
│   │   ├── EnvLogsTable.tsx              # Environment logs display (not actively used)
│   │   ├── CollapsedSignOut.tsx          # Sign out button for collapsed sidebar state
│   │   ├── ColorArchitectureCard.tsx     # Design system showcase (demo only)
│   │   ├── EditorialTypographyCard.tsx   # Design system showcase (demo only)
│   │   ├── GraphQLNodeCard.tsx           # Design system showcase (demo only)
│   │   └── InteractionLibraryCard.tsx    # Design system showcase (demo only)
│   ├── posts/
│   │   ├── PostsPageClient.tsx           # Main posts management page (client). Search (debounced), sync from Sanity, create/edit/delete modals
│   │   ├── PostsTable.tsx                # Posts table. Columns: title, status, image, tags, last modified. Row actions: view, edit, delete
│   │   ├── PostsHeader.tsx               # Page title + description
│   │   ├── PostsStatsBar.tsx             # Stats: my posts count, published, drafts
│   │   ├── PostsEmptyState.tsx           # Fallback UI when no posts. CTA to create first post
│   │   ├── PostsTableSkeleton.tsx        # Loading skeleton for posts table
│   │   ├── CreatePostModal.tsx           # Form: create post (title, excerpt, image, language, tags, featured). Calls /api/posts
│   │   ├── EditPostModal.tsx             # Form: edit existing post
│   │   ├── DeletePostDialog.tsx          # Confirmation before post deletion
│   │   ├── PostDetail.tsx                # Post detail renderer. Props: post data, nav (prev/next slugs), section configs
│   │   ├── FeaturedBanner.tsx            # Banner highlighting featured posts
│   │   └── LivePreviewClient.tsx         # Optional live preview mode integration
│   └── settings/
│       ├── ProfileForm.tsx               # Profile editor: display name, bio, website, email. Calls /api/users/{id}
│       ├── ProfileAvatar.tsx             # Avatar uploader → Supabase storage → profiles.avatar_url
│       └── DeleteAccountDialog.tsx       # Confirmation + final warning. Calls /api/delete-account

├── sections/                             # CMS Section Renderers — Sanity block type → React component
│   ├── SectionRenderer.tsx               # Main dispatcher: sectionType → component. Handles new doc refs + legacy inline objects
│   ├── _groupedExports.ts                # Barrel export for all sections
│   │
│   │   # PUBLIC / MARKETING SECTIONS
│   ├── HeroSection.tsx                   # Banner: heading, subheading, badge, CTAs. Layouts: centered or split
│   ├── CtaSection.tsx                    # CTA block: primary/secondary buttons. Themes: dark, indigo, subtle
│   ├── FeaturedPostsSection.tsx          # N featured posts in grid/list/featured layout. Fetches from Sanity
│   ├── RecentPostsSection.tsx            # Latest posts feed. Limit configurable
│   ├── RichTextSection.tsx               # PortableText content renderer
│   ├── StatsSection.tsx                  # Stats cards. Optional live post count
│   ├── FormSection.tsx                   # Generic form builder. Fields from Sanity. Actions: POST/GET
│   ├── GridSection.tsx                   # Grid of items (2/3/4 columns). Each: heading, body, icon, image, link
│   ├── ImageSection.tsx                  # Single image + caption. Max width: narrow/medium/wide/full
│   ├── GallerySection.tsx                # Image gallery. Layouts: masonry/grid/carousel. Lightbox toggle
│   ├── VideoSection.tsx                  # Embedded video. Poster image. Max width configurable
│   ├── TabsSection.tsx                   # Tabbed interface. Each tab: label, icon, content (PortableText), image
│   ├── CarouselSection.tsx               # Image carousel. Autoplay, dots, arrows toggleable
│   ├── TableSection.tsx                  # Striped/bordered table from CMS data
│   ├── TimelineTeamLogoBar.tsx           # Timeline events, team members, logo bar components
│   ├── LogoBarSection.tsx                # Scrolling logo bar (e.g., "Trusted by…")
│   ├── TeamSection.tsx                   # Team member cards with bios, social links
│   ├── PricingSection.tsx                # Pricing plans grid. Highlighted plan. Feature lists per plan
│   ├── NewsletterSection.tsx             # Newsletter signup form
│   ├── BannerSection.tsx                 # Dismissible banner alert (info/warning/error colors)
│   ├── TestimonialsSection.tsx           # Testimonials carousel/grid/single with ratings
│   ├── FaqSection.tsx                    # FAQ accordion. Layouts: accordion/open/two-col
│   ├── newSections.tsx                   # Exports: HeadingSection, FeatureListSection, ColumnsSection, SpacerSection, DividerSection, NotFoundSection
│   │
│   │   # AUTH SECTIONS
│   ├── AuthHeroSection.tsx               # Left-side hero for auth pages. Features list, graphics
│   ├── LoginSection.tsx                  # Legacy login page layout using <LoginForm>
│   ├── SignupSection.tsx                 # Legacy signup page layout using <SignupForm>
│   ├── AuthFormSection.tsx               # Unified auth section. Mode: login/signup. OAuth + email/password toggleable
│   │
│   │   # POST DETAIL SECTIONS (config-only sub-sections)
│   ├── PostDetailPageSection.tsx         # Wrapper orchestrating post detail layout
│   ├── PostDetailHeaderSection.tsx       # Config: Featured/Language badge labels
│   ├── PostDetailMetaSection.tsx         # Config: Author/Date/Unpublished labels
│   ├── PostDetailBodySection.tsx         # Config: Share/Link copied labels
│   ├── PostDetailTagsSection.tsx         # Config: Tag labels
│   ├── PostDetailBackLinkSection.tsx     # Config: Back link label, href, pagination labels
│   │
│   │   # POSTS MANAGEMENT SECTIONS (/posts page)
│   ├── PostsPageSection.tsx              # Master container for /posts page
│   ├── PostsHeaderSection.tsx            # Page title + subheading + GROQ badge
│   ├── PostsStatsSection.tsx             # Stats bar: my posts, published, drafts
│   ├── PostsActionsSection.tsx           # Action buttons: Sync, New Post
│   ├── PostsSearchSection.tsx            # Search bar. Integrates with useUIStore.postsSearchQuery
│   ├── PostsTableSection.tsx             # Post table wrapper. Config from CMS
│   │
│   │   # BILLING SECTIONS (/billing page)
│   ├── BillingSection.tsx                # Legacy master billing container
│   ├── BillingHeaderSection.tsx          # Config: page heading + subheading
│   ├── BillingCurrentPlanSection.tsx     # Config: current subscription status UI
│   ├── BillingUsageSection.tsx           # Config: usage display (posts, API, storage, seats)
│   ├── BillingPlansGridSection.tsx       # Config: plans grid display
│   ├── BillingFooterSection.tsx          # Config: footer copy (Stripe/webhook notes)
│   │
│   │   # SETTINGS SECTIONS (/settings page)
│   ├── SettingsSection.tsx               # Legacy master settings container
│   ├── SettingsHeaderSection.tsx         # Config: page heading
│   ├── SettingsInfoSection.tsx           # Config: upload photo label
│   ├── SettingsFormSection.tsx           # Config: form field labels (display name, email, bio, website, buttons)
│   ├── SettingsDangerSection.tsx         # Config: delete account section labels
│   │
│   │   # ANALYTICS / ADMIN SECTIONS
│   ├── AnalyticsSection.tsx              # Master analytics renderer. Fetches PostHog data, displays events + metrics
│   └── AdminSection.tsx                  # Master admin page. Displays users table + invite panel

├── components/
│   ├── ui/                               # shadcn/ui — Radix UI primitives + Tailwind styling
│   │   ├── button.tsx                    # Variants: primary, secondary, ghost, destructive
│   │   ├── input.tsx, textarea.tsx, label.tsx, form.tsx
│   │   ├── dialog.tsx, alert-dialog.tsx, dropdown-menu.tsx, sheet.tsx
│   │   ├── avatar.tsx, badge.tsx, separator.tsx, skeleton.tsx
│   │   ├── table.tsx, sonner.tsx
│   ├── custom/                           # Sanity component document renderers
│   │   ├── ComponentRenderer.tsx         # Dispatches componentType → layout/ or content/ sub-renderer
│   │   ├── layout/
│   │   │   ├── NavbarComponent.tsx       # Navbar from component doc. Links, CTA, auth toggle
│   │   │   ├── FooterComponent.tsx       # Footer from component doc. Columns, social links
│   │   │   ├── SidebarComponent.tsx      # App sidebar from component doc. Nav items, collapsible
│   │   │   ├── MobileNavTopComponent.tsx
│   │   │   └── MobileNavBottomComponent.tsx
│   │   └── content/
│   │       ├── GridComponent.tsx         # Grid of items. Columns (2/3/4), card styles
│   │       ├── CardsComponent.tsx        # Card grid. Layouts: grid-2/grid-3/featured/horizontal
│   │       ├── FormComponent.tsx         # Form builder. Fields, validation, submission
│   │       ├── DataTableComponent.tsx    # Tabular data. Columns, sorting, pagination
│   │       ├── PricingTableComponent.tsx # Pricing plans with billing toggle
│   │       ├── ListComponent.tsx         # List: bullet/numbered/checklist/icon/plain. Columns
│   │       └── FlexComponent.tsx         # Flex layout wrapper. Direction, wrap, gap, align, justify
│   ├── Navbar.tsx                        # Public pages navbar. Links from siteConfig. Language switcher. Auth indicator
│   ├── Footer.tsx                        # Public pages footer. Links, social icons. Dark theme
│   ├── LanguageSwitcher.tsx              # Language dropdown (EN/HI/KN). Sets ?lang= or route
│   ├── PostsListing.tsx                  # Public post list. Card layout with images
│   ├── PostFilterGrid.tsx                # Post filtering + grid. Tag filters, sorting
│   ├── DraftModeVisualEditing.tsx        # Mounts VisualEditing. Only renders inside Sanity Presentation iframe
│   ├── providers.tsx                     # Root providers: QueryClientProvider, PostHogProvider, AuthProvider
│   └── posthog-provider.tsx              # PostHog client setup

├── lib/
│   ├── sanity/
│   │   ├── client.ts                     # 3 clients: sanityClient (public CDN), sanityFreshClient (no CDN), sanityAdminClient (write, token)
│   │   ├── server-client.ts              # Draft-mode aware server client. Draft ON → previewDrafts + stega. Draft OFF → CDN
│   │   ├── queries.ts                    # All GROQ queries. POST_CARD_FIELDS, POST_FULL_FIELDS, SECTIONS_PROJECTION,
│   │   │                                 #   PAGE_BY_SLUG_AND_LANG_QUERY, POST_BY_SLUG_AND_LANG_QUERY,
│   │   │                                 #   ALL_POSTS_QUERY, MY_POSTS_QUERY, ALL_PAGE_SLUGS_QUERY, ALL_POST_SLUGS_QUERY + more
│   │   └── pageResolver.ts               # resolveContent(slug, lang) → discriminated union (page|post)
│   │                                     #   Constants: SUPPORTED_LANGUAGES ['en','hi','kn'], LANG_LABELS, isSupportedLang()
│   ├── supabase/
│   │   ├── client.ts                     # Browser-safe client. Cookie-based session. For client components
│   │   ├── server.ts                     # Server-only client. Server cookies. For route handlers + server components
│   │   └── middleware.ts                 # updateSession(). Route config:
│   │                                     #   Public: /api/*, /login, /signup, /auth/*
│   │                                     #   Protected: /posts, /analytics, /settings, /billing, /admin, /studio
│   │                                     #   Admin-only: /admin, /analytics
│   ├── utils.ts                          # cn() — clsx + tailwind-merge
│   ├── seo.ts                            # buildCanonicalPath(), buildCanonicalUrl(), buildHreflangPaths(), buildMetadata()
│   ├── stripe.ts                         # Stripe server instance. Returns null if STRIPE_SECRET_KEY not set
│   ├── email.ts                          # Email delivery via Resend. Called from welcome flows
│   └── navigation.ts                     # localizeHref(), getLocalizedLabel()

├── hooks/
│   ├── useUser.ts                        # Wrapper over AuthContext → { user, profile, isLoading }
│   └── useDebounce.ts                    # Debounce hook. Used in posts search

├── stores/
│   └── uiStore.ts                        # Zustand store. sidebarOpen, postsSearchQuery
│                                         #   toggleSidebar(), setSidebarOpen(), setPostsSearchQuery()

├── types/
│   ├── sanity.ts                         # All Sanity TypeScript types. Add new block types here
│   │                                     #   SanityPost, SanityPage, SanitySection, SanityComponent,
│   │                                     #   all section sub-types, all component sub-types
│   ├── supabase.ts                       # Auto-generated DB types. DO NOT EDIT MANUALLY
│   │                                     #   profiles table, user_role_enum (member|admin), subscription_tier_enum (free|pro)
│   └── admin.ts                          # AdminInviteType, AdminInviteStatus, AdminInvite, AdminInviteRow, AdminDatabase

├── sanity/
│   ├── schemaTypes/
│   │   ├── documents/
│   │   │   ├── page.ts                   # Page builder. Fields: title, slug, language, access (guest/user/admin),
│   │   │   │                             #   layout (home/dashboard/auth), sections[], seoTitle, seoDescription, ogImage
│   │   │   ├── post.ts                   # Blog post. Fields: title, slug, language, excerpt, body (PortableText),
│   │   │   │                             #   coverImage, publishedAt (null=draft), featured, tags[],
│   │   │   │                             #   authorId, authorName, authorEmail, authorAvatar (auto-populated)
│   │   │   ├── section.ts                # Reusable section doc. Discriminator: sectionType. One named sub-object per type
│   │   │   └── component.ts              # Reusable component doc. Discriminator: componentType
│   │   ├── sections/
│   │   │   └── systemSections/
│   │   │       ├── adminPageSections.ts
│   │   │       ├── analyticsPageSections.ts
│   │   │       ├── authPageSections.ts           # loginSection, signupSection, authFormSection, authHeroSection
│   │   │       ├── billingPageSections.ts        # billingHeader, billingCurrentPlan, billingUsage, billingPlansGrid, billingFooter
│   │   │       ├── homePageSections.ts
│   │   │       ├── postDetailPageSections.ts     # postDetailHeader, postDetailMeta, postDetailBody, postDetailTags, postDetailBackLink
│   │   │       ├── postsPageSections.ts          # postsHeader, postsStats, postsActions, postsSearch, postsTable
│   │   │       └── settingsPageSections.ts       # settingsHeader, settingsInfo, settingsForm, settingsDanger
│   │   ├── components/
│   │   │   ├── contentComponents/
│   │   │   │   ├── gridComponent.ts, cardsComponent.ts, formComponent.ts
│   │   │   │   ├── dataTableComponent.ts, pricingComponent.ts, listComponent.ts, flexComponent.ts
│   │   │   └── layoutComponents/
│   │   │       ├── navbarComponent.ts, footerComponent.ts, sidebarComponent.ts, mobileNavComponent.ts
│   │   ├── singletons/
│   │   │   └── siteConfig.ts             # Site-wide config: siteName, siteDescription, links[], languages[], branding
│   │   └── index.ts                      # Schema registry
│   ├── components/                       # Studio UI components (StudioNavbar, PreviewIframe, etc.)
│   ├── lib/                              # Studio utilities (languageStore, translations)
│   └── structure.ts                      # Custom Sanity Studio structure

├── scripts/
│   ├── seed.ts                           # Database seeding
│   └── cleanup.ts                        # Database cleanup

├── proxy.ts                              # Next.js middleware. ALWAYS_PUBLIC, ALWAYS_AUTH, ALWAYS_ADMIN path checks
├── sanity.config.tsx                     # Studio config. Plugins: structureTool, visionTool, presentationTool, documentInternationalization
│                                         #   Languages: en, hi, kn. i18n types: page, post
├── next.config.ts                        # Remote image patterns: cdn.sanity.io, supabase CDN, picsum.photos, unsplash
├── tailwind.config.ts                    # Tailwind v4 config
├── tsconfig.json                         # ES2017, ESNext, strict mode, @/* → root
└── package.json
```

---

## Architecture & Data Flows

### 1. Page Rendering Pipeline
```
Request → proxy.ts (auth check)
       → app/[lang]/page.tsx
       → lib/sanity/pageResolver.ts (resolveContent(slug, lang))
       → Sanity GROQ fetch (lib/sanity/queries.ts)
       → SectionRenderer.tsx (maps sectionType → React component)
       → Section component renders (may fetch more data or use CMS config)
```

### 2. Auth Flow
```
LoginForm / SignupForm → Supabase auth
       → app/auth/callback/route.ts (OAuth/email OTP)
       → proxy.ts → lib/supabase/middleware.ts updateSession() (every request)
       → AuthProvider (components/providers.tsx) — single Supabase subscription
       → useUser() hook → { user, profile, isLoading } (consumed everywhere)
```

### 3. Posts Management Flow
```
PostsPageClient.tsx
    → GET /api/posts → Sanity MY_POSTS_QUERY (user's posts, published + drafts)
    → CreatePostModal → POST /api/posts (upload image to Sanity, create post doc, check subscription limit)
    → EditPostModal → PUT /api/posts/[id]
    → DeletePostDialog → DELETE /api/posts/[id]
    → PostsTable renders via @tanstack/react-table
    → useUIStore.postsSearchQuery shared between PostsSearchSection (input) and PostsTable (filter)
```

### 4. CMS Draft Mode / Visual Editing
```
/api/preview/enable → draftMode().enable()
       → lib/sanity/server-client.ts switches to perspective='previewDrafts' + stega encoding
       → DraftModeVisualEditing.tsx mounts VisualEditing overlay
         (gates itself: only renders when window.self !== window.top — inside Sanity Presentation iframe)
/api/preview/disable → draftMode().disable()
```

### 5. Billing Flow
```
BillingPageClient.tsx
    → GET /api/stripe/prices → Stripe active prices
    → Upgrade: POST /api/create-checkout-session → Stripe hosted checkout
    → Manage: POST /api/stripe/portal → Stripe customer portal
    → Cancel: POST /api/stripe/cancel → immediate cancellation
    → Stripe webhook → POST /api/webhooks/stripe → updates profiles.subscription_tier in Supabase
```

### 6. Admin / Studio Access Flow
```
/studio → studio/[[...index]]/page.tsx
    → Checks Supabase auth + profile.role
    → admin → _StudioClient.tsx (full Sanity Studio, pre-seeds localStorage with token)
    → non-admin → _StudioAccessRequest.tsx
        → POST /api/studio/request-access → admin_invites (type='request', status='pending')
    → Admin approves via GET /api/admin/invites → PUT /api/admin/invites/[id] → sets profile.role='admin'
```

---

## Key Architectural Patterns

### Section Renderer Pattern
- Sanity sections are **documents** (referenced in `page.sections[]`), not inline objects
- Discriminator: `sectionType` field on the section document
- Each section type has one named sub-object (e.g., `hero`, `featuredPosts`, `authForm`)
- `SectionRenderer.tsx` maps `sectionType` → React component
- Legacy inline objects still supported for backward compat via `_type` fallback

### Component Document Pattern
- Reusable UI blocks (navbar, footer, sidebar, grid, cards, etc.) stored as Sanity documents
- Discriminator: `componentType`
- `ComponentRenderer.tsx` dispatches to `components/custom/layout/` or `components/custom/content/`
- Embedded in pages via section references

### Access Control (Layered)
| Layer | Mechanism |
|-------|-----------|
| Middleware | `proxy.ts` — ALWAYS_PUBLIC, ALWAYS_AUTH, ALWAYS_ADMIN path matching |
| Page | `page.access` field in Sanity (guest/user/admin) |
| API | Supabase auth check + role validation in every route handler |
| UI | `useUser()` hook for client-side conditional rendering |

### Multi-Language Support
- **Languages**: `en` (default, no prefix), `hi`, `kn` → `/hi/slug`, `/kn/slug`
- **Uniqueness**: (slug, language) pair — same slug allowed across languages
- **Sanity**: `@sanity/document-internationalization` plugin manages language tabs + translations UI
- **GROQ**: All queries filter by `language` field
- **Resolver**: `lib/sanity/pageResolver.ts` — `SUPPORTED_LANGUAGES`, `isSupportedLang()`
- **Nav helpers**: `lib/navigation.ts` — `localizeHref()`, `getLocalizedLabel()`

### Global State (Zustand — `stores/uiStore.ts`)
- `sidebarOpen` — sidebar visibility, toggled by `DashboardLayout` + `MobileTopBar`
- `postsSearchQuery` — bridge between `PostsSearchSection` (input writes) and `PostsTable` (filter reads)

### Auth Context at Root
- Single Supabase subscription in `AuthProvider` (components/providers.tsx)
- No per-component re-fetches → no nav flicker on navigation
- `useUser()` hook used in 16+ callsites

---

## Adding a New Content Block (Step-by-Step)

1. Schema → `sanity/schemaTypes/blocks/mySection.ts`
2. Register in `sanity/schemaTypes/index.ts`
3. Add to sections array in `sanity/schemaTypes/documents/page.ts`
4. Renderer → `sections/MySection.tsx`
5. Add case in `sections/SectionRenderer.tsx`
6. Add TypeScript type in `types/sanity.ts`

---

## Sanity CMS

- **Project ID**: `h2zl7fu3` — Dataset: `production`
- **Studio URL**: `/studio` (embedded in Next.js app)
- **API version**: `2024-01-01`
- **Draft mode**: enabled via `/api/preview/enable`

### GROQ Query Rules
- **Always** import from `lib/sanity/queries.ts` — never write inline GROQ in components
- All queries are language-aware, filtering by `language` field
- `SECTIONS_PROJECTION` fully expands section/component docs with all nested fields

```ts
// Language-aware post query pattern
*[_type == "post" && language == $lang && !(_id in path("drafts.**"))] {
  title, slug, excerpt, coverImage, publishedAt, ...
}

// Page by slug + language
*[_type == "page" && slug.current == $slug && language == $lang][0] {
  title, sections[], access, layout, ...
}
```

---

## Authentication (Supabase)

| Client | File | Use |
|--------|------|-----|
| Browser | `lib/supabase/client.ts` | Client components |
| Server | `lib/supabase/server.ts` | Route handlers + server components |
| Middleware | `lib/supabase/middleware.ts` | `updateSession()` called in proxy.ts |

### User Roles
- `member` — default, access to posts/settings/billing
- `admin` — additionally access analytics, admin panel, Sanity Studio

### Subscription Tiers
- `free` — limited to 5 posts
- `pro` — unlimited posts

### Profiles Table Fields
`id, email, display_name, bio, website, avatar_url, role, subscription_tier, stripe_customer_id, subscription_id, created_at, updated_at, feature_flags, preferences, last_seen_at, posthog_distinct_id`

---

## Stripe Billing

- **Test mode only** — test card: `4242 4242 4242 4242`
- `lib/stripe.ts` returns null if `STRIPE_SECRET_KEY` not set (graceful degradation)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-checkout-session` | POST | Start Stripe checkout |
| `/api/stripe/portal` | POST | Open billing portal |
| `/api/stripe/cancel` | POST | Cancel subscription |
| `/api/stripe/prices` | GET | Fetch active prices |
| `/api/webhooks/stripe` | POST | Handle subscription events → update profiles |

---

## PostHog Analytics

- **Client-side**: `components/providers.tsx` (PostHogProvider) + `components/posthog-provider.tsx`
- **Server-side**: `posthog-node` in API routes
- **Bridge endpoint**: `GET /api/analytics/events` — fetches last 50 events for auth'd user
- **Events tracked**: login, signup, post_viewed, post_created, upgrade_intent, etc.
- **Feature flags**: e.g., `show-featured-banner` per user (checked in `FeaturedBanner.tsx`)

---

## All API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/posts` | POST | user | Create post. Checks subscription limit (free=5) |
| `/api/posts/[id]` | GET/PUT/DELETE | user | Single post CRUD |
| `/api/create-checkout-session` | POST | user | Start Stripe checkout |
| `/api/stripe/prices` | GET | — | Fetch active Stripe prices |
| `/api/stripe/portal` | POST | user | Open billing portal |
| `/api/stripe/cancel` | POST | user | Cancel subscription |
| `/api/webhooks/stripe` | POST | — | Stripe webhook handler |
| `/api/analytics/events` | GET | user | Fetch PostHog events |
| `/api/admin/invite` | POST | admin | Invite user by email |
| `/api/admin/invites` | GET | admin | List all invites/requests |
| `/api/admin/invites/[id]` | PUT | admin | Approve/reject invite |
| `/api/studio/request-access` | POST | user | Request Studio access |
| `/api/delete-account` | POST | user | Delete user account |
| `/api/preview/enable` | GET | — | Enable Draft Mode |
| `/api/preview/disable` | POST | — | Disable Draft Mode |
| `/auth/callback` | GET | — | Supabase OAuth/email callback |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=h2zl7fu3
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
NEXT_PUBLIC_SANITY_TOKEN=
SANITY_API_READ_TOKEN=
SANITY_PREVIEW_SECRET=
SANITY_STUDIO_PROJECT_ID=h2zl7fu3
SANITY_STUDIO_DATASET=production
NEXT_PUBLIC_SANITY_STUDIO_URL=http://localhost:3333

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_PERSONAL_API_KEY=
POSTHOG_PROJECT_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Dev Commands

```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
npm run seed     # Seed database (requires .env.local)
npm run cleanup  # Clean database (requires .env.local)
```

---

## UI Conventions

| Tool | Library |
|------|---------|
| Component library | shadcn/ui (`components/ui/`) |
| Icons | Lucide React |
| Toasts | Sonner |
| Tables | TanStack React Table (`@tanstack/react-table`) |
| Forms | React Hook Form + Zod |
| Global state | Zustand (`stores/uiStore.ts`) |
| Data fetching (client) | React Query (`@tanstack/react-query`) |
| Styling | Tailwind CSS v4 (utility classes, no inline styles) |
| Themes | next-themes |

---

## TypeScript Conventions

- Path alias `@/` → project root
- All Sanity types in `types/sanity.ts` — add new block types there
- Supabase types in `types/supabase.ts` — auto-generated, **do not edit manually**
- Admin types in `types/admin.ts`
- `cn()` from `lib/utils.ts` for conditional classnames
- Client components: `'use client'` at top of file
- Server components: async functions, no `'use client'`
- API routes: always validate auth, use try-catch, return `NextResponse.json`

---

## Common Patterns

### Server Component Data Fetch
```ts
import { client } from "@/lib/sanity/client"
import { MY_QUERY } from "@/lib/sanity/queries"

const data = await client.fetch(MY_QUERY, { lang: "en" })
```

### Auth Check in Server Component
```ts
import { createClient } from "@/lib/supabase/server"

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Client Component Auth State
```ts
import { useUser } from "@/hooks/useUser"

const { user, profile, isLoading } = useUser()
```

### Conditional Classnames
```ts
import { cn } from "@/lib/utils"

className={cn("base-class", condition && "conditional-class")}
```
