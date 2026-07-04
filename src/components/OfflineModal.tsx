import { motion, AnimatePresence } from 'motion/react'
import type { OfflineEarnings } from '@/types'
import { formatCurrency, formatDuration } from '@/lib/utils'

interface OfflineModalProps {
  data: OfflineEarnings | null
  onCollect: () => void
  onDismiss: () => void
}

export function OfflineModal({ data, onCollect, onDismiss }: OfflineModalProps) {
  return (
    <AnimatePresence>
      {data && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 bottom-8 z-50 overflow-hidden rounded-3xl border border-amber-400/20"
            style={{
              background: 'linear-gradient(145deg, rgba(17,24,39,0.98), rgba(10,14,26,0.98))',
              boxShadow: '0 0 60px rgba(251,191,36,0.2), 0 20px 60px rgba(0,0,0,0.8)',
            }}
          >
            {/* Gold accent top */}
            <div
              className="h-1 w-full"
              style={{ background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }}
            />

            <div className="p-6 text-center">
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-3 text-5xl"
              >
                💰
              </motion.div>

              <h2 className="text-xl font-bold text-white">Welcome Back!</h2>
              <p className="mt-1 text-sm text-white/50">
                You were away for {formatDuration(data.elapsed)}
              </p>

              {/* Earnings amount */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="my-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4"
              >
                <p className="text-3xl font-black text-amber-400">
                  +{formatCurrency(data.earnings)}
                </p>
                <p className="mt-1 text-xs text-white/40">offline income collected</p>
              </motion.div>

              {/* Breakdown */}
              {data.breakdown.length > 0 && (
                <div className="mb-5 space-y-1.5">
                  {data.breakdown.slice(0, 4).map((b) => (
                    <div key={b.businessId} className="flex items-center justify-between text-xs">
                      <span className="text-white/40 capitalize">{b.businessId.replace('_', ' ')}</span>
                      <span className="font-medium text-white/70">+{formatCurrency(b.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Collect button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onCollect}
                className="w-full rounded-2xl py-4 text-base font-bold text-black"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  boxShadow: '0 4px 20px rgba(251,191,36,0.4)',
                }}
              >
                Collect Earnings
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
