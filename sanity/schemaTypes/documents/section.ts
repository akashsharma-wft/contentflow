// sanity/schemaTypes/documents/section.ts
//
// Single section document — one doc per section instance per page per language.
//
// Architecture:
//   • `sectionType` is the discriminator (hero | featuredPosts | recentPosts |
//     cta | authHero | authForm | features | postsList | postDetail |
//     analytics | settings | billing | admin)
//   • Content fields are defined in `sections/systemSections/<page>PageSections.ts`
//     and spread in here — one array per page domain.
//   • Pages store `sections[]` as references; GROQ dereferences with `sections[]->`
//     so the front-end receives the full section payload.

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
import {
  homePageSectionFields,
  authPageSectionFields,
  postsPageSectionFields,
  postDetailPageSectionFields,
  analyticsPageSectionFields,
  settingsPageSectionFields,
  billingPageSectionFields,
  adminPageSectionFields,
  customSectionFields,
} from '../sections'

// ── Shared option lists ────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { title: 'English',          value: 'en' },
  { title: 'Hindi — हिंदी',    value: 'hi' },
  { title: 'Kannada — ಕನ್ನಡ', value: 'kn' },
]

const PAGE_OPTIONS = [
  { title: 'Home',       value: 'home'       },
  { title: 'Login',      value: 'login'      },
  { title: 'Sign Up',    value: 'signup'     },
  { title: 'Posts',      value: 'posts'      },
  { title: 'Post Detail', value: 'postDetail' },
  { title: 'Settings',   value: 'settings'   },
  { title: 'Billing',    value: 'billing'    },
  { title: 'Analytics',  value: 'analytics'  },
  { title: 'Admin',      value: 'admin'      },
]

const SECTION_TYPE_OPTIONS = [
  { title: 'Hero',                    value: 'hero'          },
  { title: 'Featured Posts',          value: 'featuredPosts' },
  { title: 'Recent Posts',            value: 'recentPosts'   },
  { title: 'Call to Action',          value: 'cta'           },
  { title: 'Features',                value: 'features'      },
  { title: 'Auth Hero (Left Panel)',   value: 'authHero'      },
  { title: 'Auth Form (Right Panel)',  value: 'authForm'      },
  { title: 'Posts List (Legacy)',           value: 'postsList'          },
  { title: 'Post Detail (Legacy)',          value: 'postDetail'         },
  // Post Detail — multi-section
  { title: 'Post Detail — Header',          value: 'postDetailHeader'   },
  { title: 'Post Detail — Meta',            value: 'postDetailMeta'     },
  { title: 'Post Detail — Body',            value: 'postDetailBody'     },
  { title: 'Post Detail — Tags',            value: 'postDetailTags'     },
  { title: 'Post Detail — Back Link',       value: 'postDetailBackLink' },
  // Posts — multi-section
  { title: 'Posts — Header',            value: 'postsHeader'   },
  { title: 'Posts — Stats',             value: 'postsStats'    },
  { title: 'Posts — Actions',           value: 'postsActions'  },
  { title: 'Posts — Search',            value: 'postsSearch'   },
  { title: 'Posts — Table',             value: 'postsTable'    },
  { title: 'Analytics',                 value: 'analytics'     },
  { title: 'Admin',                     value: 'admin'         },
  // Billing — multi-section
  { title: 'Billing — Header',         value: 'billingHeader'       },
  { title: 'Billing — Current Plan',   value: 'billingCurrentPlan'  },
  { title: 'Billing — Usage',          value: 'billingUsage'        },
  { title: 'Billing — Plans Grid',     value: 'billingPlansGrid'    },
  { title: 'Billing — Footer',         value: 'billingFooter'       },
  // Settings — multi-section
  { title: 'Settings — Header',        value: 'settingsHeader'      },
  { title: 'Settings — Profile Info',  value: 'settingsInfo'        },
  { title: 'Settings — Profile Form',  value: 'settingsForm'        },
  { title: 'Settings — Danger Zone',   value: 'settingsDanger'      },
  // Legacy single-section (kept for backward compatibility)
  { title: 'Settings (legacy)',        value: 'settings'            },
  { title: 'Billing (legacy)',         value: 'billing'             },
]

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

    // ── Content fields — grouped by page domain ───────────────────────────────
    // Each array is defined in sections/systemSections/<page>PageSections.ts
    ...homePageSectionFields,      // hero, featuredPosts, recentPosts, cta, features
    ...authPageSectionFields,      // authHero, authForm
    ...postsPageSectionFields,     // postsHeader · postsStats · postsActions · postsSearch · postsTable (+ postsList legacy)
    ...postDetailPageSectionFields, // postDetail
    ...analyticsPageSectionFields, // analytics
    ...settingsPageSectionFields,  // settingsHeader · settingsInfo · settingsForm · settingsDanger
    ...billingPageSectionFields,   // billingHeader · billingCurrentPlan · billingUsage · billingPlansGrid · billingFooter
    ...adminPageSectionFields,     // admin
    ...customSectionFields,        // future user-defined sections
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
        features:      BulbOutlineIcon,
        authHero:      LockIcon,
        authForm:      LockIcon,
        postsList:          DocumentTextIcon,
        postDetail:         DocumentTextIcon,
        // Post Detail sub-sections
        postDetailHeader:   DocumentTextIcon,
        postDetailMeta:     DocumentTextIcon,
        postDetailBody:     DocumentTextIcon,
        postDetailTags:     DocumentTextIcon,
        postDetailBackLink: DocumentTextIcon,
        // Posts sub-sections
        postsHeader:   DocumentTextIcon,
        postsStats:    DocumentTextIcon,
        postsActions:  DocumentTextIcon,
        postsSearch:   DocumentTextIcon,
        postsTable:    DocumentTextIcon,
        analytics:          ActivityIcon,
        admin:              UsersIcon,
        // Billing sub-sections
        billingHeader:      CreditCardIcon,
        billingCurrentPlan: CreditCardIcon,
        billingUsage:       CreditCardIcon,
        billingPlansGrid:   CreditCardIcon,
        billingFooter:      CreditCardIcon,
        // Settings sub-sections
        settingsHeader:     ControlsIcon,
        settingsInfo:       ControlsIcon,
        settingsForm:       ControlsIcon,
        settingsDanger:     ControlsIcon,
        // Legacy
        settings:           ControlsIcon,
        billing:            CreditCardIcon,
      }
      const langTag = language?.toUpperCase() ?? '?'
      return {
        title:    `${title ?? 'Untitled Section'}  ·  ${langTag}`,
        subtitle: [st, page].filter(Boolean).join('  ·  '),
        media:    (st && iconMap[st]) ?? StackCompactIcon,
      }
    },
  },
})
