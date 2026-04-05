import { defineType, defineField } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrepareValue = Record<string, any>

// ─── IMAGE SECTION ────────────────────────────────────────────────────────────
export const imageSection = defineType({
  name: 'imageSection',
  title: 'Image Section',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    defineField({
      name: 'maxWidth',
      title: 'Max Width',
      type: 'string',
      options: { list: [
        { title: 'Narrow (600px)', value: 'narrow' },
        { title: 'Medium (800px)', value: 'medium' },
        { title: 'Wide (1200px)', value: 'wide' },
        { title: 'Full bleed', value: 'full' },
      ], layout: 'radio' },
      initialValue: 'wide',
    }),
    defineField({ name: 'rounded', title: 'Rounded corners?', type: 'boolean', initialValue: true }),
    defineField({ name: 'shadow', title: 'Show shadow?', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { alt: 'alt', image: 'image' },
    prepare: (value: PrepareValue) => ({ title: `Image: ${value.alt ?? 'Untitled'}` }),
  },
})

// ─── GALLERY SECTION ──────────────────────────────────────────────────────────
export const gallerySection = defineType({
  name: 'gallerySection',
  title: 'Gallery Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
          defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'caption', title: 'Caption', type: 'string' }),
        ],
        preview: { select: { alt: 'alt' }, prepare: (value: PrepareValue) => ({ title: value.alt }) },
      }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: { list: [
        { title: 'Masonry', value: 'masonry' },
        { title: 'Grid (equal)', value: 'grid' },
        { title: 'Carousel', value: 'carousel' },
      ], layout: 'radio' },
      initialValue: 'grid',
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      options: { list: [2, 3, 4], layout: 'radio' },
      initialValue: 3,
    }),
    defineField({ name: 'lightbox', title: 'Enable lightbox on click?', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { heading: 'heading', images: 'images' },
    prepare(value: PrepareValue) {
      return { title: `Gallery: ${value.heading ?? ''}`, subtitle: `${value.images?.length ?? 0} images` }
    },
  },
})

// ─── VIDEO SECTION ────────────────────────────────────────────────────────────
export const videoSection = defineType({
  name: 'videoSection',
  title: 'Video Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({
      name: 'url',
      title: 'YouTube or Vimeo URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'posterImage', title: 'Poster Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'maxWidth',
      title: 'Max Width',
      type: 'string',
      options: { list: [
        { title: 'Medium (800px)', value: 'medium' },
        { title: 'Wide (1100px)', value: 'wide' },
        { title: 'Full bleed', value: 'full' },
      ], layout: 'radio' },
      initialValue: 'wide',
    }),
  ],
  preview: {
    select: { heading: 'heading', url: 'url' },
    prepare: (value: PrepareValue) => ({
      title: `Video: ${value.heading ?? value.url ?? ''}`,
    }),
  },
})

// ─── NEWSLETTER SECTION ───────────────────────────────────────────────────────
export const newsletterSection = defineType({
  name: 'newsletterSection',
  title: 'Newsletter Signup Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Stay in the loop' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({ name: 'placeholder', title: 'Email Placeholder', type: 'string', initialValue: 'Enter your email' }),
    defineField({ name: 'buttonLabel', title: 'Button Label', type: 'string', initialValue: 'Subscribe' }),
    defineField({ name: 'successMessage', title: 'Success Message', type: 'string', initialValue: "You're subscribed!" }),
    defineField({ name: 'privacyText', title: 'Privacy Note (small text)', type: 'string' }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: { list: [
        { title: 'Centered', value: 'centered' },
        { title: 'Side-by-side', value: 'split' },
        { title: 'Compact bar', value: 'bar' },
      ], layout: 'radio' },
      initialValue: 'centered',
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: (value: PrepareValue) => ({ title: `Newsletter: ${value.heading ?? ''}` }),
  },
})

// ─── CONTACT SECTION ──────────────────────────────────────────────────────────
export const contactSection = defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'Get in touch' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({ name: 'email', title: 'Contact Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'text', rows: 2 }),
    defineField({
      name: 'showForm',
      title: 'Show contact form?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'formFields',
      title: 'Form Fields',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'name', title: 'Field Name (no spaces)', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: { list: ['text', 'email', 'tel', 'textarea', 'select'].map(v => ({ title: v, value: v })), layout: 'radio' },
            initialValue: 'text',
          }),
          defineField({ name: 'placeholder', title: 'Placeholder', type: 'string' }),
          defineField({ name: 'required', title: 'Required?', type: 'boolean', initialValue: true }),
        ],
        preview: { select: { title: 'label' }, prepare: (value: PrepareValue) => ({ title: value.title }) },
      }],
    }),
    defineField({ name: 'submitLabel', title: 'Submit Button Label', type: 'string', initialValue: 'Send message' }),
    defineField({ name: 'successMessage', title: 'Success Message', type: 'string', initialValue: "Message sent! We'll get back to you soon." }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: (value: PrepareValue) => ({ title: `Contact: ${value.heading ?? ''}` }),
  },
})

// ─── AUTH HERO SECTION ────────────────────────────────────────────────────────
// Left panel for login/signup pages. CMS-controlled copy + feature bullets.
// The right panel (actual form) is rendered by the auth system.
export const authHeroSection = defineType({
  name: 'authHeroSection',
  title: 'Auth Page Hero (Left Panel)',
  type: 'object',
  fields: [
    defineField({ name: 'headline', title: 'Headline', type: 'string', initialValue: 'CMS-driven publishing for engineering teams.' }),
    defineField({ name: 'badge', title: 'Badge Label', type: 'string' }),
    defineField({
      name: 'features',
      title: 'Feature Bullets',
      description: 'Shown below the headline',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'icon', title: 'Icon (Lucide name)', type: 'string' }),
          defineField({ name: 'text', title: 'Feature Text', type: 'string', validation: (Rule) => Rule.required() }),
        ],
        preview: { select: { title: 'text' }, prepare: (value: PrepareValue) => ({ title: value.title }) },
      }],
    }),
    defineField({
      name: 'mode',
      title: 'Page Mode',
      description: 'Which auth page this applies to',
      type: 'string',
      options: { list: [
        { title: 'Sign In', value: 'signin' },
        { title: 'Sign Up', value: 'signup' },
        { title: 'Both', value: 'both' },
      ], layout: 'radio' },
      initialValue: 'both',
    }),
  ],
  preview: {
    select: { headline: 'headline', mode: 'mode' },
    prepare: (value: PrepareValue) => ({
      title: `Auth Hero (${value.mode ?? 'both'})`,
      subtitle: value.headline,
    }),
  },
})

// ─── 404 / NOT FOUND SECTION ──────────────────────────────────────────────────
export const notFoundSection = defineType({
  name: 'notFoundSection',
  title: '404 / Not Found Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: "This page doesn't exist" }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string', initialValue: 'The page you are looking for was moved, deleted, or never existed.' }),
    defineField({ name: 'ctaLabel', title: 'CTA Button Label', type: 'string', initialValue: 'Go home' }),
    defineField({ name: 'ctaHref', title: 'CTA URL', type: 'string', initialValue: '/' }),
    defineField({ name: 'showSearch', title: 'Show search box?', type: 'boolean', initialValue: false }),
  ],
  preview: { prepare: () => ({ title: '404 Not Found Section' }) },
})
