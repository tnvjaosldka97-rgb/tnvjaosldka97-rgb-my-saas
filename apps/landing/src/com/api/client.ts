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
  // 서버가 JSON { error } / { message } 로 친숙한 메시지를 내려준 경우 우선 사용
  let parsedError: string | null = null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.error === 'string') parsedError = parsed.error
    else if (parsed && typeof parsed.message === 'string') parsedError = parsed.message
  } catch { /* noop */ }

  // 429 Too Many Requests
  if (status === 429) return parsedError ?? '요청이 너무 빠릅니다. 1분 후 다시 시도해주세요.'
  // 401 — 인증 필요
  if (status === 401) return '로그인이 필요하거나 세션이 만료되었습니다. 다시 로그인해주세요.'
  // 402 — 결제 필요 (운영팀이 등록비 수령 전)
  if (status === 402) return parsedError ?? '결제 확인이 필요합니다.'
  // 403 — 권한 부족
  if (status === 403) return '이 작업에 필요한 권한이 없습니다.'
  // 404 — 대상 없음
  if (status === 404) return parsedError ?? '요청하신 항목을 찾을 수 없습니다.'
  // 409 — 충돌
  if (status === 409) return parsedError ?? '이미 처리된 요청입니다.'
  // ZodError 포함 400은 입력 검증 실패
  if (status === 400 && raw.includes('ZodError')) {
    return '입력값을 다시 확인해주세요. 모든 필수 항목을 채웠는지 확인해주세요.'
  }
  // 500+ — 서버 오류 (서버가 준 친숙 메시지 우선)
  if (status >= 500) return parsedError ?? '일시적인 서버 오류입니다. 잠시 후 다시 시도해주세요.'
  // 400 기본
  if (parsedError) return parsedError
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
