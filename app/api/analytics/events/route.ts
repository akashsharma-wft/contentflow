// ─── app/api/analytics/events/route.ts ───────────────────────────────────────
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const posthogPersonalKey = process.env.POSTHOG_PERSONAL_API_KEY
    const projectId          = process.env.POSTHOG_PROJECT_ID

    if (!posthogPersonalKey || !projectId) {
      return NextResponse.json({
        events: [], eventsToday: 0, uniqueUsers: 0, avgSession: '—',
      })
    }

    const host = 'https://us.posthog.com'

    const [eventsRes, sessionRes] = await Promise.all([
      fetch(
        `${host}/api/projects/${projectId}/events/?limit=50&order=-timestamp`,
        {
          headers: { Authorization: `Bearer ${posthogPersonalKey}` },
          cache: 'no-store',
        }
      ),
      // Get session durations for avg session calculation
      fetch(
        `${host}/api/projects/${projectId}/insights/session/?date_from=-7d`,
        {
          headers: { Authorization: `Bearer ${posthogPersonalKey}` },
          cache: 'no-store',
        }
      ),
    ])

    if (!eventsRes.ok) {
      return NextResponse.json({ events: [], eventsToday: 0, uniqueUsers: 0, avgSession: '—' })
    }

    const data       = await eventsRes.json()
    const allEvents: Array<{
      timestamp: string
      event: string
      properties: Record<string, unknown>
      distinct_id: string
    }> = data.results ?? []

    // Compute eventsToday from actual timestamps
    const todayStr   = new Date().toDateString()
    const eventsToday = allEvents.filter(
      (e) => new Date(e.timestamp).toDateString() === todayStr
    ).length

    // Unique users from all fetched events
    const uniqueUsers = new Set(allEvents.map((e) => e.distinct_id)).size

    // Avg session from PostHog insights if available
    let avgSession = '—'
    if (sessionRes.ok) {
      try {
        const sessionData = await sessionRes.json()
        const avgSeconds  = sessionData?.result?.average_session_duration_seconds
        if (typeof avgSeconds === 'number' && avgSeconds > 0) {
          const mins = Math.floor(avgSeconds / 60)
          const secs = Math.floor(avgSeconds % 60)
          avgSession = `${mins}m ${secs}s`
        }
      } catch {
        // session insights may not be available
      }
    }

    // Custom events list for priority sorting
    const CUSTOM_EVENTS = new Set([
      'post_viewed', 'post_created', 'post_edited', 'post_deleted',
      'upgrade_intent', 'upgrade_completed', 'form_submitted', 'login',
    ])

    // Sort: custom events first (by timestamp desc), then system events (by timestamp desc)
    const customEvents = allEvents
      .filter((e) => CUSTOM_EVENTS.has(e.event))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const systemEvents = allEvents
      .filter((e) => !CUSTOM_EVENTS.has(e.event))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return both sorted versions — client chooses which to show
    return NextResponse.json({
      events: allEvents.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
      customEvents,
      systemEvents,
      eventsToday,
      uniqueUsers,
      avgSession,
    })
  } catch (err) {
    console.error('Analytics route error:', err)
    return NextResponse.json({ events: [], eventsToday: 0, uniqueUsers: 0, avgSession: '—' })
  }
}