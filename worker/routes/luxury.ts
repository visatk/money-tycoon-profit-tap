import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDb } from '../db'
import { luxuryItems, players } from '../db/schema'
import { extractUserId } from '../lib/auth'
import { LUXURY_MAP_WORKER, LUXURY_PRICES } from '../lib/gameConstants'
import { eq, and } from 'drizzle-orm'

const route = new Hono<{ Bindings: Env }>()

route.use('*', async (c, next) => {
  const userId = extractUserId(c.req.raw)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId' as never, userId)
  await next()
})

// ─── GET /api/luxury/owned ────────────────────────────────────────────────────
route.get('/owned', async (c) => {
  const userId = c.get('userId' as never) as string
  const db = getDb(c.env.DB)
  const rows = await db.select().from(luxuryItems).where(eq(luxuryItems.playerId, userId)).all()
  return c.json({ ok: true, data: rows.map((r) => r.itemId) })
})

// ─── POST /api/luxury/buy ─────────────────────────────────────────────────────
const buySchema = z.object({ itemId: z.string().min(1) })

route.post('/buy', zValidator('json', buySchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { itemId } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const price = LUXURY_PRICES[itemId]
  if (!price) return c.json({ error: 'Invalid item' }, 400)

  const [player, existing] = await Promise.all([
    db.select().from(players).where(eq(players.id, userId)).get(),
    db.select().from(luxuryItems)
      .where(and(eq(luxuryItems.playerId, userId), eq(luxuryItems.itemId, itemId)))
      .get(),
  ])

  if (!player) return c.json({ error: 'Player not found' }, 404)
  if (existing) return c.json({ error: 'Already owned' }, 400)
  if (player.balance < price) return c.json({ error: 'Insufficient balance' }, 400)

  const now = Date.now()
  const newBalance = player.balance - price
  const luxuryDef = LUXURY_MAP_WORKER[itemId]
  const prestigeGain = luxuryDef?.prestigeScore ?? 0

  await db.batch([
    db.insert(luxuryItems).values({ playerId: userId, itemId, purchasedAt: now }),
    db.update(players).set({
      balance: newBalance,
      netWorth: newBalance + prestigeGain * 1000,
    }).where(eq(players.id, userId)),
  ])

  return c.json({
    ok: true,
    data: {
      itemId,
      newBalance,
      incomeBonus: luxuryDef?.incomeBonus ?? 0,
      prestigeScore: prestigeGain,
    },
  })
})

export default route
