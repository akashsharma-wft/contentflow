# ContentFlow — Claude Code Reference

## Project Overview

ContentFlow is a **CMS-driven SaaS dashboard** built as an internship assignment. It combines a public marketing/blog site with a protected user dashboard, all powered by Sanity CMS for content management.

- **Live demo**: https://contentflow--akash-sharma-weframetech.vercel.app
- **Stack**: Next.js 16.2.1 (App Router), React 19, Sanity v4.22, Supabase Auth, Stripe, PostHog
- **Languages**: TypeScript strict mode throughout

---

## Current State (commit efc54e8)

> App routes for `(auth)`, `(dashboard)`, `posts/[slug]`, and `[lang]/posts/[slug]` are **not yet created**. Feature modules, sections, schemas, and API routes are all in place — the Next.js page files wiring them together still need to be built.

---

## Architecture at a Glance

```
Next.js App Router
├── /                    → Public home (Sanity page builder)
├── /[lang]/[slug]       → i18n dynamic pages (Sanity page builder)
├── /studio/             → Embedded Sanity Studio
└── /api/                → Backend endpoints (all implemented)

Feature modules (not yet wired to routes):
├── features/auth/       → LoginForm, SignupForm, AuthShell
├── features/dashboard/  → DashboardLayout, Sidebar, Header
├── features/posts/      → PostsPageClient, PostsTable, modals
├── features/settings/   → ProfileForm, DeleteAccountDialog
├── features/billing/    → BillingPageClient, PlansGrid
├── features/analytics/  → PostHogEventsClient
└── features/admin/      → AdminUsersTable
```

### Core Data Flow
- **Content**: Sanity → GROQ queries → Server/Client Components
- **Auth**: Supabase SSR → Middleware route protection → `useUser` hook
- **Billing**: Stripe Checkout → Webhook → Supabase `profiles` table
- **Analytics**: PostHog events from client + server components

---

## Directory Structure

```
app/
  [lang]/page.tsx         # i18n home page
  [lang]/[slug]/page.tsx  # i18n dynamic page builder
  auth/callback/          # OAuth callback
  api/                    # REST endpoints + webhooks (all implemented)
  studio/[[...index]]/    # Sanity Studio embedded
  layout.tsx              # Root layout
  page.tsx                # Public home page
  globals.css

  ⚠ NOT YET CREATED:
  (auth)/login|signup     # Auth routes
  (dashboard)/            # Protected: posts, settings, billing, analytics, admin
  posts/[slug]/           # Public post detail
  [lang]/posts/[slug]/    # i18n post detail

components/               # Shared UI components
  ui/                     # shadcn/ui: button, input, label, table, avatar, badge,
                          #   dialog, sheet, alert-dialog, form, textarea, dropdown-menu,
                          #   sonner, skeleton, separator
  Navbar.tsx
  Footer.tsx
  LanguageSwitcher.tsx
  PostFilterGrid.tsx
  PostsListing.tsx
  providers.tsx           # Auth, React Query, PostHog, Theme providers
  posthog-provider.tsx

features/
  auth/components/        # AuthShell, LoginForm, SignupForm
  dashboard/components/   # DashboardLayout, Sidebar, SidebarNav, SidebarFooter,
                          #   SidebarLogo, DashboardHeader, DashboardStats,
                          #   MobileBottomNav, MobileTopBar, CollapsedSignOut,
                          #   ColorArchitectureCard, EditorialTypographyCard,
                          #   EnvLogsTable, GraphQLNodeCard, InteractionLibraryCard
  posts/components/       # PostsPageClient, PostsTable, PostsHeader, PostsStatsBar,
                          #   CreatePostModal, EditPostModal, DeletePostDialog,
                          #   PostDetail, LivePreviewClient, FeaturedBanner,
                          #   PostsEmptyState, PostsTableSkeleton
  billing/components/     # BillingPageClient, CurrentPlanCard, PlansGrid,
                          #   UsageCard, CancelSubscriptionDialog
  settings/components/    # ProfileForm, ProfileAvatar, DeleteAccountDialog
  analytics/components/   # PostHogEventsClient
  admin/components/       # AdminUsersTable

sections/                 # Sanity page builder section renderers
  SectionRenderer.tsx     # Maps block type → component
  HeroSection.tsx
  AuthHeroSection.tsx
  CtaSection.tsx
  RichTextSection.tsx
  StatsSection.tsx
  FeaturedPostsSection.tsx
  RecentPostsSection.tsx
  PostDetailPageSection.tsx
  PostsPageSection.tsx
  AnalyticsSection.tsx
  SettingsSection.tsx
  BillingSection.tsx
  AdminSection.tsx
  LoginSection.tsx
  SignupSection.tsx
  CarouselSection.tsx
  FormSection.tsx
  GallerySection.tsx
  GridSection.tsx
  ImageSection.tsx
  TableSection.tsx
  TabsSection.tsx
  TimelineTeamLogoBar.tsx
  VideoSection.tsx
  newSections.tsx
  _groupedExports.ts

lib/
  sanity/
    client.ts             # Public Sanity client
    server-client.ts      # Server-side Sanity client
    queries.ts            # All GROQ queries (i18n-aware)
    pageResolver.ts       # Page resolver utility
  supabase/
    client.ts             # Browser Supabase client
    server.ts             # Server Supabase client (async cookies)
    middleware.ts         # updateSession() logic
  navigation.ts           # localizeHref(), getLocalizedLabel()
  stripe.ts               # Stripe instance
  seo.ts                  # SEO utilities
  utils.ts                # cn() utility (clsx + tailwind-merge)

sanity/
  schemaTypes/
    documents/page.ts     # Page builder schema
    post.ts               # Blog post schema
    blocks/               # appPageSections, contentBlocks, ctaSection,
                          #   featuredPostsSection, formSection, heroSection,
                          #   layoutBlocks, mediaAndInteractiveBlocks,
                          #   recentPostsSection, richTextSection, statsSection,
                          #   postsPageSection
    singletons/           # siteConfig, authConfig, authPageConfigs, billingPageConfig,
                          #   postsPageConfig, settingsPageConfig, analyticsConfig,
                          #   adminPageConfig
    primitives/           # button, link, badge, imageBlock, videoEmbed
    index.ts              # Schema registry

hooks/
  useUser.ts              # Auth state + profile from Supabase
  useDebounce.ts

stores/
  uiStore.ts              # Zustand: sidebar open/close state

types/
  sanity.ts               # All Sanity schema TS types
  supabase.ts             # Auto-generated Supabase DB types (do not edit)

scripts/
  seed.ts
  cleanup.ts
```

