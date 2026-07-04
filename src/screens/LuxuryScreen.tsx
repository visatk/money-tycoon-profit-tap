import { useState } from 'react'
import { motion } from 'motion/react'
import type { LuxuryCategory } from '@/types'
import { LUXURY_ITEMS } from '@/lib/gameConstants'
import { formatCurrency } from '@/lib/utils'
import { useGameState } from '@/hooks/useGameState'
import { luxuryApi } from '@/lib/api'

const CATEGORIES: { id: LuxuryCategory; label: string; emoji: string }[] = [
  { id: 'cars', label: 'Cars', emoji: '🏎️' },
  { id: 'jets', label: 'Jets', emoji: '✈️' },
  { id: 'yachts', label: 'Yachts', emoji: '⛵' },
  { id: 'art', label: 'Art', emoji: '🎨' },
]

export function LuxuryScreen() {
  const [activeCategory, setActiveCategory] = useState<LuxuryCategory>('cars')
  const [buying, setBuying] = useState<string | null>(null)
  const { state, dispatch } = useGameState()

  const items = LUXURY_ITEMS.filter((i) => i.category === activeCategory)

  const handleBuy = async (itemId: string, price: number) => {
    if (state.balance < price) return
    setBuying(itemId)
    const result = await luxuryApi.buy(itemId)
    setBuying(null)
    if (result.ok && result.data) {
      dispatch({ type: 'APPLY_LUXURY', payload: { itemId, newBalance: result.data.newBalance } })
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Luxury Lifestyle</h1>
            <p className="text-xs text-white/40">Status symbols of the ultra-rich</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40">Balance</p>
            <p className="text-sm font-bold text-amber-400">{formatCurrency(state.balance)}</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                backgroundColor: activeCategory === cat.id ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeCategory === cat.id ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${activeCategory === cat.id ? 'rgba(251,191,36,0.3)' : 'transparent'}`,
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3 grid grid-cols-1 gap-3">
        {items.map((item, i) => {
          const owned = state.luxuryOwned.includes(item.id)
          const canAfford = state.balance >= item.price
          const isLoading = buying === item.id

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl border"
              style={{
                borderColor: owned ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)',
                background: owned
                  ? 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))'
                  : 'rgba(255,255,255,0.02)',
              }}
            >
              {/* Gradient stripe */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient} opacity-60`} />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl bg-gradient-to-br ${item.gradient} bg-opacity-10`}
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      {owned && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                          Owned
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-white/40 leading-tight">{item.description}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-400">+{item.incomeBonus}% income</span>
                      <span className="text-purple-400">+{item.prestigeScore} prestige</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-base font-bold text-amber-400">{formatCurrency(item.price)}</p>
                  {!owned && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBuy(item.id, item.price)}
                      disabled={!canAfford || isLoading}
                      className="rounded-xl px-4 py-2 text-xs font-bold transition-all"
                      style={
                        canAfford
                          ? {
                              background: `linear-gradient(135deg, #fbbf24, #f59e0b)`,
                              color: '#000',
                              boxShadow: '0 4px 12px rgba(251,191,36,0.3)',
                            }
                          : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }
                      }
                    >
                      {isLoading ? '…' : canAfford ? 'Buy' : 'Need more $'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
