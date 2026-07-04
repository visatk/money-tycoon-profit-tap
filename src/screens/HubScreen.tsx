import { motion } from 'motion/react'
import type { BusinessId, Screen } from '@/types'
import { useGameState } from '@/hooks/useGameState'
import { useMarketEvents } from '@/hooks/useMarketEvents'
import { useOfflineEarnings } from '@/hooks/useOfflineEarnings'
import { BusinessCard } from '@/components/BusinessCard'
import { EventBanner } from '@/components/EventBanner'
import { OfflineModal } from '@/components/OfflineModal'
import { NetWorthCounter } from '@/components/NetWorthCounter'
import { BUSINESSES, xpForNextLevel } from '@/lib/gameConstants'
import { formatRate } from '@/lib/utils'
import { calcTotalAutoIncome } from '@/lib/incomeEngine'

interface HubScreenProps {
  onNavigate: (screen: Screen) => void
}

export function HubScreen({ onNavigate }: HubScreenProps) {
  const { state } = useGameState()
  const { lastEvent, dismissLastEvent } = useMarketEvents()
  const { offlineData, collect, dismiss } = useOfflineEarnings()

  const { player, businesses, balance, activeEvents } = state
  const totalAutoIncome = calcTotalAutoIncome(businesses, activeEvents)
  const xpNeeded = xpForNextLevel(player.level)
  const xpProgress = (player.xp / xpNeeded) * 100

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="shrink-0 px-4 pt-4 pb-3"
        style={{ background: 'linear-gradient(to bottom, rgba(8,12,26,1), rgba(8,12,26,0))' }}
      >
        {/* Player info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="flex size-9 items-center justify-center rounded-full text-sm font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}
            >
              {player.firstName[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{player.firstName}</p>
              <p className="text-[10px] text-white/40">Level {player.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40">Net Worth</p>
            <NetWorthCounter value={balance} className="text-sm font-bold text-amber-400" />
          </div>
        </div>

        {/* XP bar */}
        <div className="mb-1 flex justify-between text-[10px] text-white/30">
          <span>XP {player.xp.toFixed(0)}</span>
          <span>Level {player.level + 1}: {xpNeeded}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, xpProgress)}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Event Banner */}
      <EventBanner event={lastEvent} onDismiss={dismissLastEvent} />

      {/* Stats bar */}
      <div className="mx-4 my-3 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
        <div className="text-center">
          <p className="text-[10px] text-white/40">Balance</p>
          <NetWorthCounter value={balance} className="text-sm font-bold text-white" />
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-center">
          <p className="text-[10px] text-white/40">Auto Income</p>
          <p className="text-sm font-bold text-emerald-400">{formatRate(totalAutoIncome)}</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-center">
          <p className="text-[10px] text-white/40">Businesses</p>
          <p className="text-sm font-bold text-white">{businesses.filter((b) => b.managersHired > 0).length}/{BUSINESSES.length}</p>
        </div>
      </div>

      {/* Business list */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/30">Your Empire</p>
        {BUSINESSES.map((def, i) => {
          const bizState = businesses.find((b) => b.businessId === def.id)
          if (!bizState) return null
          return (
            <BusinessCard
              key={def.id}
              business={bizState}
              index={i}
              onClick={() => onNavigate({ id: 'business', businessId: def.id as BusinessId })}
            />
          )
        })}
      </div>

      {/* Offline Modal */}
      <OfflineModal data={offlineData} onCollect={collect} onDismiss={dismiss} />
    </div>
  )
}
