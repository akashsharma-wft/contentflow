// sections/AnalyticsSection.tsx
// Server component — fetches analyticsConfig from Sanity and passes labels
// to the client component. PostHog keys stay in env vars, never exposed to client.
import { sanityClient } from '@/lib/sanity/client'
import { ANALYTICS_CONFIG_QUERY } from '@/lib/sanity/queries'
import { PostHogEventsClient } from '@/features/analytics/components/PostHogEventsClient'

export type AnalyticsConfig = {
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

export async function AnalyticsSection() {
  const config = await sanityClient.fetch<AnalyticsConfig | null>(ANALYTICS_CONFIG_QUERY)

  // Feature flag evaluated server-side
  // (PostHog Node SDK would go here — currently using client-side check)
  const serverFlags = { showFeaturedBanner: false }

  return <PostHogEventsClient config={config ?? {}} serverFlags={serverFlags} />
}