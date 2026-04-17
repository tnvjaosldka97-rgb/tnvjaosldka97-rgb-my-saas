import {
  UtensilsCrossed, Wine, Coffee,
  Stethoscope, HeartPulse, Pill,
  Sparkles, Flower2, Gem,
  GraduationCap, BookOpen, Pencil,
  ShoppingBag, Zap, Package,
  Handshake, Wrench, PhoneCall,
  LayoutGrid, Building2, Globe,
  type LucideIcon,
} from 'lucide-react'

type Props = {
  industry: string
  color: string
  title: string
  className?: string
}

type SceneKind = 'food' | 'medical' | 'beauty' | 'edu' | 'commerce' | 'service' | 'other'

type IndustryDef = {
  kind: SceneKind
  accent: string
  Main: LucideIcon
  SubA: LucideIcon
  SubB: LucideIcon
}

const DEFAULTS: IndustryDef = {
  kind: 'other', accent: '#64748B',
  Main: LayoutGrid, SubA: Building2, SubB: Globe,
}

const INDUSTRY_MAP: Record<string, IndustryDef> = {
  외식:   { kind: 'food',     accent: '#EF4444', Main: UtensilsCrossed, SubA: Wine,        SubB: Coffee },
  병원:   { kind: 'medical',  accent: '#06B6D4', Main: Stethoscope,     SubA: HeartPulse,  SubB: Pill },
  뷰티:   { kind: 'beauty',   accent: '#EC4899', Main: Sparkles,        SubA: Flower2,     SubB: Gem },
  학원:   { kind: 'edu',      accent: '#6366F1', Main: GraduationCap,   SubA: BookOpen,    SubB: Pencil },
  커머스: { kind: 'commerce', accent: '#F59E0B', Main: ShoppingBag,     SubA: Zap,         SubB: Package },
  서비스: { kind: 'service',  accent: '#14B8A6', Main: Handshake,       SubA: Wrench,      SubB: PhoneCall },
  기타:   DEFAULTS,
}

