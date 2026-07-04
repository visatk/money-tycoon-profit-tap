import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { ActiveMarketEvent } from '@/types'
import { formatDuration } from '@/lib/utils'

interface EventBannerProps {
  event: ActiveMarketEvent | null
  onDismiss: () => void
}

export function EventBanner({ event, onDismiss }: EventBannerProps) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!event) return
    const update = () => setTimeLeft(Math.max(0, event.endsAt - Date.now()))
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [event])

  const isBoost = event?.effect === 'boost_all' || event?.effect === 'boost_one'

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative mx-4 mt-2 overflow-hidden rounded-2xl border"
          style={{
            background: isBoost
              ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))'
              : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
            borderColor: isBoost ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)',
          }}
        >
          {/* Animated shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="absolute inset-y-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none"
          />

          <div className="relative flex items-center gap-3 px-4 py-3">
            <span className="text-2xl">{event.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{event.title}</p>
              <p className="text-xs text-white/60 truncate">{event.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-sm font-bold ${isBoost ? 'text-amber-400' : 'text-red-400'}`}>
                {event.multiplier}×
              </p>
              <p className="text-[10px] text-white/40">{formatDuration(timeLeft / 1000)}</p>
            </div>
            <button
              onClick={onDismiss}
              className="shrink-0 text-white/30 hover:text-white/60 transition-colors text-lg leading-none ml-1"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
