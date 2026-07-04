import type { ActiveEvent, BusinessId } from '../types'
import { getDb } from '../db'
import { marketEvents } from '../db/schema'
import { gt } from 'drizzle-orm'


// Market event definitions for the worker
export const MARKET_EVENTS_WORKER_DATA = [
  { type: 'economic_boom', title: 'Economic Boom!', description: 'The economy is booming! All businesses earn 3× income.', emoji: '💰', effect: 'boost_all', businessId: null, multiplier: 3, durationMinutes: 5 },
  { type: 'market_surge', title: 'Market Surge!', description: 'Logistics is surging with 5× income!', emoji: '📈', effect: 'boost_one', businessId: 'logistics', multiplier: 5, durationMinutes: 3 },
  { type: 'fuel_shortage', title: 'Fuel Shortage!', description: 'Rising fuel costs slash Logistics income by 50%.', emoji: '⛽', effect: 'reduce_one', businessId: 'logistics', multiplier: 0.5, durationMinutes: 10 },
  { type: 'storm_warning', title: 'Storm Warning!', description: 'Severe weather grounds all flights. Airport income down 75%.', emoji: '🌩️', effect: 'reduce_one', businessId: 'airport', multiplier: 0.25, durationMinutes: 8 },
  { type: 'grand_opening', title: 'Grand Opening!', description: 'Your store just went viral! 10× income for a limited time.', emoji: '🎉', effect: 'boost_one', businessId: 'store', multiplier: 10, durationMinutes: 2 },
  { type: 'road_works', title: 'Road Works!', description: 'City road works disrupt taxi routes. 30% income reduction.', emoji: '🚧', effect: 'reduce_one', businessId: 'taxi', multiplier: 0.7, durationMinutes: 15 },
  { type: 'construction_boom', title: 'Construction Boom!', description: 'New infrastructure projects everywhere. 4× construction income!', emoji: '🏗️', effect: 'boost_one', businessId: 'construction', multiplier: 4, durationMinutes: 6 },
  { type: 'equipment_failure', title: 'Equipment Failure!', description: 'Critical machinery breakdown. Factory income paused temporarily.', emoji: '💥', effect: 'reduce_one', businessId: 'factory', multiplier: 0, durationMinutes: 3 },
]

/**
 * Generate a random market event and insert it into D1.
 */
export async function generateAndStoreEvent(db: D1Database): Promise<void> {
  const drizzleDb = getDb(db)
  const now = Date.now()

  // Pick a random event
  const eventDef = MARKET_EVENTS_WORKER_DATA[Math.floor(Math.random() * MARKET_EVENTS_WORKER_DATA.length)]
  const endsAt = now + eventDef.durationMinutes * 60 * 1000
  const id = `evt_${now}_${Math.random().toString(36).slice(2, 8)}`

  await drizzleDb.insert(marketEvents).values({
    id,
    eventType: eventDef.type,
    businessId: eventDef.businessId,
    multiplier: eventDef.multiplier,
    startedAt: now,
    endsAt,
    title: eventDef.title,
    description: eventDef.description,
    emoji: eventDef.emoji,
    effect: eventDef.effect,
  })

  // Clean up expired events (older than 24h)
  const cutoff = now - 24 * 60 * 60 * 1000
  await drizzleDb.delete(marketEvents).where(gt(marketEvents.endsAt, cutoff))
}

/**
 * Get all currently active market events.
 */
export async function getActiveEvents(db: D1Database): Promise<ActiveEvent[]> {
  const drizzleDb = getDb(db)
  const now = Date.now()

  const rows = await drizzleDb
    .select()
    .from(marketEvents)
    .where(gt(marketEvents.endsAt, now))
    .all()

  return rows.map((row: any) => ({
    id: row.id,
    type: row.eventType,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    effect: row.effect as ActiveEvent['effect'],
    businessId: row.businessId as BusinessId | undefined,
    multiplier: row.multiplier,
    startedAt: row.startedAt,
    endsAt: row.endsAt,
  }))
}

/**
 * Calculate the effective income multiplier for a specific business
 * given a list of active events.
 */
export function getEventMultiplier(activeEvents: ActiveEvent[], businessId: BusinessId): number {
  let multiplier = 1

  for (const event of activeEvents) {
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
