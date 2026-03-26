'use client'

import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { useUser } from '@/hooks/useUser'
import { ToggleRight, Loader2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServerFlags {
  showFeaturedBanner: boolean
}

interface PostHogEventsClientProps {
  serverFlags: ServerFlags
}

interface LiveEvent {
  timestamp: string
  event: string
  properties: Record<string, unknown>
  distinct_id: string
}

const EVENT_COLORS: Record<string, string> = {
  post_viewed:        'text-indigo-400 bg-indigo-500/10',
  upgrade_intent:     'text-amber-400  bg-amber-500/10',
  upgrade_completed:  'text-purple-400 bg-purple-500/10',
  form_submitted:     'text-emerald-400 bg-emerald-500/10',
  login:              'text-emerald-400 bg-emerald-500/10',
  page_view:          'text-white/40 bg-white/5',
  '$pageview':        'text-white/40 bg-white/5',
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  if (seconds < 60)  return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

function formatProps(properties: Record<string, unknown>): string {
  return Object.entries(properties)
    .filter(([k]) => !k.startsWith('$') && k !== 'token')
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
    .join(' · ')
}

export function PostHogEventsClient({ serverFlags }: PostHogEventsClientProps) {
  const posthog = usePostHog()
  const { user } = useUser()
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [featureFlagEnabled, setFeatureFlagEnabled] = useState(serverFlags.showFeaturedBanner)
  const [stats, setStats] = useState({ eventsToday: 0, uniqueUsers: 0, avgSession: '—' })

  useEffect(() => {
    // Fetch real events from our API route
    async function fetchEvents() {
      try {
        const response = await fetch('/api/analytics/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events ?? [])
          setStats({
            eventsToday: data.eventsToday ?? 0,
            uniqueUsers: data.uniqueUsers ?? 0,
            avgSession: data.avgSession ?? '—',
          })
        }
      } catch {
        // PostHog API not configured — show empty state
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
    posthog?.capture('page_view', { path: '/dashboard/analytics' })
  }, [posthog])

  useEffect(() => {
    if (posthog && user?.id) {
      const flag = posthog.isFeatureEnabled('show-featured-banner')
      setFeatureFlagEnabled(flag ?? serverFlags.showFeaturedBanner)
    }
  }, [posthog, user?.id, serverFlags.showFeaturedBanner])

  return (
    <div className="px-5 lg:px-8 py-6 space-y-5 max-w-[900px]">
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">PostHog Events</h1>
        <p className="text-white/30 text-[10px] uppercase tracking-widest font-mono mt-1">
          Real-time Telemetry / Production Pipeline
        </p>
      </div>

      {/* Real stats — 0 until data loads */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Events Today', value: isLoading ? '—' : stats.eventsToday.toString() },
          { label: 'Unique Users', value: isLoading ? '—' : stats.uniqueUsers.toString() },
          { label: 'Avg. Session', value: isLoading ? '—' : stats.avgSession },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#13141c] border border-white/5 rounded-xl p-4">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-mono mb-2">{label}</p>
            <p className="text-white text-2xl font-bold tracking-tight">
              {isLoading ? <Loader2 size={20} className="animate-spin text-white/20" /> : value}
            </p>
          </div>
        ))}
      </div>

      {/* Live event stream — real data or empty state */}
      <div className="bg-[#13141c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-sm font-semibold">Live event stream</h3>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-white/20 text-[10px] font-mono">NEXT_PUBLIC_POSTHOG_KEY</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-white/20" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Activity size={18} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm">No events yet</p>
            <p className="text-white/20 text-xs max-w-xs text-center">
              Events will appear here as users interact with your app.
              Make sure PostHog is initialized correctly.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {events.map((event, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <span className="text-white/25 text-xs font-mono w-16 shrink-0">
                  {timeAgo(event.timestamp)}
                </span>
                <span className={cn(
                  'px-2 py-0.5 text-[10px] font-semibold font-mono rounded shrink-0',
                  EVENT_COLORS[event.event] ?? 'text-white/40 bg-white/5'
                )}>
                  {event.event}
                </span>
                <span className="text-white/35 text-xs font-mono truncate">
                  {formatProps(event.properties)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature flag */}
      <div className="bg-[#13141c] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ToggleRight size={15} className="text-indigo-400" />
              <p className="text-white text-sm font-medium">
                Feature flag:{' '}
                <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs font-mono">
                  show-featured-banner
                </code>
              </p>
            </div>
            <p className="text-white/35 text-xs mt-1 ml-5">
              {featureFlagEnabled
                ? 'Enabled — evaluated server-side via PostHog Node SDK'
                : 'Disabled — toggle in PostHog dashboard to enable'}
            </p>
          </div>
          <div className={cn(
            'relative rounded-full transition-all',
            featureFlagEnabled ? 'bg-emerald-500' : 'bg-white/10'
          )} style={{ width: '44px', height: '24px' }}>
            <span className={cn(
              'absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm',
              featureFlagEnabled ? 'left-6' : 'left-1'
            )} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-white/25 text-[10px] font-mono uppercase">Connected to PostHog</span>
        </div>
        <a
          href={`https://us.posthog.com/project/${process.env.NEXT_PUBLIC_POSTHOG_KEY?.slice(0, 8)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
        >
          Configure_PostHog
        </a>
      </div>
    </div>
  )
}