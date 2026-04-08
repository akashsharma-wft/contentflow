// sections/AnalyticsSection.tsx
//
// FIX: SectionRenderer calls <AnalyticsSection lang={lang} /> but the component
// accepted no arguments. Added lang prop to the signature.
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

interface Props {
  lang?: string
}

export async function AnalyticsSection({ lang: _lang = 'en' }: Props) {
  const config = await sanityClient.fetch<AnalyticsConfig | null>(ANALYTICS_CONFIG_QUERY)

  const serverFlags = { showFeaturedBanner: false }

  return <PostHogEventsClient config={config ?? {}} serverFlags={serverFlags} />
}