---

## Key Files

| File | Purpose |
|------|---------|
| [proxy.ts](proxy.ts) | Next.js middleware — session refresh + route protection |
| [lib/supabase/middleware.ts](lib/supabase/middleware.ts) | `updateSession()` logic |
| [lib/sanity/queries.ts](lib/sanity/queries.ts) | All GROQ queries (i18n-aware) |
| [lib/navigation.ts](lib/navigation.ts) | `localizeHref()`, `getLocalizedLabel()` |
| [sanity.config.tsx](sanity.config.tsx) | Studio config + i18n plugin |
| [sanity/schemaTypes/documents/page.ts](sanity/schemaTypes/documents/page.ts) | Page builder schema |
| [sections/SectionRenderer.tsx](sections/SectionRenderer.tsx) | Maps Sanity block type → React component |
| [components/providers.tsx](components/providers.tsx) | Auth, React Query, PostHog, Theme providers |
| [hooks/useUser.ts](hooks/useUser.ts) | Auth state + profile from Supabase |
| [types/sanity.ts](types/sanity.ts) | All Sanity TypeScript types |
| [types/supabase.ts](types/supabase.ts) | Auto-generated DB types |

---

## Routes Still To Build

These app route files need to be created to wire the existing feature modules to pages:

| Route file | Feature module to use |
|-----------|----------------------|
| `app/(auth)/login/page.tsx` | `features/auth/LoginForm` |
| `app/(auth)/signup/page.tsx` | `features/auth/SignupForm` |
| `app/(dashboard)/layout.tsx` | `features/dashboard/DashboardLayout` |
| `app/(dashboard)/posts/page.tsx` | `features/posts/PostsPageClient` |
| `app/(dashboard)/settings/page.tsx` | `features/settings/ProfileForm` |
| `app/(dashboard)/billing/page.tsx` | `features/billing/BillingPageClient` |
| `app/(dashboard)/analytics/page.tsx` | `features/analytics/PostHogEventsClient` |
| `app/(dashboard)/admin/page.tsx` | `features/admin/AdminUsersTable` |
| `app/posts/[slug]/page.tsx` | `features/posts/PostDetail` |
| `app/[lang]/posts/[slug]/page.tsx` | `features/posts/PostDetail` (i18n) |

---

## Sanity CMS

- **Project ID**: `h2zl7fu3` — dataset: `production`
- **Studio URL**: `/studio` (embedded in Next.js app)
- **API version**: `2024-01-01`
- **Draft mode**: enabled via `/api/preview/enable`

### Schema Types
- **Documents**: `post`, `page` (with i18n language field)
- **Singletons**: `siteConfig`, `authConfig`, `authPageConfigs`, `postsPageConfig`, `billingPageConfig`, `settingsPageConfig`, `analyticsConfig`, `adminPageConfig`
- **Block groups**: `heroSection`, `ctaSection`, `richTextSection`, `statsSection`, `featuredPostsSection`, `recentPostsSection`, `formSection`, `contentBlocks`, `layoutBlocks`, `mediaAndInteractiveBlocks`, `appPageSections`, `postsPageSection`

