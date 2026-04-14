# ContentFlow

A CMS-driven SaaS dashboard built with Next.js 16, Sanity v4, Supabase Auth, Stripe billing, and PostHog analytics. Combines a public multilingual marketing/blog site with a protected user dashboard — all content managed through an embedded Sanity Studio.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router) |
| UI | React 19.2.4, Tailwind CSS v4 |
| Components | shadcn/ui, Radix UI, Lucide React |
| CMS | Sanity v4.22.0, next-sanity 11.6.12 |
| Auth | Supabase Auth + SSR (@supabase/ssr 0.9.0) |
| Database | Supabase (PostgreSQL) |
| Billing | Stripe 20.4.1 (test mode) |
| Analytics | PostHog (posthog-js + posthog-node) |
| Email | Resend 6.11.0 |
| Forms | React Hook Form 7 + Zod 4 |
| Tables | TanStack React Table 8 |
| State | Zustand 5, TanStack React Query 5 |
| i18n | @sanity/document-internationalization |
| Toasts | Sonner 2 |
| Language | TypeScript (strict) |

---

## Project Structure

```
contentflow/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # English homepage (/)
│   ├── layout.tsx                    # Root layout — Providers, Toaster, Visual Editing
│   ├── globals.css
│   ├── [lang]/
│   │   ├── page.tsx                  # /hi, /kn homepages
│   │   └── [slug]/page.tsx           # Dynamic pages + posts (i18n)
│   ├── auth/callback/route.ts        # Supabase OAuth callback
│   ├── studio/[[...index]]/
│   │   ├── page.tsx                  # Studio auth gate (server component)
│   │   ├── _StudioClient.tsx         # Mounts NextStudio with pre-seeded token
│   │   └── _StudioAccessRequest.tsx  # Access request/invite UI for non-admins
│   └── api/                          # All API routes (see below)
│
├── features/                         # Feature modules
│   ├── admin/components/             # AdminUsersTable, AdminInvitePanel
│   ├── analytics/components/         # PostHogEventsClient
│   ├── auth/components/              # AuthShell, LoginForm, SignupForm
│   ├── billing/components/           # BillingPageClient, PlansGrid, CurrentPlanCard,
│   │                                 #   UsageCard, CancelSubscriptionDialog
│   ├── dashboard/components/         # DashboardLayout, DashboardHeader, DashboardStats
│   │                                 #   Sidebar, SidebarNav, SidebarLogo, SidebarFooter
│   │                                 #   MobileTopBar, MobileBottomNav, CollapsedSignOut
│   │                                 #   EnvLogsTable + 4 design card components
│   ├── posts/components/             # PostsPageClient, PostDetail, PostsTable,
│   │                                 #   PostsHeader, PostsStatsBar, PostsTableSkeleton
│   │                                 #   CreatePostModal, EditPostModal, DeletePostDialog
│   │                                 #   FeaturedBanner, PostsEmptyState, LivePreviewClient
│   └── settings/components/          # ProfileForm, ProfileAvatar, DeleteAccountDialog
│
├── sections/                         # Sanity section renderers (45+)
│   ├── SectionRenderer.tsx           # Maps _type → component
│   ├── HeroSection.tsx               # ...and all other section files
│   └── _groupedExports.ts
│
├── components/
│   ├── ui/                           # shadcn/ui: Button, Input, Dialog, Table, Badge,
│   │                                 #   Avatar, Sheet, AlertDialog, Form, Textarea,
│   │                                 #   DropdownMenu, Skeleton, Separator, Sonner
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── LanguageSwitcher.tsx
│   ├── PostFilterGrid.tsx
│   ├── PostsListing.tsx
│   └── providers.tsx                 # Auth, React Query, PostHog, Theme providers
│
├── lib/
│   ├── sanity/
│   │   ├── client.ts                 # Static Sanity client
│   │   ├── server-client.ts          # Draft-mode-aware Sanity client
│   │   ├── queries.ts                # All GROQ queries (posts, pages, site config)
│   │   └── pageResolver.ts           # Page path + access control resolver
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client (async cookies)
│   │   └── middleware.ts             # updateSession() for session refresh
│   ├── email.ts                      # Resend invite email + dark HTML template
│   ├── navigation.ts                 # localizeHref(), nav role + icon helpers
│   ├── stripe.ts                     # Stripe instance
│   ├── seo.ts                        # buildMetadata() helper
│   └── utils.ts                      # cn() (clsx + tailwind-merge)
│
├── sanity/
│   ├── schemaTypes/
│   │   ├── documents/                # page.ts, post.ts, section.ts, component.ts
│   │   ├── singletons/               # siteConfig.ts
│   │   └── sections/
│   │       ├── systemSections/       # homePageSections, authPageSections,
│   │       │                         #   postsPageSections, postDetailPageSections,
│   │       │                         #   billingPageSections, settingsPageSections,
│   │       │                         #   adminPageSections, analyticsPageSections
│   │       └── customSections/       # Additional custom section schemas
│   ├── lib/
│   │   ├── languageStore.ts
│   │   └── translations.ts
│   ├── components/                   # Custom Sanity Studio components
│   └── structure.ts                  # Studio sidebar structure
│
├── hooks/
│   ├── useUser.ts                    # Auth state + profile (user, profile, loading)
│   └── useDebounce.ts
│
├── stores/
│   └── uiStore.ts                    # Zustand: sidebar open/close
│
├── types/
│   ├── sanity.ts                     # All Sanity TypeScript types
│   ├── supabase.ts                   # Auto-generated Supabase DB types (do not edit)
│   └── admin.ts                      # AdminInvite types + AdminDatabase type
│
├── supabase/
│   └── migrations/
│       └── 001_admin_invites.sql     # admin_invites table + RLS policies
│
├── proxy.ts                          # Next.js middleware (session + route protection)
├── sanity.config.tsx                 # Sanity Studio configuration
├── next.config.ts                    # Next.js config + image domains
└── tsconfig.json
```

