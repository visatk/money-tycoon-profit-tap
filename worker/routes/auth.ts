import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDb } from '../db'
import { players, businesses } from '../db/schema'
import { validateTelegramInitData, parseTelegramUser } from '../lib/auth'
import { BUSINESS_MAP_WORKER } from '../lib/gameConstants'
import { eq } from 'drizzle-orm'

const BUSINESS_IDS = ['store', 'taxi', 'logistics', 'construction', 'airport', 'factory'] as const

const authSchema = z.object({ initData: z.string().min(1) })

const route = new Hono<{ Bindings: Env }>()

route.post('/validate', zValidator('json', authSchema), async (c) => {
  const { initData } = c.req.valid('json')
  const botToken = (c.env as any).BOT_TOKEN ?? ''

  const isValid = validateTelegramInitData(initData, botToken)
  if (!isValid && botToken !== '') {
    return c.json({ error: 'Invalid initData signature' }, 401)
  }

  const telegramUser = parseTelegramUser(initData)
  if (!telegramUser) {
    return c.json({ error: 'Could not parse user from initData' }, 400)
  }

  const db = getDb(c.env.DB)
  const userId = String(telegramUser.id)
  const now = Date.now()

  // Upsert player
  const existing = await db.select().from(players).where(eq(players.id, userId)).get()

  if (!existing) {
    await db.insert(players).values({
      id: userId,
      username: telegramUser.username ?? null,
      firstName: telegramUser.first_name,
      netWorth: 0,
      balance: 1000, // Starting balance
      level: 1,
      xp: 0,
      lastSeen: now,
      createdAt: now,
    })

    // Initialize all 6 businesses
    for (const bizId of BUSINESS_IDS) {
      const def = BUSINESS_MAP_WORKER[bizId]
      await db.insert(businesses).values({
        playerId: userId,
        businessId: bizId,
        level: 1,
        tapIncome: def.baseIncomePerTap,
        autoIncome: 0,
        tapCount: 0,
        upgradesPurchased: '[]',
        managersHired: 0,
        lastCollected: now,
        totalEarned: 0,
      })
    }
  } else {
    // Update last seen
    await db.update(players)
      .set({ lastSeen: now, username: telegramUser.username ?? existing.username })
      .where(eq(players.id, userId))
  }

  return c.json({
    ok: true,
    data: {
      userId,
      firstName: telegramUser.first_name,
      username: telegramUser.username,
    },
  })
})

export default route
