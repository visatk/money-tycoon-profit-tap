import type { BusinessId, BusinessRow, OfflineEarnings } from '../types'
import { BUSINESS_MAP_WORKER, LUXURY_MAP_WORKER, MAX_OFFLINE_SECONDS } from './gameConstants'

/**
 * Calculate tap income for a business, applying upgrade multipliers.
 */
export function calcTapIncome(biz: BusinessRow, eventMultiplier = 1): number {
  const def = BUSINESS_MAP_WORKER[biz.business_id as BusinessId]
  if (!def) return 1

  const upgrades: string[] = JSON.parse(biz.upgrades_purchased || '[]')
  let tapMult = 1

  for (const upgradeId of upgrades) {
    const upgrade = def.upgrades.find((u: { id: string }) => u.id === upgradeId)
    if (upgrade?.tapMultiplier) tapMult *= upgrade.tapMultiplier
  }

  return def.baseIncomePerTap * biz.level * tapMult * eventMultiplier
}

/**
 * Calculate auto income per second for a business.
 */
export function calcAutoIncome(biz: BusinessRow, eventMultiplier = 1): number {
  if (biz.managers_hired === 0) return 0

  const def = BUSINESS_MAP_WORKER[biz.business_id as BusinessId]
  if (!def) return 0

  const upgrades: string[] = JSON.parse(biz.upgrades_purchased || '[]')
  let autoMult = 1

  for (const upgradeId of upgrades) {
    const upgrade = def.upgrades.find((u: { id: string }) => u.id === upgradeId)
    if (upgrade?.autoMultiplier) autoMult *= upgrade.autoMultiplier
  }

  // Sum manager income from all hired slots
  let totalManagerRate = 0
  for (const manager of def.managers) {
    totalManagerRate += manager.incomePerSecond
  }
  // managers_hired is the total count, each manager has a tier
  const managersToUse = Math.min(biz.managers_hired, def.managers.length)
  let rateFromManagers = 0
  for (let i = 0; i < managersToUse; i++) {
    rateFromManagers += def.managers[i].incomePerSecond
  }

  return rateFromManagers * biz.level * autoMult * eventMultiplier
}

/**
 * Calculate offline earnings for all businesses since lastSeen timestamp.
 * Only businesses with managers hired earn offline income.
 * Maximum 8 hours of offline accumulation.
 */
export function calcOfflineEarnings(
  businesses: BusinessRow[],
  lastSeen: number,
): OfflineEarnings {
  const now = Date.now()
  const elapsed = (now - lastSeen) / 1000 // seconds
  const effectiveTime = Math.min(elapsed, MAX_OFFLINE_SECONDS)

  const breakdown: { businessId: BusinessId; amount: number }[] = []
  let totalEarnings = 0

  for (const biz of businesses) {
    if (biz.managers_hired === 0) continue
    const autoIncome = calcAutoIncome(biz)
    const earned = autoIncome * effectiveTime

    if (earned > 0) {
      breakdown.push({ businessId: biz.business_id as BusinessId, amount: earned })
      totalEarnings += earned
    }
  }

  return { elapsed: effectiveTime, earnings: totalEarnings, breakdown }
}

/**
 * Calculate luxury income bonus multiplier from owned items.
 */
export function calcLuxuryBonus(ownedItemIds: string[]): number {
  let bonus = 0
  for (const id of ownedItemIds) {
    const item = LUXURY_MAP_WORKER[id]
    if (item) bonus += item.incomeBonus
  }
  return bonus / 100 // Convert % to multiplier addend (e.g. 10% = 0.1)
}

/**
 * XP needed to reach the next level (mirrors frontend formula).
 */
export function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

/**
 * Investment price simulation: seeded random walk based on timestamp.
 * Deterministic for a given minute, so all clients see same prices.
 */
export function simulateAssetPrice(
  basePrice: number,
  volatility: number,
  seed: number,
): number {
  // Simple seeded pseudo-random: sin-based hash
  const x = Math.sin(seed * 9301 + 49297) * 233280
  const random = x - Math.floor(x) // 0–1
  const change = (random - 0.5) * 2 * volatility // ±volatility
  return Math.max(basePrice * 0.1, basePrice * (1 + change))
}

/**
 * XP formula: amount of XP earned per tap for a given level.
 */
export function xpPerTap(level: number): number {
  return Math.floor(1 + level * 0.1)
}

/**
 * Net worth calculation from player balance + investments + luxury.
 */
export function calcNetWorth(
  balance: number,
  investmentValue: number,
  luxuryPrestige: number,
): number {
  return balance + investmentValue + luxuryPrestige * 1000
}
