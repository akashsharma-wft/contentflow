import { defineField } from 'sanity'

// Hide field unless parent.sectionType matches
const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

export const homePageSectionFields = [

  // ── Hero ────────────────────────────────────────────────────────────────────
  defineField({
    name: 'hero',
    title: 'Hero Content',
    type: 'object',
    ...shownFor('hero'),
    fields: [
      defineField({ name: 'heading',    title: 'Heading',    type: 'string', validation: R => R.required() }),
      defineField({ name: 'subheading', title: 'Subheading', type: 'text',   rows: 2 }),
      defineField({ name: 'badge',      title: 'Badge',      type: 'string', description: 'Small label above the heading' }),
      defineField({
        name: 'primaryCta', title: 'Primary CTA', type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'href',  title: 'URL',   type: 'string' }),
        ],
      }),
      defineField({
        name: 'secondaryCta', title: 'Secondary CTA', type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'href',  title: 'URL',   type: 'string' }),
        ],
      }),
      defineField({ name: 'communityText', title: 'Community Text', type: 'string', description: 'e.g. "Trusted by 2,000+ publishers"' }),
      defineField({
        name: 'layout', title: 'Layout', type: 'string',
        options: { list: [{ title: 'Centered', value: 'centered' }, { title: 'Split', value: 'split' }], layout: 'radio' },
        initialValue: 'centered',
      }),
    ],
  }),

  // ── Featured Posts ──────────────────────────────────────────────────────────
  defineField({
    name: 'featuredPosts',
    title: 'Featured Posts Content',
    type: 'object',
    ...shownFor('featuredPosts'),
    fields: [
      defineField({ name: 'heading',     title: 'Heading',         type: 'string', initialValue: 'Featured Stories' }),
      defineField({ name: 'subheading',  title: 'Subheading',      type: 'string' }),
      defineField({ name: 'maxPosts',    title: 'Max Posts',       type: 'number', initialValue: 2, validation: R => R.min(1).max(6).integer() }),
      defineField({ name: 'showExcerpt', title: 'Show Excerpt',    type: 'boolean', initialValue: true }),
      defineField({ name: 'showTags',    title: 'Show Tags',       type: 'boolean', initialValue: true }),
      defineField({ name: 'viewAllLabel', title: 'View All Label', type: 'string', initialValue: 'View all stories' }),
    ],
  }),

  // ── Recent Posts ────────────────────────────────────────────────────────────
  defineField({
    name: 'recentPosts',
    title: 'Recent Posts Content',
    type: 'object',
    ...shownFor('recentPosts'),
    fields: [
      defineField({ name: 'heading',      title: 'Heading',        type: 'string', initialValue: 'Recent Publications' }),
      defineField({ name: 'subheading',   title: 'Subheading',     type: 'string' }),
      defineField({ name: 'count',        title: 'Initial Count',  type: 'number', initialValue: 6, validation: R => R.min(1).integer() }),
      defineField({ name: 'viewAllLabel', title: 'View All Label', type: 'string', initialValue: 'View all posts' }),
      defineField({
        name: 'filterTags', title: 'Filter Tags', type: 'array',
        description: 'Optional: restrict the tag filter chips to these tags only. Leave empty to show all tags.',
        of: [{ type: 'string' }],
        options: { layout: 'tags' },
      }),
    ],
  }),

  // ── CTA ─────────────────────────────────────────────────────────────────────
  defineField({
    name: 'cta',
    title: 'CTA Content',
    type: 'object',
    ...shownFor('cta'),
    fields: [
      defineField({ name: 'heading', title: 'Heading', type: 'string', validation: R => R.required() }),
      defineField({ name: 'body',    title: 'Body',    type: 'text',   rows: 2 }),
      defineField({
        name: 'primaryButton', title: 'Primary Button', type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'href',  title: 'URL',   type: 'string' }),
        ],
      }),
      defineField({
        name: 'secondaryButton', title: 'Secondary Button', type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'href',  title: 'URL',   type: 'string' }),
        ],
      }),
      defineField({
        name: 'theme', title: 'Theme', type: 'string',
        options: { list: [{ title: 'Dark', value: 'dark' }, { title: 'Indigo', value: 'indigo' }, { title: 'Subtle', value: 'subtle' }], layout: 'radio' },
        initialValue: 'indigo',
      }),
      defineField({ name: 'centered', title: 'Centered', type: 'boolean', initialValue: true }),
    ],
  }),

  // ── Features ────────────────────────────────────────────────────────────────
  defineField({
    name: 'features',
    title: 'Features Content',
    type: 'object',
    ...shownFor('features'),
    fields: [
      defineField({ name: 'heading',    title: 'Heading',    type: 'string' }),
      defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
      defineField({
        name: 'features', title: 'Features', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'title',       title: 'Title',              type: 'string', validation: R => R.required() }),
            defineField({ name: 'description', title: 'Description',        type: 'text',   rows: 2 }),
            defineField({ name: 'icon',        title: 'Icon (Lucide name)', type: 'string' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare: (v: Record<string, unknown>) => ({ title: (v.title as string) ?? 'Feature' }),
          },
        }],
      }),
    ],
  }),

]
