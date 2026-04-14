// sanity/schemaTypes/sections/systemSections/postDetailPageSections.ts
//
// Field definitions for the post detail page (/[slug] and /[lang]/[slug]).
// Exported as a flat array — spread into the `section` document's fields array.
//
// Sections:
//   postDetailHeader   — back link label, featured badge label, language badge label
//   postDetailMeta     — author label, date format label, unpublished label
//   postDetailBody     — empty body fallback text, share button label
//   postDetailTags     — tags section heading, empty tags fallback
//   postDetailBackLink — back/all-posts link labels, prev/next labels

import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

export const postDetailPageSectionFields = [

  // ── Post Detail — Header ─────────────────────────────────────────────────────
  defineField({
    name: 'postDetailHeader',
    title: 'Post Detail — Header',
    type: 'object',
    ...shownFor('postDetailHeader'),
    fields: [
      defineField({ name: 'heading',           title: 'Page Heading Label',       type: 'string', initialValue: 'Post Detail' }),
      defineField({ name: 'featuredBadgeLabel', title: 'Featured Badge Label',    type: 'string', initialValue: 'Featured' }),
      defineField({ name: 'languageBadgeLabel', title: 'Language Badge Label',    type: 'string', initialValue: 'Language' }),
      defineField({ name: 'editInStudioLabel',  title: '"Edit in Studio" Label',  type: 'string', initialValue: 'Edit in Sanity Studio →' }),
    ],
  }),

  // ── Post Detail — Meta ───────────────────────────────────────────────────────
  defineField({
    name: 'postDetailMeta',
    title: 'Post Detail — Meta',
    type: 'object',
    ...shownFor('postDetailMeta'),
    fields: [
      defineField({ name: 'authorLabel',       title: 'Author Label',              type: 'string', initialValue: 'Author' }),
      defineField({ name: 'dateFormatLabel',    title: 'Date Format Label (hint)', type: 'string', initialValue: 'Published' }),
      defineField({ name: 'unpublishedLabel',   title: 'Unpublished Label',         type: 'string', initialValue: 'Unpublished' }),
    ],
  }),

  // ── Post Detail — Body ───────────────────────────────────────────────────────
  defineField({
    name: 'postDetailBody',
    title: 'Post Detail — Body',
    type: 'object',
    ...shownFor('postDetailBody'),
    fields: [
      defineField({ name: 'emptyBodyText',  title: 'Empty Body Fallback Text', type: 'string', initialValue: 'No content yet.' }),
      defineField({ name: 'shareLabel',     title: 'Share Button Label',       type: 'string', initialValue: 'Share' }),
      defineField({ name: 'linkCopiedText', title: 'Link Copied Toast Text',   type: 'string', initialValue: 'Link copied!' }),
    ],
  }),

  // ── Post Detail — Tags ───────────────────────────────────────────────────────
  defineField({
    name: 'postDetailTags',
    title: 'Post Detail — Tags',
    type: 'object',
    ...shownFor('postDetailTags'),
    fields: [
      defineField({ name: 'tagsHeading',    title: 'Tags Section Heading',    type: 'string', initialValue: 'Tags' }),
      defineField({ name: 'emptyTagsText',  title: 'Empty Tags Fallback',     type: 'string', initialValue: 'No tags' }),
    ],
  }),

  // ── Post Detail — Back Link ──────────────────────────────────────────────────
  defineField({
    name: 'postDetailBackLink',
    title: 'Post Detail — Back Link',
    type: 'object',
    ...shownFor('postDetailBackLink'),
    fields: [
      defineField({ name: 'backLabel',     title: 'Back Link Label',        type: 'string', initialValue: 'Back to Posts' }),
      defineField({ name: 'allPostsLabel', title: 'All Posts Link Label',   type: 'string', initialValue: 'All Posts' }),
      defineField({ name: 'prevLabel',     title: 'Previous Post Label',    type: 'string', initialValue: 'Previous' }),
      defineField({ name: 'nextLabel',     title: 'Next Post Label',        type: 'string', initialValue: 'Next' }),
      defineField({ name: 'backHref',      title: 'Back Link Href',         type: 'string', initialValue: '/posts' }),
    ],
  }),

]
