import { defineField, defineType } from 'sanity'

// BLOCK: Rich Text Section
// Portable Text section for long-form content: about pages, legal docs, articles.
// Supports text blocks + images with captions. Width-controllable.
export const richTextSection = defineType({
  name: 'richTextSection',
  title: 'Rich Text Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'maxWidth',
      title: 'Max Width',
      type: 'string',
      options: {
        list: [
          { title: 'Narrow (680px)', value: 'narrow' },
          { title: 'Medium (800px)', value: 'medium' },
          { title: 'Full Width', value: 'full' },
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare({ heading }) {
      return { title: heading ? `Rich Text: ${heading}` : 'Rich Text Block' }
    },
  },
})
