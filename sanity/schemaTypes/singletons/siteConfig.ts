import { defineField, defineType } from 'sanity'

// SINGLETON: Site Configuration
// Global site settings — branding, navigation, footer.
// Only ONE document of this type should ever exist.
// Structure Tool prevents creating new ones via the singleton pattern.
export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Site Configuration',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'navigation', title: 'Navigation' },
    { name: 'footer', title: 'Footer' },
  ],
  fields: [
    // ── Identity ──────────────────────────────────────────────────────
    defineField({
      name: 'siteName',
      title: 'Site Name',
      group: 'identity',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'ContentFlow',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      group: 'identity',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      group: 'identity',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      group: 'identity',
      type: 'image',
    }),

    // ── Navigation ────────────────────────────────────────────────────
    defineField({
      name: 'publicNav',
      title: 'Public Navigation (Header)',
      group: 'navigation',
      description: 'Links shown in public-facing header and landing pages',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'slug',
              title: 'Page Slug',
              type: 'string',
              description: 'CMS page slug (generates language-aware URL). Use instead of URL for internal pages.',
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              description: 'Fixed URL for external links or /studio. Leave blank if using Page Slug.',
            }),
            defineField({
              name: 'openInNewTab',
              title: 'Open in new tab?',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { label: 'label', slug: 'slug', href: 'href' },
            prepare({ label, slug, href }) {
              return { title: label, subtitle: slug ? `slug: ${slug}` : href }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'sidebarNav',
      title: 'Sidebar Navigation (Authenticated Users)',
      group: 'navigation',
      description: 'Links shown in the dashboard sidebar. Supports Lucide icon names.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Icon (Lucide name)',
              type: 'string',
              description: 'e.g. LayoutDashboard, FileText, BarChart3, Settings, CreditCard, Shield',
            }),
            defineField({
              name: 'adminOnly',
              title: 'Admin only?',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { label: 'label', href: 'href' },
            prepare({ label, href }) {
              return { title: label, subtitle: href }
            },
          },
        },
      ],
    }),

    // ── Footer ────────────────────────────────────────────────────────
    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      group: 'footer',
      type: 'string',
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer Links',
      group: 'footer',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'href', title: 'URL', type: 'string' }),
          ],
          preview: {
            select: { label: 'label', href: 'href' },
            prepare({ label, href }) {
              return { title: label, subtitle: href }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright Text',
      group: 'footer',
      type: 'string',
      initialValue: '© 2026 ContentFlow Engineering',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Configuration' }
    },
  },
})
