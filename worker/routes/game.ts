import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDb } from '../db'
import { players, businesses, luxuryItems } from '../db/schema'
import { extractUserId } from '../lib/auth'
import { calcTapIncome, calcAutoIncome, calcOfflineEarnings, calcNetWorth, xpForNextLevel } from '../lib/gameEngine'
import { getActiveEvents, getEventMultiplier } from '../lib/marketEvents'
import { BUSINESS_MAP_WORKER, MAX_TAPS_PER_SECOND } from '../lib/gameConstants'
import type { BusinessId } from '../types'
import { eq, and } from 'drizzle-orm'


const BUSINESS_IDS: BusinessId[] = ['store', 'taxi', 'logistics', 'construction', 'airport', 'factory']

const route = new Hono<{ Bindings: Env }>()

// ─── Middleware: require auth ─────────────────────────────────────────────────
route.use('*', async (c, next) => {
  const userId = extractUserId(c.req.raw)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId' as never, userId)
  await next()
})

// ─── GET /api/game/state ─────────────────────────────────────────────────────
route.get('/state', async (c) => {
  const userId = c.get('userId' as never) as string
  const db = getDb(c.env.DB)

  const [player, bizRows, luxuryRows] = await Promise.all([
    db.select().from(players).where(eq(players.id, userId)).get(),
    db.select().from(businesses).where(eq(businesses.playerId, userId)).all(),
    db.select().from(luxuryItems).where(eq(luxuryItems.playerId, userId)).all(),
  ])

  if (!player) return c.json({ error: 'Player not found' }, 404)

  const activeEvents = await getActiveEvents(c.env.DB)
  const ownedLuxury = luxuryRows.map((l: { itemId: string }) => l.itemId)

  const bizStates = bizRows.map((biz) => ({
    businessId: biz.businessId,
    level: biz.level,
    tapIncome: calcTapIncome(biz, getEventMultiplier(activeEvents, biz.businessId as BusinessId)),
    autoIncome: calcAutoIncome(biz, getEventMultiplier(activeEvents, biz.businessId as BusinessId)),
    tapCount: biz.tapCount,
    upgradesPurchased: JSON.parse(biz.upgradesPurchased),
    managersHired: biz.managersHired,
    lastCollected: biz.lastCollected,
    totalEarned: biz.totalEarned,
  }))

  // Update last seen
  const now = Date.now()
  await db.update(players).set({ lastSeen: now }).where(eq(players.id, userId))

  return c.json({
    ok: true,
    data: {
      player: {
        id: player.id,
        username: player.username,
        firstName: player.firstName,
        netWorth: player.netWorth,
        balance: player.balance,
        level: player.level,
        xp: player.xp,
        lastSeen: player.lastSeen,
        createdAt: player.createdAt,
      },
      businesses: bizStates,
      luxuryOwned: ownedLuxury,
      activeEvents,
    },
  })
})

// ─── POST /api/game/tap ───────────────────────────────────────────────────────
const tapSchema = z.object({
  businessId: z.enum(['store', 'taxi', 'logistics', 'construction', 'airport', 'factory']),
  taps: z.number().int().min(1).max(MAX_TAPS_PER_SECOND),
})

route.post('/tap', zValidator('json', tapSchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { businessId, taps } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const [player, biz] = await Promise.all([
    db.select().from(players).where(eq(players.id, userId)).get(),
    db.select().from(businesses)
      .where(and(eq(businesses.playerId, userId), eq(businesses.businessId, businessId)))
      .get(),
  ])

  if (!player || !biz) return c.json({ error: 'Not found' }, 404)

  const activeEvents = await getActiveEvents(c.env.DB)
  const eventMult = getEventMultiplier(activeEvents, businessId)
  const tapIncomePerTap = calcTapIncome(biz, eventMult)
  const totalIncome = tapIncomePerTap * taps

  const now = Date.now()
  const newBalance = player.balance + totalIncome
  const newTapCount = biz.tapCount + taps
  const newTotalEarned = biz.totalEarned + totalIncome
  const newXp = player.xp + taps
  const xpNeeded = xpForNextLevel(player.level)
  const newLevel = newXp >= xpNeeded ? player.level + 1 : player.level
  const finalXp = newXp >= xpNeeded ? newXp - xpNeeded : newXp

  // Update in batch transaction
  await db.batch([
    db.update(players).set({
      balance: newBalance,
      netWorth: calcNetWorth(newBalance, 0, 0),
      xp: finalXp,
      level: newLevel,
      lastSeen: now,
    }).where(eq(players.id, userId)),
    db.update(businesses).set({
      tapCount: newTapCount,
      totalEarned: newTotalEarned,
    }).where(and(eq(businesses.playerId, userId), eq(businesses.businessId, businessId))),
  ])

  return c.json({
    ok: true,
    data: {
      income: totalIncome,
      newBalance,
      newTapCount,
      multiplier: eventMult,
    },
  })
})

// ─── POST /api/game/upgrade ───────────────────────────────────────────────────
const upgradeSchema = z.object({
  businessId: z.enum(['store', 'taxi', 'logistics', 'construction', 'airport', 'factory']),
  upgradeId: z.string().min(1),
})