### Adding New Content Blocks
1. Create block schema in `sanity/schemaTypes/blocks/`
2. Register in `sanity/schemaTypes/index.ts`
3. Add to the `sections` array in `sanity/schemaTypes/documents/page.ts`
4. Create section renderer in `sections/`
5. Add case to `sections/SectionRenderer.tsx`
6. Add TypeScript type to `types/sanity.ts`

---

## Internationalization

- **Languages**: English (`en`, default), Hindi (`hi`), Kannada (`kn`)
- **URL pattern**: `/{lang}/...` (e.g., `/hi/about`)
- **Default route**: `/` = English (no lang prefix)
- **Sanity**: `@sanity/document-internationalization` plugin adds language field + Studio UI
- **GROQ queries**: All filter by `language` field
- **Nav localization**: `lib/navigation.ts` — `localizeHref()` and `getLocalizedLabel()`

---

## Authentication (Supabase)

- Browser client: `lib/supabase/client.ts`
- Server client: `lib/supabase/server.ts` (async cookies)
- Middleware: `proxy.ts` → `updateSession()` from `lib/supabase/middleware.ts`
- Protected routes (to be enforced): `/posts`, `/settings`, `/billing`, `/analytics`, `/admin`
- Admin routes: additionally check `profile.role === 'admin'`
- Auth hook: `hooks/useUser.ts` — returns `{ user, profile, loading }`

### User Roles (Supabase enum)
- `member` — default, access to posts/settings/billing
- `admin` — additionally access analytics + admin panel

### Subscription Tiers (Supabase enum)
- `free` — limited post count
- `pro` — unlimited posts

---

## Stripe Billing

- Test mode only — use test card `4242 4242 4242 4242`
- Checkout: `POST /api/create-checkout-session`
- Portal: `POST /api/stripe/portal`
- Cancel: `POST /api/stripe/cancel`
- Webhook: `POST /api/webhooks/stripe` — updates `profiles.subscription_tier`
- Stripe instance: `lib/stripe.ts`

---

## PostHog Analytics

- Client-side: `components/providers.tsx` (PostHogProvider) + `components/posthog-provider.tsx`
- Server-side: `posthog-node` in API routes
- Events tracked: login, signup, post_viewed, post_created, upgrade_intent, etc.
- Feature flags: e.g., `show-featured-banner` per user
- Admin view: `features/analytics/PostHogEventsClient.tsx`

---

## API Routes (all implemented)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/posts` | GET/POST | Fetch/create posts |
| `/api/posts/[id]` | GET | Single post by ID |
| `/api/create-checkout-session` | POST | Start Stripe checkout |
| `/api/stripe/portal` | POST | Open billing portal |
| `/api/stripe/cancel` | POST | Cancel subscription |
| `/api/stripe/prices` | GET | Fetch Stripe prices |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/analytics/events` | POST | Track PostHog event |
| `/api/delete-account` | POST | Delete user account |
| `/api/preview/enable` | GET | Enable Sanity draft mode |
| `/api/preview/disable` | POST | Disable Sanity draft mode |
| `/auth/callback` | GET | Supabase OAuth callback |

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
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run seed         # Seed database (requires .env.local)
npm run cleanup      # Clean database (requires .env.local)
```

---

## TypeScript Conventions

- Path alias `@/` maps to project root
- All Sanity types in `types/sanity.ts` — add new block types there
- Supabase types in `types/supabase.ts` — auto-generated, do not edit manually
- `cn()` utility from `lib/utils.ts` for conditional classnames (clsx + tailwind-merge)

---

## UI Conventions

- Component library: **shadcn/ui** (`components/ui/`)
- Icons: **Lucide React**
- Toasts: **Sonner**
- Tables: **TanStack React Table** (`@tanstack/react-table`)
- Forms: **React Hook Form + Zod**
- Global state: **Zustand** (`stores/uiStore.ts` — sidebar open/close)
- Styling: **Tailwind CSS v4** — use utility classes, avoid inline styles
- Themes: **next-themes**

---

## Sanity GROQ Query Patterns

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

Always import from `lib/sanity/queries.ts` — do not write inline GROQ in components.

---

## Common Patterns

### Server Component data fetch
```ts
import { client } from "@/lib/sanity/client"
import { MY_QUERY } from "@/lib/sanity/queries"

const data = await client.fetch(MY_QUERY, { lang: "en" })
```

### Auth check in Server Component
```ts
import { createClient } from "@/lib/supabase/server"

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Adding a new page builder section
1. Schema → `sanity/schemaTypes/blocks/mySection.ts`
2. Register in `sanity/schemaTypes/index.ts`
3. Add to `sanity/schemaTypes/documents/page.ts` sections array
4. Renderer → `sections/MySection.tsx`
5. Case in `sections/SectionRenderer.tsx`
6. Type in `types/sanity.ts`
