// sanity/schemaTypes/sections/systemSections/settingsPageSections.ts
//
// Field definitions for the /settings dashboard page.
// Exported as a flat array — spread into the `section` document's fields array.
//
// Sections: settingsHeader · settingsInfo · settingsForm · settingsDanger
//
// All text fields are plain strings. Multilingual support is achieved by
// creating one section document per language (en / hi / kn) in the seed.

import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

export const settingsPageSectionFields = [

  // ── Settings Header ──────────────────────────────────────────────────────────
  defineField({
    name: 'settingsHeader',
    title: 'Settings Header',
    description: 'Page heading and subheading shown at the top of /settings.',
    type: 'object',
    ...shownFor('settingsHeader'),
    fields: [
      defineField({ name: 'heading',    title: 'Heading',    type: 'string', initialValue: 'Account Settings' }),
      defineField({ name: 'subheading', title: 'Subheading', type: 'string', initialValue: 'Manage your architectural preferences and profile identity.' }),
    ],
  }),

  // ── Settings Info ────────────────────────────────────────────────────────────
  defineField({
    name: 'settingsInfo',
    title: 'Profile Info Card',
    description: 'Labels for the avatar / profile photo card.',
    type: 'object',
    ...shownFor('settingsInfo'),
    fields: [
      defineField({ name: 'uploadPhotoLabel', title: 'Upload Photo Button Label', type: 'string', initialValue: 'Upload photo' }),
    ],
  }),

  // ── Settings Form ────────────────────────────────────────────────────────────
  defineField({
    name: 'settingsForm',
    title: 'Profile Form',
    description: 'All field labels, placeholders, helper texts, and button labels for the profile editing form.',
    type: 'object',
    ...shownFor('settingsForm'),
    fields: [
      defineField({ name: 'profileSectionLabel', title: 'Profile Card Heading',     type: 'string', initialValue: 'Profile' }),
      defineField({ name: 'metadataLabel',        title: 'Metadata Label (right)',   type: 'string', initialValue: 'Metadata ID: CF-9921' }),
      defineField({ name: 'displayNameLabel',     title: 'Display Name Label',       type: 'string', initialValue: 'Display name' }),
      defineField({ name: 'emailLabel',           title: 'Email Label',              type: 'string', initialValue: 'Email address' }),
      defineField({ name: 'emailHelperText',      title: 'Email Helper Text',        type: 'string', initialValue: 'Managed by Supabase Auth' }),
      defineField({ name: 'bioLabel',             title: 'Bio Label',                type: 'string', initialValue: 'Bio' }),
      defineField({ name: 'bioPlaceholder',       title: 'Bio Placeholder',          type: 'string', initialValue: 'Write a short technical bio...' }),
      defineField({ name: 'bioMaxLength',         title: 'Bio Max Characters',       type: 'number', initialValue: 200, validation: R => R.min(50).max(2000).integer() }),
      defineField({ name: 'websiteLabel',         title: 'Website Label',            type: 'string', initialValue: 'Website' }),
      defineField({ name: 'websitePlaceholder',   title: 'Website Placeholder',      type: 'string', initialValue: 'https://yourwebsite.com' }),
      defineField({ name: 'websiteErrorText',     title: 'Website Validation Error', type: 'string', initialValue: 'Must be a valid URL' }),
      defineField({ name: 'saveLabel',            title: 'Save Button',              type: 'string', initialValue: 'Save changes' }),
      defineField({ name: 'discardLabel',         title: 'Discard Button',           type: 'string', initialValue: 'Discard' }),
    ],
  }),

  // ── Settings Danger Zone ─────────────────────────────────────────────────────
  defineField({
    name: 'settingsDanger',
    title: 'Danger Zone',
    description: 'Labels for the account-deletion / danger zone card.',
    type: 'object',
    ...shownFor('settingsDanger'),
    fields: [
      defineField({ name: 'heading',     title: 'Heading',              type: 'string', initialValue: 'Danger Zone' }),
      defineField({ name: 'body',        title: 'Body Text',            type: 'string', initialValue: 'Permanently delete your account and all associated architectural data. This action cannot be undone.' }),
      defineField({ name: 'warningText', title: 'Warning Label',        type: 'string', initialValue: 'Warning: All API keys will be invalidated.' }),
      defineField({ name: 'deleteLabel', title: 'Delete Account Button',type: 'string', initialValue: 'Delete Account' }),
    ],
  }),

]
