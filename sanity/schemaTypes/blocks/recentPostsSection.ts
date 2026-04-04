import { defineField, defineType } from 'sanity'

// BLOCK: Recent Posts Section
// Automatically fetches the N most recent published posts.
// No manual selection required — always up to date.
export const recentPostsSection = defineType({
  name: 'recentPostsSection',
  title: 'Recent Posts Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Recent Posts',
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
    defineField({
      name: 'count',
      title: 'Number of Posts to Show',
      type: 'number',
      initialValue: 6,
      validation: (Rule) => Rule.min(1).max(20),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Grid', value: 'grid' },
          { title: 'List', value: 'list' },
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
    }),
    defineField({
      name: 'showCoverImage',
      title: 'Show Cover Images?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'viewAllLabel',
      title: '"View All" Button Label',
      type: 'string',
      initialValue: 'View all posts',
    }),
    defineField({
      name: 'viewAllHref',
      title: '"View All" URL',
      type: 'string',
      initialValue: '/posts',
    }),
  ],
  preview: {
    select: { heading: 'heading', count: 'count' },
    prepare({ heading, count }) {
      return {
        title: `Recent Posts: ${heading ?? 'Untitled'}`,
        subtitle: `${count ?? 6} posts`,
      }
    },
  },
})
