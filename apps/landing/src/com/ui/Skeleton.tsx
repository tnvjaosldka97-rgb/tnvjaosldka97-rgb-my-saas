import type { CSSProperties } from 'react'

type Props = {
  width?: number | string
  height?: number | string
  radius?: number | string
  className?: string
  style?: CSSProperties
  variant?: 'block' | 'text' | 'circle' | 'card'
}

export function Skeleton({ width, height, radius, className, style, variant = 'block' }: Props) {
  const s: CSSProperties = {
    width: width ?? '100%',
    height: height ?? (variant === 'text' ? '1em' : 16),
    borderRadius: radius ?? (variant === 'circle' ? '50%' : variant === 'card' ? 12 : 6),
    ...style,
  }
  return <span className={`oc-skel oc-skel-${variant} ${className ?? ''}`.trim()} style={s} aria-hidden />
}

export function SkeletonStack({ rows = 3, gap = 8 }: { rows?: number; gap?: number }) {
  return (
    <div className="oc-skel-stack" style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === rows - 1 ? '60%' : '100%'} height={14} />
      ))}
    </div>
  )
}

export function SkeletonKpiRow() {
  return (
    <div className="oc-skel-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="card" height={78} />
      ))}
    </div>
  )
}
