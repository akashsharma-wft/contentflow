import { defineField, defineType } from 'sanity'

// DOCUMENT: Post
// Blog posts authored by users authenticated via Supabase.
// Author fields are auto-populated from Supabase — never manually entered.
// Language is managed by @sanity/document-internationalization plugin.
export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      readOnly: true,
      hidden: true,
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return 'Language is required'
          if (!['en', 'hi', 'kn'].includes(value)) return 'Language must be en, hi, or kn'
          return true
        }),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
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
            defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
        {
          // TypeScript / code block support
          type: 'object',
          name: 'codeBlock',
          title: 'Code Block',
          fields: [
            defineField({ name: 'language', title: 'Language', type: 'string', initialValue: 'typescript' }),
            defineField({ name: 'code', title: 'Code', type: 'text' }),
            defineField({ name: 'filename', title: 'Filename (optional)', type: 'string' }),
          ],
          preview: {
            select: { language: 'language', filename: 'filename' },
            prepare({ language, filename }) {
              return {
                title: filename ?? 'Code Block',
                subtitle: language,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
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

    // Author fields — auto-populated from Supabase, do not edit manually
    defineField({
      name: 'authorId',
      title: 'Author ID (Supabase)',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'authorEmail',
      title: 'Author Email',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'authorAvatar',
      title: 'Author Avatar URL',
      type: 'url',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      language: 'language',
      authorName: 'authorName',
      publishedAt: 'publishedAt',
      media: 'coverImage',
    },
    prepare({ title, language, authorName, publishedAt, media }) {
      const lang = language?.toUpperCase() ?? '—'
      const status = publishedAt ? 'Published' : 'Draft'
      return {
        title: title ?? 'Untitled',
        subtitle: `${lang} · ${status} · ${authorName ?? 'No author'}`,
        media,
      }
    },
  },
})
