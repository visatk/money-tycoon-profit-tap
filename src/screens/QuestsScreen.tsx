import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { questsApi } from '@/lib/api'
import { QUEST_POOL } from '@/lib/gameConstants'
import { useGameState } from '@/hooks/useGameState'

interface QuestItem {
  questId: string
  target: number
  progress: number
  completed: boolean
  claimed: boolean
  reward: { type: string; amount: number }
}

export function QuestsScreen() {
  const [quests, setQuests] = useState<QuestItem[]>([])
  const [loading, setLoading] = useState(true)
  const { dispatch } = useGameState()

  useEffect(() => {
    questsApi.today().then((r) => {
      setLoading(false)
      if (r.ok && r.data) setQuests(r.data)
    })
  }, [])

  const handleClaim = async (questId: string) => {
    const result = await questsApi.claim(questId)
    if (result.ok && result.data) {
      dispatch({ type: 'ADD_BALANCE', payload: result.data.reward.amount })
      setQuests((prev) => prev.map((q) => q.questId === questId ? { ...q, claimed: true } : q))
    }
  }

  const completedCount = quests.filter((q) => q.claimed).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/5">
        <h1 className="text-lg font-bold text-white">Daily Quests</h1>
        <p className="text-xs text-white/40">Resets every day at midnight UTC</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: quests.length ? `${(completedCount / quests.length) * 100}%` : '0%',
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              }}
            />
          </div>
          <span className="text-xs text-white/40">{completedCount}/{quests.length}</span>
        </div>
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-white/30">Loading quests…</div>
        ) : (
          quests.map((quest, i) => {
            const def = QUEST_POOL.find((q) => q.id === quest.questId)
            if (!def) return null
            const pct = Math.min(100, (quest.progress / quest.target) * 100)

            return (
              <motion.div
                key={quest.questId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-white/5 p-4"
                style={{
                  backgroundColor: quest.claimed
                    ? 'rgba(52,211,153,0.05)'
                    : quest.completed
                    ? 'rgba(251,191,36,0.05)'
                    : 'rgba(255,255,255,0.02)',
                  borderColor: quest.claimed
                    ? 'rgba(52,211,153,0.2)'
                    : quest.completed
                    ? 'rgba(251,191,36,0.2)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{def.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${quest.claimed ? 'text-emerald-400' : 'text-white'}`}>
                        {def.title}
                      </p>
                      <p className="text-[11px] text-white/40 shrink-0 ml-2">
                        {quest.progress.toFixed(0)}/{quest.target}
                      </p>
                    </div>
                    <p className="text-[11px] text-white/40 mt-0.5">{def.description}</p>

                    {/* Progress bar */}
                    {!quest.claimed && (
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: quest.completed
                              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                              : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Reward + Claim */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/30">Reward</p>
                    <p className="text-xs font-bold text-amber-400">{def.rewardLabel}</p>
                  </div>
                  {quest.claimed ? (
                    <span className="text-xs font-semibold text-emerald-400">✓ Claimed</span>
                  ) : quest.completed ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClaim(quest.questId)}
                      className="rounded-xl px-4 py-2 text-xs font-bold text-black"
                      style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
                    >
                      Claim!
                    </motion.button>
                  ) : (
                    <span className="text-xs text-white/20">{pct.toFixed(0)}%</span>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
