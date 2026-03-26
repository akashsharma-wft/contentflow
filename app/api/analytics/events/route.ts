// ─── app/api/analytics/events/route.ts ───────────────────────────────────────
// Fetches real events from PostHog's API using the personal API key.
// Server-side only — personal API key must never go to the client.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogPersonalKey = process.env.POSTHOG_PERSONAL_API_KEY

    if (!posthogKey || !posthogPersonalKey) {
      return NextResponse.json({
        events: [],
        eventsToday: 0,
        uniqueUsers: 0,
        avgSession: '—',
      })
    }

    const projectId = process.env.POSTHOG_PROJECT_ID
    const host = 'https://us.posthog.com'

    // Fetch recent events from PostHog API
    const eventsResponse = await fetch(
      `${host}/api/projects/${projectId}/events/?limit=20&order=-timestamp`,
      {
        headers: {
          Authorization: `Bearer ${posthogPersonalKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!eventsResponse.ok) {
      return NextResponse.json({ events: [], eventsToday: 0, uniqueUsers: 0, avgSession: '—' })
    }

    const data = await eventsResponse.json()
    const events = (data.results ?? []).map((e: {
      timestamp: string
      event: string
      properties: Record<string, unknown>
      distinct_id: string
    }) => ({
      timestamp: e.timestamp,
      event: e.event,
      properties: e.properties,
      distinct_id: e.distinct_id,
    }))

    // Count today's events
    const today = new Date().toDateString()
    const eventsToday = events.filter(
      (e: { timestamp: string }) => new Date(e.timestamp).toDateString() === today
    ).length

    // Count unique users from recent events
    const uniqueUsers = new Set(events.map((e: { distinct_id: string }) => e.distinct_id)).size

    return NextResponse.json({ events, eventsToday, uniqueUsers, avgSession: '—' })
  } catch (err) {
    console.error('PostHog API error:', err)
    return NextResponse.json({ events: [], eventsToday: 0, uniqueUsers: 0, avgSession: '—' })
  }
}