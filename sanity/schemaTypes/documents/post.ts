// sanity/schemaTypes/documents/post.ts
// Blog posts authored by users authenticated via Supabase.
// Author fields are auto-populated from Supabase — do not edit manually.
// Language is managed by @sanity/document-internationalization.

import { defineField, defineType } from 'sanity'
import { ComposeIcon } from '@sanity/icons'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: async (slug, context) => {
          // Same slug is allowed in different languages — uniqueness is (slug, language) pair
          const { document, getClient } = context
          if (!document) return true
          const client = getClient({ apiVersion: '2024-01-01' })
          const id   = document._id.replace(/^drafts\./, '')
          const lang = (document as { language?: string }).language ?? 'en'
          const count = await client.fetch<number>(
            `count(*[_type == "post" && slug.current == $slug && language == $lang && !(_id in [$id, "drafts." + $id])])`,
            { slug, lang, id }
          )
          return count === 0
        },
      },
      validation: R => R.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt',     title: 'Alt Text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption',  type: 'string' }),
          ],
        },
        {
          type: 'object',
          name: 'codeBlock',
          title: 'Code Block',
          fields: [
            defineField({ name: 'language', title: 'Language', type: 'string', initialValue: 'typescript' }),
            defineField({ name: 'code',     title: 'Code',     type: 'text' }),
            defineField({ name: 'filename', title: 'Filename', type: 'string' }),
          ],
          preview: {
            select: { language: 'language', filename: 'filename' },
            prepare: ({ language, filename }) => ({ title: filename ?? 'Code Block', subtitle: language }),
          },
        },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // ── Author — auto-populated from Supabase ─────────────────────────
    defineField({ name: 'authorId',     title: 'Author ID',     type: 'string', readOnly: true }),
    defineField({ name: 'authorName',   title: 'Author Name',   type: 'string', readOnly: true }),
    defineField({ name: 'authorEmail',  title: 'Author Email',  type: 'string', readOnly: true }),
    defineField({
      name: 'authorAvatar',
      title: 'Author Avatar',
      type: 'image',
      description: 'Upload the author\'s profile photo.',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title:      'title',
      language:   'language',
      authorName: 'authorName',
      publishedAt:'publishedAt',
      media:      'coverImage',
    },
    prepare({ title, language, authorName, publishedAt, media }) {
      return {
        title:    title ?? 'Untitled',
        subtitle: `${language?.toUpperCase() ?? '—'} · ${publishedAt ? 'Published' : 'Draft'} · ${authorName ?? 'No author'}`,
        media,
      }
    },
  },
})
