// ─── app/api/analytics/events/route.ts ───────────────────────────────────────
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // ─── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ─── Env Config ──────────────────────────────────────────────────────────
    const posthogPersonalKey = process.env.POSTHOG_PERSONAL_API_KEY
    const projectId = process.env.POSTHOG_PROJECT_ID

    if (!posthogPersonalKey || !projectId) {
      return NextResponse.json({
        events: [],
        customEvents: [],
        systemEvents: [],
        eventsToday: 0,
        uniqueUsers: 0,
        avgSession: '—',
      })
    }

    const host = 'https://us.posthog.com'

    // ─── Fetch Events ────────────────────────────────────────────────────────
    const eventsRes = await fetch(
      `${host}/api/projects/${projectId}/events/?limit=50&order=-timestamp`,
      {
        headers: {
          Authorization: `Bearer ${posthogPersonalKey}`,
        },
        cache: 'no-store',
      }
    )

    if (!eventsRes.ok) {
      console.error('PostHog events fetch failed')
      return NextResponse.json({
        events: [],
        customEvents: [],
        systemEvents: [],
        eventsToday: 0,
        uniqueUsers: 0,
        avgSession: '—',
      })
    }

    const data = await eventsRes.json()

    const allEvents: Array<{
      timestamp: string
      event: string
      properties: Record<string, unknown>
      distinct_id: string
    }> = data.results ?? []

    // ─── Metrics Calculation ─────────────────────────────────────────────────
    const todayStr = new Date().toDateString()

    const eventsToday = allEvents.filter(
      (e) => new Date(e.timestamp).toDateString() === todayStr
    ).length

    const uniqueUsers = new Set(
      allEvents.map((e) => e.distinct_id)
    ).size

    // ─── Estimated Avg Session (simple heuristic) ────────────────────────────
    let avgSession = '—'

    if (allEvents.length > 1) {
      const timestamps = allEvents
        .map((e) => new Date(e.timestamp).getTime())
        .sort((a, b) => a - b)

      const durationMs =
        timestamps[timestamps.length - 1] - timestamps[0]

      if (durationMs > 0) {
        const mins = Math.floor(durationMs / 60000)
        const secs = Math.floor((durationMs % 60000) / 1000)
        avgSession = `${mins}m ${secs}s`
      }
    }

    // ─── Custom Events Priority ──────────────────────────────────────────────
    const CUSTOM_EVENTS = new Set([
      'post_viewed',
      'post_created',
      'post_edited',
      'post_deleted',
      'upgrade_intent',
      'upgrade_completed',
      'form_submitted',
      'login',
    ])

    const customEvents = allEvents
      .filter((e) => CUSTOM_EVENTS.has(e.event))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      )

    const systemEvents = allEvents
      .filter((e) => !CUSTOM_EVENTS.has(e.event))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      )

    // ─── Final Response ──────────────────────────────────────────────────────
    return NextResponse.json({
      events: allEvents.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      ),
      customEvents,
      systemEvents,
      eventsToday,
      uniqueUsers,
      avgSession,
    })
  } catch (err) {
    console.error('Analytics route error:', err)

    return NextResponse.json({
      events: [],
      customEvents: [],
      systemEvents: [],
      eventsToday: 0,
      uniqueUsers: 0,
      avgSession: '—',
    })
  }
}