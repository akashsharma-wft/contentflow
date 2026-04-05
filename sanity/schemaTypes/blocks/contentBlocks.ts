import { defineType, defineField } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrepareValue = Record<string, any>

// ─── HEADING SECTION ──────────────────────────────────────────────────────────
// Standalone centered heading + optional subtext. Used between sections.
export const headingSection = defineType({
  name: 'headingSection',
  title: 'Heading Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'text', rows: 2 }),
    defineField({ name: 'badge', title: 'Badge Label', type: 'string' }),
    defineField({
      name: 'align',
      title: 'Alignment',
      type: 'string',
      options: { list: ['left', 'center', 'right'].map(v => ({ title: v[0].toUpperCase() + v.slice(1), value: v })), layout: 'radio' },
      initialValue: 'center',
    }),
    defineField({
      name: 'size',
      title: 'Heading Size',
      type: 'string',
      options: { list: [
        { title: 'H1 (page title)', value: 'h1' },
        { title: 'H2 (section title)', value: 'h2' },
        { title: 'H3 (subsection)', value: 'h3' },
      ], layout: 'radio' },
      initialValue: 'h2',
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: (value: PrepareValue) => ({ title: `Heading: ${value.heading}` }),
  },
})

// ─── FEATURE LIST SECTION ─────────────────────────────────────────────────────
// Icon + title + description rows. The classic "why use us" list.
export const featureListSection = defineType({
  name: 'featureListSection',
  title: 'Feature List Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: { list: [
        { title: 'Vertical list', value: 'list' },
        { title: 'Grid (2 cols)', value: 'grid-2' },
        { title: 'Grid (3 cols)', value: 'grid-3' },
      ], layout: 'radio' },
      initialValue: 'grid-3',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'icon', title: 'Icon (Lucide name)', type: 'string' }),
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
        ],
        preview: { select: { title: 'title' }, prepare: (value: PrepareValue) => ({ title: value.title }) },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading', features: 'features' },
    prepare(value: PrepareValue) {
      return { title: `Features: ${value.heading ?? 'Untitled'}`, subtitle: `${value.features?.length ?? 0} items` }
    },
  },
})

// ─── TESTIMONIALS SECTION ─────────────────────────────────────────────────────
export const testimonialsSection = defineType({
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'What people say' }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (Rule) => Rule.required() }),
          defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'title', title: 'Title / Company', type: 'string' }),
          defineField({ name: 'avatar', title: 'Avatar', type: 'image', options: { hotspot: true } }),
          defineField({ name: 'rating', title: 'Rating (1-5)', type: 'number', initialValue: 5 }),
        ],
        preview: { select: { name: 'name', quote: 'quote' }, prepare: (value: PrepareValue) => ({ title: value.name }) },
      }],
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: { list: [
        { title: 'Grid', value: 'grid' },
        { title: 'Carousel', value: 'carousel' },
        { title: 'Single large', value: 'single' },
      ], layout: 'radio' },
      initialValue: 'grid',
    }),
  ],
  preview: {
    select: { heading: 'heading', testimonials: 'testimonials' },
    prepare(value: PrepareValue) {
      return { title: `Testimonials: ${value.heading ?? ''}`, subtitle: `${value.testimonials?.length ?? 0} quotes` }
    },
  },
})

// ─── FAQ SECTION ──────────────────────────────────────────────────────────────
export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Frequently Asked Questions' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({
      name: 'faqs',
      title: 'Questions',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'answer', title: 'Answer', type: 'array', of: [{ type: 'block' }], validation: (Rule) => Rule.required() }),
        ],
        preview: { select: { title: 'question' }, prepare: (value: PrepareValue) => ({ title: value.title }) },
      }],
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: { list: [
        { title: 'Accordion (expand on click)', value: 'accordion' },
        { title: 'Open (all visible)', value: 'open' },
        { title: 'Two columns', value: 'two-col' },
      ], layout: 'radio' },
      initialValue: 'accordion',
    }),
  ],
  preview: {
    select: { heading: 'heading', faqs: 'faqs' },
    prepare(value: PrepareValue) {
      return { title: `FAQ: ${value.heading ?? ''}`, subtitle: `${value.faqs?.length ?? 0} questions` }
    },
  },
})

