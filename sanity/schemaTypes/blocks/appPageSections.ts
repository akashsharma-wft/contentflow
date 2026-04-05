// sanity/schemaTypes/blocks/appPageSections.ts
// Marker blocks for app pages (posts, analytics, settings, billing, admin).
// These blocks have no editable fields — all copy comes from their
// corresponding singleton config documents. They exist purely to tell
// the SectionRenderer which page component to render.
import { defineType } from 'sanity'

export const postsPageSection = defineType({
  name: 'postsPageSection',
  title: 'Posts Page',
  type: 'object',
  fields: [],
  preview: { prepare: () => ({ title: '📄 Posts Page Content' }) },
})

export const analyticsPageSection = defineType({
  name: 'analyticsPageSection',
  title: 'Analytics Page',
  type: 'object',
  fields: [],
  preview: { prepare: () => ({ title: '📊 Analytics Page Content' }) },
})

export const settingsPageSection = defineType({
  name: 'settingsPageSection',
  title: 'Settings Page',
  type: 'object',
  fields: [],
  preview: { prepare: () => ({ title: '⚙️ Settings Page Content' }) },
})

export const billingPageSection = defineType({
  name: 'billingPageSection',
  title: 'Billing Page',
  type: 'object',
  fields: [],
  preview: { prepare: () => ({ title: '💳 Billing Page Content' }) },
})

export const adminPageSection = defineType({
  name: 'adminPageSection',
  title: 'Admin Page',
  type: 'object',
  fields: [],
  preview: { prepare: () => ({ title: '🛡️ Admin Page Content' }) },
})