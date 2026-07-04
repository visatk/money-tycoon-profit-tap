import { useCallback, useState } from 'react'
import { motion } from 'motion/react'
import type { BusinessId } from '@/types'
import { useGameState } from '@/hooks/useGameState'
import { useTelegram } from '@/hooks/useTelegram'
import { TapButton } from '@/components/TapButton'
import { UpgradeCard } from '@/components/UpgradeCard'
import { NetWorthCounter } from '@/components/NetWorthCounter'
import { BUSINESS_MAP } from '@/lib/gameConstants'
import { formatCurrency, formatRate } from '@/lib/utils'

interface BusinessScreenProps {
  businessId: BusinessId
  onBack: () => void
}

export function BusinessScreen({ businessId, onBack }: BusinessScreenProps) {
  const { state, tap, upgrade, hire, getBusiness } = useGameState()
  const { triggerHaptic } = useTelegram()
  const [activeTab, setActiveTab] = useState<'upgrades' | 'managers'>('upgrades')

  const def = BUSINESS_MAP[businessId]
  const biz = getBusiness(businessId)

  if (!def || !biz) return null

  const handleTap = useCallback(() => {
    triggerHaptic('medium')
    tap(businessId)
  }, [tap, businessId, triggerHaptic])

  const handleUpgrade = useCallback(
    async (upgradeId: string) => {
      const success = await upgrade(businessId, upgradeId)
      if (success) triggerHaptic('success' as never)
    },
    [upgrade, businessId, triggerHaptic],
  )

  const handleHire = useCallback(
    async (managerId: string) => {
      const success = await hire(businessId, managerId)
      if (success) triggerHaptic('success' as never)
    },
    [hire, businessId, triggerHaptic],
  )

  const upgrades = def.upgrades
  const managers = def.managers

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/5"
        style={{ backgroundColor: 'rgba(8,12,26,0.95)' }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-white/60"
        >
          ‹
        </motion.button>
        <div
          className="flex size-9 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${def.color}20` }}
        >
          {def.emoji}
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-white">{def.name}</h1>
          <p className="text-[10px] text-white/40">Level {biz.level} · {biz.tapCount.toLocaleString()} taps</p>
        </div>
        <div className="text-right">
          <NetWorthCounter value={state.balance} className="text-sm font-bold text-amber-400" />
        </div>
      </div>

      {/* Tap zone */}
      <div
        className="flex shrink-0 flex-col items-center justify-center py-8"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${def.color}12, transparent 70%)`,
        }}
      >
        <TapButton
          onTap={handleTap}
          income={biz.tapIncome}
          color={def.color}
          glowColor={def.glowColor}
          emoji={def.emoji}
        />

        {/* Income stats */}
        <div className="mt-5 flex items-center gap-6 text-center">
          <div>
            <p className="text-[10px] text-white/40">Per Tap</p>
            <p className="text-sm font-bold" style={{ color: def.color }}>
              {formatCurrency(biz.tapIncome)}
            </p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-[10px] text-white/40">Per Second</p>
            <p className="text-sm font-bold text-emerald-400">
              {biz.managersHired > 0 ? formatRate(biz.autoIncome) : 'No managers'}
            </p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-[10px] text-white/40">Total Earned</p>
            <p className="text-sm font-bold text-white/70">
              {formatCurrency(biz.totalEarned)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex gap-1 px-4 pb-3">
        {(['upgrades', 'managers'] as const).map((tab) => (
          <motion.button
            key={tab}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-all"
            style={{
              backgroundColor: activeTab === tab ? `${def.color}22` : 'rgba(255,255,255,0.04)',
              color: activeTab === tab ? def.color : 'rgba(255,255,255,0.4)',
              border: `1px solid ${activeTab === tab ? `${def.color}40` : 'transparent'}`,
            }}
          >
            {tab} ({tab === 'upgrades' ? upgrades.length : managers.length})
          </motion.button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
        {activeTab === 'upgrades'
          ? upgrades.map((upgrade) => (
              <UpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                isPurchased={biz.upgradesPurchased.includes(upgrade.id)}
                canAfford={state.balance >= upgrade.cost}
                onBuy={() => handleUpgrade(upgrade.id)}
                businessColor={def.color}
              />
            ))
          : managers.map((manager, i) => {
              const isHired = biz.managersHired > i
              const costForNext = isHired
                ? manager.costPerHire * Math.pow(1.5, biz.managersHired)
                : manager.costPerHire
              const canAfford = state.balance >= costForNext

              return (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-xl border p-3 ${isHired ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-xl">
                      {isHired ? '✅' : '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isHired ? 'text-emerald-400' : 'text-white'}`}>
                        {manager.name}
                      </p>
                      <p className="text-[11px] text-white/40">{manager.description}</p>
                      <p className="text-[11px] text-emerald-400/70">
                        +{formatRate(manager.incomePerSecond)} per second
                      </p>
                    </div>
                    {!isHired ? (
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => handleHire(manager.id)}
                        disabled={!canAfford}
                        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold"
                        style={
                          canAfford
                            ? { backgroundColor: def.color, color: '#000', boxShadow: `0 0 12px ${def.glowColor}` }
                            : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }
                        }
                      >
                        {formatCurrency(costForNext)}
                      </motion.button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400">Hired</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
      </div>
    </div>
  )
}