// ─── PRICING SECTION ──────────────────────────────────────────────────────────
export const pricingSection = defineType({
  name: 'pricingSection',
  title: 'Pricing Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Simple Pricing' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({
      name: 'plans',
      title: 'Plans',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Plan Name', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'price', title: 'Price (e.g. $9)', type: 'string' }),
          defineField({ name: 'priceNote', title: 'Price Note (e.g. /month)', type: 'string' }),
          defineField({ name: 'description', title: 'Description', type: 'string' }),
          defineField({ name: 'badge', title: 'Badge (e.g. Most Popular)', type: 'string' }),
          defineField({ name: 'highlighted', title: 'Highlight this plan?', type: 'boolean', initialValue: false }),
          defineField({
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{ type: 'object', fields: [
              defineField({ name: 'text', title: 'Feature', type: 'string' }),
              defineField({ name: 'included', title: 'Included?', type: 'boolean', initialValue: true }),
            ]}],
          }),
          defineField({ name: 'ctaLabel', title: 'CTA Button Label', type: 'string' }),
          defineField({ name: 'ctaHref', title: 'CTA URL', type: 'string' }),
        ],
        preview: { select: { name: 'name', price: 'price' }, prepare: (value: PrepareValue) => ({ title: value.name, subtitle: value.price }) },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: (value: PrepareValue) => ({ title: `Pricing: ${value.heading ?? ''}` }),
  },
})

// ─── TEAM SECTION ─────────────────────────────────────────────────────────────
export const teamSection = defineType({
  name: 'teamSection',
  title: 'Team Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Meet the Team' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({
      name: 'members',
      title: 'Team Members',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'role', title: 'Role', type: 'string' }),
          defineField({ name: 'bio', title: 'Short Bio', type: 'text', rows: 2 }),
          defineField({ name: 'avatar', title: 'Photo', type: 'image', options: { hotspot: true } }),
          defineField({ name: 'linkedIn', title: 'LinkedIn URL', type: 'url' }),
          defineField({ name: 'twitter', title: 'Twitter/X URL', type: 'url' }),
        ],
        preview: { select: { name: 'name', role: 'role' }, prepare: (value: PrepareValue) => ({ title: value.name, subtitle: value.role }) },
      }],
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      options: { list: [2, 3, 4], layout: 'radio' },
      initialValue: 3,
    }),
  ],
  preview: {
    select: { heading: 'heading', members: 'members' },
    prepare(value: PrepareValue) {
      return { title: `Team: ${value.heading ?? ''}`, subtitle: `${value.members?.length ?? 0} members` }
    },
  },
})

// ─── LOGO BAR SECTION ─────────────────────────────────────────────────────────
export const logoBarSection = defineType({
  name: 'logoBarSection',
  title: 'Logo Bar (Social Proof)',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Label (e.g. "Trusted by")', type: 'string' }),
    defineField({
      name: 'logos',
      title: 'Logos',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'image', title: 'Logo Image', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
          defineField({ name: 'alt', title: 'Company Name (alt text)', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'href', title: 'Link (optional)', type: 'url' }),
        ],
        preview: { select: { alt: 'alt' }, prepare: (value: PrepareValue) => ({ title: value.alt }) },
      }],
    }),
    defineField({ name: 'scrolling', title: 'Auto-scroll (marquee)?', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { heading: 'heading', logos: 'logos' },
    prepare(value: PrepareValue) {
      return { title: `Logo Bar: ${value.heading ?? 'Social Proof'}`, subtitle: `${value.logos?.length ?? 0} logos` }
    },
  },
})

// ─── CAROUSEL SECTION ─────────────────────────────────────────────────────────
export const carouselSection = defineType({
  name: 'carouselSection',
  title: 'Carousel Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
          defineField({ name: 'heading', title: 'Heading', type: 'string' }),
          defineField({ name: 'body', title: 'Body', type: 'text', rows: 2 }),
          defineField({ name: 'ctaLabel', title: 'CTA Label', type: 'string' }),
          defineField({ name: 'ctaHref', title: 'CTA URL', type: 'string' }),
        ],
        preview: { select: { title: 'heading' }, prepare: (value: PrepareValue) => ({ title: value.title ?? 'Slide' }) },
      }],
    }),
    defineField({ name: 'autoplay', title: 'Autoplay?', type: 'boolean', initialValue: false }),
    defineField({ name: 'showDots', title: 'Show dot indicators?', type: 'boolean', initialValue: true }),
    defineField({ name: 'showArrows', title: 'Show arrow buttons?', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { heading: 'heading', slides: 'slides' },
    prepare(value: PrepareValue) {
      return { title: `Carousel: ${value.heading ?? ''}`, subtitle: `${value.slides?.length ?? 0} slides` }
    },
  },
})

