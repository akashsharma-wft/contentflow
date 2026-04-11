// sanity/structure.ts
// ContentFlow Studio sidebar structure.
//
// Language awareness:
//   All document lists filter by getStudioLanguage() so editors see only
//   documents in the currently selected language. Switching language via
//   StudioNavbar dropdown reloads the Studio so this re-evaluates.
//
// Architecture:
//   Sections are standalone documents (type: 'section') grouped by page.
//   Pages store references to section documents.
//
// Site Config:
//   Single siteConfig document (stable ID: 'site-config').
//   No per-language duplication.
//
// Preview:
//   Page documents get an Editor | Preview tab pair.
//   PreviewIframe derives the URL from slug + language using DocumentViewProps.

import type { StructureBuilder, DefaultDocumentNodeContext } from 'sanity/structure'
import {
  DocumentIcon,
  ComposeIcon,
  StackCompactIcon,
  CogIcon,
  ImageIcon,
  DocumentTextIcon,
  LockIcon,
  ActivityIcon,
  ControlsIcon,
  CreditCardIcon,
  UsersIcon,
} from '@sanity/icons'
import { getStudioLanguage } from './lib/languageStore'
import { t }                  from './lib/translations'
import { PreviewIframe }      from './components/PreviewIframe'

// ── defaultDocumentNode ───────────────────────────────────────────────────────

export function defaultDocumentNode(
  S: StructureBuilder,
  { schemaType }: DefaultDocumentNodeContext,
) {
  if (schemaType === 'page' || schemaType === 'post') {
    return S.document().views([
      S.view.form().title('Editor'),
      S.view
        .component(PreviewIframe)
        .title('Preview')
        .id('preview'),
    ])
  }
  return S.document().views([S.view.form()])
}

// ── Language label map ────────────────────────────────────────────────────────

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi — हिंदी',
  kn: 'Kannada — ಕನ್ನಡ',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Section group: one list item per page that shows section docs
 * for the active language. Label includes the language tag.
 */
function pageSectionItem(
  S: StructureBuilder,
  lang: string,
  page: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any,
) {
  const langTag   = lang.toUpperCase()
  const fullLabel = `${label}  ·  ${langTag}`
  return S.listItem()
    .title(fullLabel)
    .id(`page-sections-${page}-${lang}`)
    .icon(icon)
    .child(
      S.documentList()
        .title(fullLabel)
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

      // ── Pages ─────────────────────────────────────────────────────────────
      S.listItem()
        .title(t('pages', lang))
        .id(`pages-${lang}`)
        .icon(DocumentIcon)
        .child(
          S.documentList()
            .title(`${t('pages', lang)}  ·  ${lang.toUpperCase()}`)
            .filter(filter('page'))
            .defaultOrdering([{ field: 'title', direction: 'asc' }]),
        ),

      // ── Posts ─────────────────────────────────────────────────────────────
      S.listItem()
        .title(t('posts', lang))
        .id(`posts-${lang}`)
        .icon(ComposeIcon)
        .child(
          S.documentList()
            .title(`${t('posts', lang)}  ·  ${lang.toUpperCase()}`)
            .filter(filter('post'))
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
        ),

      S.divider(),

      // ── Sections — grouped by page, labeled with language tag ─────────────
      S.listItem()
        .title(t('sections', lang))
        .id(`sections-${lang}`)
        .icon(StackCompactIcon)
        .child(
          S.list()
            .title(`${t('pageSections', lang)}  ·  ${lang.toUpperCase()}`)
            .items([
              pageSectionItem(S, lang, 'home',     'Home',     ImageIcon),
              pageSectionItem(S, lang, 'login',    'Login',    LockIcon),
              pageSectionItem(S, lang, 'signup',   'Sign Up',  LockIcon),
              pageSectionItem(S, lang, 'posts',    'Posts',    DocumentTextIcon),
              pageSectionItem(S, lang, 'settings', 'Settings', ControlsIcon),
              pageSectionItem(S, lang, 'billing',  'Billing',  CreditCardIcon),
              pageSectionItem(S, lang, 'admin',    'Admin',    UsersIcon),
            ]),
        ),

      S.divider(),

      // ── Site Config — single document ─────────────────────────────────────
      S.listItem()
        .title(t('siteConfig', lang))
        .id('site-config')
        .icon(CogIcon)
        .child(
          S.document()
            .documentId('site-config')
            .schemaType('siteConfig')
            .title('Site Config'),
        ),

    ])
}
