// sanity/schemaTypes/singletons/siteConfig.ts
// Single site configuration document — stable ID: 'site-config'
//
// Architecture rule:
//   Structure / layout  → code  (Next.js components do the rendering)
//   Content  / config   → Sanity (editors control text, links, labels, visibility)
//
// The four layout config objects below mirror the real UI zones exactly:
//   navbarConfig  — public header bar + mobile bottom bar
//   footerConfig  — public footer (brand, columns, social, copyright, bottom links)
//   sidebarConfig — dashboard sidebar (brand, nav, CTA, footer links, status bar)
//   mobileNavConfig — dashboard mobile bottom tab bar

import { defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons'

// ── Shared reusable field definitions ─────────────────────────────────────────

/** Standard nav link fields: label, URL, open-in-new-tab */
const NAV_LINK_FIELDS = [
  defineField({ name: 'label',    title: 'Label',           type: 'string', validation: R => R.required() }),
  defineField({ name: 'href',     title: 'URL / Path',      type: 'string', validation: R => R.required() }),
  defineField({ name: 'external', title: 'Open in new tab', type: 'boolean', initialValue: false }),
]

/** App nav item fields: multilingual label + audience visibility */
const NAV_ITEM_FIELDS = [
  defineField({
    name: 'label', title: 'Label', type: 'object',
    fields: [
      defineField({ name: 'en', title: 'English', type: 'string', validation: R => R.required() }),
      defineField({ name: 'hi', title: 'Hindi',   type: 'string' }),
      defineField({ name: 'kn', title: 'Kannada', type: 'string' }),
    ],
  }),
  defineField({ name: 'href', title: 'URL / Path', type: 'string', validation: R => R.required() }),
  defineField({
    name: 'icon', title: 'Icon', type: 'string',
    description: 'Lucide icon name — e.g. "LayoutDashboard", "FileText", "Settings", "CreditCard", "BarChart2", "ShieldCheck"',
  }),
  defineField({
    name: 'visibleFor', title: 'Visible For', type: 'array',
    description: 'Audience roles that can see this item. Leave empty to hide from all.',
    of: [{ type: 'string' }],
    options: {
      list: [
        { title: 'Guest (not logged in)', value: 'guest' },
        { title: 'User (logged in)',       value: 'user'  },
        { title: 'Admin',                  value: 'admin' },
      ],
    },
  }),
]

/** Preview helper that reads the nested label.en field */
const NAV_ITEM_PREVIEW = {
  select: { title: 'label.en', subtitle: 'href' },
  prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }),
}

/** CTA button fields used in several zones */
const CTA_BUTTON_FIELDS = [
  defineField({ name: 'label', title: 'Button Label', type: 'string' }),
  defineField({ name: 'href',  title: 'Button URL',   type: 'string' }),
]

