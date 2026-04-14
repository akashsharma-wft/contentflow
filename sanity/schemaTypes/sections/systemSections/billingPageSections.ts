// sanity/schemaTypes/sections/systemSections/billingPageSections.ts
//
// Field definitions for the /billing dashboard page.
// Exported as a flat array — spread into the `section` document's fields array.
//
// Sections: billingHeader · billingCurrentPlan · billingUsage · billingPlansGrid · billingFooter
//
// All text fields are plain strings. Multilingual support is achieved by
// creating one section document per language (en / hi / kn) in the seed.

import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

export const billingPageSectionFields = [

  // ── Billing Header ───────────────────────────────────────────────────────────
  defineField({
    name: 'billingHeader',
    title: 'Billing Header',
    description: 'Page heading and subheading shown at the top of /billing.',
    type: 'object',
    ...shownFor('billingHeader'),
    fields: [
      defineField({ name: 'heading',    title: 'Heading',    type: 'string', initialValue: 'Billing & Plans' }),
      defineField({ name: 'subheading', title: 'Subheading', type: 'string', initialValue: 'Manage your subscription, view usage metrics, and upgrade your workspace.' }),
    ],
  }),

  // ── Billing Current Plan ─────────────────────────────────────────────────────
  defineField({
    name: 'billingCurrentPlan',
    title: 'Current Plan Card',
    description: 'Labels for the current plan card: section header, badge text, action buttons.',
    type: 'object',
    ...shownFor('billingCurrentPlan'),
    fields: [
      defineField({ name: 'currentPlanLabel',     title: 'Section Label',              type: 'string', initialValue: 'Current Plan' }),
      defineField({ name: 'activeBadgeLabel',     title: 'Active Badge',               type: 'string', initialValue: 'Active' }),
      defineField({ name: 'cancellingBadgeLabel', title: 'Cancelling Badge',            type: 'string', initialValue: 'Cancelling' }),
      defineField({ name: 'freeTierBadgeLabel',   title: 'Free Tier Badge',             type: 'string', initialValue: 'Free Tier' }),
      defineField({ name: 'manageLabel',          title: 'Manage Subscription Button',  type: 'string', initialValue: 'Manage subscription' }),
      defineField({ name: 'cancelLabel',          title: 'Cancel Button',               type: 'string', initialValue: 'Cancel' }),
      defineField({ name: 'reactivateLabel',      title: 'Reactivate Button',           type: 'string', initialValue: 'Reactivate' }),
      defineField({ name: 'upgradeLabel',         title: 'Upgrade Button (free tier)',  type: 'string', initialValue: 'Upgrade to Pro' }),
      defineField({
        name: 'cancellingNote',
        title: 'Cancelling Notice',
        description: 'Shown below the plan name when a cancellation is scheduled. The end-date is appended automatically.',
        type: 'string',
        initialValue: 'After that, your account reverts to Free.',
      }),
    ],
  }),

  // ── Billing Usage ────────────────────────────────────────────────────────────
  defineField({
    name: 'billingUsage',
    title: 'Usage Card',
    description: 'Labels for the "Usage this month" usage-metrics card.',
    type: 'object',
    ...shownFor('billingUsage'),
    fields: [
      defineField({ name: 'usageHeading',     title: 'Card Heading',         type: 'string', initialValue: 'Usage this month' }),
      defineField({ name: 'postsUsageLabel',  title: 'Posts Published Label',type: 'string', initialValue: 'Posts Published' }),
      defineField({ name: 'apiUsageLabel',    title: 'API Requests Label',   type: 'string', initialValue: 'API Requests' }),
      defineField({ name: 'storageUsageLabel',title: 'Storage Usage Label',  type: 'string', initialValue: 'Storage Utilization' }),
      defineField({ name: 'seatsUsageLabel',  title: 'Team Seats Label',     type: 'string', initialValue: 'Team Seats' }),
    ],
  }),

  // ── Billing Plans Grid ───────────────────────────────────────────────────────
  defineField({
    name: 'billingPlansGrid',
    title: 'Plans Grid',
    description: 'All text for the Free and Pro plan cards and their action buttons.',
    type: 'object',
    ...shownFor('billingPlansGrid'),
    fields: [
      defineField({ name: 'plansHeading', title: 'Section Heading', type: 'string', initialValue: 'Plans' }),

      // Free plan
      defineField({ name: 'freePlanName',    title: 'Free Plan — Name',    type: 'string', initialValue: 'Free' }),
      defineField({ name: 'freePlanTagline', title: 'Free Plan — Tagline', type: 'string', initialValue: 'For individuals starting their editorial journey.' }),
      defineField({ name: 'freePlanPrice',   title: 'Free Plan — Price',   type: 'string', initialValue: '$0' }),
      defineField({
        name: 'freePlanFeatures',
        title: 'Free Plan — Feature List',
        type: 'array',
        of: [{ type: 'string' }],
        initialValue: ['5 Published Posts', '1,000 API calls', 'Community Support'],
      }),

      // Pro plan
      defineField({ name: 'proPlanName',    title: 'Pro Plan — Name (fallback)',  type: 'string', initialValue: 'Pro' }),
      defineField({ name: 'proPlanTagline', title: 'Pro Plan — Tagline',          type: 'string', initialValue: 'Unleash the full potential of high-performance content delivery.' }),
      defineField({ name: 'proPlanBadge',   title: 'Pro Plan — Badge Text',       type: 'string', initialValue: 'Most Popular' }),
      defineField({
        name: 'proPlanFeatures',
        title: 'Pro Plan — Feature List',
        type: 'array',
        of: [{ type: 'string' }],
        initialValue: ['Unlimited Posts', '10,000 API calls', 'Priority Email Support', 'Team Collaboration (5 seats)'],
      }),

      // Buttons
      defineField({ name: 'upgradeLabel',           title: 'Upgrade Button',               type: 'string', initialValue: 'Upgrade to Pro' }),
      defineField({ name: 'downgradeLabel',         title: 'Downgrade Button',             type: 'string', initialValue: 'Downgrade' }),
      defineField({ name: 'downgradeScheduledLabel',title: 'Downgrade Scheduled Label',    type: 'string', initialValue: 'Downgrade scheduled' }),
      defineField({ name: 'currentPlanButtonLabel', title: 'Current Plan Button Label',    type: 'string', initialValue: 'Current Plan' }),
    ],
  }),

  // ── Billing Footer ───────────────────────────────────────────────────────────
  defineField({
    name: 'billingFooter',
    title: 'Billing Footer',
    description: 'Small footer row shown below the plans grid (Stripe + webhook note).',
    type: 'object',
    ...shownFor('billingFooter'),
    fields: [
      defineField({ name: 'stripeNote',  title: 'Stripe Note',  type: 'string', initialValue: 'Billing Portal Powered by Stripe' }),
      defineField({ name: 'webhookNote', title: 'Webhook Note', type: 'string', initialValue: 'Webhook: /api/webhooks/stripe' }),
    ],
  }),

]
