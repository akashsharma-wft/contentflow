// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { documentInternationalization } from '@sanity/document-internationalization'
import {
  DocumentTextIcon,
  DocumentIcon,
  CogIcon,
  LockIcon,
  DashboardIcon,
  BarChartIcon,
  BillIcon,
  UserIcon,
} from '@sanity/icons'
import { schemaTypes } from '@/sanity/schemaTypes'

const SUPPORTED_LANGUAGES = [
  { id: 'en', title: 'English' },
  { id: 'hi', title: 'Hindi' },
  { id: 'kn', title: 'Kannada' },
]

// All singleton document type names — excluded from the "new document" menu
const SINGLETON_TYPES = [
  'siteConfig',
  'authConfig',
  'postsPageConfig',
  'analyticsConfig',
  'settingsPageConfig',
  'billingPageConfig',
  'adminPageConfig',
]

// Schema types that support multiple languages via document-internationalization
const I18N_SCHEMA_TYPES = ['post', 'page']

export default defineConfig({
  name: 'contentflow-studio',
  title: 'ContentFlow',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'h2zl7fu3',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',

  plugins: [
    // ── Structure Tool with organized sidebar ──────────────────────────
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // ── Posts ────────────────────────────────────────────────
            S.listItem()
              .title('Posts')
              .icon(DocumentTextIcon)
              .schemaType('post')
              .child(S.documentTypeList('post').title('All Posts')),

            // ── Pages ────────────────────────────────────────────────
            S.listItem()
              .title('Pages')
              .icon(DocumentIcon)
              .schemaType('page')
              .child(S.documentTypeList('page').title('All Pages')),

            S.divider(),

            // ── Global Singletons ─────────────────────────────────────
            S.listItem()
              .title('Site Configuration')
              .icon(CogIcon)
              .id('siteConfig')
              .child(
                S.document()
                  .schemaType('siteConfig')
                  .documentId('siteConfig')
                  .title('Site Configuration')
              ),

            S.listItem()
              .title('Auth Configuration')
              .icon(LockIcon)
              .id('authConfig')
              .child(
                S.document()
                  .schemaType('authConfig')
                  .documentId('authConfig')
                  .title('Auth Configuration')
              ),

            S.divider(),

            // ── App Page Configurations ───────────────────────────────
            S.listItem()
              .title('App Pages')
              .icon(DashboardIcon)
              .child(
                S.list()
                  .title('App Page Configurations')
                  .items([
                    S.listItem()
                      .title('Posts Page')
                      .icon(DocumentTextIcon)
                      .id('postsPageConfig')
                      .child(
                        S.document()
                          .schemaType('postsPageConfig')
                          .documentId('postsPageConfig')
                          .title('Posts Page')
                      ),
                    S.listItem()
                      .title('Analytics Page')
                      .icon(BarChartIcon)
                      .id('analyticsConfig')
                      .child(
                        S.document()
                          .schemaType('analyticsConfig')
                          .documentId('analyticsConfig')
                          .title('Analytics Page')
                      ),
                    S.listItem()
                      .title('Settings Page')
                      .icon(CogIcon)
                      .id('settingsPageConfig')
                      .child(
                        S.document()
                          .schemaType('settingsPageConfig')
                          .documentId('settingsPageConfig')
                          .title('Settings Page')
                      ),
                    S.listItem()
                      .title('Billing Page')
                      .icon(BillIcon)
                      .id('billingPageConfig')
                      .child(
                        S.document()
                          .schemaType('billingPageConfig')
                          .documentId('billingPageConfig')
                          .title('Billing Page')
                      ),
                    S.listItem()
                      .title('Admin Page')
                      .icon(UserIcon)
                      .id('adminPageConfig')
                      .child(
                        S.document()
                          .schemaType('adminPageConfig')
                          .documentId('adminPageConfig')
                          .title('Admin Page')
                      ),
                  ])
              ),
          ]),
    }),

    // ── Vision (GROQ query explorer) ──────────────────────────────────
    visionTool({
      defaultApiVersion: '2024-01-01',
      defaultDataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
    }),

    // ── Document Internationalization (en / hi / kn) ──────────────────
    documentInternationalization({
      supportedLanguages: SUPPORTED_LANGUAGES,
      schemaTypes: I18N_SCHEMA_TYPES,
      languageField: 'language',
    }),
  ],

  schema: {
    types: schemaTypes,
    // Prevent singletons from appearing in the "New document" menu
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.includes(schemaType)),
  },
})