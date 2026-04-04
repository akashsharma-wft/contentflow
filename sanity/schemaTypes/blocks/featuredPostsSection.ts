import { defineField, defineType } from 'sanity'

// BLOCK: Featured Posts Section
// Automatically pulls posts marked as featured: true from Sanity.
// Admin controls layout, count, and display options.
export const featuredPostsSection = defineType({
  name: 'featuredPostsSection',
  title: 'Featured Posts Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Featured Posts',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'maxPosts',
      title: 'Max Posts to Show',
      type: 'number',
      initialValue: 3,
      validation: (Rule) => Rule.min(1).max(12),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid (3 columns)', value: 'grid' },
          { title: 'List', value: 'list' },
          { title: 'Featured (large + sidebar)', value: 'featured' },
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
    }),
    defineField({
      name: 'showExcerpt',
      title: 'Show Excerpts?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showTags',
      title: 'Show Tags?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'viewAllLabel',
      title: '"View All" Button Label',
      description: 'Leave empty to hide the button',
      type: 'string',
    }),
  ],
  preview: {
    select: { heading: 'heading', maxPosts: 'maxPosts' },
    prepare({ heading, maxPosts }) {
      return {
        title: `Featured Posts: ${heading ?? 'Untitled'}`,
        subtitle: `Max ${maxPosts ?? 3} posts`,
      }
    },
  },
})
