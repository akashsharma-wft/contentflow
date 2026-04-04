import { defineField, defineType } from 'sanity'

// BLOCK: Stats Section
// Displays a grid of metric cards (1-6 stats).
// First stat can optionally auto-populate from live Sanity post count.
export const statsSection = defineType({
  name: 'statsSection',
  title: 'Stats Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              description: 'e.g. "1,200+" or "99%"',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              description: 'e.g. "Articles Published"',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description (optional)',
              type: 'string',
            }),
            defineField({
              name: 'useLivePostCount',
              title: 'Use live post count?',
              description: 'Auto-populates value with current published post count',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { value: 'value', label: 'label' },
            prepare({ value, label }) {
              return { title: value, subtitle: label }
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1).max(6),
    }),
  ],
  preview: {
    select: { heading: 'heading', stats: 'stats' },
    prepare({ heading, stats }) {
      return {
        title: heading ?? 'Stats Section',
        subtitle: `${(stats as unknown[])?.length ?? 0} stats`,
      }
    },
  },
})
