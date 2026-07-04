import { Hono } from 'hono'
import { getDb } from '../db'
import { players } from '../db/schema'
import { LEADERBOARD_TTL_SECONDS } from '../lib/gameConstants'
import { extractUserId } from '../lib/auth'
import { desc, eq, sql } from 'drizzle-orm'

const route = new Hono<{ Bindings: Env }>()

// ─── GET /api/leaderboard/global ──────────────────────────────────────────────
route.get('/global', async (c) => {
  const cacheKey = 'leaderboard:global'

  // Try KV cache first
  const cached = await c.env.GAME_KV.get(cacheKey, 'json')
  if (cached) return c.json({ ok: true, data: cached, cached: true })

  const db = getDb(c.env.DB)
  const top100 = await db
    .select({
      id: players.id,
      username: players.username,
      firstName: players.firstName,
      netWorth: players.netWorth,
      level: players.level,
    })
    .from(players)
    .orderBy(desc(players.netWorth))
    .limit(100)
    .all()

  const ranked = top100.map((p: any, i: number) => ({ rank: i + 1, ...p }))

  // Cache result
  await c.env.GAME_KV.put(cacheKey, JSON.stringify(ranked), {
    expirationTtl: LEADERBOARD_TTL_SECONDS,
  })

  return c.json({ ok: true, data: ranked, cached: false })
})

// ─── GET /api/leaderboard/rank ────────────────────────────────────────────────
route.get('/rank', async (c) => {
  const userId = extractUserId(c.req.raw)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const db = getDb(c.env.DB)
  const player = await db.select().from(players).where(eq(players.id, userId)).get()
  if (!player) return c.json({ error: 'Player not found' }, 404)

  // Count players with higher net worth for rank
  const rankResult = await db
    .select({ count: sql`count(*)` })
    .from(players)
    .where(sql`${players.netWorth} > ${player.netWorth}`)
    .get()
  
  const totalPlayersResult = await db.select({ count: sql`count(*)` }).from(players).get()

  const rank = (Number(rankResult?.count) || 0) + 1
  const total = Number(totalPlayersResult?.count) || 0

  return c.json({
    ok: true,
    data: {
      rank,
      total,
      netWorth: player.netWorth,
      level: player.level,
    },
  })
})

export default route
