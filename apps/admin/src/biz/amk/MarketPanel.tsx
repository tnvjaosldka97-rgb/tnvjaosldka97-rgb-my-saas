import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Briefcase,
  BadgeCheck,
  Send,
  MessageSquare,
  Star,
  Check,
  X,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { apiFetch } from '../../com/api/client'

type Tab = 'overview' | 'projects' | 'agencies' | 'applications' | 'consultations' | 'reviews'

type TabDef = { key: Tab; label: string; Icon: typeof LayoutDashboard }

const TABS: TabDef[] = [
  { key: 'overview',      label: 'Overview',      Icon: LayoutDashboard },
  { key: 'projects',      label: 'Projects',      Icon: Briefcase },
  { key: 'agencies',      label: 'Agencies',      Icon: BadgeCheck },
  { key: 'applications',  label: 'Applications',  Icon: Send },
  { key: 'consultations', label: 'Consultations', Icon: MessageSquare },
  { key: 'reviews',       label: 'Reviews',       Icon: Star },
]

export function MarketPanel() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <section className="market-panel">
      <nav className="market-tabs" role="tablist" aria-label="마켓 탭">
        {TABS.map((t) => {
          const Icon = t.Icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`market-tab${active ? ' is-active' : ''}`}
            >
              <Icon size={14} strokeWidth={2} aria-hidden />
              {t.label}
            </button>
          )
        })}
      </nav>

      <div className="market-tab-panel">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'projects' && <ProjectsTab />}
        {tab === 'agencies' && <AgenciesTab />}
        {tab === 'applications' && <ApplicationsTab />}
        {tab === 'consultations' && <ConsultationsTab />}
        {tab === 'reviews' && <ReviewsTab />}
      </div>
    </section>
  )
}

/* =============================================================
   Overview
============================================================= */

type Overview = {
  totalProjects: number
  recruitingProjects: number
  executingProjects: number
  completedProjects: number
  totalAgencies: number
  verifiedAgencies: number
  totalApplications: number
  pendingApplications: number
  totalConsultations: number
  pendingConsultations: number
  totalReviews: number
  avgRating: number
  industryDistribution: Array<{ industry: string; count: number }>
  recentActivity: Array<{ kind: string; label: string; at: string }>
}

