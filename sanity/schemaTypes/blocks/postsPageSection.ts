import { defineType } from 'sanity'

// BLOCK: Posts Page Section
// This is a marker block for the posts page.
// The actual rendering is done by PostsPageSection component.
// All config comes from postsPageConfig singleton.
export const postsPageSection = defineType({
  name: 'postsPageSection',
  title: 'Posts Page',
  type: 'object',
  fields: [],
  preview: { prepare: () => ({ title: 'Posts Page Content' }) },
})
