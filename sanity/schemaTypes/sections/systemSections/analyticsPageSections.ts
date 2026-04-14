// sanity/schemaTypes/sections/systemSections/analyticsPageSections.ts
//
// Field definitions for the /analytics dashboard page.
// Exported as a flat array — spread into the `section` document's fields array.
//
// Sections: analytics
//
// All text fields are plain strings. Multilingual support is achieved by
// creating one section document per language (en / hi / kn) in the seed.

import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

export const analyticsPageSectionFields = [

  // ── Analytics section (mounts PostHogEventsClient) ───────────────────────
  defineField({
    name: 'analytics',
    title: 'Analytics Content',
    description: 'Labels and copy shown on the /analytics page. Create one per language.',
    type: 'object',
    ...shownFor('analytics'),
    fields: [
      // ── Header ────────────────────────────────────────────────────────────
      defineField({
        name: 'heading',
        title: 'Heading',
        description: 'Main page heading — e.g. "PostHog Events"',
        type: 'string',
        initialValue: 'PostHog Events',
      }),
      defineField({
        name: 'subheading',
        title: 'Subheading',
        description: 'Monospace tag line below the heading.',
        type: 'string',
        initialValue: 'Real-time Telemetry / Production Pipeline',
      }),

      // ── Stat cards ────────────────────────────────────────────────────────
      defineField({
        name: 'eventsLabel',
        title: 'Stat: Events Today Label',
        type: 'string',
        initialValue: 'Events Today',
      }),
      defineField({
        name: 'usersLabel',
        title: 'Stat: Unique Users Label',
        type: 'string',
        initialValue: 'Unique Users',
      }),
      defineField({
        name: 'avgSessionLabel',
        title: 'Stat: Avg. Session Label',
        type: 'string',
        initialValue: 'Avg. Session',
      }),

      // ── Live event stream ─────────────────────────────────────────────────
      defineField({
        name: 'liveStreamLabel',
        title: 'Live Stream Heading',
        type: 'string',
        initialValue: 'Live event stream',
      }),
      defineField({
        name: 'refreshLabel',
        title: 'Refresh Button Label',
        type: 'string',
        initialValue: 'Refresh',
      }),

      // ── Empty state ───────────────────────────────────────────────────────
      defineField({
        name: 'emptyTitle',
        title: 'Empty State Title',
        type: 'string',
        initialValue: 'No events yet',
      }),
      defineField({
        name: 'emptyBody',
        title: 'Empty State Body',
        type: 'string',
        initialValue: 'Events will appear here as users interact with your app.',
      }),

      // ── Feature flag card ─────────────────────────────────────────────────
      defineField({
        name: 'featureFlagLabel',
        title: 'Feature Flag Label',
        description: 'Label shown next to the feature flag toggle.',
        type: 'string',
        initialValue: 'Feature flag: show-featured-banner',
      }),
      defineField({
        name: 'featureFlagEnabledNote',
        title: 'Feature Flag Enabled Note',
        description: 'Helper text shown when the flag is enabled.',
        type: 'string',
        initialValue: 'Enabled — evaluated server-side via PostHog Node SDK',
      }),
      defineField({
        name: 'featureFlagDisabledNote',
        title: 'Feature Flag Disabled Note',
        description: 'Helper text shown when the flag is disabled.',
        type: 'string',
        initialValue: 'Disabled — toggle in PostHog dashboard to enable',
      }),

      // ── Pagination ───────────────────────────────────────────────────────
      defineField({
        name: 'showingLabel',
        title: 'Pagination: Showing Label',
        description: 'Prefix for the "Showing X–Y / Z" count line.',
        type: 'string',
        initialValue: 'Showing',
      }),
      defineField({
        name: 'prevLabel',
        title: 'Pagination: Previous Button Label',
        type: 'string',
        initialValue: 'Prev',
      }),
      defineField({
        name: 'nextLabel',
        title: 'Pagination: Next Button Label',
        type: 'string',
        initialValue: 'Next',
      }),

      // ── Footer row ────────────────────────────────────────────────────────
      defineField({
        name: 'connectedLabel',
        title: 'Connected Status Label',
        description: 'Small status label — e.g. "Connected to PostHog".',
        type: 'string',
        initialValue: 'Connected to PostHog',
      }),
      defineField({
        name: 'ctaLabel',
        title: 'CTA Button Label',
        description: 'Label on the "open PostHog dashboard" button.',
        type: 'string',
        initialValue: 'Configure_PostHog',
      }),
    ],
  }),

]
