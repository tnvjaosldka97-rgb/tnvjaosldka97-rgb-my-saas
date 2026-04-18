import type { MarketNotification, NotificationKind } from '@my-saas/com'
import type { D1DatabaseLike } from '../../com/bindings'
import { allRows, isoNow } from '../../com/db'

type NotificationRow = {
  id: number
  user_id: number
  kind: string
  project_id: number | null
  application_id: number | null
  title: string
  body: string
  link: string | null
  read_at: string | null
  created_at: string
}

function mapNotification(row: NotificationRow): MarketNotification {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind as NotificationKind,
    projectId: row.project_id,
    applicationId: row.application_id,
    title: row.title,
    body: row.body,
    link: row.link,
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}

export async function createNotification(
  db: D1DatabaseLike,
  input: {
    userId: number
    kind: NotificationKind
    title: string
    body?: string
    projectId?: number | null
    applicationId?: number | null
    link?: string | null
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO notifications (user_id, kind, project_id, application_id, title, body, link, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
    )
    .bind(
      input.userId,
      input.kind,
      input.projectId ?? null,
      input.applicationId ?? null,
      input.title,
      input.body ?? '',
      input.link ?? null,
      isoNow(),
    )
    .run()
}

export async function listNotifications(
  db: D1DatabaseLike,
  userId: number,
  limit = 20,
  before?: string,
): Promise<MarketNotification[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100)
  const rows = before
    ? await allRows<NotificationRow>(
        db
          .prepare(
            'SELECT * FROM notifications WHERE user_id = ?1 AND created_at < ?2 ORDER BY created_at DESC LIMIT ?3',
          )
          .bind(userId, before, safeLimit),
      )
    : await allRows<NotificationRow>(
        db
          .prepare('SELECT * FROM notifications WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2')
          .bind(userId, safeLimit),
      )
  return rows.map(mapNotification)
}

export async function unreadCount(db: D1DatabaseLike, userId: number): Promise<number> {
  const row = await db
    .prepare('SELECT COUNT(*) AS c FROM notifications WHERE user_id = ?1 AND read_at IS NULL')
    .bind(userId)
    .first<{ c: number }>()
  return row?.c ?? 0
}

export async function markAllRead(db: D1DatabaseLike, userId: number): Promise<void> {
  await db
    .prepare('UPDATE notifications SET read_at = ?1 WHERE user_id = ?2 AND read_at IS NULL')
    .bind(isoNow(), userId)
    .run()
}

export async function markRead(
  db: D1DatabaseLike,
  userId: number,
  id: number,
): Promise<void> {
  await db
    .prepare('UPDATE notifications SET read_at = ?1 WHERE id = ?2 AND user_id = ?3 AND read_at IS NULL')
    .bind(isoNow(), id, userId)
    .run()
}
