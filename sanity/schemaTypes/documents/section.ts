// sanity/schemaTypes/documents/section.ts
//
// Single section document — replaces both the old component-reference model
// and the inline-object approach.
//
// Architecture:
//   • `sectionType` is the discriminator (hero | featuredPosts | recentPosts |
//     cta | authHero | authForm | authLegal | features | posts | analytics |
//     settings | billing | admin)
//   • Each possible content block lives in its own named sub-object field
//     (e.g. `hero`, `featuredPosts`, …) and is hidden unless the matching
//     sectionType is selected — keeps Studio clean while keeping one doc type
//   • Pages store `sections[]` as references to these documents
//   • GROQ dereferences them with `sections[]->` so the front-end receives
//     the same shape it always expected

import { defineField, defineType } from 'sanity'
import {
  ImageIcon,
  BulbOutlineIcon,
  DocumentTextIcon,
  LockIcon,
  ActivityIcon,
  ControlsIcon,
  CreditCardIcon,
  UsersIcon,
  StackCompactIcon,
} from '@sanity/icons'
import { getStudioLanguage } from '../../lib/languageStore'

// ── Shared option lists ────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { title: 'English',          value: 'en' },
  { title: 'Hindi — हिंदी',    value: 'hi' },
  { title: 'Kannada — ಕನ್ನಡ', value: 'kn' },
]

const PAGE_OPTIONS = [
  { title: 'Home',      value: 'home'      },
  { title: 'Login',     value: 'login'     },
  { title: 'Sign Up',   value: 'signup'    },
  { title: 'Posts',     value: 'posts'     },
  { title: 'Settings',  value: 'settings'  },
  { title: 'Billing',   value: 'billing'   },
  { title: 'Analytics', value: 'analytics' },
  { title: 'Admin',     value: 'admin'     },
]

const SECTION_TYPE_OPTIONS = [
  { title: 'Hero',           value: 'hero'          },
  { title: 'Featured Posts', value: 'featuredPosts'  },
  { title: 'Recent Posts',   value: 'recentPosts'   },
  { title: 'Call to Action', value: 'cta'           },
  { title: 'Auth Hero (Left Panel)',  value: 'authHero' },
  { title: 'Auth Form (Right Panel)', value: 'authForm' },
  { title: 'Auth Legal Links',        value: 'authLegal' },
  { title: 'Features',       value: 'features'      },
  { title: 'Posts List',     value: 'postsList'     },
  { title: 'Analytics',      value: 'analytics'     },
  { title: 'Settings',       value: 'settings'      },
  { title: 'Billing',        value: 'billing'       },
  { title: 'Admin',          value: 'admin'         },
]

// ── Helper: hide unless sectionType matches ────────────────────────────────────
const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

// ── Section document ──────────────────────────────────────────────────────────

