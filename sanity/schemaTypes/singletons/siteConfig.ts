// sanity/schemaTypes/singletons/siteConfig.ts
// Per-language site configuration. Create one document per language (en / hi / kn).

import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'
import { getStudioLanguage } from '../../lib/languageStore'

const LANGUAGE_OPTIONS = [
  { title: 'English',          value: 'en' },
  { title: 'Hindi — हिंदी',    value: 'hi' },
  { title: 'Kannada — ಕನ್ನಡ', value: 'kn' },
]

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Site Config',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Displayed in the browser tab.',
      initialValue: 'ContentFlow',
      validation: R => R.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      initialValue: () => getStudioLanguage(),
      options: { list: LANGUAGE_OPTIONS, layout: 'radio' },
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
    select: { title: 'title', language: 'language' },
    prepare: ({ title, language }) => ({
      title:    title ?? 'Site Config',
      subtitle: language?.toUpperCase() ?? '—',
      media:    CogIcon,
    }),
  },
})
