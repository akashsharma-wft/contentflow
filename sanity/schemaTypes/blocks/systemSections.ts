// sanity/schemaTypes/blocks/systemSections.ts
// All 7 predefined system section object types.
// These are embedded inline in a page's sections array.

import { defineField, defineType } from 'sanity'
import {
  ImageIcon,
  BulbOutlineIcon,
  DocumentTextIcon,
  LockIcon,
  ActivityIcon,
  MenuIcon,
  InlineElementIcon,
} from '@sanity/icons'

// ─── 1. Hero Section ─────────────────────────────────────────────────────────

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({ name: 'heading',    title: 'Heading',    type: 'string', validation: R => R.required() }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'text',   rows: 2 }),
    defineField({ name: 'badge',      title: 'Badge',      type: 'string', description: 'Small label above the heading' }),
    defineField({
      name: 'primaryCta',
      title: 'Primary CTA',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href',  title: 'URL',   type: 'string' }),
      ],
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href',  title: 'URL',   type: 'string' }),
      ],
    }),
    defineField({ name: 'communityText', title: 'Community Text', type: 'string', description: 'e.g. "Trusted by 2,000+ publishers" — shown in split layout below the CTAs' }),
    defineField({ name: 'backgroundImage', title: 'Background Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      options: {
        list: [
          { title: 'Dark',             value: 'dark'     },
          { title: 'Light',            value: 'light'    },
          { title: 'Indigo Gradient',  value: 'gradient' },
        ],
        layout: 'radio',
      },
      initialValue: 'dark',
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Centered', value: 'centered' },
          { title: 'Split',    value: 'split'    },
        ],
        layout: 'radio',
      },
      initialValue: 'centered',
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: ({ heading }) => ({ title: `Hero: ${heading ?? 'Untitled'}`, media: ImageIcon }),
  },
})

// ─── 2. Features Section ─────────────────────────────────────────────────────

export const featuresSection = defineType({
  name: 'featuresSection',
  title: 'Features',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({ name: 'heading',    title: 'Heading',    type: 'string' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title',       title: 'Title',       type: 'string', validation: R => R.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text',   rows: 2 }),
            defineField({ name: 'icon',        title: 'Icon (Lucide name)', type: 'string' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({ title: title ?? 'Feature' }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: ({ heading }) => ({ title: `Features: ${heading ?? 'Untitled'}`, media: BulbOutlineIcon }),
  },
})

// ─── 3. Posts Section ────────────────────────────────────────────────────────
// Marker block — tells the page renderer to mount the Posts component.

export const postsSection = defineType({
  name: 'postsSection',
  title: 'Posts',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Posts' }),
    defineField({
      name: 'limit',
      title: 'Post Limit (0 = all)',
      type: 'number',
      initialValue: 0,
      validation: R => R.min(0).integer(),
    }),
  ],
  preview: {
    select: { heading: 'heading', limit: 'limit' },
    prepare: ({ heading, limit }) => ({
      title:    `Posts: ${heading ?? 'Posts'}`,
      subtitle: limit ? `Limit: ${limit}` : 'All posts',
      media:    DocumentTextIcon,
    }),
  },
})

// ─── 4. Auth Hero Section ─────────────────────────────────────────────────────
// Left branding panel on login/signup pages.
// Hidden on mobile; stacks as left column (45 %) on desktop.

export const authHeroSection = defineType({
  name: 'authHeroSection',
  title: 'Auth Hero (Left Panel)',
  type: 'object',
  icon: LockIcon,
  fields: [
    defineField({
      name: 'mode',
      title: 'Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Login',  value: 'login'  },
          { title: 'Signup', value: 'signup' },
          { title: 'Both',   value: 'both'   },
        ],
        layout: 'radio',
      },
      initialValue: 'login',
    }),
    defineField({ name: 'badge',    title: 'Badge',    type: 'string', description: 'Small pill above the headline' }),
    defineField({ name: 'headline', title: 'Headline', type: 'string', validation: R => R.required() }),
    defineField({
      name: 'features',
      title: 'Feature Bullets',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon (emoji or short text)', type: 'string' }),
            defineField({ name: 'text', title: 'Text',                       type: 'string', validation: R => R.required() }),
          ],
          preview: {
            select: { title: 'text', subtitle: 'icon' },
            prepare: ({ title, subtitle }) => ({ title, subtitle }),
          },
        },
      ],
    }),
    defineField({ name: 'footerNote', title: 'Footer Note', type: 'string', initialValue: 'Powered by Supabase Auth' }),
  ],
  preview: {
    select: { headline: 'headline', mode: 'mode' },
    prepare: ({ headline, mode }) => ({
      title: `Auth Hero (${mode ?? 'login'}): ${headline ?? 'Untitled'}`,
      media: LockIcon,
    }),
  },
})

