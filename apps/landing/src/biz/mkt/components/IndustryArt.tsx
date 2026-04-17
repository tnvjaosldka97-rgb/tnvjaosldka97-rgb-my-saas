import {
  UtensilsCrossed,
  Stethoscope,
  Sparkles,
  GraduationCap,
  ShoppingBag,
  Handshake,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react'

type Props = {
  industry: string
  color: string
  title: string
  className?: string
}

type IndustryDef = {
  Icon: LucideIcon
  accent: string
  pattern: 'dots' | 'grid' | 'lines' | 'waves'
}

const DEFAULTS: IndustryDef = { Icon: LayoutGrid, accent: '#64748B', pattern: 'dots' }

const INDUSTRY_MAP: Record<string, IndustryDef> = {
  외식:   { Icon: UtensilsCrossed, accent: '#EF4444', pattern: 'waves' },
  병원:   { Icon: Stethoscope,    accent: '#06B6D4', pattern: 'grid' },
  뷰티:   { Icon: Sparkles,       accent: '#EC4899', pattern: 'dots' },
  학원:   { Icon: GraduationCap,  accent: '#6366F1', pattern: 'lines' },
  커머스: { Icon: ShoppingBag,    accent: '#F59E0B', pattern: 'grid' },
  서비스: { Icon: Handshake,      accent: '#14B8A6', pattern: 'dots' },
  기타:   { Icon: LayoutGrid,     accent: '#64748B', pattern: 'lines' },
}

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function PatternLayer({ kind, accent }: { kind: IndustryDef['pattern']; accent: string }) {
  const stroke = hexToRgba(accent, 0.18)
  const fill = hexToRgba(accent, 0.22)
  if (kind === 'dots') {
    return (
      <svg className="oc-art-pattern" aria-hidden>
        <defs>
          <pattern id={`pat-dots-${accent}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.3" fill={fill} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pat-dots-${accent})`} />
      </svg>
    )
  }
  if (kind === 'grid') {
    return (
      <svg className="oc-art-pattern" aria-hidden>
        <defs>
          <pattern id={`pat-grid-${accent}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke={stroke} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pat-grid-${accent})`} />
      </svg>
    )
  }
  if (kind === 'lines') {
    return (
      <svg className="oc-art-pattern" aria-hidden>
        <defs>
          <pattern id={`pat-lines-${accent}`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="12" stroke={stroke} strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pat-lines-${accent})`} />
      </svg>
    )
  }
  // waves
  return (
    <svg className="oc-art-pattern" aria-hidden viewBox="0 0 200 120" preserveAspectRatio="none">
      <path d="M0 90 Q 25 70, 50 90 T 100 90 T 150 90 T 200 90" fill="none" stroke={stroke} strokeWidth="2" />
      <path d="M0 60 Q 25 40, 50 60 T 100 60 T 150 60 T 200 60" fill="none" stroke={stroke} strokeWidth="2" />
      <path d="M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30" fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  )
}

export function IndustryArt({ industry, color, className }: Props) {
  const def = INDUSTRY_MAP[industry] ?? { ...DEFAULTS, accent: color || DEFAULTS.accent }
  const accent = color && color.startsWith('#') ? color : def.accent
  const Icon = def.Icon

  const background = [
    `radial-gradient(120% 110% at 12% 10%, ${hexToRgba(accent, 0.22)} 0%, transparent 55%)`,
    `radial-gradient(120% 110% at 90% 90%, ${hexToRgba(accent, 0.28)} 0%, transparent 60%)`,
    `linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)`,
  ].join(', ')

  return (
    <div
      className={`oc-art oc-art-v2 ${className ?? ''}`.trim()}
      style={{ background }}
      aria-hidden
    >
      <PatternLayer kind={def.pattern} accent={accent} />
      <div className="oc-art-icon-wrap" style={{ color: accent }}>
        <Icon size={52} strokeWidth={1.5} />
      </div>
      <span className="oc-art-stripe" style={{ background: accent }} />
    </div>
  )
}
