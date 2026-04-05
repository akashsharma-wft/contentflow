import { defineType, defineField } from 'sanity'

// PRIMITIVE: Button
// Reused inside any section that needs a CTA.
// variant controls visual style, size controls padding.
export const buttonSchema = defineType({
  name: 'button',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL / Path',
      type: 'string',
      description: 'Use /path for internal links or https:// for external',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          { title: 'Primary (filled indigo)', value: 'primary' },
          { title: 'Secondary (outlined)', value: 'secondary' },
          { title: 'Ghost (text only)', value: 'ghost' },
          { title: 'Danger (red)', value: 'danger' },
          { title: 'White', value: 'white' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
      options: {
        list: [
          { title: 'Small', value: 'sm' },
          { title: 'Medium', value: 'md' },
          { title: 'Large', value: 'lg' },
        ],
        layout: 'radio',
      },
      initialValue: 'md',
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'icon',
      title: 'Icon (optional)',
      description: 'Lucide icon name, e.g. "arrow-right", "star", "zap"',
      type: 'string',
    }),
  ],
  preview: {
    select: { label: 'label', variant: 'variant' },
    prepare({ label, variant }) {
      return { title: label ?? 'Button', subtitle: variant }
    },
  },
})