// ─── 5. Auth Form Section ─────────────────────────────────────────────────────
// Right panel: form card with Google OAuth + email/password form.
// All visible copy (labels, placeholders, button text) is CMS-controlled.

export const authSection = defineType({
  name: 'authSection',
  title: 'Auth Form (Right Panel)',
  type: 'object',
  icon: LockIcon,
  fields: [
    defineField({
      name: 'mode',
      title: 'Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Login',  value: 'login'  },
          { title: 'Signup', value: 'signup' },
        ],
        layout: 'radio',
      },
      initialValue: 'login',
      validation: R => R.required(),
    }),
    // ── Form card heading ─────────────────────────────────────────────────────
    defineField({ name: 'heading',      title: 'Heading',       type: 'string', description: 'e.g. "Welcome back" or "Create your account"' }),
    // ── OAuth ─────────────────────────────────────────────────────────────────
    defineField({ name: 'googleLabel',  title: 'Google Button Label',  type: 'string', initialValue: 'Continue with Google' }),
    defineField({ name: 'dividerLabel', title: 'OR Divider Label',      type: 'string', initialValue: 'or' }),
    // ── Name (signup only) ────────────────────────────────────────────────────
    defineField({ name: 'nameLabel',       title: 'Name Label',       type: 'string', description: 'Signup only. e.g. "Name"',             initialValue: 'Name' }),
    defineField({ name: 'namePlaceholder', title: 'Name Placeholder', type: 'string', description: 'Signup only.',                        initialValue: 'Your full name' }),
    // ── Email ─────────────────────────────────────────────────────────────────
    defineField({ name: 'emailLabel',       title: 'Email Label',       type: 'string', initialValue: 'Email' }),
    defineField({ name: 'emailPlaceholder', title: 'Email Placeholder', type: 'string', initialValue: 'you@example.com' }),
    // ── Password ──────────────────────────────────────────────────────────────
    defineField({ name: 'passwordLabel',       title: 'Password Label',       type: 'string', initialValue: 'Password' }),
    defineField({ name: 'passwordPlaceholder', title: 'Password Placeholder', type: 'string', initialValue: 'Your password' }),
    // ── Submit + footer ────────────────────────────────────────────────────────
    defineField({ name: 'submitLabel',     title: 'Submit Label',     type: 'string', initialValue: 'Sign in' }),
    defineField({ name: 'footerText',      title: 'Footer Text',      type: 'string', initialValue: "Don't have an account?" }),
    defineField({ name: 'footerLinkLabel', title: 'Footer Link Label', type: 'string', initialValue: 'Request access' }),
    defineField({ name: 'footerLinkHref',  title: 'Footer Link URL',   type: 'string', initialValue: '/signup' }),
    // ── Visibility toggles ────────────────────────────────────────────────────
    defineField({ name: 'showGoogleOAuth',    title: 'Show Google OAuth',     type: 'boolean', initialValue: true }),
    defineField({ name: 'showEmailPassword',  title: 'Show Email/Password',   type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { mode: 'mode', heading: 'heading' },
    prepare: ({ mode, heading }) => ({
      title: `Auth Form (${mode ?? 'login'}): ${heading ?? 'Untitled'}`,
      media: LockIcon,
    }),
  },
})

// ─── 6. Auth Legal Section ────────────────────────────────────────────────────
// Legal link row shown at the bottom of auth pages (Terms, Privacy, Security).

export const authLegalSection = defineType({
  name: 'authLegalSection',
  title: 'Auth Legal Links',
  type: 'object',
  icon: LockIcon,
  fields: [
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: R => R.required() }),
            defineField({ name: 'href',  title: 'URL',   type: 'string', initialValue: '#' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
            prepare: ({ title, subtitle }) => ({ title, subtitle }),
          },
        },
      ],
      initialValue: [
        { label: 'Terms of Service', href: '#' },
        { label: 'Privacy Policy',   href: '#' },
        { label: 'Security',         href: '#' },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Auth Legal Links', media: LockIcon }),
  },
})

// ─── 5. Analytics Section ────────────────────────────────────────────────────
// Marker block — mounts the PostHog analytics component.

export const analyticsSection = defineType({
  name: 'analyticsSection',
  title: 'Analytics',
  type: 'object',
  icon: ActivityIcon,
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Analytics' }),
  ],
  preview: {
    prepare: () => ({ title: 'Analytics', media: ActivityIcon }),
  },
})

// ─── 6. Navbar Section ───────────────────────────────────────────────────────

