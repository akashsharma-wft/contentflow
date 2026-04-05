// sections/BillingSection.tsx
import { sanityClient } from '@/lib/sanity/client'
import { BILLING_PAGE_CONFIG_QUERY } from '@/lib/sanity/queries'
import { BillingPageClient } from '@/features/billing/components/BillingPageClient'

export type BillingConfig = {
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

export async function BillingSection() {
  const config = await sanityClient.fetch<BillingConfig | null>(BILLING_PAGE_CONFIG_QUERY)
  return <BillingPageClient config={config ?? {}} />
}