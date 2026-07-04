import { motion } from 'motion/react'
import type { Upgrade } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UpgradeCardProps {
  upgrade: Upgrade
  isPurchased: boolean
  canAfford: boolean
  onBuy: () => void
  businessColor: string
}

export function UpgradeCard({
  upgrade,
  isPurchased,
  canAfford,
  onBuy,
  businessColor,
}: UpgradeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'relative rounded-xl border p-3',
        isPurchased
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : canAfford
          ? 'border-white/10 bg-white/5'
          : 'border-white/5 bg-white/[0.02]',
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg text-xl',
            isPurchased ? 'bg-emerald-500/20' : 'bg-white/5',
          )}
        >
          {isPurchased ? '✅' : upgrade.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', isPurchased ? 'text-emerald-400' : 'text-white')}>
              {upgrade.name}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-white/40 leading-tight">{upgrade.description}</p>
        </div>

        {/* Buy / Owned */}
        {isPurchased ? (
          <span className="shrink-0 text-xs font-semibold text-emerald-400">Owned</span>
        ) : (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onBuy}
            disabled={!canAfford}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              canAfford
                ? 'text-black'
                : 'bg-white/5 text-white/30 cursor-not-allowed',
            )}
            style={
              canAfford
                ? { backgroundColor: businessColor, boxShadow: `0 0 12px ${businessColor}66` }
                : undefined
            }
          >
            {formatCurrency(upgrade.cost)}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
