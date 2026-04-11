// sanity/schemaTypes/documents/section.ts
// Custom reusable section — composed from component references.
// Drop a reference to one of these into any page's sections array.
// The `page` field categorises this section so Studio can filter by page.

import { defineField, defineType } from 'sanity'
import { StackCompactIcon } from '@sanity/icons'
import { getStudioLanguage } from '../../lib/languageStore'

const LANGUAGE_OPTIONS = [
  { title: 'English',          value: 'en' },
  { title: 'Hindi — हिंदी',    value: 'hi' },
  { title: 'Kannada — ಕನ್ನಡ', value: 'kn' },
]

const PAGE_OPTIONS = [
  { title: 'Home',     value: 'home'     },
  { title: 'Login',    value: 'login'    },
  { title: 'Sign Up',  value: 'signup'   },
  { title: 'Posts',    value: 'posts'    },
  { title: 'Settings', value: 'settings' },
  { title: 'Billing',  value: 'billing'  },
  { title: 'Admin',    value: 'admin'    },
]

export const sectionType = defineType({
  name: 'section',
  title: 'Section',
  type: 'document',
  icon: StackCompactIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      description: 'Which page this section belongs to (used to group sections in Studio).',
      type: 'string',
      options: { list: PAGE_OPTIONS },
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
      name: 'components',
      title: 'Components',
      description: 'UI components that make up this section.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'component' }] }],
    }),
  ],
  preview: {
    select: { title: 'title', language: 'language', page: 'page' },
    prepare: ({ title, language, page }) => ({
      title:    title ?? 'Untitled Section',
      subtitle: [page, language?.toUpperCase()].filter(Boolean).join(' · ') || '—',
      media:    StackCompactIcon,
    }),
  },
})
