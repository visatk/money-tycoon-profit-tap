-- Money Tycoon Profit Tap — D1 Database Schema
-- Run: wrangler d1 migrations apply moneytycoon --local
-- Then: wrangler d1 migrations apply moneytycoon --remote

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT NOT NULL,
  net_worth REAL NOT NULL DEFAULT 0,
  balance REAL NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  xp REAL NOT NULL DEFAULT 0,
  last_seen INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  player_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  tap_income REAL NOT NULL DEFAULT 1,
  auto_income REAL NOT NULL DEFAULT 0,
  tap_count INTEGER NOT NULL DEFAULT 0,
  upgrades_purchased TEXT NOT NULL DEFAULT '[]',
  managers_hired INTEGER NOT NULL DEFAULT 0,
  last_collected INTEGER,
  total_earned REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, business_id)
);

CREATE TABLE IF NOT EXISTS investments (
  player_id TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  purchase_price REAL NOT NULL,
  purchased_at INTEGER NOT NULL,
  PRIMARY KEY (player_id, asset_id)
);

CREATE TABLE IF NOT EXISTS luxury_items (
  player_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  purchased_at INTEGER NOT NULL,
  PRIMARY KEY (player_id, item_id)
);

CREATE TABLE IF NOT EXISTS quest_progress (
  player_id TEXT NOT NULL,
  quest_date TEXT NOT NULL,
  quest_id TEXT NOT NULL,
  progress REAL NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  claimed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, quest_date, quest_id)
);

CREATE TABLE IF NOT EXISTS market_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  business_id TEXT,
  multiplier REAL NOT NULL,
  started_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  effect TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS asset_prices (
  asset_id TEXT PRIMARY KEY,
  price REAL NOT NULL,
  change_24h REAL NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_player ON businesses(player_id);
CREATE INDEX IF NOT EXISTS idx_investments_player ON investments(player_id);
CREATE INDEX IF NOT EXISTS idx_luxury_player ON luxury_items(player_id);
CREATE INDEX IF NOT EXISTS idx_quest_player_date ON quest_progress(player_id, quest_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON market_events(ends_at);
CREATE INDEX IF NOT EXISTS idx_players_networth ON players(net_worth DESC);
