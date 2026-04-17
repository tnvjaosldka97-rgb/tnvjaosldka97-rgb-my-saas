type Props = {
  industry: string
  color: string
  title: string
  className?: string
}

const ICON_PATHS: Record<string, { path: string; viewBox: string }> = {
  외식: {
    viewBox: '0 0 64 64',
    path: 'M16 4v24a8 8 0 0 0 6 7.75V60h4V35.75A8 8 0 0 0 32 28V4h-3v16h-2V4h-3v16h-2V4h-3v16h-2V4h-1zm32 0c-4 0-8 6-8 14v14h6v28h4V4z',
  },
  병원: {
    viewBox: '0 0 64 64',
    path: 'M32 6l-4 10-10 2 7.5 8-2 10.5L32 42l8.5 4.5-2-10.5 7.5-8-10-2z M6 34h8l4-8 6 18 6-14 6 10h20',
  },
  뷰티: {
    viewBox: '0 0 64 64',
    path: 'M32 8c0 10-6 14-12 14 6 0 12 4 12 14 0-10 6-14 12-14-6 0-12-4-12-14zm-20 30c0 6-3 8-6 8 3 0 6 2 6 8 0-6 3-8 6-8-3 0-6-2-6-8zm40 4c0 6-3 8-6 8 3 0 6 2 6 8 0-6 3-8 6-8-3 0-6-2-6-8z',
  },
  학원: {
    viewBox: '0 0 64 64',
    path: 'M8 12h20a4 4 0 0 1 4 4v36a4 4 0 0 0-4-4H8V12zm48 0H36a4 4 0 0 0-4 4v36a4 4 0 0 1 4-4h20V12zM12 18h14v4H12v-4zm0 8h14v4H12v-4zm0 8h14v4H12v-4zm26-16h14v4H38v-4zm0 8h14v4H38v-4zm0 8h14v4H38v-4z',
  },
  커머스: {
    viewBox: '0 0 64 64',
    path: 'M18 16h-6l-4 8v28a4 4 0 0 0 4 4h40a4 4 0 0 0 4-4V24l-4-8h-6M18 16a14 14 0 0 1 28 0M18 16h28M10 28h44',
  },
  서비스: {
    viewBox: '0 0 64 64',
    path: 'M48 18l-8 8-6-6 8-8a12 12 0 0 0-16 16l-18 18a4 4 0 0 0 6 6l18-18a12 12 0 0 0 16-16z',
  },
  기타: {
    viewBox: '0 0 64 64',
    path: 'M32 8v12M32 44v12M8 32h12M44 32h12M15 15l8 8M41 41l8 8M15 49l8-8M41 23l8-8',
  },
}

function hueForIndustry(industry: string): string {
  return ICON_PATHS[industry] ? industry : '기타'
}

export function IndustryArt({ industry, color, title, className }: Props) {
  const key = hueForIndustry(industry)
  const icon = ICON_PATHS[key]
  const monogram = title.trim().charAt(0)

  return (
    <div
      className={`oc-art ${className ?? ''}`.trim()}
      style={{
        background: `linear-gradient(135deg, ${color}EE 0%, ${color}99 55%, ${color}55 100%)`,
      }}
      aria-hidden
    >
      <svg
        className="oc-art-icon"
        viewBox={icon.viewBox}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="white"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d={icon.path} />
      </svg>
      <span className="oc-art-monogram">{monogram}</span>
      <span className="oc-art-grain" />
    </div>
  )
}
