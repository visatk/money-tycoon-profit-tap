// Worker-side game constants (no React imports)
// Mirrored from src/lib/gameConstants.ts for the backend

import type { BusinessId } from '../types'

export const MAX_OFFLINE_SECONDS = 8 * 3600
export const LEADERBOARD_TTL_SECONDS = 300
export const MAX_TAPS_PER_SECOND = 20

interface WorkerBusinessDef {
  id: BusinessId
  name: string
  emoji: string
  baseIncomePerTap: number
  baseAutoPerManager: number
  upgrades: { id: string; tapMultiplier?: number; autoMultiplier?: number; cost: number }[]
  managers: { id: string; costPerHire: number; incomePerSecond: number }[]
}

interface WorkerLuxuryDef {
  id: string
  incomeBonus: number
  prestigeScore: number
}

const BUSINESSES_WORKER: WorkerBusinessDef[] = [
  {
    id: 'store', name: 'Your Own Store', emoji: '🏪',
    baseIncomePerTap: 1, baseAutoPerManager: 0.5,
    upgrades: [
      { id: 'product_variety', tapMultiplier: 1.5, cost: 100 },
      { id: 'loyalty_cards', tapMultiplier: 2.0, cost: 500 },
      { id: 'self_checkout', autoMultiplier: 2.0, cost: 2000 },
      { id: 'brand_advertising', tapMultiplier: 3.0, cost: 10000 },
      { id: 'premium_brand', tapMultiplier: 4.0, autoMultiplier: 4.0, cost: 100000 },
    ],
    managers: [
      { id: 'cashier', costPerHire: 50, incomePerSecond: 1 },
      { id: 'shift_manager', costPerHire: 500, incomePerSecond: 8 },
      { id: 'district_manager', costPerHire: 5000, incomePerSecond: 50 },
    ],
  },
  {
    id: 'taxi', name: 'Taxi Service', emoji: '🚕',
    baseIncomePerTap: 5, baseAutoPerManager: 2,
    upgrades: [
      { id: 'gps_system', tapMultiplier: 1.5, cost: 500 },
      { id: 'luxury_fleet', tapMultiplier: 2.0, cost: 2500 },
      { id: 'driver_training', autoMultiplier: 2.0, cost: 10000 },
      { id: 'surge_pricing', tapMultiplier: 3.0, cost: 50000 },
      { id: 'autonomous_vehicles', autoMultiplier: 5.0, cost: 500000 },
    ],
    managers: [
      { id: 'driver', costPerHire: 250, incomePerSecond: 4 },
      { id: 'fleet_manager', costPerHire: 2500, incomePerSecond: 30 },
      { id: 'dispatch_ai', costPerHire: 25000, incomePerSecond: 200 },
    ],
  },
  {
    id: 'logistics', name: 'Logistics & Delivery', emoji: '📦',
    baseIncomePerTap: 20, baseAutoPerManager: 8,
    upgrades: [
      { id: 'cargo_capacity', tapMultiplier: 1.5, cost: 2000 },
      { id: 'express_lanes', tapMultiplier: 2.0, cost: 10000 },
      { id: 'hub_warehouse', autoMultiplier: 2.5, cost: 40000 },
      { id: 'drone_delivery', tapMultiplier: 4.0, cost: 200000 },
      { id: 'global_network', tapMultiplier: 6.0, autoMultiplier: 6.0, cost: 2000000 },
    ],
    managers: [
      { id: 'courier', costPerHire: 1000, incomePerSecond: 16 },
      { id: 'logistics_manager', costPerHire: 10000, incomePerSecond: 120 },
      { id: 'supply_chain_ai', costPerHire: 100000, incomePerSecond: 800 },
    ],
  },
  {
    id: 'construction', name: 'Construction Company', emoji: '🏗️',
    baseIncomePerTap: 100, baseAutoPerManager: 40,
    upgrades: [
      { id: 'safety_equipment', tapMultiplier: 1.5, cost: 10000 },
      { id: 'modern_machinery', tapMultiplier: 2.5, cost: 50000 },
      { id: 'permit_expediting', autoMultiplier: 2.0, cost: 200000 },
      { id: 'skyscraper_tech', tapMultiplier: 4.0, cost: 1000000 },
      { id: 'smart_construction', tapMultiplier: 6.0, autoMultiplier: 6.0, cost: 10000000 },
    ],
    managers: [
      { id: 'foreman', costPerHire: 5000, incomePerSecond: 80 },
      { id: 'project_manager', costPerHire: 50000, incomePerSecond: 600 },
      { id: 'ceo', costPerHire: 500000, incomePerSecond: 4000 },
    ],
  },
  {
    id: 'airport', name: 'International Airport', emoji: '✈️',
    baseIncomePerTap: 500, baseAutoPerManager: 200,
    upgrades: [
      { id: 'terminal_expansion', tapMultiplier: 1.5, cost: 50000 },
      { id: 'new_routes', tapMultiplier: 2.5, cost: 250000 },
      { id: 'vip_lounge', autoMultiplier: 3.0, cost: 1000000 },
      { id: 'duty_free_shops', tapMultiplier: 4.0, cost: 5000000 },
      { id: 'hub_airport', tapMultiplier: 7.0, autoMultiplier: 7.0, cost: 50000000 },
    ],
    managers: [
      { id: 'ground_crew', costPerHire: 25000, incomePerSecond: 400 },
      { id: 'air_traffic_controller', costPerHire: 250000, incomePerSecond: 3000 },
      { id: 'airport_ceo', costPerHire: 2500000, incomePerSecond: 20000 },
    ],
  },
  {
    id: 'factory', name: 'Industrial Factory', emoji: '🏭',
    baseIncomePerTap: 2500, baseAutoPerManager: 1000,
    upgrades: [
      { id: 'assembly_line', tapMultiplier: 1.5, cost: 250000 },
      { id: 'quality_control', tapMultiplier: 2.5, cost: 1250000 },
      { id: 'resource_recycling', autoMultiplier: 3.0, cost: 5000000 },
      { id: 'robot_assembly', tapMultiplier: 5.0, cost: 25000000 },
      { id: 'megafactory', tapMultiplier: 8.0, autoMultiplier: 8.0, cost: 250000000 },
    ],
    managers: [
      { id: 'technician', costPerHire: 125000, incomePerSecond: 2000 },
      { id: 'plant_manager', costPerHire: 1250000, incomePerSecond: 15000 },
      { id: 'automation_ai', costPerHire: 12500000, incomePerSecond: 100000 },
    ],
  },
]

