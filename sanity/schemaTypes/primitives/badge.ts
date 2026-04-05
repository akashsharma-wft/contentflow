import { defineType, defineField } from 'sanity'

// PRIMITIVE: Badge
// Small label chip used above headings or on cards.
export const badgeSchema = defineType({
  name: 'badge',
  title: 'Badge',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: [
          { title: 'Indigo', value: 'indigo' },
          { title: 'Emerald', value: 'emerald' },
          { title: 'Amber', value: 'amber' },
          { title: 'Red', value: 'red' },
          { title: 'White/Muted', value: 'muted' },
        ],
        layout: 'radio',
      },
      initialValue: 'indigo',
    }),
  ],
})