---

## Routes

### Public Routes

| Route | Description |
|---|---|
| `/` | English homepage (Sanity page builder) |
| `/[lang]` | Language homepage — `/hi`, `/kn` |
| `/[lang]/[slug]` | Any CMS-driven page or post (all languages) |

### Protected Routes (require auth)

Middleware enforces login for these path prefixes: `/posts` · `/settings` · `/billing` · `/analytics` · `/admin` · `/studio`

### Admin-Only Routes

`/admin` · `/analytics` — additionally require `profiles.role === 'admin'`

### Sanity Studio

| Route | Description |
|---|---|
| `/studio` | Embedded Sanity Studio (admin only) |

Non-admins visiting `/studio` see a gated request-access screen. Admins bypass Sanity's own login via a pre-seeded localStorage token + `unstable_noAuthBoundary`.

---

## API Routes

| Endpoint | Method(s) | Description |
|---|---|---|
| `/api/admin/invite` | POST | Admin invites or directly promotes a user |
| `/api/admin/invites` | GET | List all pending invites + access requests |
| `/api/admin/invites/[id]` | PATCH | Approve / reject / cancel an invite |
| `/api/analytics/events` | GET | Fetch PostHog analytics events |
| `/api/create-checkout-session` | POST | Start Stripe Checkout for Pro upgrade |
| `/api/delete-account` | DELETE | Delete user account + associated data |
| `/api/posts` | POST | Create a new post (synced to Sanity) |
| `/api/posts/[id]` | PATCH, DELETE | Update or delete a post |
| `/api/preview/enable` | GET | Enable Sanity draft mode |
| `/api/preview/disable` | GET | Disable Sanity draft mode |
| `/api/stripe/cancel` | POST | Cancel Stripe subscription |
| `/api/stripe/portal` | POST | Open Stripe billing portal |
| `/api/stripe/prices` | GET | Fetch available Stripe prices |
| `/api/studio/request-access` | POST | Non-admin requests studio access |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/auth/callback` | GET | Supabase OAuth callback |

---

## Authentication

- Browser client: `lib/supabase/client.ts`
- Server client: `lib/supabase/server.ts` (async cookies, App Router compatible)
- Middleware: `proxy.ts` → `updateSession()` in `lib/supabase/middleware.ts`
- Auth hook: `hooks/useUser.ts` — returns `{ user, profile, loading }`

### Roles (`profiles.role`)

| Role | Access |
|---|---|
| `member` | Posts, Settings, Billing |
| `admin` | All above + Analytics, Admin panel, Sanity Studio |

`profiles.role` is the only source of truth for role checks — no secondary role system.

### Subscription Tiers (`profiles.subscription_tier`)

| Tier | Limit |
|---|---|
| `free` | 5 published posts |
| `pro` | Unlimited posts |

---

## Admin Invite Flow

The Admin page has an invite/grant form. Behaviour branches on the target email:

**`akash.sharma@weframetech.com` — email invite path**
1. Insert `admin_invites` row (`type='invite'`, `status='pending'`)
2. Send a real email via Resend with a CTA linking to `/login?redirectTo=/studio`
3. If email fails → roll back the DB row → show error toast
4. Admin separately approves the pending request to promote the role
5. Toast shown: *"Email invite sent"*

**Any other email — direct grant path**
1. Look up the profile by email — returns error toast if no account exists yet
2. Directly update `profiles.role = 'admin'`
3. Insert an `approved` audit record in `admin_invites` for history
4. Toast shown: *"Admin access granted directly"*

### Studio Access States for Non-Admins

| State | Screen shown |
|---|---|
| No record | Request-access form |
| Pending invite (invited by admin) | "Invite Pending Approval" |
| Pending request (self-submitted) | "Request Pending" |
| Approved | "Access Approved — Reload Page" |
| Rejected | Re-request form |

When an invited user first visits `/studio`, their `user_id` is auto-linked on the invite row so approval can promote them correctly.

---

## Sanity CMS

- **Project ID:** `h2zl7fu3` — Dataset: `production`
- **Studio:** embedded at `/studio`
- **API version:** `2024-01-01`
- **Draft mode:** `/api/preview/enable`

### Document Types

| Type | Description |
|---|---|
| `page` | CMS page builder — sections[], access control, layout type, i18n |
| `post` | Blog posts — title, slug, excerpt, tags, body (portable text), coverImage, author |
| `section` | Reusable section blocks (discriminated by sectionType) |
| `component` | Reusable layout components (navbar, footer, sidebar, etc.) |
| `siteConfig` | Global site settings singleton |

### Page Builder Sections (45+)

**Marketing:** HeroSection, CarouselSection, GallerySection, RichTextSection, ImageSection, GridSection, TableSection, TabsSection, StatsSection, TimelineTeamLogoBar, CtaSection, FormSection, VideoSection

**Blog:** FeaturedPostsSection, RecentPostsSection, PostsPageSection, PostDetailPageSection (+ sub-sections for header, body, meta, tags, back-link)

**App Pages:** AuthHeroSection, LoginSection, SignupSection, AdminSection, AnalyticsSection, SettingsFormSection, SettingsDangerSection, BillingCurrentPlanSection, BillingPlansGridSection, BillingUsageSection

### Adding a New Section

1. Schema → `sanity/schemaTypes/sections/customSections/mySection.ts`
2. Register in `sanity/schemaTypes/index.ts`
3. Add to `sections[]` in the relevant page schema
4. Renderer → `sections/MySection.tsx`
5. Add case in `sections/SectionRenderer.tsx`
6. Add TypeScript type in `types/sanity.ts`

---

## Internationalization

| Language | Code | URL prefix |
|---|---|---|
| English | `en` | `/` (no prefix) |
| Hindi | `hi` | `/hi/` |
| Kannada | `kn` | `/kn/` |

- Sanity documents carry a `language` field managed by `@sanity/document-internationalization`
- All GROQ queries in `lib/sanity/queries.ts` are language-aware
- Nav localization via `lib/navigation.ts` — `localizeHref()`, `getLocalizedLabel()`

---

## Stripe Billing

- Test mode only — use card `4242 4242 4242 4242`
- Checkout: `POST /api/create-checkout-session`
- Portal: `POST /api/stripe/portal`
- Cancel: `POST /api/stripe/cancel`
- Webhook: `POST /api/webhooks/stripe` — updates `profiles.subscription_tier`

---

## PostHog Analytics

- Client-side: `components/providers.tsx` (PostHogProvider) + `components/posthog-provider.tsx`
- Server-side: `posthog-node` in API routes
- Events tracked: `login`, `signup`, `post_viewed`, `post_created`, `upgrade_intent`, etc.
- Feature flags: e.g., `show-featured-banner` per user
- Admin analytics view: `features/analytics/PostHogEventsClient.tsx`

---

## Database

### `profiles` table

Key fields: `id`, `email`, `display_name`, `role` (member/admin), `subscription_tier` (free/pro), `avatar_url`, `stripe_customer_id`

> Auto-generated types in `types/supabase.ts` — do not edit manually.

### `admin_invites` table

Defined in `supabase/migrations/001_admin_invites.sql`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | TEXT | Target email |
| `user_id` | UUID | FK → auth.users (nullable until sign-up) |
| `type` | TEXT | `invite` or `request` |
| `status` | TEXT | `pending`, `approved`, `rejected`, `cancelled` |
| `message` | TEXT | Optional note |
| `invited_by` | UUID | Admin who sent the invite |
| `reviewed_by` | UUID | Admin who approved/rejected |
| `reviewed_at` | TIMESTAMPTZ | Review timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

RLS enabled — users can view their own rows. All writes use the service-role client (bypasses RLS).

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
SANITY_API_TOKEN=                       # Full-access token (mutations)
NEXT_PUBLIC_SANITY_TOKEN=               # Read-only viewer token (draft streaming)
SANITY_API_READ_TOKEN=                  # Read-only token (server queries)
SANITY_PREVIEW_SECRET=                  # Preview mode secret
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

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=                      # Optional — defaults to onboarding@resend.dev

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Dev Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## Conventions

### TypeScript

- Path alias `@/` → project root
- Sanity types → `types/sanity.ts`
- Supabase types → `types/supabase.ts` (auto-generated, never edit manually)
- Admin workflow types → `types/admin.ts`
- `cn()` utility from `lib/utils.ts` for conditional classnames (clsx + tailwind-merge)

### GROQ Queries

All queries live in `lib/sanity/queries.ts`. Never write inline GROQ in components.

```ts
// Language-aware post query pattern
*[_type == "post" && language == $lang && !(_id in path("drafts.**"))] {
  title, slug, excerpt, coverImage, publishedAt, ...
}
```

### Auth in Server Components

```ts
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Sanity Data Fetch in Server Components

```ts
import { client } from '@/lib/sanity/client'
import { MY_QUERY } from '@/lib/sanity/queries'

const data = await client.fetch(MY_QUERY, { lang: 'en' })
```

### Allowed Remote Image Domains

- `cdn.sanity.io`
- `qyzgcwwoehpeietxrqrh.supabase.co`
- `picsum.photos`
- `images.unsplash.com`
