import { useEffect, useState } from 'react'

type Options = {
  enabled?: boolean
  minDelta?: number
  maxDelta?: number
  intervalMs?: [number, number]
}

export function useLiveTicker(seed: number, opts: Options = {}): number {
  const {
    enabled = true,
    minDelta = -1,
    maxDelta = 1,
    intervalMs = [5000, 8000],
  } = opts

  const [value, setValue] = useState(seed)

  useEffect(() => {
    setValue(seed)
  }, [seed])

  useEffect(() => {
    if (!enabled) return
    if (typeof document === 'undefined') return

    let timer: number | undefined
    function schedule() {
      const [lo, hi] = intervalMs
      const wait = Math.floor(lo + Math.random() * (hi - lo))
      timer = window.setTimeout(tick, wait)
    }
    function tick() {
      if (document.visibilityState === 'hidden') {
        schedule()
        return
      }
      setValue((prev) => {
        const span = maxDelta - minDelta + 1
        const delta = Math.floor(Math.random() * span) + minDelta
        const next = Math.max(0, prev + delta)
        return next
      })
      schedule()
    }
    schedule()
    return () => { if (timer !== undefined) window.clearTimeout(timer) }
  }, [enabled, minDelta, maxDelta, intervalMs])

  return value
}