export const BUSINESS_MAP_WORKER: Record<string, WorkerBusinessDef> = Object.fromEntries(
  BUSINESSES_WORKER.map((b) => [b.id, b]),
)

const LUXURY_WORKER: WorkerLuxuryDef[] = [
  { id: 'sports_car', incomeBonus: 2, prestigeScore: 10 },
  { id: 'luxury_sedan', incomeBonus: 4, prestigeScore: 25 },
  { id: 'supercar', incomeBonus: 8, prestigeScore: 60 },
  { id: 'hypercar', incomeBonus: 15, prestigeScore: 150 },
  { id: 'track_weapon', incomeBonus: 25, prestigeScore: 400 },
  { id: 'mythical_racer', incomeBonus: 50, prestigeScore: 1000 },
  { id: 'future_concept', incomeBonus: 100, prestigeScore: 3000 },
  { id: 'ultimate_legend', incomeBonus: 200, prestigeScore: 10000 },
  { id: 'private_jet', incomeBonus: 5, prestigeScore: 200 },
  { id: 'executive_jet', incomeBonus: 10, prestigeScore: 600 },
  { id: 'super_jet', incomeBonus: 20, prestigeScore: 2000 },
  { id: 'mega_jet', incomeBonus: 50, prestigeScore: 8000 },
  { id: 'luxury_yacht', incomeBonus: 5, prestigeScore: 350 },
  { id: 'mega_yacht', incomeBonus: 15, prestigeScore: 1500 },
  { id: 'giga_yacht', incomeBonus: 40, prestigeScore: 9000 },
  { id: 'modern_print', incomeBonus: 1, prestigeScore: 15 },
  { id: 'impressionist', incomeBonus: 2, prestigeScore: 40 },
  { id: 'pop_art_icon', incomeBonus: 3, prestigeScore: 100 },
  { id: 'classic_master', incomeBonus: 5, prestigeScore: 250 },
  { id: 'digital_nft', incomeBonus: 10, prestigeScore: 700 },
  { id: 'abstract_genius', incomeBonus: 15, prestigeScore: 1500 },
  { id: 'sculpture_marvel', incomeBonus: 25, prestigeScore: 5000 },
  { id: 'priceless_relic', incomeBonus: 50, prestigeScore: 15000 },
  { id: 'masterpiece', incomeBonus: 100, prestigeScore: 50000 },
]

