import type { StructureBuilder, DefaultDocumentNodeContext } from 'sanity/structure'
import {
  DocumentIcon,
  ComposeIcon,
  StackCompactIcon,
  ComponentIcon,
  CogIcon,
  ImageIcon,
  DocumentTextIcon,
  LockIcon,
  ControlsIcon,
  CreditCardIcon,
  UsersIcon,
  BulbOutlineIcon,
  UlistIcon,
  ActivityIcon,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Single filtered list item for a component type group. */
function componentTypeItem(
  S: StructureBuilder,
  lang: string,
  componentType: string,
  label: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any,
) {
  return S.listItem()
    .title(label)
    .id(`components-${componentType}-${lang}`)
    .icon(icon)
    .child(
      S.documentList()
        .title(`${label}  ·  ${lang.toUpperCase()}`)
        .filter(`_type == "component" && componentType == "${componentType}" && language == "${lang}"`)
        .defaultOrdering([{ field: 'name', direction: 'asc' }]),
    )
}

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
              pageSectionItem(S, lang, 'home',       'Home',        ImageIcon),
              pageSectionItem(S, lang, 'login',      'Login',       LockIcon),
              pageSectionItem(S, lang, 'signup',     'Sign Up',     LockIcon),
              pageSectionItem(S, lang, 'posts',      'Posts',       DocumentTextIcon),
              pageSectionItem(S, lang, 'postDetail', 'Post Detail', DocumentTextIcon),
              pageSectionItem(S, lang, 'settings',   'Settings',    ControlsIcon),
              pageSectionItem(S, lang, 'billing',    'Billing',     CreditCardIcon),
              pageSectionItem(S, lang, 'analytics',  'Analytics',   ActivityIcon),
              pageSectionItem(S, lang, 'admin',      'Admin',       UsersIcon),
            ]),
        ),

      S.divider(),

      // ── Components — content blocks only (layout chrome is owned by Site Config) ──
      S.listItem()
        .title('Components')
        .id(`components-${lang}`)
        .icon(ComponentIcon)
        .child(
          S.list()
            .title(`Components  ·  ${lang.toUpperCase()}`)
            .items([
              componentTypeItem(S, lang, 'form',         'Form',          ControlsIcon),
              componentTypeItem(S, lang, 'grid',         'Grid',          BulbOutlineIcon),
              componentTypeItem(S, lang, 'cards',        'Cards',         BulbOutlineIcon),
              componentTypeItem(S, lang, 'pricingTable', 'Pricing Table', CreditCardIcon),
              componentTypeItem(S, lang, 'dataTable',    'Data Table',    UlistIcon),
              componentTypeItem(S, lang, 'list',         'List',          UlistIcon),
              componentTypeItem(S, lang, 'flex',         'Flex Layout',   BulbOutlineIcon),
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
