// sanity.config.tsx
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { documentInternationalization } from '@sanity/document-internationalization'
import { schemaTypes }                   from '@/sanity/schemaTypes'
import { StudioNavbar }                  from '@/sanity/components/StudioNavbar'
import { StudioToolMenu }               from '@/sanity/components/StudioToolMenu'
import { structure, defaultDocumentNode } from '@/sanity/structure'

// ── Constants ─────────────────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = [
  { id: 'en', title: 'English'  },
  { id: 'hi', title: 'Hindi'    },
  { id: 'kn', title: 'Kannada'  },
]

// page and post are managed by the i18n plugin (Translations tab + language filter)
const I18N_TYPES  = ['page', 'post']

const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const API_VERSION = '2024-01-01'

// ── Config ────────────────────────────────────────────────────────────────────

export default defineConfig({
  name:     'contentflow-studio',
  title:    'ContentFlow',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET   ?? 'production',

  studio: {
    components: {
      navbar:   StudioNavbar,
      // Language switcher injected inline next to Structure/Vision/Presentation tabs
      toolMenu: StudioToolMenu,
    },
  },

  plugins: [

    // 1. Structure — custom sidebar + Editor / Preview tabs
    structureTool({ structure, defaultDocumentNode }),

    // 2. Vision — GROQ explorer tab
    visionTool({
      defaultApiVersion: API_VERSION,
      defaultDataset:    process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
    }),

    // 3. Presentation — live-preview iframe
    presentationTool({
      title: 'Presentation',
      previewUrl: {
        origin:      APP_URL,
        preview:     '/',
        previewMode: { enable: '/api/preview/enable' },
      },
    }),

    // 4. Document i18n — language field + Translations tab for page & post
    documentInternationalization({
      supportedLanguages: SUPPORTED_LANGUAGES,
      schemaTypes:        I18N_TYPES,
      languageField:      'language',
      apiVersion:         API_VERSION,
    }),

  ],

  schema: {
    types: schemaTypes,
  },
})
