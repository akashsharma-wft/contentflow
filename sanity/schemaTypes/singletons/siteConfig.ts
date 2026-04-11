// sanity/schemaTypes/singletons/siteConfig.ts
// Single site configuration document — one document for the whole site.
// Stable ID: 'site-config'

import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Site Config',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Browser Tab Title',
      type: 'string',
      description: 'Displayed in the browser tab.',
      initialValue: 'ContentFlow',
      validation: R => R.required(),
    }),
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description: 'Brand name shown in the header and footer.',
      initialValue: 'ContentFlow',
      validation: R => R.required(),
    }),
  ],
  preview: {
    select: { title: 'title', siteName: 'siteName' },
    prepare: ({ title, siteName }) => ({
      title:    title ?? 'Site Config',
      subtitle: siteName ?? '—',
      media:    CogIcon,
    }),
  },
})
