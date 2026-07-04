// ─── Business Types ──────────────────────────────────────────────────────────

export type BusinessId =
  | 'store'
  | 'taxi'
  | 'logistics'
  | 'construction'
  | 'airport'
  | 'factory'

export interface Upgrade {
  id: string
  name: string
  description: string
  cost: number
  tapMultiplier?: number
  autoMultiplier?: number
  icon: string
}

export interface Manager {
  id: string
  name: string
  description: string
  costPerHire: number
  incomePerSecond: number
}

export interface BusinessDef {
  id: BusinessId
  name: string
  emoji: string
  color: string
  glowColor: string
  description: string
  baseIncomePerTap: number
  baseAutoPerManager: number
  upgrades: Upgrade[]
  managers: Manager[]
}

export interface BusinessState {
  businessId: BusinessId
  level: number
  tapIncome: number
  autoIncome: number
  tapCount: number
  upgradesPurchased: string[]
  managersHired: number
  lastCollected: number
  totalEarned: number
}

// ─── Investment Types ─────────────────────────────────────────────────────────

export type AssetId = 'tech_stock' | 'real_estate' | 'crypto' | 'bonds' | 'commodities'

export interface InvestmentAsset {
  id: AssetId
  name: string
  emoji: string
  description: string
  basePrice: number
  volatility: number // daily % change
  color: string
}

export interface InvestmentPosition {
  assetId: AssetId
  amount: number
  purchasePrice: number
  purchasedAt: number
}

export interface AssetPrice {
  assetId: AssetId
  price: number
  change24h: number
  updatedAt: number
}

// ─── Luxury Types ─────────────────────────────────────────────────────────────

export type LuxuryCategory = 'cars' | 'jets' | 'yachts' | 'art'

export interface LuxuryItem {
  id: string
  category: LuxuryCategory
  name: string
  emoji: string
  description: string
  price: number
  incomeBonus: number // % income boost
  prestigeScore: number
  gradient: string
}

// ─── Market Event Types ───────────────────────────────────────────────────────

export type EventEffect = 'boost_all' | 'boost_one' | 'reduce_one'

export interface MarketEventDef {
  type: string
  title: string
  description: string
  emoji: string
  effect: EventEffect
  businessId?: BusinessId
  multiplier: number
  durationMinutes: number
}

export interface ActiveMarketEvent {
  id: string
  type: string
  title: string
  description: string
  emoji: string
  effect: EventEffect
  businessId?: BusinessId
  multiplier: number
  startedAt: number
  endsAt: number
}

// ─── Mini-Game Types ──────────────────────────────────────────────────────────

export type MiniGameId = 'tap_frenzy' | 'memory_match' | 'fortune_wheel'

export interface MiniGameDef {
  id: MiniGameId
  name: string
  emoji: string
  description: string
  maxReward: number
  cooldownMinutes: number
}

// ─── Quest Types ──────────────────────────────────────────────────────────────

export type QuestRewardType = 'cash' | 'boost' | 'random'

export interface QuestDef {
  id: string
  title: string
  description: string
  emoji: string
  target: number
  rewardType: QuestRewardType
  rewardAmount: number
  rewardLabel: string
}

export interface QuestProgress {
  questId: string
  progress: number
  completed: boolean
  claimed: boolean
}

// ─── Player Types ─────────────────────────────────────────────────────────────

export interface Player {
  id: string
  username?: string
  firstName: string
  netWorth: number
  level: number
  xp: number
  lastSeen: number
  createdAt: number
}

export interface LeaderboardEntry {
  rank: number
  playerId: string
  username?: string
  firstName: string
  netWorth: number
  level: number
}

// ─── Game State Types ─────────────────────────────────────────────────────────

export interface GameState {
  player: Player
  businesses: BusinessState[]
  balance: number
  investments: InvestmentPosition[]
  luxuryOwned: string[]
  questProgress: QuestProgress[]
  activeEvents: ActiveMarketEvent[]
  lastSync: number
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  ok: boolean
  data?: T
  error?: string
}

export interface TapResult {
  income: number
  newBalance: number
  newTapCount: number
  multiplier: number
}

export interface OfflineEarnings {
  elapsed: number
  earnings: number
  breakdown: { businessId: BusinessId; amount: number }[]
}

// ─── Screen Types ─────────────────────────────────────────────────────────────

export type Screen =
  | { id: 'splash' }
  | { id: 'hub' }
  | { id: 'business'; businessId: BusinessId }
  | { id: 'investments' }
  | { id: 'luxury' }
  | { id: 'minigames' }
  | { id: 'quests' }
  | { id: 'leaderboard' }