function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '')
  const r = parseInt(cleaned.slice(0, 2), 16)
  const g = parseInt(cleaned.slice(2, 4), 16)
  const b = parseInt(cleaned.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function SceneBackground({ kind, accent }: { kind: SceneKind; accent: string }) {
  const strong = hexToRgba(accent, 0.38)
  const soft = hexToRgba(accent, 0.18)
  const faint = hexToRgba(accent, 0.09)

  // 업종별 배경 패턴 SVG
  return (
    <svg className="oc-art-scene" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {/* layer 1: 강한 그라디언트 */}
      <defs>
        <radialGradient id={`art-bg-a-${kind}`} cx="80%" cy="0%" r="80%">
          <stop offset="0" stopColor={strong} />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
        <radialGradient id={`art-bg-b-${kind}`} cx="10%" cy="100%" r="70%">
          <stop offset="0" stopColor={soft} />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
        <linearGradient id={`art-stripe-${kind}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={hexToRgba(accent, 0.55)} />
          <stop offset="1" stopColor={hexToRgba(accent, 0.05)} />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="#FFFFFF" />
      <rect width="200" height="150" fill={`url(#art-bg-a-${kind})`} />
      <rect width="200" height="150" fill={`url(#art-bg-b-${kind})`} />

      {kind === 'food' && (
        <>
          {/* wave: 소스 흐름 */}
          <path d="M-10 120 Q 40 100, 80 118 T 160 112 T 220 118" fill="none" stroke={soft} strokeWidth="2.5" />
          <path d="M-10 135 Q 40 115, 80 132 T 160 126 T 220 132" fill="none" stroke={faint} strokeWidth="2" />
          {/* dot: 들깨/후추 */}
          {[[30, 40], [150, 20], [175, 65], [40, 90], [110, 35]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.8" fill={strong} opacity={0.5} />
          ))}
        </>
      )}
      {kind === 'medical' && (
        <>
          {/* heartbeat line */}
          <polyline
            points="-5,90 20,90 26,75 34,105 42,85 50,90 70,90 76,70 84,110 92,85 100,90 200,90"
            fill="none" stroke={strong} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"
          />
          {/* grid cross */}
          <g stroke={faint} strokeWidth="1">
            <path d="M0 30 L200 30" />
            <path d="M0 120 L200 120" />
          </g>
        </>
      )}
      {kind === 'beauty' && (
        <>
          {/* sparkle petals */}
          {[[30, 30], [165, 25], [40, 110], [170, 100], [100, 130]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 -6 L1.8 -1.8 L6 0 L1.8 1.8 L0 6 L-1.8 1.8 L-6 0 L-1.8 -1.8 Z" fill={strong} opacity={0.45} />
            </g>
          ))}
          {/* soft dot */}
          {[[60, 55], [140, 80], [90, 95]].map(([x, y], i) => (
            <circle key={`d-${i}`} cx={x} cy={y} r="2" fill={soft} />
          ))}
        </>
      )}
      {kind === 'edu' && (
        <>
          {/* diagonal lines: 공책 */}
          <g stroke={soft} strokeWidth="1">
            {Array.from({ length: 10 }).map((_, i) => (
              <path key={i} d={`M${-20 + i * 24} 160 L${10 + i * 24} 0`} />
            ))}
          </g>
          {/* 책갈피 dot */}
          <circle cx="170" cy="30" r="3" fill={strong} opacity="0.6" />
        </>
      )}
      {kind === 'commerce' && (
        <>
          {/* 상승 차트 bar + 번개 */}
          <g fill={soft}>
            <rect x="20" y="105" width="6" height="18" rx="1" />
            <rect x="32" y="98" width="6" height="25" rx="1" />
            <rect x="44" y="88" width="6" height="35" rx="1" />
            <rect x="56" y="78" width="6" height="45" rx="1" />
          </g>
          <path d="M155 30 L148 55 L160 55 L150 85" fill="none" stroke={strong} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          <circle cx="160" cy="80" r="2.5" fill={strong} opacity="0.5" />
        </>
      )}
      {kind === 'service' && (
        <>
          {/* dot grid */}
          <g fill={soft}>
            {Array.from({ length: 7 }).map((_, row) =>
              Array.from({ length: 12 }).map((_, col) => (
                <circle key={`${row}-${col}`} cx={col * 17 + 4} cy={row * 22 + 8} r="1.4" />
              ))
            )}
          </g>
          {/* 연결선 */}
          <path d="M30 120 Q 100 80, 170 120" fill="none" stroke={strong} strokeWidth="1.6" strokeDasharray="3 4" opacity="0.55" />
        </>
      )}
      {kind === 'other' && (
        <>
          {/* 추상 기하 */}
          <g stroke={soft} strokeWidth="1" fill="none">
            <circle cx="40" cy="30" r="22" />
            <circle cx="170" cy="115" r="30" />
            <rect x="95" y="50" width="40" height="40" transform="rotate(15 115 70)" />
          </g>
        </>
      )}

      {/* 하단 브랜드 그라디언트 라인 */}
      <rect x="0" y="146" width="200" height="4" fill={`url(#art-stripe-${kind})`} />
    </svg>
  )
}

export function IndustryArt({ industry, color, className }: Props) {
  const def = INDUSTRY_MAP[industry] ?? DEFAULTS
  const accent = color && color.startsWith('#') ? color : def.accent
  const { Main, SubA, SubB } = def

  return (
    <div className={`oc-art oc-art-v3 ${className ?? ''}`.trim()} aria-hidden>
      <SceneBackground kind={def.kind} accent={accent} />

      {/* 좌상단 보조 아이콘 (희미) */}
      <span className="oc-art-sub oc-art-sub-a" style={{ color: hexToRgba(accent, 0.35) }}>
        <SubA size={22} strokeWidth={1.6} />
      </span>

      {/* 우하단 보조 아이콘 (희미) */}
      <span className="oc-art-sub oc-art-sub-b" style={{ color: hexToRgba(accent, 0.35) }}>
        <SubB size={18} strokeWidth={1.6} />
      </span>

      {/* 중앙 메인 아이콘 카드 */}
      <div className="oc-art-icon-wrap" style={{ color: accent }}>
        <Main size={58} strokeWidth={1.6} />
      </div>
    </div>
  )
}
