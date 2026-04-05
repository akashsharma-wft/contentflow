// sanity/schemaTypes/singletons/billingPageConfig.ts
import { defineType, defineField } from 'sanity'

export const billingPageConfig = defineType({
  name: 'billingPageConfig',
  title: 'Billing Page',
  type: 'document',
  groups: [
    { name: 'copy', title: 'Copy & Labels', default: true },
    { name: 'usage', title: 'Usage Labels' },
    { name: 'plans', title: 'Plans Content' },
  ],
  fields: [
    // Header
    defineField({ name: 'heading', title: 'Page Heading', group: 'copy', type: 'string', initialValue: 'Billing & Plans' }),
    defineField({ name: 'subheading', title: 'Page Subheading', group: 'copy', type: 'string', initialValue: 'Manage your subscription, view usage metrics, and upgrade your workspace.' }),
    defineField({ name: 'currentPlanLabel', title: '"Current Plan" Label', group: 'copy', type: 'string', initialValue: 'Current Plan' }),
    defineField({ name: 'manageLabel', title: 'Manage Subscription Button Label', group: 'copy', type: 'string', initialValue: 'Manage subscription' }),
    defineField({ name: 'cancelLabel', title: 'Cancel Button Label', group: 'copy', type: 'string', initialValue: 'Cancel' }),
    defineField({ name: 'reactivateLabel', title: 'Reactivate Button Label', group: 'copy', type: 'string', initialValue: 'Reactivate' }),
    defineField({ name: 'upgradeLabel', title: 'Upgrade to Pro Button Label', group: 'copy', type: 'string', initialValue: 'Upgrade to Pro' }),
    // Usage
    defineField({ name: 'usageHeading', title: '"Usage this month" Heading', group: 'usage', type: 'string', initialValue: 'Usage this month' }),
    defineField({ name: 'postsUsageLabel', title: 'Posts Published Label', group: 'usage', type: 'string', initialValue: 'Posts Published' }),
    defineField({ name: 'apiUsageLabel', title: 'API Requests Label', group: 'usage', type: 'string', initialValue: 'API Requests' }),
    defineField({ name: 'storageUsageLabel', title: 'Storage Utilization Label', group: 'usage', type: 'string', initialValue: 'Storage Utilization' }),
    defineField({ name: 'seatsUsageLabel', title: 'Team Seats Label', group: 'usage', type: 'string', initialValue: 'Team Seats' }),
    // Plans section
    defineField({ name: 'plansHeading', title: 'Plans Section Heading', group: 'plans', type: 'string', initialValue: 'Plans' }),
    defineField({ name: 'freePlanName', title: 'Free Plan Name', group: 'plans', type: 'string', initialValue: 'Free' }),
    defineField({ name: 'freePlanTagline', title: 'Free Plan Tagline', group: 'plans', type: 'string', initialValue: 'For individuals starting their editorial journey.' }),
    defineField({ name: 'freePlanPrice', title: 'Free Plan Price Display', group: 'plans', type: 'string', initialValue: '$0' }),
    defineField({
      name: 'freePlanFeatures', title: 'Free Plan Features', group: 'plans', type: 'array', of: [{ type: 'string' }],
      initialValue: ['5 Published Posts', '1,000 API calls', 'Community Support'],
    }),
    defineField({ name: 'proPlanName', title: 'Pro Plan Name', group: 'plans', type: 'string', initialValue: 'ContentFlow Pro' }),
    defineField({ name: 'proPlanTagline', title: 'Pro Plan Tagline', group: 'plans', type: 'string', initialValue: 'Unleash the full potential of high-performance content delivery.' }),
    defineField({ name: 'proPlanBadge', title: 'Pro Plan Badge Label', group: 'plans', type: 'string', initialValue: 'Most Popular' }),
    defineField({
      name: 'proPlanFeatures', title: 'Pro Plan Features', group: 'plans', type: 'array', of: [{ type: 'string' }],
      initialValue: ['Unlimited Posts', '10,000 API calls', 'Priority Email Support', 'Team Collaboration (5 seats)'],
    }),
    defineField({ name: 'downgradeLabel', title: 'Downgrade Button Label', group: 'plans', type: 'string', initialValue: 'Downgrade' }),
    defineField({ name: 'currentPlanButtonLabel', title: '"Current Plan" Button Label (inactive)', group: 'plans', type: 'string', initialValue: 'Current Plan' }),
  ],
  preview: { prepare: () => ({ title: 'Billing Page' }) },
})