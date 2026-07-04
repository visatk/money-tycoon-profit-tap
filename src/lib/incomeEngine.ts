import type { BusinessState, ActiveMarketEvent } from '@/types'
import { BUSINESS_MAP, LUXURY_MAP, INCOME_TICK_MS } from '@/lib/gameConstants'

/**
 * Calculate tap income on the client, applying event multipliers.
 */
export function calcClientTapIncome(biz: BusinessState, events: ActiveMarketEvent[]): number {
  const def = BUSINESS_MAP[biz.businessId]
  if (!def) return 1

  let tapMult = 1
  for (const upgradeId of biz.upgradesPurchased) {
    const upgrade = def.upgrades.find((u) => u.id === upgradeId)
    if (upgrade?.tapMultiplier) tapMult *= upgrade.tapMultiplier
  }

  const eventMult = getClientEventMultiplier(events, biz.businessId)
  return def.baseIncomePerTap * biz.level * tapMult * eventMult
}

/**
 * Calculate auto income per second on the client.
 */
export function calcClientAutoIncome(biz: BusinessState, events: ActiveMarketEvent[]): number {
  if (biz.managersHired === 0) return 0

  const def = BUSINESS_MAP[biz.businessId]
  if (!def) return 0

  let autoMult = 1
  for (const upgradeId of biz.upgradesPurchased) {
    const upgrade = def.upgrades.find((u) => u.id === upgradeId)
    if (upgrade?.autoMultiplier) autoMult *= upgrade.autoMultiplier
  }

  const managersToUse = Math.min(biz.managersHired, def.managers.length)
  let rateFromManagers = 0
  for (let i = 0; i < managersToUse; i++) {
    rateFromManagers += def.managers[i].incomePerSecond
  }

  const eventMult = getClientEventMultiplier(events, biz.businessId)
  return rateFromManagers * biz.level * autoMult * eventMult
}

/**
 * Get total auto income per second across all businesses.
 */
export function calcTotalAutoIncome(businesses: BusinessState[], events: ActiveMarketEvent[]): number {
  return businesses.reduce((sum, biz) => sum + calcClientAutoIncome(biz, events), 0)
}

/**
 * Apply a single income tick (100ms) to a balance.
 * Returns the income earned in that tick.
 */
export function applyIncomeTick(businesses: BusinessState[], events: ActiveMarketEvent[]): number {
  const totalPerSecond = calcTotalAutoIncome(businesses, events)
  return totalPerSecond * (INCOME_TICK_MS / 1000)
}

/**
 * Get event multiplier for a specific business.
 */
export function getClientEventMultiplier(
  events: ActiveMarketEvent[],
  businessId: string,
): number {
  let multiplier = 1
  const now = Date.now()

  for (const event of events) {
    if (event.endsAt < now) continue
    if (event.effect === 'boost_all') {
      multiplier *= event.multiplier
    } else if (
      (event.effect === 'boost_one' || event.effect === 'reduce_one') &&
      event.businessId === businessId
    ) {
      multiplier *= event.multiplier
    }
  }

  return multiplier
}

/**
 * Get total net worth from balance + investments + luxury.
 */
export function calcClientNetWorth(balance: number, investmentValue: number, ownedLuxury: string[]): number {
  const prestigeScore = ownedLuxury.reduce((sum, id) => {
    return sum + (LUXURY_MAP[id]?.prestigeScore ?? 0)
  }, 0)
  return balance + investmentValue + prestigeScore * 1000
}
