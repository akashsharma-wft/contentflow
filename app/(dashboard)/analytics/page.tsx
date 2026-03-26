// ─── app/(dashboard)/analytics/page.tsx ──────────────────────────────────────
// PostHog Events dashboard — shows live event stream and feature flag status.
// Uses PostHog Node SDK server-side for feature flag evaluation.
import { PostHogEventsClient } from '@/features/analytics/components/PostHogEventsClient'
import { PostHog } from 'posthog-node'

export const metadata = { title: 'PostHog Events — ContentFlow' }

  async function getFeatureFlags(userId: string) {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      return { showFeaturedBanner: false } // always return boolean, never undefined
    }

    const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    })

    const showFeaturedBanner = await client.isFeatureEnabled('show-featured-banner', userId)
    await client.shutdown()

    return { showFeaturedBanner: showFeaturedBanner === true } // coerce to boolean
  }

export default async function AnalyticsPage() {
  // For server-side flag evaluation we need a user ID
  // Using a placeholder — in real app you'd get this from the session
  const flags = await getFeatureFlags('server-evaluation')

  return <PostHogEventsClient serverFlags={flags} />
}