export const sectionType = defineType({
  name: 'section',
  title: 'Section',
  type: 'document',
  icon: StackCompactIcon,

  fields: [
    // ── Identity ──────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Internal Title',
      description: 'Used only inside Studio (not shown on the site)',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      description: 'Which page this section belongs to — used for Studio grouping.',
      type: 'string',
      options: { list: PAGE_OPTIONS },
      validation: R => R.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      initialValue: () => getStudioLanguage(),
      options: { list: LANGUAGE_OPTIONS, layout: 'radio' },
      validation: R => R.required(),
    }),
    defineField({
      name: 'sectionType',
      title: 'Section Type',
      description: 'Determines which content fields are shown below.',
      type: 'string',
      options: { list: SECTION_TYPE_OPTIONS },
      validation: R => R.required(),
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // ── Hero content ──────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
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
        defineField({ name: 'backgroundImage', title: 'Background Image', type: 'image', options: { hotspot: true } }),
        defineField({
          name: 'theme', title: 'Theme', type: 'string',
          options: { list: [{ title: 'Dark', value: 'dark' }, { title: 'Light', value: 'light' }, { title: 'Indigo Gradient', value: 'gradient' }], layout: 'radio' },
          initialValue: 'dark',
        }),
        defineField({
          name: 'layout', title: 'Layout', type: 'string',
          options: { list: [{ title: 'Centered', value: 'centered' }, { title: 'Split', value: 'split' }], layout: 'radio' },
          initialValue: 'centered',
        }),
      ],
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // ── Featured Posts content ────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'featuredPosts',
      title: 'Featured Posts Content',
      type: 'object',
      ...shownFor('featuredPosts'),
      fields: [
        defineField({ name: 'heading',     title: 'Heading',          type: 'string', initialValue: 'Featured Stories' }),
        defineField({ name: 'subheading',  title: 'Subheading',       type: 'string' }),
        defineField({ name: 'maxPosts',    title: 'Max Posts',        type: 'number', initialValue: 2, validation: R => R.min(1).max(6).integer() }),
        defineField({ name: 'showExcerpt', title: 'Show Excerpt',     type: 'boolean', initialValue: true }),
        defineField({ name: 'showTags',    title: 'Show Tags',        type: 'boolean', initialValue: true }),
        defineField({ name: 'viewAllLabel', title: 'View All Label',  type: 'string', initialValue: 'View all stories' }),
      ],
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // ── Recent Posts content ──────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'recentPosts',
      title: 'Recent Posts Content',
      type: 'object',
      ...shownFor('recentPosts'),
      fields: [
        defineField({ name: 'heading',      title: 'Heading',        type: 'string', initialValue: 'Recent Publications' }),
        defineField({ name: 'subheading',   title: 'Subheading',     type: 'string' }),
        defineField({ name: 'count',        title: 'Initial Count',  type: 'number', initialValue: 12, validation: R => R.min(1).integer() }),
        defineField({ name: 'viewAllLabel', title: 'View All Label', type: 'string', initialValue: 'View all posts' }),
      ],
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // ── CTA content ───────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'cta',
      title: 'CTA Content',
      type: 'object',
      ...shownFor('cta'),
      fields: [
        defineField({ name: 'heading',  title: 'Heading',  type: 'string', validation: R => R.required() }),
        defineField({ name: 'body',     title: 'Body',     type: 'text',   rows: 2 }),
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

    // ══════════════════════════════════════════════════════════════════════════
    // ── Auth Hero content (left branding panel) ───────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'authHero',
      title: 'Auth Hero Content',
      type: 'object',
      ...shownFor('authHero'),
      fields: [
        defineField({
          name: 'mode', title: 'Mode', type: 'string',
          options: { list: [{ title: 'Login', value: 'login' }, { title: 'Signup', value: 'signup' }, { title: 'Both', value: 'both' }], layout: 'radio' },
          initialValue: 'login',
        }),
        defineField({ name: 'badge',    title: 'Badge',    type: 'string', description: 'Small pill above the headline' }),
        defineField({ name: 'headline', title: 'Headline', type: 'string', validation: R => R.required() }),
        defineField({
          name: 'features', title: 'Feature Bullets', type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'icon', title: 'Icon (emoji or short text)', type: 'string' }),
              defineField({ name: 'text', title: 'Text', type: 'string', validation: R => R.required() }),
            ],
            preview: {
              select: { title: 'text', subtitle: 'icon' },
              prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }),
            },
          }],
        }),
        defineField({ name: 'footerNote', title: 'Footer Note', type: 'string', initialValue: 'Powered by Supabase Auth' }),
      ],
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // ── Auth Form content (right panel) ──────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'authForm',
      title: 'Auth Form Content',
      type: 'object',
      ...shownFor('authForm'),
      fields: [
        defineField({
          name: 'mode', title: 'Mode', type: 'string',
          options: { list: [{ title: 'Login', value: 'login' }, { title: 'Signup', value: 'signup' }], layout: 'radio' },
          initialValue: 'login',
          validation: R => R.required(),
        }),
        defineField({ name: 'heading',           title: 'Heading',            type: 'string' }),
        defineField({ name: 'googleLabel',        title: 'Google Button Label', type: 'string', initialValue: 'Continue with Google' }),
        defineField({ name: 'dividerLabel',       title: 'OR Divider Label',    type: 'string', initialValue: 'or' }),
        defineField({ name: 'nameLabel',          title: 'Name Label',          type: 'string', description: 'Signup only', initialValue: 'Name' }),
        defineField({ name: 'namePlaceholder',    title: 'Name Placeholder',    type: 'string', description: 'Signup only', initialValue: 'Your full name' }),
        defineField({ name: 'emailLabel',         title: 'Email Label',         type: 'string', initialValue: 'Email' }),
        defineField({ name: 'emailPlaceholder',   title: 'Email Placeholder',   type: 'string', initialValue: 'you@example.com' }),
        defineField({ name: 'passwordLabel',      title: 'Password Label',      type: 'string', initialValue: 'Password' }),
        defineField({ name: 'passwordPlaceholder', title: 'Password Placeholder', type: 'string', initialValue: 'Your password' }),
        defineField({ name: 'submitLabel',        title: 'Submit Label',        type: 'string', initialValue: 'Sign in' }),
        defineField({ name: 'footerText',         title: 'Footer Text',         type: 'string', initialValue: "Don't have an account?" }),
        defineField({ name: 'footerLinkLabel',    title: 'Footer Link Label',   type: 'string', initialValue: 'Request access' }),
        defineField({ name: 'footerLinkHref',     title: 'Footer Link URL',     type: 'string', initialValue: '/signup' }),
        defineField({ name: 'showGoogleOAuth',    title: 'Show Google OAuth',   type: 'boolean', initialValue: true }),
        defineField({ name: 'showEmailPassword',  title: 'Show Email/Password', type: 'boolean', initialValue: true }),
      ],
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // ── Auth Legal content ────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'authLegal',
      title: 'Auth Legal Content',
      type: 'object',
      ...shownFor('authLegal'),
      fields: [
        defineField({
          name: 'links', title: 'Links', type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'label', title: 'Label', type: 'string', validation: R => R.required() }),
              defineField({ name: 'href',  title: 'URL',   type: 'string', initialValue: '#' }),
            ],
            preview: {
              select: { title: 'label', subtitle: 'href' },
              prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }),
            },
          }],
          initialValue: [
            { label: 'Terms of Service', href: '#' },
            { label: 'Privacy Policy',   href: '#' },
            { label: 'Security',         href: '#' },
          ],
        }),
      ],
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // ── Features content ──────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
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
              defineField({ name: 'title',       title: 'Title',       type: 'string', validation: R => R.required() }),
              defineField({ name: 'description', title: 'Description', type: 'text',   rows: 2 }),
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

    // ══════════════════════════════════════════════════════════════════════════
    // ── Posts List content (marker) ───────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'postsList',
      title: 'Posts List Content',
      type: 'object',
      ...shownFor('postsList'),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Posts' }),
        defineField({ name: 'limit', title: 'Post Limit (0 = all)', type: 'number', initialValue: 0, validation: R => R.min(0).integer() }),
      ],
    }),

    // ══════════════════════════════════════════════════════════════════════════
    // ── Analytics / Settings / Billing / Admin — marker blocks (no content) ──
    // ══════════════════════════════════════════════════════════════════════════
    defineField({
      name: 'analyticsMarker',
      title: 'Analytics Content',
      type: 'object',
      ...shownFor('analytics'),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Analytics' }),
      ],
    }),
    defineField({
      name: 'settingsMarker',
      title: 'Settings Content',
      type: 'object',
      ...shownFor('settings'),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Settings' }),
      ],
    }),
    defineField({
      name: 'billingMarker',
      title: 'Billing Content',
      type: 'object',
      ...shownFor('billing'),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Billing' }),
      ],
    }),
    defineField({
      name: 'adminMarker',
      title: 'Admin Content',
      type: 'object',
      ...shownFor('admin'),
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Admin' }),
      ],
    }),
  ],

  // ── Studio preview ──────────────────────────────────────────────────────────
  preview: {
    select: {
      title:       'title',
      language:    'language',
      page:        'page',
      sectionType: 'sectionType',
    },
    prepare: ({ title, language, page, sectionType: st }: {
      title?: string; language?: string; page?: string; sectionType?: string
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iconMap: Record<string, any> = {
        hero:          ImageIcon,
        featuredPosts: DocumentTextIcon,
        recentPosts:   DocumentTextIcon,
        cta:           BulbOutlineIcon,
        authHero:      LockIcon,
        authForm:      LockIcon,
        authLegal:     LockIcon,
        features:      BulbOutlineIcon,
        postsList:     DocumentTextIcon,
        analytics:     ActivityIcon,
        settings:      ControlsIcon,
        billing:       CreditCardIcon,
        admin:         UsersIcon,
      }
      const langTag = language?.toUpperCase() ?? '?'
      return {
        // "Home Hero  ·  EN"  — makes language visible in every list row
        title:    `${title ?? 'Untitled Section'}  ·  ${langTag}`,
        // "hero  ·  home"  — type + page context
        subtitle: [st, page].filter(Boolean).join('  ·  '),
        media:    (st && iconMap[st]) ?? StackCompactIcon,
      }
    },
  },
})
