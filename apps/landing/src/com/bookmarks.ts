const KEY = 'mcy:bookmarks:v1'

type BookmarkKind = 'project' | 'agency'
type BookmarkStore = {
  project: number[]
  agency: string[]
}

function read(): BookmarkStore {
  if (typeof window === 'undefined') return { project: [], agency: [] }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { project: [], agency: [] }
    const parsed = JSON.parse(raw) as Partial<BookmarkStore>
    return {
      project: Array.isArray(parsed.project) ? parsed.project.filter((n) => typeof n === 'number') : [],
      agency: Array.isArray(parsed.agency) ? parsed.agency.filter((s) => typeof s === 'string') : [],
    }
  } catch {
    return { project: [], agency: [] }
  }
}

function write(store: BookmarkStore) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* quota */ }
}

export function listBookmarks(kind: BookmarkKind): Array<number | string> {
  return read()[kind]
}

export function isBookmarked(kind: BookmarkKind, id: number | string): boolean {
  const s = read()
  if (kind === 'project') return s.project.includes(id as number)
  return s.agency.includes(id as string)
}

export function toggleBookmark(kind: BookmarkKind, id: number | string): boolean {
  const s = read()
  if (kind === 'project') {
    const n = id as number
    if (s.project.includes(n)) s.project = s.project.filter((x) => x !== n)
    else s.project = [...s.project, n]
    write(s)
    return s.project.includes(n)
  }
  const str = id as string
  if (s.agency.includes(str)) s.agency = s.agency.filter((x) => x !== str)
  else s.agency = [...s.agency, str]
  write(s)
  return s.agency.includes(str)
}

export async function shareOrCopy(data: { title: string; text?: string; url: string }): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator === 'undefined') return 'failed'
  const nav = navigator as Navigator & { share?: (d: { title?: string; text?: string; url?: string }) => Promise<void> }
  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title: data.title, text: data.text, url: data.url })
      return 'shared'
    } catch {
      // user cancelled or not supported, fall through to copy
    }
  }
  try {
    await navigator.clipboard.writeText(data.url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
