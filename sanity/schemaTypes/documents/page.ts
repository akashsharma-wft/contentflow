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
      name: 'access',
      title: 'Page Access',
      group: 'settings',
      type: 'string',
      options: {
        list: [
          { title: '🌐 Public — anyone can visit', value: 'public' },
          { title: '🔒 Member — must be logged in', value: 'member' },
          { title: '🛡️ Admin — admin role only', value: 'admin' },
        ],
        layout: 'radio',
      },
      initialValue: 'public',
      validation: (Rule) => Rule.required(),
    }),

    // ── Layout ────────────────────────────────────────────────────────
    defineField({
      name: 'layout',
      title: 'Layout',
      group: 'settings',
      type: 'string',
      options: {
        list: [
          { title: '🌐 Public (Navbar + Footer)', value: 'public' },
          { title: '🖥 Dashboard (Sidebar)', value: 'dashboard' },
          { title: '🔑 Auth (No chrome)', value: 'auth' },
        ],
        layout: 'radio',
      },
      initialValue: 'public',
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
        { type: 'loginSection' },
        { type: 'signupSection' },
        { type: 'notFoundSection' },

        // ── App pages (each page = one marker block) ──────────────────────
        { type: 'postsPageSection' },
        { type: 'analyticsPageSection' },
        { type: 'settingsPageSection' },
        { type: 'billingPageSection' },
        { type: 'adminPageSection' },
        { type: 'loginPageSection' },
        { type: 'signupPageSection' },
        { type: 'postDetailPageSection' },
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
      access: 'access',
      layout: 'layout',
    },
    prepare({ title, slug, language, access, layout }) {
      const accessEmoji =
        access === 'public'
          ? '🌐'
          : access === 'member'
            ? '🔒'
            : '🛡️'
      const layoutEmoji =
        layout === 'dashboard'
          ? '🖥'
          : layout === 'auth'
            ? '🔑'
            : '🌐'
      return {
        title: title ?? 'Untitled',
        subtitle: `${language?.toUpperCase() ?? '—'} · /${slug ?? '…'} · ${accessEmoji} ${access} · ${layoutEmoji} ${layout}`,
      }
    },
  },
})