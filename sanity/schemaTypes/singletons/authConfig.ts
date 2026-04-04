import { defineType, defineField } from 'sanity'

// SINGLETON: Auth Config
// Controls the presentation of login and signup pages.
// Toggle OAuth providers on/off, change copy, configure the split-panel layout.
// IMPORTANT: Toggling OAuth here only affects the UI.
// The actual OAuth provider must be enabled in Supabase dashboard separately.
export const authConfig = defineType({
  name: 'authConfig',
  title: 'Auth Configuration',
  type: 'document',
  groups: [
    { name: 'providers', title: 'Auth Providers', default: true },
    { name: 'loginPage', title: 'Login Page' },
    { name: 'signupPage', title: 'Signup Page' },
    { name: 'leftPanel', title: 'Left Panel' },
  ],
  fields: [
    // ── Auth providers ────────────────────────────────────────────────
    defineField({
      name: 'showGoogleOAuth',
      title: 'Show Google OAuth button?',
      group: 'providers',
      description: 'Hides/shows the "Continue with Google" button on login + signup. Supabase must also have Google provider enabled.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showEmailPassword',
      title: 'Show email + password form?',
      group: 'providers',
      type: 'boolean',
      initialValue: true,
    }),

    // ── Login page copy ───────────────────────────────────────────────
    defineField({
      name: 'loginHeading',
      title: 'Login Page — Heading',
      group: 'loginPage',
      type: 'string',
      initialValue: 'Welcome back',
    }),
    defineField({
      name: 'loginSubheading',
      title: 'Login Page — Subheading',
      group: 'loginPage',
      type: 'string',
      initialValue: 'Sign in to your workspace',
    }),
    defineField({
      name: 'loginSubmitLabel',
      title: 'Login Button Label',
      group: 'loginPage',
      type: 'string',
      initialValue: 'Sign in',
    }),
    defineField({
      name: 'loginFooterText',
      title: 'Footer Text',
      group: 'loginPage',
      type: 'string',
      initialValue: "Don't have an account?",
    }),
    defineField({
      name: 'loginFooterLinkLabel',
      title: 'Footer Link Label',
      group: 'loginPage',
      type: 'string',
      initialValue: 'Request access',
    }),
    defineField({
      name: 'loginFooterLinkHref',
      title: 'Footer Link URL',
      group: 'loginPage',
      type: 'string',
      initialValue: '/signup',
    }),

    // ── Signup page copy ──────────────────────────────────────────────
    defineField({
      name: 'signupHeading',
      title: 'Signup Page — Heading',
      group: 'signupPage',
      type: 'string',
      initialValue: 'Create your account',
    }),
    defineField({
      name: 'signupSubheading',
      title: 'Signup Page — Subheading',
      group: 'signupPage',
      type: 'string',
      initialValue: 'Join the ContentFlow workspace',
    }),
    defineField({
      name: 'signupSubmitLabel',
      title: 'Signup Button Label',
      group: 'signupPage',
      type: 'string',
      initialValue: 'Create account',
    }),
    defineField({
      name: 'signupFooterText',
      title: 'Footer Text',
      group: 'signupPage',
      type: 'string',
      initialValue: 'Already have an account?',
    }),
    defineField({
      name: 'signupFooterLinkLabel',
      title: 'Footer Link Label',
      group: 'signupPage',
      type: 'string',
      initialValue: 'Sign in',
    }),
    defineField({
      name: 'signupFooterLinkHref',
      title: 'Footer Link URL',
      group: 'signupPage',
      type: 'string',
      initialValue: '/login',
    }),

    // ── Left panel (the dark split panel on desktop) ──────────────────
    defineField({
      name: 'leftPanelHeadline',
      title: 'Left Panel Headline',
      group: 'leftPanel',
      type: 'string',
      initialValue: 'CMS-driven publishing for engineering teams.',
    }),
    defineField({
      name: 'leftPanelBadge',
      title: 'Left Panel Badge Text',
      group: 'leftPanel',
      type: 'string',
      initialValue: 'Backed by Supabase Auth',
    }),
    defineField({
      name: 'leftPanelFeatures',
      title: 'Left Panel Feature Bullets',
      group: 'leftPanel',
      description: 'Up to 4 bullet points shown on the left side of auth pages',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'text', title: 'Feature Text', type: 'string' }),
            defineField({
              name: 'icon',
              title: 'Icon (Lucide name)',
              type: 'string',
              description: 'e.g. Zap, Shield, LayoutGrid, GitBranch',
            }),
          ],
          preview: { select: { title: 'text' } },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Auth Configuration' }
    },
  },
})
