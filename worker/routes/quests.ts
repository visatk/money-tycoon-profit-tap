import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDb } from '../db'
import { questProgress, players } from '../db/schema'
import { extractUserId } from '../lib/auth'
import { getDailyQuestIds, QUEST_TARGETS, QUEST_REWARDS } from '../lib/gameConstants'
import { eq, and } from 'drizzle-orm'

const route = new Hono<{ Bindings: Env }>()

route.use('*', async (c, next) => {
  const userId = extractUserId(c.req.raw)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId' as never, userId)
  await next()
})

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}

// ─── GET /api/quests/today ────────────────────────────────────────────────────
route.get('/today', async (c) => {
  const userId = c.get('userId' as never) as string
  const db = getDb(c.env.DB)
  const today = getTodayDate()
  const questIds = getDailyQuestIds(today)

  // Ensure progress rows exist
  for (const questId of questIds) {
    const exists = await db.select().from(questProgress)
      .where(and(
        eq(questProgress.playerId, userId),
        eq(questProgress.questDate, today),
        eq(questProgress.questId, questId),
      ))
      .get()

    if (!exists) {
      await db.insert(questProgress).values({
        playerId: userId,
        questDate: today,
        questId,
        progress: 0,
        completed: 0,
        claimed: 0,
      })
    }
  }

  const rows = await db.select().from(questProgress)
    .where(and(eq(questProgress.playerId, userId), eq(questProgress.questDate, today)))
    .all()

  const result = questIds.map((questId: string) => {
    const row = rows.find((r: { questId: string }) => r.questId === questId)
    return {
      questId,
      target: QUEST_TARGETS[questId] ?? 1,
      progress: row?.progress ?? 0,
      completed: row ? row.completed === 1 : false,
      claimed: row ? row.claimed === 1 : false,
      reward: QUEST_REWARDS[questId] ?? { type: 'cash', amount: 0 },
    }
  })

  return c.json({ ok: true, data: result })
})

// ─── POST /api/quests/claim ───────────────────────────────────────────────────
const claimSchema = z.object({ questId: z.string().min(1) })

route.post('/claim', zValidator('json', claimSchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { questId } = c.req.valid('json')
  const db = getDb(c.env.DB)
  const today = getTodayDate()

  const [row, player] = await Promise.all([
    db.select().from(questProgress)
      .where(and(
        eq(questProgress.playerId, userId),
        eq(questProgress.questDate, today),
        eq(questProgress.questId, questId),
      ))
      .get(),
    db.select().from(players).where(eq(players.id, userId)).get(),
  ])

  if (!row) return c.json({ error: 'Quest not found' }, 404)
  if (!row.completed) return c.json({ error: 'Quest not completed' }, 400)
  if (row.claimed) return c.json({ error: 'Already claimed' }, 400)
  if (!player) return c.json({ error: 'Player not found' }, 404)

  const reward = QUEST_REWARDS[questId]
  if (!reward) return c.json({ error: 'Invalid quest' }, 400)

  const newBalance = player.balance + (reward.type === 'cash' ? reward.amount : 0)

  await db.batch([
    db.update(questProgress).set({ claimed: 1 })
      .where(and(
        eq(questProgress.playerId, userId),
        eq(questProgress.questDate, today),
        eq(questProgress.questId, questId),
      )),
    db.update(players).set({ balance: newBalance }).where(eq(players.id, userId)),
  ])

  return c.json({ ok: true, data: { reward, newBalance } })
})

// ─── POST /api/quests/progress ────────────────────────────────────────────────
const progressSchema = z.object({
  questId: z.string().min(1),
  amount: z.number().positive(),
})

route.post('/progress', zValidator('json', progressSchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { questId, amount } = c.req.valid('json')
  const db = getDb(c.env.DB)
  const today = getTodayDate()

  const target = QUEST_TARGETS[questId]
  if (!target) return c.json({ error: 'Invalid quest' }, 400)

  const row = await db.select().from(questProgress)
    .where(and(
      eq(questProgress.playerId, userId),
      eq(questProgress.questDate, today),
      eq(questProgress.questId, questId),
    ))
    .get()

  if (!row) return c.json({ error: 'Quest not initialized' }, 404)

  const newProgress = Math.min(row.progress + amount, target)
  const completed = newProgress >= target ? 1 : 0

  await db.update(questProgress).set({ progress: newProgress, completed })
    .where(and(
      eq(questProgress.playerId, userId),
      eq(questProgress.questDate, today),
      eq(questProgress.questId, questId),
    ))

  return c.json({ ok: true, data: { newProgress, target, completed: completed === 1 } })
})

export default route
