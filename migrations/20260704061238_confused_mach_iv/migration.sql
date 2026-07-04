CREATE TABLE `asset_prices` (
	`asset_id` text PRIMARY KEY,
	`price` real NOT NULL,
	`change_24h` real DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`player_id` text NOT NULL,
	`business_id` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`tap_income` real DEFAULT 1 NOT NULL,
	`auto_income` real DEFAULT 0 NOT NULL,
	`tap_count` integer DEFAULT 0 NOT NULL,
	`upgrades_purchased` text DEFAULT '[]' NOT NULL,
	`managers_hired` integer DEFAULT 0 NOT NULL,
	`last_collected` integer,
	`total_earned` real DEFAULT 0 NOT NULL,
	CONSTRAINT `businesses_pk` PRIMARY KEY(`player_id`, `business_id`)
);
--> statement-breakpoint
CREATE TABLE `investments` (
	`player_id` text NOT NULL,
	`asset_id` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`purchase_price` real NOT NULL,
	`purchased_at` integer NOT NULL,
	CONSTRAINT `investments_pk` PRIMARY KEY(`player_id`, `asset_id`)
);
--> statement-breakpoint
CREATE TABLE `luxury_items` (
	`player_id` text NOT NULL,
	`item_id` text NOT NULL,
	`purchased_at` integer NOT NULL,
	CONSTRAINT `luxury_items_pk` PRIMARY KEY(`player_id`, `item_id`)
);
--> statement-breakpoint
CREATE TABLE `market_events` (
	`id` text PRIMARY KEY,
	`event_type` text NOT NULL,
	`business_id` text,
	`multiplier` real NOT NULL,
	`started_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`emoji` text NOT NULL,
	`effect` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY,
	`username` text,
	`first_name` text NOT NULL,
	`net_worth` real DEFAULT 0 NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`xp` real DEFAULT 0 NOT NULL,
	`last_seen` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quest_progress` (
	`player_id` text NOT NULL,
	`quest_date` text NOT NULL,
	`quest_id` text NOT NULL,
	`progress` real DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`claimed` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `quest_progress_pk` PRIMARY KEY(`player_id`, `quest_date`, `quest_id`)
);
