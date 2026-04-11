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
      description: '"home" → /   |   "about" → /about',
      options: { source: 'title', maxLength: 96 },
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

    // ── Sections ─────────────────────────────────────────────────────────
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'content',
      of: [
        // System sections (predefined inline objects)
        { type: 'heroSection'           },
        { type: 'featuresSection'       },
        { type: 'featuredPostsSection'  },
        { type: 'recentPostsSection'    },
        { type: 'ctaSection'            },
        { type: 'postsSection'          },
        { type: 'authHeroSection'       },
        { type: 'authSection'           },
        { type: 'authLegalSection'      },
        { type: 'analyticsSection'      },
        { type: 'navbarSection'         },
        { type: 'footerSection'         },
        // Custom sections (reference to section document)
        { type: 'reference', title: 'Custom Section', to: [{ type: 'section' }] },
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
    prepare({ title, slug, language, access, layout }) {
      const a = access  === 'guest' ? '🌐' : access  === 'user' ? '🔒' : '🛡️'
      const l = layout  === 'dashboard' ? '🖥' : layout === 'auth' ? '🔑' : '🏠'
      return {
        title:    title ?? 'Untitled',
        subtitle: `${language?.toUpperCase() ?? '—'} · /${slug ?? '…'} · ${a} ${access} · ${l} ${layout}`,
      }
    },
  },
})
