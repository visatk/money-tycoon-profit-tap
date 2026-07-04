import { sqliteTable, text, real, integer, primaryKey } from 'drizzle-orm/sqlite-core'

// ─── Players ──────────────────────────────────────────────────────────────────
export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  username: text('username'),
  firstName: text('first_name').notNull(),
  netWorth: real('net_worth').default(0).notNull(),
  balance: real('balance').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  xp: real('xp').default(0).notNull(),
  lastSeen: integer('last_seen').notNull(),
  createdAt: integer('created_at').notNull(),
})

// ─── Businesses ───────────────────────────────────────────────────────────────
export const businesses = sqliteTable(
  'businesses',
  {
    playerId: text('player_id').notNull(),
    businessId: text('business_id').notNull(),
    level: integer('level').default(1).notNull(),
    tapIncome: real('tap_income').default(1).notNull(),
    autoIncome: real('auto_income').default(0).notNull(),
    tapCount: integer('tap_count').default(0).notNull(),
    upgradesPurchased: text('upgrades_purchased').default('[]').notNull(),
    managersHired: integer('managers_hired').default(0).notNull(),
    lastCollected: integer('last_collected'),
    totalEarned: real('total_earned').default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.playerId, t.businessId] })],
)

// ─── Investments ──────────────────────────────────────────────────────────────
export const investments = sqliteTable(
  'investments',
  {
    playerId: text('player_id').notNull(),
    assetId: text('asset_id').notNull(),
    amount: real('amount').default(0).notNull(),
    purchasePrice: real('purchase_price').notNull(),
    purchasedAt: integer('purchased_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.playerId, t.assetId] })],
)

// ─── Luxury Items ─────────────────────────────────────────────────────────────
export const luxuryItems = sqliteTable(
  'luxury_items',
  {
    playerId: text('player_id').notNull(),
    itemId: text('item_id').notNull(),
    purchasedAt: integer('purchased_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.playerId, t.itemId] })],
)

// ─── Quest Progress ───────────────────────────────────────────────────────────
export const questProgress = sqliteTable(
  'quest_progress',
  {
    playerId: text('player_id').notNull(),
    questDate: text('quest_date').notNull(),
    questId: text('quest_id').notNull(),
    progress: real('progress').default(0).notNull(),
    completed: integer('completed').default(0).notNull(),
    claimed: integer('claimed').default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.playerId, t.questDate, t.questId] })],
)

// ─── Market Events ────────────────────────────────────────────────────────────
export const marketEvents = sqliteTable('market_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(),
  businessId: text('business_id'),
  multiplier: real('multiplier').notNull(),
  startedAt: integer('started_at').notNull(),
  endsAt: integer('ends_at').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  emoji: text('emoji').notNull(),
  effect: text('effect').notNull(),
})

// ─── Asset Prices (current price state) ──────────────────────────────────────
export const assetPrices = sqliteTable('asset_prices', {
  assetId: text('asset_id').primaryKey(),
  price: real('price').notNull(),
  change24h: real('change_24h').default(0).notNull(),
  updatedAt: integer('updated_at').notNull(),
})
