import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export type ToastKind = 'success' | 'error' | 'info' | 'warn'

type Toast = {
  id: number
  kind: ToastKind
  message: string
  durationMs: number
}

type ToastApi = {
  push: (kind: ToastKind, message: string, durationMs?: number) => void
  success: (message: string, durationMs?: number) => void
  error: (message: string, durationMs?: number) => void
  info: (message: string, durationMs?: number) => void
  warn: (message: string, durationMs?: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const KIND_ICON: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warn: AlertTriangle,
}

let autoId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setItems((s) => s.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback((kind: ToastKind, message: string, durationMs = 3200) => {
    const id = autoId++
    setItems((s) => [...s, { id, kind, message, durationMs }])
    const handle = setTimeout(() => dismiss(id), durationMs)
    timers.current.set(id, handle)
  }, [dismiss])

  useEffect(() => () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current.clear()
  }, [])

  const api: ToastApi = {
    push,
    success: (m, d) => push('success', m, d),
    error:   (m, d) => push('error', m, d),
    info:    (m, d) => push('info', m, d),
    warn:    (m, d) => push('warn', m, d),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="oc-toast-stack" aria-live="polite" aria-atomic="false">
        {items.map((t) => {
          const Icon = KIND_ICON[t.kind]
          return (
            <div
              key={t.id}
              className={`oc-toast oc-toast-${t.kind}`}
              role={t.kind === 'error' ? 'alert' : 'status'}
              style={{ animationDuration: `${t.durationMs}ms` }}
            >
              <Icon size={16} strokeWidth={2.2} className="oc-toast-icon" aria-hidden />
              <span className="oc-toast-msg">{t.message}</span>
              <button type="button" className="oc-toast-close" onClick={() => dismiss(t.id)} aria-label="닫기">
                <X size={13} strokeWidth={2.2} aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // 안전 폴백 — 프로바이더 외부에서 호출되어도 앱이 깨지지 않도록 콘솔 로그로 대체
    return {
      push: (kind, msg) => console.info(`[toast:${kind}] ${msg}`),
      success: (m) => console.info(`[toast:success] ${m}`),
      error:   (m) => console.warn(`[toast:error] ${m}`),
      info:    (m) => console.info(`[toast:info] ${m}`),
      warn:    (m) => console.warn(`[toast:warn] ${m}`),
    }
  }
  return ctx
}
