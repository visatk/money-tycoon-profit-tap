import { useState, useEffect, useCallback } from 'react'
import type { LeaderboardEntry } from '@/types'
import { leaderboardApi } from '@/lib/api'

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [playerRank, setPlayerRank] = useState<{ rank: number; total: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [globalResult, rankResult] = await Promise.all([
      leaderboardApi.global(),
      leaderboardApi.rank(),
    ])

    setLoading(false)

    if (globalResult.ok && globalResult.data) {
      setEntries(globalResult.data)
    } else {
      setError(globalResult.error ?? 'Failed to load leaderboard')
    }

    if (rankResult.ok && rankResult.data) {
      setPlayerRank({ rank: rankResult.data.rank, total: rankResult.data.total })
    }
  }, [])

  useEffect(() => {
    void fetchLeaderboard()
  }, [fetchLeaderboard])

  return { entries, playerRank, loading, error, refetch: fetchLeaderboard }
}
