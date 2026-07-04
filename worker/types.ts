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
  player_id: string
  business_id: string
  level: number
  tap_income: number
  auto_income: number
  tap_count: number
  upgrades_purchased: string // JSON array
  managers_hired: number
  last_collected: number | null
  total_earned: number
}

export interface PlayerRow {
  id: string
  username: string | null
  first_name: string
  net_worth: number
  level: number
  xp: number
  last_seen: number
  created_at: number
}

export interface InvestmentRow {
  player_id: string
  asset_id: string
  amount: number
  purchase_price: number
  purchased_at: number
}

export interface LuxuryRow {
  player_id: string
  item_id: string
  purchased_at: number
}

export interface QuestProgressRow {
  player_id: string
  quest_date: string
  quest_id: string
  progress: number
  completed: number
  claimed: number
}

export interface MarketEventRow {
  id: string
  event_type: string
  business_id: string | null
  multiplier: number
  started_at: number
  ends_at: number
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
