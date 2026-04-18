import type { MarketUser, MarketUserType } from '@my-saas/com'
import type { D1DatabaseLike } from '../../com/bindings'
import { isoNow } from '../../com/db'

type MarketUserRow = {
  id: number
  email: string
  password_hash: string
  name: string
  user_type: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

function mapUser(row: MarketUserRow): MarketUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    userType: row.user_type as MarketUserType,
    phone: row.phone,
    avatarUrl: row.avatar_url ?? null,
    createdAt: row.created_at,
  }
}

export async function findMarketUserByEmail(
  db: D1DatabaseLike,
  email: string,
): Promise<MarketUserRow | null> {
  const row = await db
    .prepare('SELECT * FROM market_users WHERE email = ?1 LIMIT 1')
    .bind(email.toLowerCase())
    .first<MarketUserRow>()
  return row ?? null
}

export async function findMarketUserById(
  db: D1DatabaseLike,
  id: number,
): Promise<MarketUser | null> {
  const row = await db
    .prepare('SELECT * FROM market_users WHERE id = ?1 LIMIT 1')
    .bind(id)
    .first<MarketUserRow>()
  return row ? mapUser(row) : null
}

export async function createMarketUser(
  db: D1DatabaseLike,
  input: {
    email: string
    passwordHash: string
    name: string
    userType: MarketUserType
    phone?: string | null
  },
): Promise<MarketUser> {
  const now = isoNow()
  const email = input.email.toLowerCase()
  await db
    .prepare(
      `INSERT INTO market_users (email, password_hash, name, user_type, phone, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
    )
    .bind(email, input.passwordHash, input.name, input.userType, input.phone ?? null, now, now)
    .run()
  const fresh = await findMarketUserByEmail(db, email)
  if (!fresh) throw new Error('Failed to create market user')
  return mapUser(fresh)
}

export function toMarketUser(row: MarketUserRow): MarketUser {
  return mapUser(row)
}
