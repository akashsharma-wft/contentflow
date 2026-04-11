// sanity/schemaTypes/documents/component.ts
// Reusable UI component — building block for custom sections.

import { defineField, defineType } from 'sanity'
import { CodeIcon } from '@sanity/icons'
import { getStudioLanguage } from '../../lib/languageStore'

const LANGUAGE_OPTIONS = [
  { title: 'English',          value: 'en' },
  { title: 'Hindi — हिंदी',    value: 'hi' },
  { title: 'Kannada — ಕನ್ನಡ', value: 'kn' },
]

const COMPONENT_TYPES = [
  { title: 'Button',    value: 'button'    },
  { title: 'Input',     value: 'input'     },
  { title: 'Select',    value: 'select'    },
  { title: 'Container', value: 'container' },
  { title: 'Form',      value: 'form'      },
  { title: 'Grid',      value: 'grid'      },
]

export const componentType = defineType({
  name: 'component',
  title: 'Component',
  type: 'document',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
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
      name: 'type',
      title: 'Type',
      type: 'string',
      options: { list: COMPONENT_TYPES, layout: 'radio' },
      validation: R => R.required(),
    }),
    defineField({
      name: 'config',
      title: 'Config',
      description: 'Key-value pairs that configure this component.',
      type: 'object',
      fields: [
        defineField({ name: 'label',       title: 'Label',       type: 'string' }),
        defineField({ name: 'placeholder', title: 'Placeholder', type: 'string' }),
        defineField({ name: 'variant',     title: 'Variant',     type: 'string' }),
        defineField({ name: 'className',   title: 'Class Names', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { name: 'name', type: 'type' },
    prepare: ({ name, type }) => ({
      title:    name ?? 'Unnamed Component',
      subtitle: type ?? '—',
      media:    CodeIcon,
    }),
  },
})
