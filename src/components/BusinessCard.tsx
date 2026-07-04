import { motion } from 'motion/react'
import type { BusinessState } from '@/types'
import { BUSINESS_MAP } from '@/lib/gameConstants'
import { formatCurrency, formatRate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface BusinessCardProps {
  business: BusinessState
  onClick: () => void
  index: number
}

export function BusinessCard({ business, onClick, index }: BusinessCardProps) {
  const def = BUSINESS_MAP[business.businessId]
  if (!def) return null

  const isAutomated = business.managersHired > 0

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-2xl p-4 text-left',
        'border border-white/5 transition-colors',
        'hover:border-white/10 active:border-white/15',
      )}
      style={{
        background: `linear-gradient(135deg, ${def.color}15, ${def.color}05)`,
        borderColor: `${def.color}20`,
      }}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
        style={{ backgroundColor: def.color }}
      />

      {/* Emoji */}
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${def.color}20` }}
      >
        {def.emoji}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white truncate">{def.name}</span>
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            style={{ backgroundColor: `${def.color}30`, color: def.color }}
          >
            Lv.{business.level}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-white/50">
          <span>
            Tap: <span className="text-white/70">{formatCurrency(business.tapIncome)}</span>
          </span>
          {isAutomated && (
            <span>
              Auto: <span className="text-emerald-400">{formatRate(business.autoIncome)}</span>
            </span>
          )}
        </div>
        <div className="mt-1 text-[11px] text-white/30">
          Total: {formatCurrency(business.totalEarned)}
        </div>
      </div>

      {/* Arrow */}
      <div className="shrink-0 text-white/20 text-lg">›</div>

      {/* Automation badge */}
      {isAutomated && (
        <div className="absolute top-2 right-2 size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
      )}
    </motion.button>
  )
}
