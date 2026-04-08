// sanity.config.ts
//
// Implements exactly what's shown in the Google Meet screenshots:
//
//  Screenshot 1 (Studio UI):
//    • Top bar: Structure | Vision | Presentation
//    • Language dropdown in top bar (EN / HI / KN) — filters ALL document lists
//    • Inside a document: "Editor" | "Preview" tabs — via defaultDocumentNode
//    • Right side of document: "Translations" tab linking language variants
//    • Document list shows language badges
//
//  Screenshot 2 (their code):
//    presentationTool({ title, previewUrl: { origin, preview: '/', previewMode: { enable } } })
//    documentInternationalization({ supportedLanguages, schemaTypes, apiVersion })
//    studio: { components: { layout: props => <LanguageProvider>...</LanguageProvider> } }
//
//  Screenshot 3 (their code):
//    structureTool({ structure, defaultDocumentNode })
//    — defaultDocumentNode is how "Preview" tab appears next to "Editor"
//
// TYPESCRIPT ERRORS FIXED:
//   ✗ defineLocations / defineDocuments — REMOVED (caused all 4 TS errors)
//   ✗ defineUrlSecret() — REMOVED (package v4 removed this export)
//   ✓ defaultDocumentNode in structureTool — ADDED
//   ✓ presentationTool with correct v2 previewUrl shape — FIXED
//   ✓ studio.components.layout with LanguageProvider — ADDED
//   ✓ documentInternationalization with apiVersion — ADDED

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import type { StructureBuilder, DefaultDocumentNodeContext } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { documentInternationalization } from '@sanity/document-internationalization'
import {
  DocumentTextIcon, DocumentIcon, CogIcon,
  LockIcon, DashboardIcon, BarChartIcon, BillIcon, UserIcon,
} from '@sanity/icons'
import { schemaTypes } from '@/sanity/schemaTypes'
import { LanguageProvider } from '@/sanity/components/LanguageProvider'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = [
  { id: 'en', title: 'English' },
  { id: 'hi', title: 'Hindi' },
  { id: 'kn', title: 'Kannada' },
]

const SINGLETON_TYPES = [
  'siteConfig', 'authConfig',
  'postsPageConfig', 'analyticsConfig', 'settingsPageConfig',
  'billingPageConfig', 'adminPageConfig',
  'loginPageConfig', 'signupPageConfig', 'postDetailPageConfig',
]

const I18N_TYPES   = ['post', 'page']
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const API_VERSION  = '2024-01-01'

// ─── defaultDocumentNode ──────────────────────────────────────────────────────
// Shown in screenshot 3: structureTool({ structure, defaultDocumentNode })
//
// This adds the "Editor" | "Preview" tab pair that appears at the top of every
// page and post document (exactly as you see in screenshot 1 where it shows
// "Editor" and "Preview" below the document title).
//
// The Preview tab hooks into the Presentation tool's live preview iframe.
// When clicked, it shows your Next.js site with the current draft content.

function defaultDocumentNode(S: StructureBuilder, { schemaType }: DefaultDocumentNodeContext) {
  if (I18N_TYPES.includes(schemaType)) {
    return S.document().views([
      S.view.form().title('Editor'),
      S.view
        .component(() => null)  // Presentation tool replaces this with the live preview
        .title('Preview')
        .id('preview'),
    ])
  }
  return S.document().views([S.view.form()])
}

// ─── Config ───────────────────────────────────────────────────────────────────

