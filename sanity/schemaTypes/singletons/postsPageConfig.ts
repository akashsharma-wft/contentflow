// sanity/schemaTypes/singletons/postsPageConfig.ts
import { defineType, defineField } from 'sanity'

export const postsPageConfig = defineType({
  name: 'postsPageConfig',
  title: 'Posts Page',
  type: 'document',
  groups: [
    { name: 'copy', title: 'Copy & Labels', default: true },
    { name: 'table', title: 'Table Columns' },
    { name: 'empty', title: 'Empty State' },
  ],
  fields: [
    defineField({ name: 'heading', title: 'Page Heading', group: 'copy', type: 'string', initialValue: 'Blog Posts' }),
    defineField({ name: 'subheading', title: 'Page Subheading', group: 'copy', type: 'string', initialValue: 'Manage your technical documentation and editorial content.' }),
    defineField({ name: 'groqBadgeLabel', title: 'GROQ Badge Label', group: 'copy', type: 'string', initialValue: 'via Sanity GROQ' }),
    defineField({ name: 'syncButtonLabel', title: 'Sync Button Label', group: 'copy', type: 'string', initialValue: 'Sync' }),
    defineField({ name: 'newPostButtonLabel', title: 'New Post Button Label', group: 'copy', type: 'string', initialValue: 'New Post' }),
    defineField({ name: 'myPostsLabel', title: '"My Posts" Stat Label', group: 'copy', type: 'string', initialValue: 'My Posts' }),
    defineField({ name: 'publishedLabel', title: '"Published" Stat Label', group: 'copy', type: 'string', initialValue: 'Published' }),
    defineField({ name: 'draftsLabel', title: '"Drafts" Stat Label', group: 'copy', type: 'string', initialValue: 'Drafts' }),
    defineField({ name: 'searchPlaceholder', title: 'Search Placeholder', group: 'copy', type: 'string', initialValue: 'Search posts...' }),
    // Table column headers
    defineField({ name: 'colTitle', title: 'Column: Post Title', group: 'table', type: 'string', initialValue: 'Post Title' }),
    defineField({ name: 'colStatus', title: 'Column: Status', group: 'table', type: 'string', initialValue: 'Status' }),
    defineField({ name: 'colTags', title: 'Column: Tags', group: 'table', type: 'string', initialValue: 'Tags' }),
    defineField({ name: 'colLastModified', title: 'Column: Last Modified', group: 'table', type: 'string', initialValue: 'Last Modified' }),
    // Empty state
    defineField({ name: 'emptyTitle', title: 'Empty State Title', group: 'empty', type: 'string', initialValue: 'No posts found' }),
    defineField({ name: 'emptyBody', title: 'Empty State Body', group: 'empty', type: 'string', initialValue: 'Try adjusting your search or sync from Sanity to populate your workspace.' }),
    defineField({ name: 'emptyCtaLabel', title: 'Empty State CTA Label', group: 'empty', type: 'string', initialValue: 'Sync from Sanity' }),
  ],
  preview: { prepare: () => ({ title: 'Posts Page' }) },
})