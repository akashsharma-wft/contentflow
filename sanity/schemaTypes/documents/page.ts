// sanity/schemaTypes/documents/page.ts
import { defineType, defineField } from 'sanity'

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
      title: 'Show public Navbar?',
      group: 'settings',
      description: 'Show the public-facing Navbar on this page.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showSidebar',
      title: 'Show Sidebar Layout?',
      group: 'settings',
      description: 'If ON, page renders inside the authenticated dashboard sidebar layout instead of the public layout.',
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

        // ── App pages (each page = one marker block) ──────────────────────
        { type: 'postsPageSection' },
        { type: 'analyticsPageSection' },
        { type: 'settingsPageSection' },
        { type: 'billingPageSection' },
        { type: 'adminPageSection' },
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
      showSidebar: 'showSidebar',
    },
    prepare({ title, slug, language, isPublic, showSidebar }) {
      const lang = language?.toUpperCase() ?? '—'
      const layout = showSidebar ? '🖥 Dashboard' : '🌐 Public'
      return {
        title: title ?? 'Untitled',
        subtitle: `${lang} · /${slug ?? '…'} · ${isPublic ? '🌐 Public' : '🔒 Protected'} · ${layout}`,
      }
    },
  },
})