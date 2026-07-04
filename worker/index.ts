import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/auth'
import gameRoutes from './routes/game'
import investRoutes from './routes/invest'
import eventsRoutes from './routes/events'
import luxuryRoutes from './routes/luxury'
import leaderboardRoutes from './routes/leaderboard'
import questRoutes from './routes/quests'
import minigameRoutes from './routes/minigames'
import { generateAndStoreEvent } from './lib/marketEvents'

const app = new Hono<{ Bindings: Env }>()

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  '/api/*',
  cors({
    origin: ['https://telegram.org', 'https://web.telegram.org'],
    allowHeaders: ['Content-Type', 'x-init-data', 'x-dev-user-id'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

// ─── Routes ──────────────────────────────────────────────────────────────────
app.route('/api/auth', authRoutes)
app.route('/api/game', gameRoutes)
app.route('/api/invest', investRoutes)
app.route('/api/events', eventsRoutes)
app.route('/api/luxury', luxuryRoutes)
app.route('/api/leaderboard', leaderboardRoutes)
app.route('/api/quests', questRoutes)
app.route('/api/minigame', minigameRoutes)

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }))

// ─── Export ───────────────────────────────────────────────────────────────────
export default {
  fetch: app.fetch,

  /**
   * Cron trigger: fires every minute.
   * Generates a random market event and stores it in D1.
   */
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    try {
      await generateAndStoreEvent(env.DB)
    } catch (err) {
      console.error('Scheduled event error:', err)
    }
  },
} satisfies ExportedHandler<Env>
