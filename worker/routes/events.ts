import { Hono } from 'hono'
import { getActiveEvents } from '../lib/marketEvents'

const route = new Hono<{ Bindings: Env }>()

route.get('/active', async (c) => {
  const events = await getActiveEvents(c.env.DB)
  return c.json({ ok: true, data: events })
})

export default route
