import { Hono } from 'hono'
import type { AppBindings } from '../../com/bindings'
import { requireMarketUser, type MarketAuthVariables } from '../mau/middleware'
import { listNotifications, markAllRead, markRead, unreadCount } from './repository'

export const notificationRoutes = new Hono<{
  Bindings: AppBindings
  Variables: MarketAuthVariables
}>()

notificationRoutes.use('*', requireMarketUser)

notificationRoutes.get('/', async (c) => {
  const user = c.get('marketUser')
  const [items, unread] = await Promise.all([
    listNotifications(c.env.DB, user.userId),
    unreadCount(c.env.DB, user.userId),
  ])
  return c.json({ notifications: items, unreadCount: unread })
})

notificationRoutes.post('/read-all', async (c) => {
  const user = c.get('marketUser')
  await markAllRead(c.env.DB, user.userId)
  return c.json({ ok: true })
})

notificationRoutes.post('/:id/read', async (c) => {
  const user = c.get('marketUser')
  const id = Number.parseInt(c.req.param('id'), 10)
  if (!Number.isFinite(id) || id <= 0) return c.json({ error: 'Invalid id' }, 400)
  await markRead(c.env.DB, user.userId, id)
  return c.json({ ok: true })
})
