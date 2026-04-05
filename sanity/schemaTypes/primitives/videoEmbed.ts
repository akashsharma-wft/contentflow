import { defineType, defineField } from 'sanity'

export const videoEmbedSchema = defineType({
  name: 'videoEmbed',
  title: 'Video Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube or Vimeo URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    defineField({ name: 'autoplay', title: 'Autoplay (muted)', type: 'boolean', initialValue: false }),
  ],
})
