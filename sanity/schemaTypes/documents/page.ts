// sanity/schemaTypes/documents/page.ts
import { defineType, defineField } from 'sanity'
import { DocumentIcon } from '@sanity/icons'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content',  title: 'Content',  default: true },
    { name: 'settings', title: 'Settings' },
    { name: 'seo',      title: 'SEO'       },
  ],
  fields: [
    // ── Identity ─────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: R => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'settings',
      description: '"home" → /   |   "about" → /about   (must be unique per language)',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: async (slug, context) => {
          // Allow the same slug in different languages — uniqueness is (slug, language) pair
          const { document, getClient } = context
          if (!document) return true
          const client = getClient({ apiVersion: '2024-01-01' })
          const id  = document._id.replace(/^drafts\./, '')
          const lang = (document as { language?: string }).language ?? 'en'
          const count = await client.fetch<number>(
            `count(*[_type == "page" && slug.current == $slug && language == $lang && !(_id in [$id, "drafts." + $id])])`,
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

    // ── Access ───────────────────────────────────────────────────────────
    defineField({
      name: 'access',
      title: 'Access',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: '🌐 Guest — anyone',          value: 'guest' },
          { title: '🔒 User — must be signed in', value: 'user'  },
          { title: '🛡️ Admin — admin role only',  value: 'admin' },
        ],
        layout: 'radio',
      },
      initialValue: 'guest',
      validation: R => R.required(),
    }),

    // ── Layout ───────────────────────────────────────────────────────────
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: '🏠 Home (Navbar + Footer)', value: 'home'      },
          { title: '🖥 Dashboard (Sidebar)',    value: 'dashboard' },
          { title: '🔑 Auth (no chrome)',       value: 'auth'      },
        ],
        layout: 'radio',
      },
      initialValue: 'home',
      validation: R => R.required(),
    }),

    // ── Sections & Components ─────────────────────────────────────────────
    // A single polymorphic reference type that can point to either a
    // `section` doc or a `component` doc.  Using one array member avoids
    // the Sanity "duplicate type 'reference'" schema error while keeping
    // the full pick-list of both document types in Studio.
    // GROQ: sections[]-> returns the full doc; _type discriminates 'section'
    // vs 'component' on the frontend.
    defineField({
      name: 'sections',
      title: 'Sections & Components',
      description: 'Add section or component documents here. Create them first via Sections / Components menus.',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'reference',
          to: [
            { type: 'section'   },
            { type: 'component' },
          ],
        },
      ],
    }),

    // ── SEO ──────────────────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      validation: R => R.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 2,
      group: 'seo',
      validation: R => R.max(160),
    }),
  ],
  preview: {
    select: {
      title:    'title',
      slug:     'slug.current',
      language: 'language',
      access:   'access',
      layout:   'layout',
    },
    prepare({ title, slug, language, access, layout }: {
      title?: string; slug?: string; language?: string; access?: string; layout?: string
    }) {
      const langTag  = language?.toUpperCase() ?? '?'
      const route    = slug ? (slug === 'home' ? '/' : `/${slug}`) : '…'

      const accessIcon = access === 'admin' ? '🛡️' : access === 'user' ? '🔒' : '🌐'
      const accessLabel = access === 'admin' ? 'Admin' : access === 'user' ? 'User' : 'Guest'

      const layoutIcon  = layout === 'dashboard' ? '🖥' : layout === 'auth' ? '🔑' : '🏠'
      const layoutLabel = layout === 'dashboard' ? 'Dashboard' : layout === 'auth' ? 'Auth' : 'Home'

      return {
        title:    `${title ?? 'Untitled'}  ·  ${langTag}`,
        subtitle: `${route}  ·  ${accessIcon} ${accessLabel}  ·  ${layoutIcon} ${layoutLabel}`,
      }
    },
  },
})
