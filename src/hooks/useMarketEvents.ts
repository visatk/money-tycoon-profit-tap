import { useState, useEffect, useCallback } from 'react'
import type { ActiveMarketEvent } from '@/types'
import { eventsApi } from '@/lib/api'

const POLL_INTERVAL_MS = 60_000 // poll every 60s

export function useMarketEvents() {
  const [events, setEvents] = useState<ActiveMarketEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [lastEvent, setLastEvent] = useState<ActiveMarketEvent | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const result = await eventsApi.active()
    setLoading(false)

    if (result.ok && result.data) {
      const newEvents = result.data
      // Detect newly started events
      setEvents((prev) => {
        const prevIds = new Set(prev.map((e) => e.id))
        const brandNew = newEvents.filter((e) => !prevIds.has(e.id))
        if (brandNew.length > 0) setLastEvent(brandNew[0])
        return newEvents
      })
    }
  }, [])

  useEffect(() => {
    void fetchEvents()
    const interval = setInterval(fetchEvents, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchEvents])

  const dismissLastEvent = useCallback(() => setLastEvent(null), [])

  return { events, loading, lastEvent, dismissLastEvent, refetch: fetchEvents }
}
