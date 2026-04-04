import { defineField, defineType } from 'sanity'

// BLOCK: Hero Section
// Used at the top of landing pages, home pages, auth pages.
// Supports heading, subheading, badge, CTA buttons, background image, and theme.
export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      description: 'Small label shown above the heading e.g. "Engineering First"',
      type: 'string',
    }),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA Button',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'string' }),
      ],
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA Button',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'string' }),
      ],
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      options: {
        list: [
          { title: 'Dark (default)', value: 'dark' },
          { title: 'Light', value: 'light' },
          { title: 'Indigo Gradient', value: 'gradient' },
        ],
        layout: 'radio',
      },
      initialValue: 'dark',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Centered (default)', value: 'centered' },
          { title: 'Split — content left, decoration right', value: 'split' },
        ],
        layout: 'radio',
      },
      initialValue: 'centered',
    }),
    defineField({
      name: 'communityText',
      title: 'Community Label',
      description: 'Social proof shown below CTAs in split layout. e.g. "JOIN OUR GLOBAL COMMUNITY OF WRITERS"',
      type: 'string',
    }),
  ],
  preview: {
    select: { heading: 'heading', subheading: 'subheading' },
    prepare({ heading, subheading }) {
      return {
        title: `Hero: ${heading ?? 'Untitled'}`,
        subtitle: subheading,
      }
    },
  },
})
