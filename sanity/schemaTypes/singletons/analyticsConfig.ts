// sanity/schemaTypes/singletons/analyticsConfig.ts
import { defineType, defineField } from 'sanity'

// SINGLETON: Analytics Page Configuration
// Controls all copy/labels for the /analytics page.
// PostHog API keys are kept in env vars (server-side only) — never stored here.
export const analyticsConfig = defineType({
  name: 'analyticsConfig',
  title: 'Analytics Page',
  type: 'document',
  fields: [
    defineField({ name: 'heading', title: 'Page Heading', type: 'string', initialValue: 'PostHog Events' }),
    defineField({ name: 'subheading', title: 'Page Subheading', type: 'string', initialValue: 'Real-time Telemetry / Production Pipeline' }),
    defineField({ name: 'eventsLabel', title: '"Events Today" Card Label', type: 'string', initialValue: 'Events Today' }),
    defineField({ name: 'usersLabel', title: '"Unique Users" Card Label', type: 'string', initialValue: 'Unique Users' }),
    defineField({ name: 'avgSessionLabel', title: '"Avg. Session" Card Label', type: 'string', initialValue: 'Avg. Session' }),
    defineField({ name: 'liveStreamLabel', title: 'Live Stream Section Label', type: 'string', initialValue: 'Live event stream' }),
    defineField({ name: 'refreshLabel', title: 'Refresh Button Label', type: 'string', initialValue: 'Refresh' }),
    defineField({ name: 'emptyTitle', title: 'Empty State Title', type: 'string', initialValue: 'No events yet' }),
    defineField({ name: 'emptyBody', title: 'Empty State Body', type: 'string', initialValue: 'Events will appear here as users interact with your app. Make sure PostHog is initialized correctly.' }),
    defineField({ name: 'featureFlagLabel', title: 'Feature Flag Section Label', type: 'string', initialValue: 'Feature flag: show-featured-banner' }),
  ],
  preview: { prepare: () => ({ title: 'Analytics Page' }) },
})