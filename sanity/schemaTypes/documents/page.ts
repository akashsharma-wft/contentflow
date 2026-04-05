import { defineType, defineField } from 'sanity'

// DOCUMENT: Page
// The core page builder document. Every CMS-driven page on the site has one of these.
// The slug determines the URL. The sections[] array determines what appears on the page.
// Admin can add, remove, and reorder sections freely from Studio.
// Access is controlled via isPublic + adminOnly flags.
// Language is managed by the @sanity/document-internationalization plugin.
export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'settings', title: 'Settings' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ── Identity ──────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      group: 'settings',
      description: 'The URL path. "home" = /, "about" = /about, "posts" = /posts',
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

    // ── Access control ────────────────────────────────────────────────
    defineField({
      name: 'isPublic',
      title: 'Public page?',
      group: 'settings',
      description: 'If ON, accessible without login. If OFF, users must be authenticated.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'adminOnly',
      title: 'Admin only?',
      group: 'settings',
      description: 'If ON, only users with role=admin can access this page.',
      type: 'boolean',
      initialValue: false,
    }),

    // ── Layout toggles ────────────────────────────────────────────────
    defineField({
      name: 'showNavbar',
      title: 'Show Navbar?',
      group: 'settings',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showSidebar',
      title: 'Show Sidebar?',
      group: 'settings',
      description: 'Only applies to authenticated pages inside the dashboard layout.',
      type: 'boolean',
      initialValue: false,
    }),

    // ── Integrations ──────────────────────────────────────────────────
    defineField({
      name: 'enablePosthogTracking',
      title: 'Enable PostHog tracking?',
      group: 'settings',
      type: 'boolean',
      initialValue: true,
    }),

    // ── Page sections (the page builder array) ────────────────────────
    // ── Page sections (the page builder array) ────────────────────────
    defineField({
      name: 'sections',
      title: 'Page Sections',
      group: 'content',
      description: 'Add, remove, and reorder sections. Each section is a configurable block.',
      type: 'array',
      of: [
        // ── Existing ──────────────────────────────────────────────────────
        { type: 'heroSection' },
        { type: 'ctaSection' },
        { type: 'featuredPostsSection' },
        { type: 'recentPostsSection' },
        { type: 'richTextSection' },
        { type: 'statsSection' },
        { type: 'formSection' },

        // ── Layout ────────────────────────────────────────────────────────
        { type: 'gridSection' },
        { type: 'columnsSection' },
        { type: 'spacerSection' },
        { type: 'dividerSection' },

        // ── Content ───────────────────────────────────────────────────────
        { type: 'headingSection' },
        { type: 'featureListSection' },
        { type: 'testimonialsSection' },
        { type: 'faqSection' },
        { type: 'pricingSection' },
        { type: 'teamSection' },
        { type: 'logoBarSection' },
        { type: 'carouselSection' },
        { type: 'tableSection' },
        { type: 'timelineSection' },
        { type: 'bannerSection' },
        { type: 'tabsSection' },

        // ── Media ─────────────────────────────────────────────────────────
        { type: 'imageSection' },
        { type: 'gallerySection' },
        { type: 'videoSection' },

        // ── Interactive / Auth ────────────────────────────────────────────
        { type: 'newsletterSection' },
        { type: 'contactSection' },
        { type: 'authHeroSection' },
        { type: 'notFoundSection' },
      ],
    }),

    // ── SEO ────────────────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      group: 'seo',
      description: 'Overrides page title in <title> tags. Defaults to page title if empty. Max 60 characters.',
      type: 'string',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      group: 'seo',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Share Image',
      group: 'seo',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      language: 'language',
      isPublic: 'isPublic',
    },
    prepare({ title, slug, language, isPublic }) {
      const lang = language?.toUpperCase() ?? '—'
      return {
        title: title ?? 'Untitled',
        subtitle: `${lang} · /${slug ?? '…'} · ${isPublic ? '🌐 Public' : '🔒 Protected'}`,
      }
    },
  },
})
