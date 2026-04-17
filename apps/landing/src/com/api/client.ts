export class ApiError extends Error {
  status: number
  friendly: string
  raw: string
  constructor(status: number, friendly: string, raw: string) {
    super(friendly)
    this.name = 'ApiError'
    this.status = status
    this.friendly = friendly
    this.raw = raw
  }
}

function humanize(status: number, raw: string): string {
  // 429 Too Many Requests — rate limit
  if (status === 429) {
    return '요청이 너무 빠릅니다. 잠시 후 다시 시도해주세요.'
  }
  // 401 — 인증 만료/필요
  if (status === 401) {
    return '로그인이 필요하거나 세션이 만료되었습니다. 다시 로그인해주세요.'
  }
  // 403 — 권한 부족
  if (status === 403) {
    return '이 작업에 필요한 권한이 없습니다.'
  }
  // 404 — 대상 없음
  if (status === 404) {
    return '요청하신 항목을 찾을 수 없습니다.'
  }
  // 409 — 충돌 (이미 지원 등)
  if (status === 409) {
    return raw || '이미 처리된 요청입니다.'
  }
  // ZodError 포함 400은 입력 검증 실패
  if (status === 400 && raw.includes('ZodError')) {
    return '입력값을 다시 확인해주세요.'
  }
  // 500+ — 서버 오류
  if (status >= 500) {
    return '일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.'
  }
  // 400 기본 — 서버 에러 응답이 JSON {error: "..."} 일 때 해당 메시지 사용
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.error === 'string') return parsed.error
  } catch { /* noop */ }
  return raw || '요청 처리 중 오류가 발생했습니다.'
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const raw = await response.text()
    const friendly = humanize(response.status, raw)
    throw new ApiError(response.status, friendly, raw)
  }

  return response.json() as Promise<T>
}
