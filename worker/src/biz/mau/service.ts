import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import type { AppBindings } from '../../com/bindings'

const COOKIE_SECURE = '__Host-my-saas_market'
const COOKIE_INSECURE = 'my-saas_market'
const PBKDF2_ITER = 100_000

function cookieName(isSecure: boolean) {
  return isSecure ? COOKIE_SECURE : COOKIE_INSECURE
}
const HASH_BYTES = 32
const SALT_BYTES = 16

type MarketSessionPayload = {
  userId: number
  email: string
  exp: number
}

function toB64(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes)
  let s = ''
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i])
  return btoa(s)
}

function fromB64(b64: string): Uint8Array {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

async function deriveKey(password: string, salt: Uint8Array, iter: number) {
  const keyMat = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )
  // saltBuffer.slice() gives a cleanly-typed ArrayBuffer for BufferSource
  const saltBuffer = salt.slice().buffer
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuffer, iterations: iter, hash: 'SHA-256' },
    keyMat,
    HASH_BYTES * 8,
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await deriveKey(password, salt, PBKDF2_ITER)
  return `${PBKDF2_ITER}:${toB64(salt.buffer)}:${toB64(hash.buffer)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':')
  if (parts.length !== 3) return false
  const iter = Number.parseInt(parts[0], 10)
  if (!Number.isFinite(iter) || iter < 1000) return false
  const salt = fromB64(parts[1])
  const expected = fromB64(parts[2])
  const actual = await deriveKey(password, salt, iter)
  if (actual.byteLength !== expected.byteLength) return false
  let diff = 0
  for (let i = 0; i < actual.byteLength; i++) diff |= actual[i] ^ expected[i]
  return diff === 0
}

export function marketAuthConfigured(env: AppBindings): boolean {
  return Boolean(env.ADMIN_JWT_SECRET)
}

export async function issueMarketSession(
  c: Context<{ Bindings: AppBindings }>,
  userId: number,
  email: string,
) {
  if (!c.env.ADMIN_JWT_SECRET) throw new Error('ADMIN_JWT_SECRET is not configured')
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  const token = await sign({ userId, email, exp }, c.env.ADMIN_JWT_SECRET, 'HS256')
  const isSecure = new URL(c.req.url).protocol === 'https:'
  setCookie(c, cookieName(isSecure), token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearMarketSession(c: Context) {
  const isSecure = new URL(c.req.url).protocol === 'https:'
  deleteCookie(c, cookieName(isSecure), { httpOnly: true, secure: isSecure, sameSite: 'Strict', path: '/' })
}

export async function readMarketSession(
  c: Context<{ Bindings: AppBindings }>,
): Promise<{ userId: number; email: string } | null> {
  const isSecure = new URL(c.req.url).protocol === 'https:'
  const token = getCookie(c, cookieName(isSecure)) ?? getCookie(c, COOKIE_INSECURE)
  if (!token || !c.env.ADMIN_JWT_SECRET) return null
  try {
    const payload = (await verify(token, c.env.ADMIN_JWT_SECRET, 'HS256')) as MarketSessionPayload
    return { userId: payload.userId, email: payload.email }
  } catch {
    return null
  }
}
