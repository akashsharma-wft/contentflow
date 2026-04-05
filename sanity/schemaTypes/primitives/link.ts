import { defineType, defineField } from 'sanity'

export const linkSchema = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'href', title: 'URL', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'openInNewTab', title: 'Open in new tab?', type: 'boolean', initialValue: false }),
  ],
})