export const navbarSection = defineType({
  name: 'navbarSection',
  title: 'Navbar',
  type: 'object',
  icon: MenuIcon,
  fields: [
    defineField({ name: 'logo', title: 'Logo Text', type: 'string', initialValue: 'ContentFlow' }),
    defineField({
      name: 'links',
      title: 'Nav Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: R => R.required() }),
            defineField({ name: 'href',  title: 'URL',   type: 'string', validation: R => R.required() }),
          ],
          preview: {
            select: { label: 'label', href: 'href' },
            prepare: ({ label, href }) => ({ title: label, subtitle: href }),
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Navbar', media: MenuIcon }),
  },
})

// ─── 8. Featured Posts Section ───────────────────────────────────────────────
// Shows a curated grid of featured posts fetched from Sanity.

export const featuredPostsSection = defineType({
  name: 'featuredPostsSection',
  title: 'Featured Posts',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'heading',      title: 'Heading',             type: 'string', initialValue: 'Featured Stories' }),
    defineField({ name: 'subheading',   title: 'Subheading',          type: 'string' }),
    defineField({ name: 'maxPosts',     title: 'Max Posts',           type: 'number', initialValue: 2, validation: R => R.min(1).max(6).integer() }),
    defineField({ name: 'showExcerpt', title: 'Show Excerpt',         type: 'boolean', initialValue: true }),
    defineField({ name: 'showTags',    title: 'Show Tags',            type: 'boolean', initialValue: true }),
    defineField({ name: 'viewAllLabel', title: 'View All Label',      type: 'string', initialValue: 'View all stories' }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: ({ heading }) => ({ title: `Featured Posts: ${heading ?? 'Untitled'}`, media: DocumentTextIcon }),
  },
})

// ─── 9. Recent Posts Section ──────────────────────────────────────────────────
// Shows a filterable grid of recent posts with load-more support.

export const recentPostsSection = defineType({
  name: 'recentPostsSection',
  title: 'Recent Posts',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'heading',      title: 'Heading',        type: 'string', initialValue: 'Recent Publications' }),
    defineField({ name: 'subheading',   title: 'Subheading',     type: 'string' }),
    defineField({ name: 'count',        title: 'Initial Count',  type: 'number', initialValue: 12, validation: R => R.min(1).integer() }),
    defineField({ name: 'viewAllLabel', title: 'View All Label', type: 'string', initialValue: 'View all posts' }),
  ],
  preview: {
    select: { heading: 'heading', count: 'count' },
    prepare: ({ heading, count }) => ({
      title:    `Recent Posts: ${heading ?? 'Untitled'}`,
      subtitle: `Initial count: ${count ?? 12}`,
      media:    DocumentTextIcon,
    }),
  },
})

// ─── 10. CTA Section ──────────────────────────────────────────────────────────
// Call-to-action band with heading, body text, and two optional buttons.

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Call to Action',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({ name: 'heading',  title: 'Heading',  type: 'string', validation: R => R.required() }),
    defineField({ name: 'body',     title: 'Body',     type: 'text',   rows: 2 }),
    defineField({
      name: 'primaryButton',
      title: 'Primary Button',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href',  title: 'URL',   type: 'string' }),
      ],
    }),
    defineField({
      name: 'secondaryButton',
      title: 'Secondary Button',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'href',  title: 'URL',   type: 'string' }),
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Theme',
      type: 'string',
      options: {
        list: [
          { title: 'Dark',   value: 'dark'   },
          { title: 'Indigo', value: 'indigo' },
          { title: 'Subtle', value: 'subtle' },
        ],
        layout: 'radio',
      },
      initialValue: 'indigo',
    }),
    defineField({ name: 'centered', title: 'Centered', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: ({ heading }) => ({ title: `CTA: ${heading ?? 'Untitled'}`, media: BulbOutlineIcon }),
  },
})

// ─── 7. Footer Section ───────────────────────────────────────────────────────

export const footerSection = defineType({
  name: 'footerSection',
  title: 'Footer',
  type: 'object',
  icon: InlineElementIcon,
  fields: [
    defineField({ name: 'tagline',   title: 'Tagline',   type: 'string' }),
    defineField({ name: 'copyright', title: 'Copyright', type: 'string', initialValue: '© 2026 ContentFlow' }),
    defineField({
      name: 'links',
      title: 'Footer Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: R => R.required() }),
            defineField({ name: 'href',  title: 'URL',   type: 'string', validation: R => R.required() }),
          ],
          preview: {
            select: { label: 'label', href: 'href' },
            prepare: ({ label, href }) => ({ title: label, subtitle: href }),
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Footer', media: InlineElementIcon }),
  },
})
