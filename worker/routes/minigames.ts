import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDb } from '../db'
import { players } from '../db/schema'
import { extractUserId } from '../lib/auth'
import { eq } from 'drizzle-orm'
import type { MiniGameId } from '../types'

const WHEEL_REWARDS = [
  { label: '$10K', amount: 10_000, weight: 30 },
  { label: '$50K', amount: 50_000, weight: 25 },
  { label: '$100K', amount: 100_000, weight: 20 },
  { label: '$500K', amount: 500_000, weight: 12 },
  { label: '$1M', amount: 1_000_000, weight: 7 },
  { label: '2× Boost', amount: 0, weight: 4 },
  { label: '$5M', amount: 5_000_000, weight: 1.5 },
  { label: '$10M JACKPOT!', amount: 10_000_000, weight: 0.5 },
]

function weightedRandom(rewards: typeof WHEEL_REWARDS): (typeof WHEEL_REWARDS)[0] {
  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0)
  let rand = Math.random() * totalWeight
  for (const reward of rewards) {
    rand -= reward.weight
    if (rand <= 0) return reward
  }
  return rewards[0]
}

const route = new Hono<{ Bindings: Env }>()

route.use('*', async (c, next) => {
  const userId = extractUserId(c.req.raw)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId' as never, userId)
  await next()
})

// ─── POST /api/minigame/tap_frenzy/submit ─────────────────────────────────────
const tapFrenzySchema = z.object({ taps: z.number().int().min(1).max(200) })

route.post('/tap_frenzy/submit', zValidator('json', tapFrenzySchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { taps } = c.req.valid('json')
  const db = getDb(c.env.DB)

  // Max 20 taps/s × 10s = 200 taps
  const reward = Math.floor((taps / 200) * 50_000)
  const player = await db.select().from(players).where(eq(players.id, userId)).get()
  if (!player) return c.json({ error: 'Not found' }, 404)

  const newBalance = player.balance + reward
  await db.update(players).set({ balance: newBalance }).where(eq(players.id, userId))

  return c.json({ ok: true, data: { taps, reward, newBalance } })
})

// ─── POST /api/minigame/memory_match/submit ───────────────────────────────────
const memorySchema = z.object({ solved: z.boolean(), timeMs: z.number().positive() })

route.post('/memory_match/submit', zValidator('json', memorySchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { solved, timeMs } = c.req.valid('json')
  const db = getDb(c.env.DB)

  if (!solved) return c.json({ ok: true, data: { reward: 0, message: 'Better luck next time!' } })

  // Faster solve = bigger reward (up to 100K)
  const speedBonus = Math.max(0, 1 - timeMs / 60_000)
  const reward = Math.floor(50_000 + speedBonus * 50_000)

  const player = await db.select().from(players).where(eq(players.id, userId)).get()
  if (!player) return c.json({ error: 'Not found' }, 404)

  const newBalance = player.balance + reward
  await db.update(players).set({ balance: newBalance }).where(eq(players.id, userId))

  return c.json({ ok: true, data: { reward, newBalance } })
})

// ─── POST /api/minigame/fortune_wheel/submit ──────────────────────────────────
route.post('/fortune_wheel/submit', async (c) => {
  const userId = c.get('userId' as never) as string
  const db = getDb(c.env.DB)

  const prize = weightedRandom(WHEEL_REWARDS)
  const player = await db.select().from(players).where(eq(players.id, userId)).get()
  if (!player) return c.json({ error: 'Not found' }, 404)

  const newBalance = player.balance + prize.amount
  if (prize.amount > 0) {
    await db.update(players).set({ balance: newBalance }).where(eq(players.id, userId))
  }

  return c.json({ ok: true, data: { prize: prize.label, reward: prize.amount, newBalance } })
})

// ─── GET /api/minigame/:id/config ─────────────────────────────────────────────
route.get('/:id/config', async (c) => {
  const gameId = c.req.param('id') as MiniGameId
  const configs: Record<string, object> = {
    tap_frenzy: { durationSeconds: 10, maxTaps: 200 },
    memory_match: { pairs: 6, flipTimeMs: 1000 },
    fortune_wheel: { segments: WHEEL_REWARDS.map((r) => r.label) },
  }
  const config = configs[gameId]
  if (!config) return c.json({ error: 'Invalid mini-game' }, 404)
  return c.json({ ok: true, data: config })
})

export default route