// ── Document ──────────────────────────────────────────────────────────────────

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Site Config',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'navbar',   title: 'Navbar'   },
    { name: 'footer',   title: 'Footer'   },
    { name: 'sidebar',  title: 'Sidebar'  },
    { name: 'mobile',   title: 'Mobile Nav' },
  ],
  fields: [

    // ── Identity ─────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Browser Tab Title',
      description: 'Displayed in the browser tab. Typically the site or product name.',
      type: 'string',
      group: 'identity',
      initialValue: 'ContentFlow',
      validation: R => R.required(),
    }),
    defineField({
      name: 'siteName',
      title: 'Site Name',
      description: 'Default brand name. Individual layout zones can override this below.',
      type: 'string',
      group: 'identity',
      initialValue: 'ContentFlow',
      validation: R => R.required(),
    }),

    // ── Navbar config ─────────────────────────────────────────────────────────
    // Controls the public header bar that appears on layout='home' pages.
    // Nav items are role-filtered in the frontend — editors configure all items here.
    defineField({
      name: 'navbarConfig',
      title: 'Navbar Config',
      description: 'Brand, nav items (filtered by role), and auth actions for the public header.',
      type: 'object',
      group: 'navbar',
      fields: [

        // Brand
        defineField({ name: 'brandName', title: 'Brand Name', type: 'string', initialValue: 'ContentFlow',
          description: 'Overrides Site Name for the navbar logo text.' }),

        // Right-side action toggles
        defineField({ name: 'showLanguageSwitcher', title: 'Show Language Switcher', type: 'boolean', initialValue: true }),

        // CTA button (renders next to sign-in, shown to guest users only)
        defineField({
          name: 'ctaButton', title: 'CTA Button',
          description: 'Optional call-to-action button shown in the navbar for guest (unauthenticated) visitors. Leave label empty to hide.',
          type: 'object',
          fields: CTA_BUTTON_FIELDS,
        }),

        // Navigation items — filtered by visibleFor in the frontend
        defineField({
          name: 'items', title: 'Navigation Items',
          description: 'Items shown in the center of the navbar, filtered by the visitor\'s role.',
          type: 'array',
          of: [{ type: 'object', fields: NAV_ITEM_FIELDS, preview: NAV_ITEM_PREVIEW }],
        }),
      ],
    }),

    // ── Footer config ─────────────────────────────────────────────────────────
    // Controls the public footer that appears on layout='home' pages.
    defineField({
      name: 'footerConfig',
      title: 'Footer Config',
      description: 'Brand block, link columns, social links, copyright, and bottom-row auxiliary links.',
      type: 'object',
      group: 'footer',
      fields: [

        // Brand block
        defineField({ name: 'brandName', title: 'Brand Name (Footer)', type: 'string',
          description: 'Overrides Site Name in the footer brand block. Leave empty to use Site Name.' }),
        defineField({ name: 'showBrandLogo', title: 'Show Brand Logo Block', type: 'boolean', initialValue: true }),
        defineField({ name: 'tagline', title: 'Tagline / Description', type: 'string',
          description: 'Short description shown below the brand name.' }),

        // Social links
        defineField({
          name: 'socialLinks', title: 'Social Links', type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({
                name: 'platform', title: 'Platform', type: 'string',
                options: { list: [
                  { title: 'Twitter / X', value: 'twitter'   },
                  { title: 'GitHub',      value: 'github'    },
                  { title: 'LinkedIn',    value: 'linkedin'  },
                  { title: 'YouTube',     value: 'youtube'   },
                  { title: 'Instagram',   value: 'instagram' },
                ]},
                validation: R => R.required(),
              }),
              defineField({ name: 'label', title: 'Aria Label', type: 'string', description: 'Accessible name for the icon button.' }),
              defineField({ name: 'href',  title: 'URL', type: 'string', validation: R => R.required() }),
            ],
            preview: { select: { title: 'platform', subtitle: 'href' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
          }],
        }),

        // Link columns
        defineField({
          name: 'columns', title: 'Link Columns', type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'heading', title: 'Column Heading', type: 'string', validation: R => R.required() }),
              defineField({
                name: 'links', title: 'Links', type: 'array',
                of: [{
                  type: 'object',
                  fields: NAV_LINK_FIELDS,
                  preview: { select: { title: 'label' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string }) },
                }],
              }),
            ],
            preview: { select: { title: 'heading' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string }) },
          }],
        }),

        // Legal / copyright row
        defineField({ name: 'copyright', title: 'Copyright Text', type: 'string',
          initialValue: `© ${new Date().getFullYear()} ContentFlow. All rights reserved.` }),
        defineField({
          name: 'bottomLinks', title: 'Bottom Row Links',
          description: 'Auxiliary links shown in the bottom bar (e.g. RSS Feed, Status, Privacy, Terms).',
          type: 'array',
          of: [{
            type: 'object',
            fields: NAV_LINK_FIELDS,
            preview: { select: { title: 'label' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string }) },
          }],
        }),
      ],
    }),

    // ── Sidebar config ────────────────────────────────────────────────────────
    // Controls all text / link / label content in the dashboard sidebar.
    // Dynamic data (user name, avatar, plan) comes from Supabase at runtime.
    defineField({
      name: 'sidebarConfig',
      title: 'Sidebar Config',
      description: 'Brand block, nav items, CTA, footer links, and status bar for the dashboard sidebar.',
      type: 'object',
      group: 'sidebar',
      fields: [

        // Brand block (SidebarLogo component)
        defineField({ name: 'brandName',     title: 'Brand Name',     type: 'string', initialValue: 'ContentFlow',
          description: 'Product name shown in the sidebar logo area.' }),
        defineField({ name: 'brandSubtitle', title: 'Brand Subtitle', type: 'string', initialValue: 'Engineering CMS',
          description: 'Sub-label shown below the brand name (e.g. "Engineering CMS").' }),

        // Primary navigation
        defineField({
          name: 'navItems', title: 'Navigation Items', type: 'array',
          description: 'Primary nav links. Use Lucide icon names for the icon field.',
          of: [{ type: 'object', fields: NAV_ITEM_FIELDS, preview: NAV_ITEM_PREVIEW }],
        }),

        // CTA button block (SidebarFooter — "+ New Entry")
        defineField({
          name: 'ctaButton', title: 'CTA Button',
          description: 'Primary action button shown in the sidebar footer area (e.g. "+ New Entry").',
          type: 'object',
          fields: CTA_BUTTON_FIELDS,
        }),

        // Footer support / utility links (above sign-out)
        defineField({
          name: 'footerLinks', title: 'Footer Links',
          description: 'Utility links shown at the bottom of the sidebar (e.g. Documentation, Support). Sign Out is always rendered by code.',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({ name: 'label',    title: 'Label',           type: 'string', validation: R => R.required() }),
              defineField({ name: 'href',     title: 'URL',             type: 'string', validation: R => R.required() }),
              defineField({ name: 'icon',     title: 'Icon',            type: 'string',
                description: 'Lucide icon name — e.g. "BookOpen", "LifeBuoy", "HelpCircle"' }),
              defineField({ name: 'external', title: 'Open in new tab', type: 'boolean', initialValue: false }),
            ],
            preview: { select: { title: 'label', subtitle: 'href' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
          }],
        }),

        // Status bar (bottom of sidebar when expanded)
        defineField({ name: 'statusText',  title: 'Status Bar Text',  type: 'string',
          description: 'Static label shown at the very bottom of the sidebar (e.g. "Built with ContentFlow SDK").',
          initialValue: 'Built with ContentFlow SDK' }),
        defineField({ name: 'statusBadge', title: 'Status Badge Text', type: 'string',
          description: 'Live status badge text (e.g. "System Status: Nominal").',
          initialValue: 'System Status: Nominal' }),
      ],
    }),

    // ── Mobile nav config ─────────────────────────────────────────────────────
    // Controls the bottom tab bar shown on mobile in the dashboard layout.
    defineField({
      name: 'mobileNavConfig',
      title: 'Mobile Nav Config',
      description: 'Bottom tab bar shown on mobile screens inside the dashboard layout.',
      type: 'object',
      group: 'mobile',
      fields: [
        defineField({ name: 'showLabels', title: 'Show Labels Below Icons', type: 'boolean', initialValue: true }),
        defineField({
          name: 'items', title: 'Bottom Nav Items', type: 'array',
          description: 'Tab items shown in the mobile bar. Items beyond 4 appear in an overflow "More" menu.',
          of: [{ type: 'object', fields: NAV_ITEM_FIELDS, preview: NAV_ITEM_PREVIEW }],
        }),
      ],
    }),

  ],
})
