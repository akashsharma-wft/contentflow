// sanity/schemaTypes/sections/systemSections/postsPageSections.ts
//
// Field definitions for sections on the /posts dashboard page.
// Exported as a flat array — spread into the `section` document's fields array.
//
// Sections:
//   postsHeader  — heading, subheading, GROQ badge label
//   postsStats   — 3 stats card labels
//   postsActions — sync button + new post button labels
//   postsSearch  — search input placeholder
//   postsTable   — table column labels, empty state, pagination labels
//
// Legacy:
//   postsList — kept for backward compat only (do not add new docs with this type)

import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

export const postsPageSectionFields = [

  // ── postsHeader ──────────────────────────────────────────────────────────────
  defineField({
    name: 'postsHeader',
    title: 'Posts Header',
    type: 'object',
    ...shownFor('postsHeader'),
    fields: [
      defineField({ name: 'heading',        title: 'Heading',          type: 'string', initialValue: 'Blog Posts' }),
      defineField({ name: 'subheading',     title: 'Subheading',       type: 'string', initialValue: 'Manage your technical documentation and editorial content.' }),
      defineField({ name: 'groqBadgeLabel', title: 'GROQ Badge Label', type: 'string', initialValue: 'via Sanity GROQ' }),
    ],
  }),

  // ── postsStats ───────────────────────────────────────────────────────────────
  defineField({
    name: 'postsStats',
    title: 'Posts Stats',
    type: 'object',
    ...shownFor('postsStats'),
    fields: [
      defineField({ name: 'myPostsLabel',   title: 'My Posts Label',  type: 'string', initialValue: 'My Posts' }),
      defineField({ name: 'publishedLabel', title: 'Published Label', type: 'string', initialValue: 'Published' }),
      defineField({ name: 'draftsLabel',    title: 'Drafts Label',    type: 'string', initialValue: 'Drafts' }),
    ],
  }),

  // ── postsActions ─────────────────────────────────────────────────────────────
  defineField({
    name: 'postsActions',
    title: 'Posts Actions',
    type: 'object',
    ...shownFor('postsActions'),
    fields: [
      defineField({ name: 'syncButtonLabel',    title: 'Sync Button Label',     type: 'string', initialValue: 'Sync' }),
      defineField({ name: 'newPostButtonLabel', title: 'New Post Button Label', type: 'string', initialValue: 'New Post' }),
    ],
  }),

  // ── postsSearch ──────────────────────────────────────────────────────────────
  defineField({
    name: 'postsSearch',
    title: 'Posts Search',
    type: 'object',
    ...shownFor('postsSearch'),
    fields: [
      defineField({ name: 'searchPlaceholder', title: 'Search Placeholder', type: 'string', initialValue: 'Search posts...' }),
    ],
  }),

  // ── postsTable ───────────────────────────────────────────────────────────────
  defineField({
    name: 'postsTable',
    title: 'Posts Table',
    type: 'object',
    ...shownFor('postsTable'),
    fields: [
      defineField({ name: 'colTitle',        title: 'Column: Title',           type: 'string', initialValue: 'Post Title' }),
      defineField({ name: 'colStatus',       title: 'Column: Status',          type: 'string', initialValue: 'Status' }),
      defineField({ name: 'colImage',        title: 'Column: Cover Image',     type: 'string', initialValue: 'Cover' }),
      defineField({ name: 'colTags',         title: 'Column: Tags',            type: 'string', initialValue: 'Tags' }),
      defineField({ name: 'colLastModified', title: 'Column: Last Modified',   type: 'string', initialValue: 'Last Modified' }),
      defineField({ name: 'emptyTitle',      title: 'Empty State: Title',      type: 'string', initialValue: 'No posts found' }),
      defineField({ name: 'emptyBody',       title: 'Empty State: Body',       type: 'text',   initialValue: 'Sync from Sanity to populate your workspace.' }),
      defineField({ name: 'emptyCtaLabel',   title: 'Empty State: CTA Label',  type: 'string', initialValue: 'Sync from Sanity' }),
      defineField({ name: 'showingLabel',    title: 'Pagination: Showing Label', type: 'string', initialValue: 'Showing' }),
      defineField({ name: 'loadMoreLabel',   title: 'Pagination: Load More',   type: 'string', initialValue: 'Load more' }),
      defineField({ name: 'connectedLabel',  title: 'Footer: Connected Label', type: 'string', initialValue: 'Sanity API Connected' }),
      // Row action labels
      defineField({ name: 'viewPostLabel',   title: 'Action: View Post',       type: 'string', initialValue: 'View post' }),
      defineField({ name: 'editPostLabel',   title: 'Action: Edit Post',       type: 'string', initialValue: 'Edit post' }),
      defineField({ name: 'deletePostLabel', title: 'Action: Delete Post',     type: 'string', initialValue: 'Delete post' }),
      // Delete confirmation dialog
      defineField({ name: 'deleteDialogTitle',        title: 'Dialog: Title',          type: 'string', initialValue: 'Delete Post' }),
      defineField({ name: 'deleteDialogBody',         title: 'Dialog: Body (use {title} for post name)', type: 'text',   initialValue: 'Are you sure you want to delete "{title}"? This will permanently remove it from Sanity. This cannot be undone.' }),
      defineField({ name: 'deleteDialogConfirmLabel', title: 'Dialog: Confirm Button',  type: 'string', initialValue: 'Delete Post' }),
      defineField({ name: 'deleteDialogCancelLabel',  title: 'Dialog: Cancel Button',   type: 'string', initialValue: 'Cancel' }),
      // Featured banner — full configuration
      defineField({ name: 'featuredLabel',     title: 'Featured Banner: Badge Label',       type: 'string', initialValue: 'Featured Post' }),
      defineField({ name: 'featuredOfLabel',   title: 'Featured Banner: Counter "of" word', type: 'string', initialValue: 'of', description: 'The word between numbers in "1 of 5".' }),
      defineField({ name: 'featuredReadLabel', title: 'Featured Banner: Read Button Label', type: 'string', initialValue: 'Read now' }),
      defineField({
        name: 'featuredBannerIcon',
        title: 'Featured Banner: Icon',
        description: 'Icon shown in the banner badge. Defaults to Star.',
        type: 'string',
        options: {
          list: [
            { title: 'Star',     value: 'Star'     },
            { title: 'Bookmark', value: 'Bookmark' },
            { title: 'Sparkles', value: 'Sparkles' },
            { title: 'Zap',      value: 'Zap'      },
            { title: 'Flame',    value: 'Flame'    },
            { title: 'Trophy',   value: 'Trophy'   },
            { title: 'Award',    value: 'Award'    },
            { title: 'Crown',    value: 'Crown'    },
          ],
          layout: 'radio',
        },
        initialValue: 'Star',
      }),
    ],
  }),

  // ── postsList (legacy — kept for backward compat, do not use for new docs) ───
  defineField({
    name: 'postsList',
    title: 'Posts List Content (Legacy)',
    type: 'object',
    ...shownFor('postsList'),
    fields: [
      defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Posts' }),
      defineField({ name: 'limit',   title: 'Post Limit (0 = all)', type: 'number', initialValue: 0, validation: R => R.min(0).integer() }),
    ],
  }),

]
