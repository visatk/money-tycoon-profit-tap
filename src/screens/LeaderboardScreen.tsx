import { motion } from 'motion/react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useGameState } from '@/hooks/useGameState'
import { formatCurrency } from '@/lib/utils'

const RANK_BADGES = [
  { min: 1, max: 1, label: '👑', color: '#fbbf24' },
  { min: 2, max: 3, label: '🥇', color: '#fbbf24' },
  { min: 4, max: 10, label: '🥈', color: '#94a3b8' },
  { min: 11, max: 50, label: '🥉', color: '#d97706' },
  { min: 51, max: 100, label: '🏅', color: '#6b7280' },
]

function getRankBadge(rank: number) {
  return RANK_BADGES.find((b) => rank >= b.min && rank <= b.max) ?? { label: '🎖️', color: '#6b7280' }
}

export function LeaderboardScreen() {
  const { entries, playerRank, loading, error, refetch } = useLeaderboard()
  const { state } = useGameState()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Leaderboard</h1>
            <p className="text-xs text-white/40">Global net worth rankings</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={refetch}
            className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/40">
            ↻ Refresh
          </motion.button>
        </div>

        {/* Player rank summary */}
        {playerRank && (
          <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3 flex items-center gap-3">
            <span className="text-2xl">{getRankBadge(playerRank.rank).label}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Your Rank: #{playerRank.rank}</p>
              <p className="text-[11px] text-white/40">
                Top {Math.round((playerRank.rank / playerRank.total) * 100)}% of {playerRank.total.toLocaleString()} players
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Net Worth</p>
              <p className="text-sm font-bold text-amber-400">{formatCurrency(state.balance)}</p>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3">
        {loading && (
          <div className="flex items-center justify-center py-16 text-white/30">Loading rankings…</div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-red-400/60">{error}</div>
        )}
        {!loading && entries.length > 0 && (
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const badge = getRankBadge(entry.rank)
              const isCurrentPlayer = entry.playerId === state.player.id

              return (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 rounded-2xl border p-3 transition-all"
                  style={{
                    borderColor: isCurrentPlayer ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.05)',
                    backgroundColor: isCurrentPlayer ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {/* Rank */}
                  <div className="flex size-9 shrink-0 flex-col items-center justify-center">
                    {entry.rank <= 3 ? (
                      <span className="text-xl">{badge.label}</span>
                    ) : (
                      <span className="text-sm font-bold" style={{ color: badge.color }}>
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                    style={{ background: isCurrentPlayer ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.1)' }}
                  >
                    <span className={isCurrentPlayer ? 'text-black' : 'text-white'}>
                      {(entry.firstName ?? entry.username ?? '?')[0]?.toUpperCase()}
                    </span>
                  </div>

                  {/* Name + Level */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isCurrentPlayer ? 'text-amber-400' : 'text-white'}`}>
                      {entry.firstName ?? entry.username ?? 'Anonymous'}
                      {isCurrentPlayer && ' (You)'}
                    </p>
                    <p className="text-[11px] text-white/40">Level {entry.level}</p>
                  </div>

                  {/* Net worth */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{formatCurrency(entry.netWorth)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
