import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Route cache ───────────────────────────────────────────────────────────────
interface RouteInfo {
  isPublic: boolean
  adminOnly: boolean
}

let routeCache: Map<string, RouteInfo> | null = null
let cacheLoadedAt: number | null = null
const CACHE_TTL_MS = 5 * 60 * 1000

const ALWAYS_PUBLIC = new Set([
  '/login',
  '/signup',
  '/auth/callback',
  '/api/webhooks/stripe',
  '/api/webhooks/sanity',
  '/api/posts',
  '/api/stripe',
  '/api/analytics',
  '/api/delete-account',
])

const ALWAYS_PROTECTED = new Set([
  '/admin',
  '/analytics',
  '/billing',
  '/settings',
])

async function loadRouteCache(): Promise<Map<string, RouteInfo>> {
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
    if (!projectId) return new Map()

    const query = encodeURIComponent(
      `*[_type == "page"]{"slug": slug.current, isPublic, adminOnly}`
    )
    const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${query}`

    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return routeCache ?? new Map()

    const data = await res.json()
    const map = new Map<string, RouteInfo>()

    for (const page of data.result ?? []) {
      if (!page.slug) continue
      const path = page.slug === 'home' ? '/' : `/${page.slug}`
      map.set(path, { isPublic: page.isPublic ?? true, adminOnly: page.adminOnly ?? false })
    }

    routeCache = map
    cacheLoadedAt = Date.now()
    return map
  } catch {
    return routeCache ?? new Map()
  }
}

export function invalidateRouteCache() {
  routeCache = null
  cacheLoadedAt = null
}

async function getRouteInfo(pathname: string): Promise<RouteInfo> {
  if (ALWAYS_PUBLIC.has(pathname)) return { isPublic: true, adminOnly: false }
  if (ALWAYS_PROTECTED.has(pathname)) return { isPublic: false, adminOnly: false }

  const isStale = !cacheLoadedAt || Date.now() - cacheLoadedAt > CACHE_TTL_MS
  if (!routeCache || isStale) await loadRouteCache()

  const exact = routeCache?.get(pathname)
  if (exact) return exact

  for (const [path, info] of routeCache ?? []) {
    if (pathname.startsWith(path + '/')) return info
  }

  return { isPublic: false, adminOnly: false }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const routeInfo = await getRouteInfo(pathname)

  if (!user && !routeInfo.isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (routeInfo.adminOnly && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  if (user && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