// ─── TABLE SECTION ────────────────────────────────────────────────────────────
export const tableSection = defineType({
  name: 'tableSection',
  title: 'Table Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'headers',
      title: 'Column Headers',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({
            name: 'cells',
            title: 'Cells (one per column)',
            type: 'array',
            of: [{ type: 'string' }],
          }),
        ],
        preview: { select: { cells: 'cells' }, prepare: (value: PrepareValue) => ({ title: value.cells?.[0] ?? 'Row' }) },
      }],
    }),
    defineField({ name: 'striped', title: 'Striped rows?', type: 'boolean', initialValue: true }),
    defineField({ name: 'bordered', title: 'Bordered?', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: (value: PrepareValue) => ({ title: `Table: ${value.heading ?? ''}` }),
  },
})

// ─── TIMELINE SECTION ─────────────────────────────────────────────────────────
export const timelineSection = defineType({
  name: 'timelineSection',
  title: 'Timeline Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'events',
      title: 'Events',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'date', title: 'Date / Label', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          defineField({ name: 'icon', title: 'Icon (Lucide name)', type: 'string' }),
          defineField({ name: 'highlight', title: 'Highlight this event?', type: 'boolean', initialValue: false }),
        ],
        preview: { select: { title: 'title', date: 'date' }, prepare: (value: PrepareValue) => ({ title: value.title, subtitle: value.date }) },
      }],
    }),
    defineField({
      name: 'orientation',
      title: 'Orientation',
      type: 'string',
      options: { list: [
        { title: 'Vertical (center line)', value: 'vertical' },
        { title: 'Horizontal scroll', value: 'horizontal' },
      ], layout: 'radio' },
      initialValue: 'vertical',
    }),
  ],
  preview: {
    select: { heading: 'heading', events: 'events' },
    prepare(value: PrepareValue) {
      return { title: `Timeline: ${value.heading ?? ''}`, subtitle: `${value.events?.length ?? 0} events` }
    },
  },
})

// ─── BANNER SECTION ───────────────────────────────────────────────────────────
// Full-width announcement bar.
export const bannerSection = defineType({
  name: 'bannerSection',
  title: 'Banner / Announcement Bar',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'ctaLabel', title: 'CTA Label', type: 'string' }),
    defineField({ name: 'ctaHref', title: 'CTA URL', type: 'string' }),
    defineField({ name: 'dismissible', title: 'Dismissible?', type: 'boolean', initialValue: true }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      options: { list: [
        { title: 'Indigo', value: 'indigo' },
        { title: 'Amber (warning)', value: 'amber' },
        { title: 'Red (urgent)', value: 'red' },
        { title: 'Emerald (success)', value: 'emerald' },
      ], layout: 'radio' },
      initialValue: 'indigo',
    }),
  ],
  preview: {
    select: { text: 'text' },
    prepare: (value: PrepareValue) => ({ title: `Banner: ${value.text ?? ''}` }),
  },
})

// ─── TABS SECTION ─────────────────────────────────────────────────────────────
export const tabsSection = defineType({
  name: 'tabsSection',
  title: 'Tabs Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'tabs',
      title: 'Tabs',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Tab Label', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'icon', title: 'Icon (Lucide name)', type: 'string' }),
          defineField({
            name: 'content',
            title: 'Tab Content',
            type: 'array',
            of: [{ type: 'block' }],
          }),
          defineField({ name: 'image', title: 'Image (optional)', type: 'image', options: { hotspot: true } }),
        ],
        preview: { select: { title: 'label' }, prepare: (value: PrepareValue) => ({ title: value.title }) },
      }],
    }),
  ],
  preview: {
    select: { heading: 'heading', tabs: 'tabs' },
    prepare(value: PrepareValue) {
      return { title: `Tabs: ${value.heading ?? ''}`, subtitle: `${value.tabs?.length ?? 0} tabs` }
    },
  },
})
