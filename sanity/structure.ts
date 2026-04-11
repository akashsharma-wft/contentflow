// sanity/structure.ts
// ContentFlow Studio sidebar structure.
//
// Language awareness:
//   - All document lists filter by getStudioLanguage() so editors only see
//     documents in their currently selected language.
//   - When a new document is created, the language field initialValue function
//     (defined in each schema) auto-sets the language to the current value.
//   - Language switching reloads the Studio (see StudioNavbar.tsx), which
//     re-evaluates this function with the updated language from localStorage.
//
// Sections structure:
//   Sections are now grouped by page (Home, Login, Sign Up, Posts, Settings, Admin)
//   rather than by section type. Each group filters `section` documents where
//   page == <slug> AND language == <currentLang>.

import type { StructureBuilder, DefaultDocumentNodeContext } from 'sanity/structure'
import {
  DocumentIcon,
  ComposeIcon,
  StackCompactIcon,
  CodeIcon,
  CogIcon,
  ImageIcon,
  DocumentTextIcon,
  LockIcon,
  ActivityIcon,
} from '@sanity/icons'
import { getStudioLanguage } from './lib/languageStore'
import { t }                 from './lib/translations'

// ── defaultDocumentNode ───────────────────────────────────────────────────────
// Adds Editor | Preview tabs for page and post documents.

export function defaultDocumentNode(
  S: StructureBuilder,
  { schemaType }: DefaultDocumentNodeContext,
) {
  if (schemaType === 'page' || schemaType === 'post') {
    return S.document().views([
      S.view.form().title('Editor'),
      S.view
        .component(() => null)
        .title('Preview')
        .id('preview'),
    ])
  }
  return S.document().views([S.view.form()])
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** One list-item in the Sections tree that shows `section` docs for a given page + lang. */
function pageSectionItem(
  S: StructureBuilder,
  lang: string,
  page: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any,
) {
  return S.listItem()
    .title(label)
    .id(`page-${page}`)
    .icon(icon)
    .child(
      S.documentList()
        .title(label)
        .filter(`_type == "section" && page == "${page}" && language == "${lang}"`)
        .defaultOrdering([{ field: 'title', direction: 'asc' }]),
    )
}

// ── Sidebar structure ─────────────────────────────────────────────────────────

export function structure(S: StructureBuilder) {
  const lang   = getStudioLanguage()
  const filter = (type: string) => `_type == "${type}" && language == "${lang}"`

  return S.list()
    .title('ContentFlow')
    .items([

      // ── Pages ─────────────────────────────────────────────────────────
      S.listItem()
        .title(t('pages', lang))
        .icon(DocumentIcon)
        .child(
          S.documentList()
            .title(t('pages', lang))
            .filter(filter('page'))
            .defaultOrdering([{ field: 'title', direction: 'asc' }]),
        ),

      // ── Posts ─────────────────────────────────────────────────────────
      S.listItem()
        .title(t('posts', lang))
        .icon(ComposeIcon)
        .child(
          S.documentList()
            .title(t('posts', lang))
            .filter(filter('post'))
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
        ),

      S.divider(),

      // ── Sections — grouped by page ─────────────────────────────────────
      S.listItem()
        .title(t('sections', lang))
        .icon(StackCompactIcon)
        .child(
          S.list()
            .title(t('pageSections', lang))
            .items([
              pageSectionItem(S, lang, 'home',     'Home Page Sections',     ImageIcon),
              pageSectionItem(S, lang, 'login',    'Login Page Sections',    LockIcon),
              pageSectionItem(S, lang, 'signup',   'Sign Up Page Sections',  LockIcon),
              pageSectionItem(S, lang, 'posts',    'Posts Page Sections',    DocumentTextIcon),
              pageSectionItem(S, lang, 'settings', 'Settings Page Sections', CogIcon),
              pageSectionItem(S, lang, 'billing',  'Billing Page Sections',  DocumentTextIcon),
              pageSectionItem(S, lang, 'admin',    'Admin Page Sections',    ActivityIcon),
            ]),
        ),

      // ── Components ────────────────────────────────────────────────────
      S.listItem()
        .title(t('components', lang))
        .icon(CodeIcon)
        .child(
          S.list()
            .title(t('components', lang))
            .items([
              S.listItem()
                .title(t('basic', lang))
                .id('components-basic')
                .icon(CodeIcon)
                .child(
                  S.documentList()
                    .title(t('basic', lang))
                    .filter(`_type == "component" && language == "${lang}" && type in ["button", "input", "select"]`)
                    .defaultOrdering([{ field: 'name', direction: 'asc' }]),
                ),
              S.listItem()
                .title(t('advanced', lang))
                .id('components-advanced')
                .icon(CodeIcon)
                .child(
                  S.documentList()
                    .title(t('advanced', lang))
                    .filter(`_type == "component" && language == "${lang}" && type in ["container", "form", "grid"]`)
                    .defaultOrdering([{ field: 'name', direction: 'asc' }]),
                ),
            ]),
        ),

      S.divider(),

      // ── Site Config ───────────────────────────────────────────────────
      S.listItem()
        .title(t('siteConfig', lang))
        .icon(CogIcon)
        .child(
          S.documentList()
            .title(t('siteConfig', lang))
            .filter(filter('siteConfig'))
            .defaultOrdering([{ field: 'title', direction: 'asc' }]),
        ),
    ])
}
