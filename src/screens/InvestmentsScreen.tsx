import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { investApi } from '@/lib/api'
import { INVESTMENT_ASSETS } from '@/lib/gameConstants'
import { formatCurrency, formatPct } from '@/lib/utils'
import { NetWorthCounter } from '@/components/NetWorthCounter'
import { useGameState } from '@/hooks/useGameState'

export function InvestmentsScreen() {
  const { state, dispatch } = useGameState()
  const [prices, setPrices] = useState<Record<string, { price: number; change24h: number }>>({})
  const [portfolio, setPortfolio] = useState<{ totalValue: number; totalPnl: number; positions: Array<{ assetId: string; amount: number; currentPrice: number; currentValue: number; pnl: number; pnlPct: number }> }>({ totalValue: 0, totalPnl: 0, positions: [] })
  const [buyModal, setBuyModal] = useState<string | null>(null)
  const [buyAmount, setBuyAmount] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const [pricesRes, portfolioRes] = await Promise.all([investApi.assets(), investApi.portfolio()])
      setLoading(false)
      if (pricesRes.ok && pricesRes.data) {
        const map: Record<string, { price: number; change24h: number }> = {}
        for (const p of pricesRes.data) map[p.assetId] = p
        setPrices(map)
      }
      if (portfolioRes.ok && portfolioRes.data) setPortfolio(portfolioRes.data)
    }
    void fetch()
    const interval = setInterval(fetch, 30_000)
    return () => clearInterval(interval)
  }, [])

  const handleBuy = async () => {
    if (!buyModal) return
    const amount = parseFloat(buyAmount)
    if (isNaN(amount) || amount <= 0) return
    const result = await investApi.buy(buyModal, amount)
    if (result.ok && result.data) {
      dispatch({ type: 'SUBTRACT_BALANCE', payload: amount })
      setBuyModal(null)
      setBuyAmount('')
    }
  }

  const handleSellAll = async (assetId: string) => {
    const pos = portfolio.positions.find((p) => p.assetId === assetId)
    if (!pos) return
    const result = await investApi.sell(assetId, pos.amount)
    if (result.ok && result.data) {
      dispatch({ type: 'ADD_BALANCE', payload: result.data.proceeds })
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/5">
        <h1 className="text-lg font-bold text-white">Investments</h1>
        <p className="text-xs text-white/40">Virtual financial markets</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-3 space-y-4">
        {/* Balance + Portfolio */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[10px] text-white/40">Cash Balance</p>
            <NetWorthCounter value={state.balance} className="text-base font-bold text-amber-400" />
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
            <p className="text-[10px] text-white/40">Portfolio Value</p>
            <p className="text-base font-bold text-white">{formatCurrency(portfolio.totalValue)}</p>
            <p className={`text-[10px] font-medium ${portfolio.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(portfolio.totalPnl)} P&L
            </p>
          </div>
        </div>

        {/* Assets */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">Markets</p>
          <div className="space-y-2">
            {INVESTMENT_ASSETS.map((asset) => {
              const price = prices[asset.id]
              const position = portfolio.positions.find((p) => p.assetId === asset.id)

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl"
                      style={{ backgroundColor: `${asset.color}20` }}
                    >
                      {asset.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{asset.name}</p>
                        <p className="text-sm font-bold text-white">
                          ${price?.price.toFixed(2) ?? '—'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-white/40 truncate">{asset.description}</p>
                        {price && (
                          <p className={`text-[11px] font-medium shrink-0 ml-2 ${price.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatPct(price.change24h)}
                          </p>
                        )}
                      </div>
                      {position && (
                        <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                          <span className="text-white/40">Holdings:</span>
                          <span className="text-white/70">{position.amount.toFixed(3)} units</span>
                          <span className={position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {formatCurrency(position.pnl)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setBuyModal(asset.id)}
                      className="flex-1 rounded-xl py-2 text-xs font-semibold text-black"
                      style={{ backgroundColor: asset.color }}
                    >
                      Buy
                    </motion.button>
                    {position && position.amount > 0 && (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSellAll(asset.id)}
                        className="flex-1 rounded-xl py-2 text-xs font-semibold border border-white/10 text-white/60"
                      >
                        Sell All
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {buyModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setBuyModal(null)} />
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            className="relative w-full rounded-t-3xl border-t border-white/10 bg-[#0d1528] p-6"
          >
            <h3 className="text-base font-bold text-white mb-4">
              Buy {INVESTMENT_ASSETS.find((a) => a.id === buyModal)?.name}
            </h3>
            <div className="flex gap-3 mb-4">
              {['1000', '10000', '100000'].map((amt) => (
                <button key={amt} onClick={() => setBuyAmount(amt)}
                  className="flex-1 rounded-xl border border-white/10 py-2 text-xs text-white/60">
                  ${parseInt(amt).toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="Enter amount ($)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none mb-4"
            />
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleBuy}
              className="w-full rounded-2xl py-4 text-sm font-bold text-black"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
              Invest {buyAmount ? `$${parseFloat(buyAmount).toLocaleString()}` : ''}
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
