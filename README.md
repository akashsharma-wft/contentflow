# ContentFlow

A modern, CMS-driven SaaS dashboard built as a Weframetech internship assignment. ContentFlow leverages a robust tech stack to deliver a seamless content management experience, integrating authentication, analytics, billing, and editorial workflows in a single Next.js 16 application.

---

## 🚀 Live Demo
[https://contentflow--akash-sharma-weframetech.vercel.app](https://contentflow--akash-sharma-weframetech.vercel.app)

---

## 📚 Project Overview
ContentFlow is a full-featured SaaS dashboard for managing posts, users, and billing. It combines a Next.js 16 App Router frontend with a headless Sanity CMS backend, Supabase for authentication and storage, Stripe for billing, and PostHog for analytics and feature flags. The project demonstrates best practices in modern React, API integration, and scalable architecture.

---

## 🛠️ Tech Stack

| Layer         | Technology                                    |
|--------------|-----------------------------------------------|
| Framework    | Next.js 16 (App Router, Turbopack)            |
| Language     | TypeScript                                    |
| Styling      | Tailwind CSS, shadcn/ui                       |
| Data Fetch   | TanStack Query v5                             |
| State Mgmt   | Zustand                                       |
| Validation   | Zod + React Hook Form                         |
| Auth/DB      | Supabase (auth, database, storage)            |
| CMS          | Sanity (GROQ queries, PortableText)           |
| Payments     | Stripe (subscriptions, webhooks)              |
| Analytics    | PostHog (feature flags, event tracking)        |

---

## ⚡ Setup Steps

1. **Clone the repo:**
   ```sh
   git clone https://github.com/your-username/contentflow.git
   cd contentflow
   ```
2. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   ```
3. **Configure environment variables:**
   Create a `.env.local` file with the following keys (values not included):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SANITY_PROJECT_ID=
   NEXT_PUBLIC_SANITY_DATASET=
   SANITY_API_TOKEN=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   NEXT_PUBLIC_POSTHOG_KEY=
   NEXT_PUBLIC_POSTHOG_HOST=
   ```
4. **Run the development server:**
   ```sh
   pnpm dev
   # or
   npm run dev
   ```

---

## 📁 Folder Structure

- `app/` — Next.js App Router pages, layouts, and API routes
- `components/` — UI primitives and providers (shadcn/ui)
- `features/` — Feature modules (auth, analytics, billing, dashboard, posts, settings)
- `hooks/` — Custom React hooks
- `lib/` — Utility libraries (stripe, sanity, supabase)
- `public/` — Static assets
- `stores/` — Zustand state stores
- `types/` — TypeScript types

---

## ✅ What Works
- Email + Google OAuth login (Supabase)
- Collapsible sidebar (Zustand state)
- Posts list from Sanity (TanStack Query, GROQ)
- Skeleton loading and debounced search
- Featured banner (PostHog feature flag)
- Create/Edit post modals (Sanity API)
- Single post page (Server Component, PortableText)
- Profile settings with avatar upload (Supabase Storage)
- Stripe checkout and billing with real usage data
- PostHog analytics and feature flags

---

## ⏭️ What's Skipped and Why
- **Sanity Studio not embedded:** Standalone Studio used for schema management and editorial workflows, keeping dashboard bundle lean and secure.
- **No granular author model:** Posts use flat author fields for simplicity; multi-author or reference models omitted for scope.
- **No advanced RBAC:** Service role key used only for account deletion to avoid exposing sensitive permissions in client.
- **Stripe webhook route excluded from middleware:** Ensures Stripe can POST without auth/session checks, as required for webhooks.
- **No SSR for all pages:** Some pages use client-side data fetching for simplicity and demo speed.

---

## 🏗️ Architectural Decisions
- **Standalone Sanity Studio:** Editorial workflows and schema changes are managed outside the main app for security and performance.
- **Flat author fields in posts:** Simplifies data model and avoids unnecessary joins for a single-user demo.
- **Service role for account deletion:** Only used server-side to securely delete user data from Supabase.
- **Webhook route excluded from middleware:** Stripe webhooks require unauthenticated access; route is explicitly excluded from Next.js middleware.

---

## 📊 PostHog Events Tracked
- `login_success` / `login_failure`
- `signup_success` / `signup_failure`
- `post_create` / `post_edit` / `post_delete`
- `profile_update`
- `stripe_checkout_start` / `stripe_checkout_success` / `stripe_checkout_cancel`
- `feature_banner_viewed`
- `search_performed`

---

## 🐞 Known Issues
- Stripe test mode only; no production payments.
- No email verification for Supabase signups.
- No granular user roles or permissions.
- Some error states are minimally handled for brevity.
- Sanity Studio and API tokens must be managed securely outside the repo.

---

## 📬 Questions?
For technical review or questions, please contact Akash Sharma.
