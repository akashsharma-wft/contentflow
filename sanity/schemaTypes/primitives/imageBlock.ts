import { defineType, defineField } from 'sanity'

export const imageBlockSchema = defineType({
  name: 'imageBlock',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      options: {
        list: [
          { title: '16:9 (Video)', value: '16/9' },
          { title: '4:3 (Classic)', value: '4/3' },
          { title: '1:1 (Square)', value: '1/1' },
          { title: '3:2 (Photo)', value: '3/2' },
          { title: 'Auto', value: 'auto' },
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
    }),
    defineField({
      name: 'rounded',
      title: 'Rounded corners?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
