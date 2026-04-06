import { defineType, defineField } from 'sanity'

export const loginPageConfig = defineType({
  name: 'loginPageConfig',
  title: 'Login Page Config',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Left Panel Heading',
      type: 'string',
      initialValue: 'CMS-driven publishing for engineering teams.',
    }),
    defineField({
      name: 'subheading',
      title: 'Form Subheading',
      type: 'string',
      initialValue: 'Welcome back',
    }),
    defineField({
      name: 'badge',
      title: 'Badge Label',
      type: 'string',
    }),
  ],
})

export const signupPageConfig = defineType({
  name: 'signupPageConfig',
  title: 'Signup Page Config',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Left Panel Heading',
      type: 'string',
      initialValue: 'CMS-driven publishing for engineering teams.',
    }),
    defineField({
      name: 'subheading',
      title: 'Form Subheading',
      type: 'string',
      initialValue: 'Create your account',
    }),
    defineField({
      name: 'badge',
      title: 'Badge Label',
      type: 'string',
      initialValue: 'ENGINEERING FIRST',
    }),
  ],
})

export const postDetailPageConfig = defineType({
  name: 'postDetailPageConfig',
  title: 'Post Detail Page Config',
  type: 'document',
  fields: [
    defineField({
      name: 'showComments',
      title: 'Show comments section?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'relatedPostsCount',
      title: 'Number of related posts to show',
      type: 'number',
      initialValue: 3,
    }),
  ],
})
