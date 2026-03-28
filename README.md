# 🚀 ContentFlow — CMS-Driven SaaS Dashboard

> Weframetech Advanced Frontend Assignment
> Built as a production-style full-stack application using the complete Weframetech stack

---

## 🌐 Live Demo

* 🔗 **App:** https://contentflow--akash-sharma-weframetech.vercel.app
* 🎥 **Loom Walkthrough:** 

---

## 📌 Overview

**ContentFlow** is a CMS-driven SaaS dashboard designed for internal content teams to manage:

* 📝 Blog content (via Sanity CMS)
* 👤 User profiles (via Supabase)
* 💳 Subscription plans (via Stripe)
* 📊 Product analytics (via PostHog)

This project simulates a **real production system**, focusing on:

* scalability
* security
* separation of concerns
* async system design

---

## 🎯 What This Project Covers

This project intentionally touches **every layer of a modern SaaS product**:

* Authentication & session management (SSR)
* CMS integration (headless architecture)
* Client/server data boundaries
* Subscription billing with webhooks
* Analytics and feature flags
* Form handling with validation + async state

---

# 🏗️ Feature Breakdown (By Assignment Phases)

---

## 🔐 Phase 1 — Authentication & Dashboard Shell

### ✅ Implemented

* Supabase SSR auth (email + password)
* Google OAuth login
* Route protection via middleware
* Persistent Zustand sidebar (no component state)
* Custom `useUser()` hook (centralized user state)
* Auto profile creation via Supabase trigger

### 🧠 Key Decisions

* Used **@supabase/ssr** to ensure secure session handling across server + middleware
* Sidebar state stored in Zustand with selector pattern to avoid unnecessary re-renders

---

## 📝 Phase 2 — CMS + Data Fetching

### ✅ Implemented

* Sanity CMS with structured post schema
* Centralized GROQ queries (`sanity/queries.ts`)
* Posts list via TanStack Query (`['posts']`)
* DataTable with sorting, filtering, and badges
* Debounced search (custom hook)
* Server Component for `/posts/[slug]`
* PortableText rendering
* PostHog event: `post_viewed`

### 🧠 Key Decisions

* Used **client-side fetching (React Query)** for list (better UX)
* Used **Server Components** for detail page (better performance + SEO)

---

## ⚙️ Phase 3 — Settings & Profile Management

### ✅ Implemented

* Zod schema with full validation rules
* React Hook Form + shadcn Form integration
* Prefilled form via React Query
* Mutation with query invalidation
* Avatar upload via Supabase Storage
* Toast feedback on success
* Account deletion flow (with confirmation dialog)

### 🧠 Key Decisions

* Used `reset()` after async fetch to avoid stale defaultValues issue
* Used mutation lifecycle (`onSuccess`) to keep UI in sync

---

## 💳 Phase 4 — Stripe Billing

### ✅ Implemented

* Subscription tier system (`free` / `pro`)
* Billing page with plan display
* Checkout session API route (server-side only)
* Stripe webhook handler (signature verified ✅)
* Upgrade flow with loading states

### 📊 Events Tracked

* `stripe_checkout_start`
* `stripe_checkout_success`
* `stripe_checkout_cancel`
* `upgrade_intent`
* `upgrade_completed`

### 🧠 Key Decisions

* All Stripe logic handled server-side (no secret leakage)
* Webhook route excluded from middleware (required for Stripe)

---

## ⭐ Bonus Features

* ✅ PostHog Feature Flag: `show-featured-banner`
* Displays highlighted featured post dynamically

---

# 🧱 Architecture & Structure

## 📁 Folder Structure (Assignment-Compliant)

```id="struct1"
app/
  (auth)/login
  (dashboard)/
    layout.tsx
    dashboard/
    posts/
    settings/
    billing/
  api/

features/
lib/
stores/
hooks/
components/
types/
```

---

## 🔁 Data Flow Example

```id="flow1"
User Action → API Route → External Service → DB → React Query Cache → UI
```

Example:

```id="flow2"
Upgrade → Stripe Checkout → Webhook → Supabase Update → UI Refetch
```

---

# ⚙️ Tech Stack (With Intent)

| Technology     | Why It Was Used                |
| -------------- | ------------------------------ |
| Next.js 16     | App Router + Server Components |
| Supabase       | Auth + DB + Storage            |
| Sanity         | Headless CMS                   |
| Stripe         | Subscription billing           |
| TanStack Query | Client-side caching            |
| Zustand        | Lightweight global state       |
| Zod + RHF      | Type-safe forms                |
| PostHog        | Analytics + feature flags      |
| shadcn/ui      | Consistent UI system           |

---

# 🔐 Security Considerations

* ✅ Supabase SSR session validation
* ✅ Protected routes via middleware
* ✅ Stripe webhook signature verification
* ✅ No secrets exposed to client
* ✅ Service role key used only server-side

---

# ⚠️ What Works vs Limitations

## ✅ Fully Working

* Auth flow (email + OAuth)
* Dashboard navigation + persistence
* CMS posts (list + detail)
* Profile update + avatar upload
* Stripe checkout (test mode)
* Webhook → DB sync
* Analytics tracking

---

## ⚠️ Limitations / Tradeoffs

* Stripe in test mode only
* Limited RBAC (no full admin panel)
* Sanity Studio kept external (not embedded)

---

# ⚖️ Architectural Decisions

### 1. Standalone Sanity Studio

* Keeps dashboard lightweight and secure
* Avoids exposing content management surface publicly

### 2. Client + Server Data Split

* React Query for interactive data
* Server Components for static/content-heavy pages

### 3. Stripe via Webhooks

* Ensures reliable backend-driven state updates
* Avoids trusting client-side payment state

### 4. Minimal RBAC

* Simplified for assignment scope
* Prevents misuse of service role keys on client

---

# 📊 PostHog Events

* Auth: `login_success`, `signup_success`
* Content: `post_viewed`, `post_create`, `post_edit`
* Billing: `upgrade_intent`, `upgrade_completed`
* UX: `search_performed`, `feature_banner_viewed`

---

# 🧪 Setup Instructions

## 1. Clone & Install

```bash id="setup1"
git clone <repo-url>
cd contentflow
npm install
```

---

## 2. Environment Variables

```env id="env1"
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

---

## 3. Run Locally

```bash id="run1"
npm run dev
```

---

# 🧠 Key Learnings

## 1. Server vs Client Boundaries

Understanding when to use Server Components vs client fetching was critical for performance and security.

## 2. Auth is Infrastructure

SSR auth with middleware is significantly more robust than client-only approaches.

## 3. Async Systems (Stripe)

Webhooks introduce eventual consistency — UI must handle delayed updates.

## 4. Data Fetching Strategy

TanStack Query is a caching layer, not just a fetch tool.

## 5. Forms Are Complex Systems

Handling async data + validation + UI state requires careful orchestration.

---

# 🔍 What I Would Improve

* Add retry logic for failed API calls
* Improve global error handling
* Add admin dashboard (RBAC)

---

# ✅ Assignment Checklist

* ✅ All 4 phases implemented
* ✅ Folder structure followed
* ✅ No secrets committed
* ✅ Auth flow works end-to-end
* ✅ Stripe flow works (test mode)
* ✅ PostHog events tracked
* ✅ Zustand state persists

---

# 👨‍💻 Author

**Akash Sharma**
Weframetech Advanced Frontend Assignment

---

> Built with a focus on **real-world engineering practices**, not just feature completion.