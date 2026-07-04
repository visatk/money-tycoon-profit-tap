// Worker-side types (subset of frontend types, no React dependencies)

export type BusinessId =
  | 'store'
  | 'taxi'
  | 'logistics'
  | 'construction'
  | 'airport'
  | 'factory'

export type AssetId = 'tech_stock' | 'real_estate' | 'crypto' | 'bonds' | 'commodities'
export type LuxuryCategory = 'cars' | 'jets' | 'yachts' | 'art'
export type MiniGameId = 'tap_frenzy' | 'memory_match' | 'fortune_wheel'
export type EventEffect = 'boost_all' | 'boost_one' | 'reduce_one'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface BusinessRow {
  playerId: string
  businessId: string
  level: number
  tapIncome: number
  autoIncome: number
  tapCount: number
  upgradesPurchased: string // JSON array
  managersHired: number
  lastCollected: number | null
  totalEarned: number
}

export interface PlayerRow {
  id: string
  username: string | null
  firstName: string
  netWorth: number
  level: number
  xp: number
  lastSeen: number
  createdAt: number
}

export interface InvestmentRow {
  playerId: string
  assetId: string
  amount: number
  purchasePrice: number
  purchasedAt: number
}

export interface LuxuryRow {
  playerId: string
  itemId: string
  purchasedAt: number
}

export interface QuestProgressRow {
  playerId: string
  questDate: string
  questId: string
  progress: number
  completed: number
  claimed: number
}

export interface MarketEventRow {
  id: string
  eventType: string
  businessId: string | null
  multiplier: number
  startedAt: number
  endsAt: number
  description: string
  title: string
  emoji: string
  effect: string
}

export interface ActiveEvent {
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

export interface OfflineEarnings {
  elapsed: number
  earnings: number
  breakdown: { businessId: BusinessId; amount: number }[]
}

export interface TapResult {
  income: number
  newBalance: number
  newTapCount: number
  multiplier: number
}

export interface ApiError {
  error: string
  code?: number
}