function OverviewTab() {
  const [data, setData] = useState<Overview | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    void apiFetch<Overview>('/api/admin/market/overview')
      .then(setData)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : '불러오기 실패'))
  }, [])

  if (err) return <div className="market-err">{err}</div>
  if (!data) return <div className="market-skeleton">마켓 데이터 집계 중…</div>

  const totalDist = data.industryDistribution.reduce((acc, d) => acc + d.count, 0) || 1

  return (
    <div className="market-overview">
      <div className="market-kpis">
        <KpiBox title="프로젝트" primary={data.totalProjects} sub={`모집 ${data.recruitingProjects} · 집행 ${data.executingProjects} · 완료 ${data.completedProjects}`} tone="navy" />
        <KpiBox title="인증 대행사" primary={`${data.verifiedAgencies}/${data.totalAgencies}`} sub={`평균 평점 ${data.avgRating.toFixed(1)}`} tone="royal" />
        <KpiBox title="지원서" primary={data.totalApplications} sub={`검토 대기 ${data.pendingApplications}`} tone="amber" />
        <KpiBox title="상담 요청" primary={data.totalConsultations} sub={`미응대 ${data.pendingConsultations}`} tone="mint" />
      </div>

      <div className="market-grid-2">
        <section className="market-card">
          <h3>업종별 분포</h3>
          <ul className="market-dist">
            {data.industryDistribution.map((d) => {
              const pct = Math.round((d.count / totalDist) * 100)
              return (
                <li key={d.industry}>
                  <span className="market-dist-label">{d.industry}</span>
                  <span className="market-dist-bar">
                    <span className="market-dist-fill" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="market-dist-count">{d.count}건 · {pct}%</span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="market-card">
          <h3>최근 활동</h3>
          {data.recentActivity.length === 0 ? (
            <p className="market-empty">아직 활동이 없습니다.</p>
          ) : (
            <ul className="market-activity">
              {data.recentActivity.map((a, i) => (
                <li key={i}>
                  <span className={`market-activity-kind kind-${a.kind}`}>{kindLabel(a.kind)}</span>
                  <span className="market-activity-label">{a.label}</span>
                  <time>{fmtRel(a.at)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function KpiBox({ title, primary, sub, tone }: { title: string; primary: string | number; sub: string; tone: 'navy' | 'royal' | 'amber' | 'mint' }) {
  return (
    <div className={`market-kpi market-kpi-${tone}`}>
      <span className="market-kpi-title">{title}</span>
      <span className="market-kpi-primary">{primary}</span>
      <span className="market-kpi-sub">{sub}</span>
    </div>
  )
}

function kindLabel(kind: string): string {
  if (kind === 'project') return '프로젝트'
  if (kind === 'consultation') return '상담'
  if (kind === 'review') return '리뷰'
  return kind
}

function fmtRel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60 * 60 * 1000) return `${Math.round(diff / 60000)}분 전`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.round(diff / (60 * 60000))}시간 전`
  return `${Math.round(diff / (24 * 60 * 60 * 1000))}일 전`
}

/* =============================================================
   Projects
============================================================= */

type Project = {
  id: number; slug: string; industry: string; title: string
  status: string; stage: string
  budgetMin: number; budgetMax: number | null
  applicantCount: number; daysLeft: number
  advertiserName: string | null; createdAt: string
}

function ProjectsTab() {
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  function load() {
    setLoading(true)
    void apiFetch<{ items: Project[] }>('/api/admin/market/projects')
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function changeStage(id: number, stage: Project['stage']) {
    await apiFetch(`/api/admin/market/projects/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    })
    load()
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.stage === filter)

  return (
    <div className="market-tab-content">
      <div className="market-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="market-select">
          <option value="all">전체 단계</option>
          <option value="recruiting">모집중</option>
          <option value="contracting">계약 진행중</option>
          <option value="executing">집행중</option>
          <option value="completed">완료</option>
        </select>
        <span className="market-count"><strong>{filtered.length}</strong> / {items.length}건</span>
        <button type="button" className="market-btn" onClick={load}><RefreshCw size={12} strokeWidth={2} /> 새로고침</button>
      </div>

      {loading ? (
        <div className="market-skeleton">불러오는 중…</div>
      ) : (
        <div className="market-table-wrap">
          <table className="market-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>업종</th>
                <th>예산</th>
                <th>지원자</th>
                <th>D-day</th>
                <th>단계</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="mono">#{p.id}</td>
                  <td className="market-cell-title">{p.title}</td>
                  <td><span className="market-badge">{p.industry}</span></td>
                  <td>{p.budgetMin.toLocaleString()}만{p.budgetMax ? `~${p.budgetMax.toLocaleString()}만` : '+'}</td>
                  <td>{p.applicantCount}</td>
                  <td>{p.daysLeft > 0 ? `D-${p.daysLeft}` : '—'}</td>
                  <td><StageBadge stage={p.stage} /></td>
                  <td>
                    <select className="market-select market-select-sm" value={p.stage} onChange={(e) => changeStage(p.id, e.target.value as Project['stage'])}>
                      <option value="recruiting">모집</option>
                      <option value="contracting">계약</option>
                      <option value="executing">집행</option>
                      <option value="completed">완료</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    recruiting:  { label: '모집중', cls: 'badge-mint' },
    contracting: { label: '계약',   cls: 'badge-blue' },
    executing:   { label: '집행',   cls: 'badge-amber' },
    completed:   { label: '완료',   cls: 'badge-gray' },
  }
  const m = map[stage] ?? { label: stage, cls: 'badge-gray' }
  return <span className={`market-pill ${m.cls}`}>{m.label}</span>
}

/* =============================================================
   Agencies
============================================================= */

type Agency = {
  id: number; slug: string; name: string; verified: boolean; rating: number
  completedProjects: number; totalReviews: number; specialties: string[]; createdAt: string
}

function AgenciesTab() {
  const [items, setItems] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    void apiFetch<{ items: Agency[] }>('/api/admin/market/agencies')
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function toggleVerified(id: number, verified: boolean) {
    await apiFetch(`/api/admin/market/agencies/${id}/verified`, {
      method: 'PATCH',
      body: JSON.stringify({ verified }),
    })
    load()
  }

  return (
    <div className="market-tab-content">
      <div className="market-toolbar">
        <span className="market-count"><strong>{items.length}</strong>개 대행사 등록</span>
        <button type="button" className="market-btn" onClick={load}><RefreshCw size={12} strokeWidth={2} /> 새로고침</button>
      </div>
      {loading ? (
        <div className="market-skeleton">불러오는 중…</div>
      ) : (
        <div className="market-table-wrap">
          <table className="market-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>대행사명</th>
                <th>전문 분야</th>
                <th>평점</th>
                <th>완료</th>
                <th>리뷰</th>
                <th>인증</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="mono">#{a.id}</td>
                  <td className="market-cell-title">{a.name}</td>
                  <td>{a.specialties.slice(0, 3).map((s) => <span key={s} className="market-badge market-badge-sm">{s}</span>)}</td>
                  <td><Star size={12} strokeWidth={2} aria-hidden /> {a.rating.toFixed(1)}</td>
                  <td>{a.completedProjects}</td>
                  <td>{a.totalReviews}</td>
                  <td>{a.verified ? <span className="market-pill badge-mint"><Check size={11} /> 인증</span> : <span className="market-pill badge-gray">미인증</span>}</td>
                  <td>
                    <button type="button" className="market-btn-sm" onClick={() => toggleVerified(a.id, !a.verified)}>
                      {a.verified ? '인증 해제' : '인증 승인'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* =============================================================
   Applications
============================================================= */

type Application = {
  id: number; projectId: number; projectTitle: string
  agencyUserId: number; agencyUserName: string; agencyUserEmail: string
  status: string; message: string; createdAt: string
}

function ApplicationsTab() {
  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void apiFetch<{ items: Application[] }>('/api/admin/market/applications')
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="market-skeleton">불러오는 중…</div>
  if (items.length === 0) return <div className="market-empty">아직 지원서가 없습니다.</div>

  return (
    <div className="market-tab-content">
      <div className="market-toolbar">
        <span className="market-count"><strong>{items.length}</strong>건 전체 지원 내역</span>
      </div>
      <div className="market-table-wrap">
        <table className="market-table">
          <thead>
            <tr><th>ID</th><th>프로젝트</th><th>지원 대행사</th><th>이메일</th><th>상태</th><th>제출일</th></tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td className="mono">#{a.id}</td>
                <td className="market-cell-title">{a.projectTitle}</td>
                <td>{a.agencyUserName}</td>
                <td className="mono">{a.agencyUserEmail}</td>
                <td><StageBadge stage={a.status === 'pending' ? 'recruiting' : a.status === 'selected' ? 'executing' : 'completed'} /></td>
                <td>{fmtRel(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* =============================================================
   Consultations
============================================================= */

type Consultation = {
  id: number; projectId: number; projectTitle: string
  agencyId: number | null; agencyName: string | null
  requesterName: string; requesterContact: string; message: string
  preferredTime: string; status: string; createdAt: string
}

function ConsultationsTab() {
  const [items, setItems] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    void apiFetch<{ items: Consultation[] }>('/api/admin/market/consultations')
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function setStatus(id: number, status: 'pending' | 'contacted' | 'closed') {
    await apiFetch(`/api/admin/market/consultations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    load()
  }

  if (loading) return <div className="market-skeleton">불러오는 중…</div>
  if (items.length === 0) return <div className="market-empty">아직 상담 요청이 없습니다.</div>

  return (
    <div className="market-tab-content">
      <div className="market-toolbar">
        <span className="market-count"><strong>{items.length}</strong>건</span>
      </div>
      <ul className="market-consult-list">
        {items.map((c) => (
          <li key={c.id} className={`market-consult-card status-${c.status}`}>
            <header>
              <div>
                <strong>{c.requesterName}</strong>
                <span className="market-consult-meta">{c.requesterContact} · {c.preferredTime}</span>
              </div>
              <div className="market-consult-actions">
                <select className="market-select market-select-sm" value={c.status} onChange={(e) => setStatus(c.id, e.target.value as 'pending' | 'contacted' | 'closed')}>
                  <option value="pending">대기</option>
                  <option value="contacted">연락 완료</option>
                  <option value="closed">종료</option>
                </select>
              </div>
            </header>
            <div className="market-consult-project">→ {c.projectTitle}</div>
            <p className="market-consult-msg">{c.message}</p>
            <time>{fmtRel(c.createdAt)}</time>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* =============================================================
   Reviews
============================================================= */

type Review = {
  id: number; projectId: number; projectTitle: string
  agencyId: number; agencyName: string
  rating: number; comment: string; createdAt: string
}

function ReviewsTab() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    void apiFetch<{ items: Review[] }>('/api/admin/market/reviews')
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function remove(id: number) {
    if (!confirm('이 리뷰를 삭제하시겠습니까? 이 동작은 되돌릴 수 없습니다.')) return
    await apiFetch(`/api/admin/market/reviews/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div className="market-skeleton">불러오는 중…</div>
  if (items.length === 0) return <div className="market-empty">리뷰가 없습니다.</div>

  return (
    <div className="market-tab-content">
      <div className="market-toolbar">
        <span className="market-count"><strong>{items.length}</strong>건</span>
      </div>
      <ul className="market-review-list">
        {items.map((r) => (
          <li key={r.id} className="market-review-card">
            <div className="market-review-head">
              <span className="market-review-rating">{'★'.repeat(r.rating)}<span className="market-star-dim">{'★'.repeat(5 - r.rating)}</span></span>
              <strong>{r.agencyName}</strong>
              <span className="market-review-project">— {r.projectTitle}</span>
              <button type="button" className="market-btn-sm market-btn-danger" onClick={() => remove(r.id)} aria-label="리뷰 삭제">
                <Trash2 size={11} /> 삭제
              </button>
            </div>
            <p className="market-review-comment">{r.comment}</p>
            <time>{fmtRel(r.createdAt)}</time>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* =============================================================
   Unused export pacifier (avoid dead-code TS warnings)
============================================================= */
export const _icons = { X }
