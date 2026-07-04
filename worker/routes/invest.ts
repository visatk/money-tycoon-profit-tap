import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getDb } from '../db'
import { investments, players, assetPrices } from '../db/schema'
import { extractUserId } from '../lib/auth'
import { simulateAssetPrice } from '../lib/gameEngine'
import { INVESTMENT_VOLATILITY } from '../lib/gameConstants'
import { eq, and } from 'drizzle-orm'

const route = new Hono<{ Bindings: Env }>()

route.use('*', async (c, next) => {
  const userId = extractUserId(c.req.raw)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId' as never, userId)
  await next()
})

// ─── GET /api/invest/assets ───────────────────────────────────────────────────
route.get('/assets', async (c) => {
  const db = getDb(c.env.DB)
  const now = Date.now()
  // Prices are seeded per minute for determinism
  const minuteSeed = Math.floor(now / 60_000)

  const assetIds = Object.keys(INVESTMENT_VOLATILITY)
  const priceData = assetIds.map((assetId) => {
    const { basePrice, volatility } = INVESTMENT_VOLATILITY[assetId]
    const price = simulateAssetPrice(basePrice, volatility, minuteSeed + assetId.charCodeAt(0))
    const prevPrice = simulateAssetPrice(basePrice, volatility, minuteSeed - 1440 + assetId.charCodeAt(0))
    const change24h = ((price - prevPrice) / prevPrice) * 100

    return { assetId, price: Math.round(price * 100) / 100, change24h: Math.round(change24h * 100) / 100, updatedAt: now }
  })

  return c.json({ ok: true, data: priceData })
})

// ─── GET /api/invest/portfolio ────────────────────────────────────────────────
route.get('/portfolio', async (c) => {
  const userId = c.get('userId' as never) as string
  const db = getDb(c.env.DB)
  const now = Date.now()
  const minuteSeed = Math.floor(now / 60_000)

  const positions = await db.select().from(investments).where(eq(investments.playerId, userId)).all()

  const portfolio = positions.map((pos) => {
    const { basePrice, volatility } = INVESTMENT_VOLATILITY[pos.assetId] ?? { basePrice: 1, volatility: 0 }
    const currentPrice = simulateAssetPrice(basePrice, volatility, minuteSeed + pos.assetId.charCodeAt(0))
    const currentValue = pos.amount * currentPrice
    const costBasis = pos.amount * pos.purchasePrice
    const pnl = currentValue - costBasis
    const pnlPct = (pnl / costBasis) * 100

    return {
      assetId: pos.assetId,
      amount: pos.amount,
      purchasePrice: pos.purchasePrice,
      currentPrice: Math.round(currentPrice * 100) / 100,
      currentValue: Math.round(currentValue * 100) / 100,
      pnl: Math.round(pnl * 100) / 100,
      pnlPct: Math.round(pnlPct * 100) / 100,
    }
  })

  const totalValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0)
  const totalPnl = portfolio.reduce((sum, p) => sum + p.pnl, 0)

  return c.json({ ok: true, data: { positions: portfolio, totalValue, totalPnl } })
})

// ─── POST /api/invest/buy ─────────────────────────────────────────────────────
const buySchema = z.object({
  assetId: z.string().min(1),
  spendAmount: z.number().positive(),
})

route.post('/buy', zValidator('json', buySchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { assetId, spendAmount } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const volatility = INVESTMENT_VOLATILITY[assetId]
  if (!volatility) return c.json({ error: 'Invalid asset' }, 400)

  const now = Date.now()
  const minuteSeed = Math.floor(now / 60_000)
  const currentPrice = simulateAssetPrice(volatility.basePrice, volatility.volatility, minuteSeed + assetId.charCodeAt(0))
  const unitsBought = spendAmount / currentPrice

  const player = await db.select().from(players).where(eq(players.id, userId)).get()
  if (!player) return c.json({ error: 'Player not found' }, 404)
  if (player.balance < spendAmount) return c.json({ error: 'Insufficient balance' }, 400)

  const existing = await db.select().from(investments)
    .where(and(eq(investments.playerId, userId), eq(investments.assetId, assetId)))
    .get()

  if (existing) {
    // Average cost basis
    const totalUnits = existing.amount + unitsBought
    const avgPrice = (existing.amount * existing.purchasePrice + unitsBought * currentPrice) / totalUnits

    await db.batch([
      db.update(investments).set({
        amount: totalUnits,
        purchasePrice: avgPrice,
      }).where(and(eq(investments.playerId, userId), eq(investments.assetId, assetId))),
      db.update(players).set({ balance: player.balance - spendAmount }).where(eq(players.id, userId))
    ])
  } else {
    await db.batch([
      db.insert(investments).values({
        playerId: userId,
        assetId,
        amount: unitsBought,
        purchasePrice: currentPrice,
        purchasedAt: now,
      }),
      db.update(players).set({ balance: player.balance - spendAmount }).where(eq(players.id, userId))
    ])
  }

  return c.json({ ok: true, data: { unitsBought, pricePerUnit: currentPrice, newBalance: player.balance - spendAmount } })
})

// ─── POST /api/invest/sell ────────────────────────────────────────────────────
const sellSchema = z.object({
  assetId: z.string().min(1),
  sellAmount: z.number().positive(), // units to sell
})

route.post('/sell', zValidator('json', sellSchema), async (c) => {
  const userId = c.get('userId' as never) as string
  const { assetId, sellAmount } = c.req.valid('json')
  const db = getDb(c.env.DB)

  const volatility = INVESTMENT_VOLATILITY[assetId]
  if (!volatility) return c.json({ error: 'Invalid asset' }, 400)

  const now = Date.now()
  const minuteSeed = Math.floor(now / 60_000)
  const currentPrice = simulateAssetPrice(volatility.basePrice, volatility.volatility, minuteSeed + assetId.charCodeAt(0))

  const [player, position] = await Promise.all([
    db.select().from(players).where(eq(players.id, userId)).get(),
    db.select().from(investments)
      .where(and(eq(investments.playerId, userId), eq(investments.assetId, assetId)))
      .get(),
  ])

  if (!player) return c.json({ error: 'Player not found' }, 404)
  if (!position || position.amount < sellAmount) return c.json({ error: 'Insufficient holdings' }, 400)

  const proceeds = sellAmount * currentPrice
  const newAmount = position.amount - sellAmount
  const newBalance = player.balance + proceeds

  if (newAmount <= 0) {
    await db.batch([
      db.delete(investments)
        .where(and(eq(investments.playerId, userId), eq(investments.assetId, assetId))),
      db.update(players).set({ balance: newBalance }).where(eq(players.id, userId))
    ])
  } else {
    await db.batch([
      db.update(investments).set({ amount: newAmount })
        .where(and(eq(investments.playerId, userId), eq(investments.assetId, assetId))),
      db.update(players).set({ balance: newBalance }).where(eq(players.id, userId))
    ])
  }

  return c.json({ ok: true, data: { proceeds, newBalance } })
})

export default route