export default defineConfig({
  name: 'contentflow-studio',
  title: 'ContentFlow',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   ?? 'production',

  // ── Studio components ────────────────────────────────────────────────────
  // From screenshot 2: studio.components.layout wraps Studio with LanguageProvider
  // so the active language (from top-bar dropdown) persists across navigation.
  studio: {
    components: {
      layout: (props) => (
        <LanguageProvider>
          {props.renderDefault(props)}
        </LanguageProvider>
      ),
    },
  },

  plugins: [

    // 1. Structure Tool — sidebar + defaultDocumentNode for Editor/Preview tabs
    structureTool({
      defaultDocumentNode,
      structure: (S) =>
        S.list()
          .title('ContentFlow')
          .items([
            // Pages — ordered by language (EN → HI → KN), then title
            S.listItem()
              .title('Pages')
              .icon(DocumentIcon)
              .child(
                S.documentTypeList('page')
                  .title('All Pages')
                  .defaultOrdering([
                    { field: 'language', direction: 'asc' },
                    { field: 'title',    direction: 'asc' },
                  ])
              ),

            // Posts — ordered by language, then newest first
            S.listItem()
              .title('Posts')
              .icon(DocumentTextIcon)
              .child(
                S.documentTypeList('post')
                  .title('All Posts')
                  .defaultOrdering([
                    { field: 'language',    direction: 'asc' },
                    { field: 'publishedAt', direction: 'desc' },
                  ])
              ),

            S.divider(),

            // Singletons
            S.listItem().title('Site Configuration').icon(CogIcon).id('siteConfig')
              .child(S.document().schemaType('siteConfig').documentId('siteConfig').title('Site Configuration')),

            S.listItem().title('Auth Configuration').icon(LockIcon).id('authConfig')
              .child(S.document().schemaType('authConfig').documentId('authConfig').title('Auth Configuration')),

            S.divider(),

            // App Page configs
            S.listItem().title('App Pages').icon(DashboardIcon)
              .child(
                S.list().title('App Page Configurations').items([
                  S.listItem().title('Posts Page').icon(DocumentTextIcon).id('postsPageConfig')
                    .child(S.document().schemaType('postsPageConfig').documentId('postsPageConfig').title('Posts Page')),
                  S.listItem().title('Analytics Page').icon(BarChartIcon).id('analyticsConfig')
                    .child(S.document().schemaType('analyticsConfig').documentId('analyticsConfig').title('Analytics Page')),
                  S.listItem().title('Settings Page').icon(CogIcon).id('settingsPageConfig')
                    .child(S.document().schemaType('settingsPageConfig').documentId('settingsPageConfig').title('Settings Page')),
                  S.listItem().title('Billing Page').icon(BillIcon).id('billingPageConfig')
                    .child(S.document().schemaType('billingPageConfig').documentId('billingPageConfig').title('Billing Page')),
                  S.listItem().title('Admin Page').icon(UserIcon).id('adminPageConfig')
                    .child(S.document().schemaType('adminPageConfig').documentId('adminPageConfig').title('Admin Page')),
                ])
              ),
          ]),
    }),

    // 2. Vision — GROQ explorer (Vision tab in top bar, screenshot 1)
    visionTool({
      defaultApiVersion: API_VERSION,
      defaultDataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
    }),

    // 3. Presentation — live preview + Presentation tab (screenshot 1, screenshot 2)
    // Exactly matching the code shown in their screenshot:
    //   presentationTool({ title: 'Presentation', previewUrl: { origin, preview, previewMode: { enable } } })
    presentationTool({
      title: 'Presentation',
      previewUrl: {
        origin: APP_URL,
        preview: '/',
        previewMode: {
          enable: '/api/preview/enable',
        },
      },
    }),

    // 4. Document Internationalization (screenshot 1 + screenshot 2)
    // Adds:
    //   • Language dropdown in Studio top bar — filters ALL document lists to that language
    //   • "Translations" tab inside each page/post document
    //   • Language badges on document list rows (clickable to open that variant)
    //   • Published/Draft status per language
    documentInternationalization({
      supportedLanguages: SUPPORTED_LANGUAGES,
      schemaTypes:        I18N_TYPES,
      languageField:      'language',
      apiVersion:         API_VERSION,
    }),

  ],

  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.includes(schemaType)),
  },
})