import { defineField, defineType } from 'sanity'

// BLOCK: CTA Section
// A call-to-action block. Use for "Get started", "Upgrade to Pro", etc.
// Supports heading, body, primary + optional secondary button, theme, and alignment.
export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'CTA Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body Text',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'primaryButton',
      title: 'Primary Button',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'string' }),
      ],
    }),
    defineField({
      name: 'secondaryButton',
      title: 'Secondary Button (optional)',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'string' }),
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Background Theme',
      type: 'string',
      options: {
        list: [
          { title: 'Dark', value: 'dark' },
          { title: 'Indigo (default)', value: 'indigo' },
          { title: 'Subtle (border)', value: 'subtle' },
        ],
        layout: 'radio',
      },
      initialValue: 'indigo',
    }),
    defineField({
      name: 'centered',
      title: 'Center-align text?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }) {
      return { title: `CTA: ${heading ?? 'Untitled'}` }
    },
  },
})
