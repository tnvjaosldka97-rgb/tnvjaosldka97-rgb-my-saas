import type { Context, MiddlewareHandler } from 'hono'
import type { AppBindings } from '../../com/bindings'
import { readMarketSession } from './service'

export type MarketAuthVariables = {
  marketUser: { userId: number; email: string }
}

export const requireMarketUser: MiddlewareHandler<{
  Bindings: AppBindings
  Variables: MarketAuthVariables
}> = async (c, next) => {
  const session = await readMarketSession(c as unknown as Context<{ Bindings: AppBindings }>)
  if (!session) return c.json({ error: 'Authentication required' }, 401)
  c.set('marketUser', session)
  await next()
}