export const LUXURY_MAP_WORKER: Record<string, WorkerLuxuryDef> = Object.fromEntries(
  LUXURY_WORKER.map((l) => [l.id, l]),
)

export const LUXURY_PRICES: Record<string, number> = {
  sports_car: 50_000, luxury_sedan: 200_000, supercar: 1_000_000,
  hypercar: 5_000_000, track_weapon: 25_000_000, mythical_racer: 100_000_000,
  future_concept: 500_000_000, ultimate_legend: 2_000_000_000,
  private_jet: 10_000_000, executive_jet: 50_000_000, super_jet: 200_000_000, mega_jet: 1_000_000_000,
  luxury_yacht: 20_000_000, mega_yacht: 100_000_000, giga_yacht: 1_000_000_000,
  modern_print: 500_000, impressionist: 2_000_000, pop_art_icon: 5_000_000,
  classic_master: 10_000_000, digital_nft: 50_000_000, abstract_genius: 100_000_000,
  sculpture_marvel: 500_000_000, priceless_relic: 2_000_000_000, masterpiece: 10_000_000_000,
}

export const INVESTMENT_VOLATILITY: Record<string, { basePrice: number; volatility: number }> = {
  tech_stock: { basePrice: 100, volatility: 0.05 },
  real_estate: { basePrice: 1000, volatility: 0.02 },
  crypto: { basePrice: 50, volatility: 0.15 },
  bonds: { basePrice: 500, volatility: 0.005 },
  commodities: { basePrice: 200, volatility: 0.03 },
}

export const QUEST_TARGETS: Record<string, number> = {
  tap_500: 500, tap_1000: 1000, tap_5000: 5000,
  earn_store_1m: 1_000_000, earn_taxi_5m: 5_000_000, earn_logistics_10m: 10_000_000,
  earn_construction_50m: 50_000_000, earn_airport_100m: 100_000_000, earn_factory_500m: 500_000_000,
  buy_3_upgrades: 3, buy_5_upgrades: 5,
  hire_2_managers: 2, hire_5_managers: 5,
  make_investment: 1, complete_minigame: 1,
}

export const QUEST_REWARDS: Record<string, { type: string; amount: number }> = {
  tap_500: { type: 'cash', amount: 50_000 },
  tap_1000: { type: 'cash', amount: 150_000 },
  tap_5000: { type: 'cash', amount: 1_000_000 },
  earn_store_1m: { type: 'cash', amount: 500_000 },
  earn_taxi_5m: { type: 'cash', amount: 2_500_000 },
  earn_logistics_10m: { type: 'cash', amount: 5_000_000 },
  earn_construction_50m: { type: 'cash', amount: 25_000_000 },
  earn_airport_100m: { type: 'cash', amount: 50_000_000 },
  earn_factory_500m: { type: 'cash', amount: 250_000_000 },
  buy_3_upgrades: { type: 'cash', amount: 250_000 },
  buy_5_upgrades: { type: 'cash', amount: 1_000_000 },
  hire_2_managers: { type: 'cash', amount: 500_000 },
  hire_5_managers: { type: 'cash', amount: 2_000_000 },
  make_investment: { type: 'cash', amount: 100_000 },
  complete_minigame: { type: 'cash', amount: 250_000 },
}

// Daily quest IDs (pick 5 per day, seeded by date)
export const ALL_QUEST_IDS = Object.keys(QUEST_TARGETS)

export function getDailyQuestIds(dateStr: string): string[] {
  // Seed based on date string for deterministic daily selection
  let seed = 0
  for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i)

  const shuffled = [...ALL_QUEST_IDS]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff
  }
  return shuffled.slice(0, 5)
}