route.post('/upgrade', zValidator('json', upgradeSchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { businessId, upgradeId } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const def = BUSINESS_MAP_WORKER[businessId]
  if (!def) return c.json({ error: 'Invalid business' }, 400)

  const [player, biz] = await Promise.all([
    db.select().from(players).where(eq(players.id, userId)).get(),
    db.select().from(businesses)
      .where(and(eq(businesses.playerId, userId), eq(businesses.businessId, businessId)))
      .get(),
  ])

  if (!player || !biz) return c.json({ error: 'Not found' }, 404)

  const owned: string[] = JSON.parse(biz.upgradesPurchased)
  const alreadyOwned = owned.find((u: string) => u === upgradeId)
  if (alreadyOwned) return c.json({ error: 'Already purchased' }, 400)

  const upgradeDef = def.upgrades.find((u) => u.id === upgradeId)
  if (!upgradeDef) return c.json({ error: 'Invalid upgrade' }, 400)

  // Scale cost by level
  const cost = upgradeDef.cost * Math.pow(1.1, biz.level - 1)
  if (player.balance < cost) return c.json({ error: 'Insufficient balance' }, 400)

  const newOwned = [...owned, upgradeId]
  const newBalance = player.balance - cost

  // Recalculate income
  const updatedBiz = { ...biz, upgradesPurchased: JSON.stringify(newOwned) }
  const newTapIncome = calcTapIncome(updatedBiz)
  const newAutoIncome = calcAutoIncome(updatedBiz)

  await db.batch([
    db.update(players).set({ balance: newBalance }).where(eq(players.id, userId)),
    db.update(businesses).set({
      upgradesPurchased: JSON.stringify(newOwned),
      tapIncome: newTapIncome,
      autoIncome: newAutoIncome,
    }).where(and(eq(businesses.playerId, userId), eq(businesses.businessId, businessId))),
  ])

  return c.json({ ok: true, data: { newBalance, newTapIncome, newAutoIncome } })
})

// ─── POST /api/game/hire ─────────────────────────────────────────────────────
const hireSchema = z.object({
  businessId: z.enum(['store', 'taxi', 'logistics', 'construction', 'airport', 'factory']),
  managerId: z.string().min(1),
})

route.post('/hire', zValidator('json', hireSchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { businessId, managerId } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const def = BUSINESS_MAP_WORKER[businessId]
  if (!def) return c.json({ error: 'Invalid business' }, 400)

  const managerDef = def.managers.find((m) => m.id === managerId)
  if (!managerDef) return c.json({ error: 'Invalid manager' }, 400)

  const [player, biz] = await Promise.all([
    db.select().from(players).where(eq(players.id, userId)).get(),
    db.select().from(businesses)
      .where(and(eq(businesses.playerId, userId), eq(businesses.businessId, businessId)))
      .get(),
  ])

  if (!player || !biz) return c.json({ error: 'Not found' }, 404)

  if (biz.managersHired >= def.managers.length) return c.json({ error: 'All managers hired' }, 400)

  const cost = managerDef.costPerHire * Math.pow(1.5, biz.managersHired)
  if (player.balance < cost) return c.json({ error: 'Insufficient balance' }, 400)

  const newManagersHired = biz.managersHired + 1
  const newBalance = player.balance - cost
  const updatedBiz = { ...biz, managersHired: newManagersHired }
  const newAutoIncome = calcAutoIncome(updatedBiz)

  await db.batch([
    db.update(players).set({ balance: newBalance }).where(eq(players.id, userId)),
    db.update(businesses).set({
      managersHired: newManagersHired,
      autoIncome: newAutoIncome,
    }).where(and(eq(businesses.playerId, userId), eq(businesses.businessId, businessId))),
  ])

  return c.json({ ok: true, data: { newBalance, newAutoIncome, newManagersHired } })
})

// ─── GET /api/game/offline ───────────────────────────────────────────────────
route.get('/offline', async (c) => {
  const userId = c.get('userId' as never) as string
  const db = getDb(c.env.DB)

  const [player, bizRows] = await Promise.all([
    db.select().from(players).where(eq(players.id, userId)).get(),
    db.select().from(businesses).where(eq(businesses.playerId, userId)).all(),
  ])

  if (!player) return c.json({ error: 'Not found' }, 404)

  const result = calcOfflineEarnings(bizRows, player.lastSeen)
  return c.json({ ok: true, data: result })
})

// ─── POST /api/game/collect ──────────────────────────────────────────────────
route.post('/collect', async (c) => {
  const userId = c.get('userId' as never) as string
  const db = getDb(c.env.DB)

  const [player, bizRows] = await Promise.all([
    db.select().from(players).where(eq(players.id, userId)).get(),
    db.select().from(businesses).where(eq(businesses.playerId, userId)).all(),
  ])

  if (!player) return c.json({ error: 'Not found' }, 404)

  const { earnings } = calcOfflineEarnings(bizRows, player.lastSeen)
  const now = Date.now()
  const newBalance = player.balance + earnings

  await db.update(players).set({ balance: newBalance, lastSeen: now }).where(eq(players.id, userId))

  return c.json({ ok: true, data: { earnings, newBalance } })
})

export default route
