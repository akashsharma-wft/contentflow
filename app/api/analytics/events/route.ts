// ─── app/api/analytics/events/route.ts ───────────────────────────────────────
// Fetches real events from PostHog's API using the personal API key.
// Server-side only — personal API key must never go to the client.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const posthogPersonalKey = process.env.POSTHOG_PERSONAL_API_KEY
    const projectId = process.env.POSTHOG_PROJECT_ID

    // If keys missing, return empty with explanation
    if (!posthogPersonalKey || !projectId) {
      console.warn('PostHog personal API key or project ID not configured')
      return NextResponse.json({
        events: [],
        eventsToday: 0,
        uniqueUsers: 0,
        avgSession: '—',
        error: 'POSTHOG_PERSONAL_API_KEY or POSTHOG_PROJECT_ID not set in environment',
      })
    }

    const host = 'https://us.posthog.com'
    
    const eventsResponse = await fetch(
      `${host}/api/projects/${projectId}/events/?limit=50&order=-timestamp`,
      {
        headers: {
          Authorization: `Bearer ${posthogPersonalKey}`,
          'Content-Type': 'application/json',
        },
        // Don't cache this — always fresh
        cache: 'no-store',
      }
    )

    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text()
      console.error('PostHog API error:', eventsResponse.status, errorText)
      return NextResponse.json({ events: [], eventsToday: 0, uniqueUsers: 0, avgSession: '—' })
    }

    const data = await eventsResponse.json()
    const allEvents = data.results ?? []

    // Sort custom events first, autocapture last
    const sortedEvents = [...allEvents].sort((a: { event: string }, b: { event: string }) => {
      const customA = !a.event.startsWith('$')
      const customB = !b.event.startsWith('$')
      if (customA && !customB) return -1
      if (!customA && customB) return 1
      return 0
    })

    const today = new Date().toDateString()
    const eventsToday = allEvents.filter(
      (e: { timestamp: string }) => new Date(e.timestamp).toDateString() === today
    ).length

    const uniqueUsers = new Set(
      allEvents.map((e: { distinct_id: string }) => e.distinct_id)
    ).size

    return NextResponse.json({
      events: sortedEvents.map((e: {
        timestamp: string
        event: string
        properties: Record<string, unknown>
        distinct_id: string
      }) => ({
        timestamp: e.timestamp,
        event: e.event,
        properties: e.properties,
        distinct_id: e.distinct_id,
      })),
      eventsToday,
      uniqueUsers,
      avgSession: '—',
    })
  } catch (err) {
    console.error('Analytics route error:', err)
    return NextResponse.json({ events: [], eventsToday: 0, uniqueUsers: 0, avgSession: '—' })
  }
}