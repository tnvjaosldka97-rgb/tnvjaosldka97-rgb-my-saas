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
  ClipboardList,
  CheckCircle2,
  XCircle,
  UserCog,
  Ban,
  RotateCcw,
} from 'lucide-react'
import { apiFetch } from '../../com/api/client'
import { useToast } from '../../com/ui/Toast'

type Tab = 'overview' | 'drafts' | 'verifications' | 'projects' | 'agencies' | 'members' | 'applications' | 'consultations' | 'reviews'

type BadgeKind = 'pending-drafts' | 'pending-cons' | 'pending-verify'

type TabDef = { key: Tab; label: string; Icon: typeof LayoutDashboard; badge?: BadgeKind }

const TABS: TabDef[] = [
  { key: 'overview',      label: 'Overview',      Icon: LayoutDashboard },
  { key: 'drafts',        label: '접수 승인',     Icon: ClipboardList, badge: 'pending-drafts' },
  { key: 'verifications', label: '대행사 검증',   Icon: BadgeCheck, badge: 'pending-verify' },
  { key: 'projects',      label: 'Projects',      Icon: Briefcase },
  { key: 'agencies',      label: 'Agencies',      Icon: BadgeCheck },
  { key: 'members',       label: 'Members',       Icon: UserCog },
  { key: 'applications',  label: 'Applications',  Icon: Send },
  { key: 'consultations', label: 'Consultations', Icon: MessageSquare, badge: 'pending-cons' },
  { key: 'reviews',       label: 'Reviews',       Icon: Star },
]

export function MarketPanel() {
  const [tab, setTab] = useState<Tab>('overview')
  const [badges, setBadges] = useState<Record<BadgeKind, number>>({ 'pending-drafts': 0, 'pending-cons': 0, 'pending-verify': 0 })

  useEffect(() => {
    void Promise.all([
      apiFetch<Overview>('/api/admin/market/overview').catch(() => null),
      apiFetch<{ items: unknown[] }>('/api/admin/market/agency-verifications?status=submitted').catch(() => ({ items: [] })),
    ]).then(([ov, verif]) => {
      setBadges({
        'pending-drafts': ov?.pendingDrafts ?? 0,
        'pending-cons': ov?.pendingConsultations ?? 0,
        'pending-verify': verif?.items.length ?? 0,
      })
    })
  }, [tab])

  return (
    <section className="market-panel">
      <nav className="market-tabs" role="tablist" aria-label="마켓 탭">
        {TABS.map((t) => {
          const Icon = t.Icon
          const active = tab === t.key
          const count = t.badge ? badges[t.badge] : 0
          const showBadge = Boolean(t.badge) && count > 0
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
              {showBadge && <span className="market-tab-badge">{count}</span>}
            </button>
          )
        })}
      </nav>

      <div className="market-tab-panel">
        {tab === 'overview' && <OverviewTab onNavigate={setTab} />}
        {tab === 'drafts' && <DraftsTab />}
        {tab === 'verifications' && <VerificationsTab />}
        {tab === 'projects' && <ProjectsTab />}
        {tab === 'agencies' && <AgenciesTab />}
        {tab === 'members' && <MembersTab />}
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
  totalDrafts?: number
  pendingDrafts?: number
  weeklyProjects?: number[]
  industryDistribution: Array<{ industry: string; count: number }>
  recentActivity: Array<{ kind: string; label: string; at: string }>
  monthRegistrationFeeKrw?: number
  monthCompletedProjects?: number
  monthSignups?: number
  pendingVerifications?: number
  pendingPayments?: number
  totalMembers?: number
}

function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
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
  const successFeeEstimate = Math.round((data.monthCompletedProjects ?? 0) * 300_000 * 0.1)
  const actions: Array<{ label: string; count: number; tab: Tab; tone: 'red' | 'amber' | 'navy' }> = ([
    { label: '검증 대기 대행사', count: data.pendingVerifications ?? 0, tab: 'verifications' as Tab, tone: 'red' as const },
    { label: '결제 대기 접수', count: data.pendingPayments ?? 0, tab: 'drafts' as Tab, tone: 'amber' as const },
    { label: '상담 미응대', count: data.pendingConsultations, tab: 'consultations' as Tab, tone: 'amber' as const },
    { label: '지원서 검토', count: data.pendingApplications, tab: 'applications' as Tab, tone: 'navy' as const },
  ]).filter((a) => a.count > 0)

  return (
    <div className="market-overview">
      {/* 이번달 핵심 지표 */}
      <div className="market-kpis">
        <KpiBox title="이번달 등록비 수령" primary={`₩${(data.monthRegistrationFeeKrw ?? 0).toLocaleString('ko-KR')}`} sub={`완료 ${data.monthCompletedProjects ?? 0}건 · 수수료 추정 ₩${successFeeEstimate.toLocaleString('ko-KR')}`} tone="navy" />
        <KpiBox title="이번달 신규 가입" primary={`+${data.monthSignups ?? 0}`} sub={`총 회원 ${(data.totalMembers ?? 0).toLocaleString('ko-KR')}명`} tone="royal" />
        <KpiBox title="인증 대행사" primary={`${data.verifiedAgencies}/${data.totalAgencies}`} sub={`평균 평점 ${data.avgRating.toFixed(1)}`} tone="amber" />
        <KpiBox title="진행중 프로젝트" primary={data.totalProjects} sub={`모집 ${data.recruitingProjects} · 집행 ${data.executingProjects} · 완료 ${data.completedProjects}`} tone="mint" />
      </div>

      {/* 즉시 처리 액션 큐 */}
      {actions.length > 0 && (
        <section className="market-card" style={{ borderLeft: '4px solid #DC2626' }}>
          <h3>즉시 처리 필요</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
            {actions.map((a) => (
              <button
                key={a.tab}
                type="button"
                onClick={() => onNavigate(a.tab)}
                className={`market-action-chip market-action-${a.tone}`}
              >
                <span className="market-action-count">{a.count}</span>
                <span className="market-action-label">{a.label} →</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {data.weeklyProjects && data.weeklyProjects.length === 7 && (
        <section className="market-card">
          <h3>지난 7주 프로젝트 등록</h3>
          <WeeklyBarChart buckets={data.weeklyProjects} />
        </section>
      )}

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

function WeeklyBarChart({ buckets }: { buckets: number[] }) {
  const max = Math.max(1, ...buckets)
  return (
    <svg viewBox="0 0 420 140" className="market-chart" role="img" aria-label="지난 7주 프로젝트 등록 분포">
      <defs>
        <linearGradient id="mkt-bar-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      {buckets.map((count, i) => {
        const x = i * 56 + 22
        const h = Math.max(3, (count / max) * 94)
        const y = 108 - h
        return (
          <g key={i}>
            <rect x={x} y={y} width={38} height={h} rx={5} fill="url(#mkt-bar-g)" />
            {count > 0 && (
              <text x={x + 19} y={y - 5} textAnchor="middle" fontSize="10.5" fill="#0B1E3F" fontWeight={800}>{count}</text>
            )}
            <text x={x + 19} y={126} textAnchor="middle" fontSize="10" fill="#94A3B8">
              {i === 6 ? '이번주' : `${6 - i}주전`}
            </text>
          </g>
        )
      })}
    </svg>
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
   Members (market_users 관리)
============================================================= */

type Member = {
  id: number
  email: string
  name: string
  userType: string
  phone: string | null
  status: string
  createdAt: string
  agencySlug: string | null
  agencyVerified: boolean | null
}

function MembersTab() {
  const toast = useToast()
  const [items, setItems] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'advertiser' | 'agency'>('all')
  const [busy, setBusy] = useState<number | null>(null)

  function load() {
    setLoading(true)
    void apiFetch<{ items: Member[] }>(`/api/admin/market/members?status=${statusFilter}&type=${typeFilter}`)
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false))
  }
  useEffect(load, [statusFilter, typeFilter])

  async function toggleStatus(m: Member) {
    const next = m.status === 'suspended' ? 'active' : 'suspended'
    if (next === 'suspended' && !confirm(`${m.name}(${m.email}) 계정을 정지하시겠습니까?`)) return
    setBusy(m.id)
    try {
      await apiFetch(`/api/admin/market/members/${m.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      })
      toast.success(next === 'suspended' ? `${m.name} 정지 완료` : `${m.name} 활성 복구`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '상태 변경 실패')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="market-tab-content">
      <div className="market-toolbar">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} className="market-select">
          <option value="all">전체 유형</option>
          <option value="advertiser">광고주</option>
          <option value="agency">대행사</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="market-select">
          <option value="all">전체 상태</option>
          <option value="active">활성</option>
          <option value="suspended">정지</option>
        </select>
        <span className="market-count"><strong>{items.length}</strong>명</span>
        <button type="button" className="market-btn" onClick={load}><RefreshCw size={12} strokeWidth={2} /> 새로고침</button>
      </div>

      {loading ? (
        <div className="market-skeleton">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="market-empty">조건에 맞는 회원이 없습니다.</div>
      ) : (
        <div className="market-table-wrap">
          <table className="market-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>이메일</th>
                <th>유형</th>
                <th>대행사</th>
                <th>가입일</th>
                <th>상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td className="mono">#{m.id}</td>
                  <td className="market-cell-title">{m.name}</td>
                  <td className="mono">{m.email}</td>
                  <td><span className="market-badge">{m.userType === 'agency' ? '대행사' : '광고주'}</span></td>
                  <td>
                    {m.agencySlug ? (
                      <a href={`/agency/${m.agencySlug}`} target="_blank" rel="noopener" style={{ color: 'var(--oc-royal)' }}>
                        {m.agencyVerified ? '✓ 인증' : '미인증'}
                      </a>
                    ) : '—'}
                  </td>
                  <td>{fmtRel(m.createdAt)}</td>
                  <td>
                    {m.status === 'suspended' ? (
                      <span className="market-pill badge-gray">정지</span>
                    ) : (
                      <span className="market-pill badge-mint">활성</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`market-btn-sm ${m.status === 'suspended' ? 'market-btn-approve' : 'market-btn-danger'}`}
                      disabled={busy === m.id}
                      onClick={() => toggleStatus(m)}
                    >
                      {m.status === 'suspended' ? <><RotateCcw size={11} /> 복구</> : <><Ban size={11} /> 정지</>}
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
   Drafts (비회원 프로젝트 접수 승인 큐)
============================================================= */

type Draft = {
  id: number
  requesterName: string
  requesterContact: string
  industry: string
  marketingType: string
  budgetRange: string
  message: string
  status: string
  submittedAt: string
  reviewedAt: string | null
  approvedProjectId: number | null
  rejectReason: string | null
  paymentStatus: string
  paymentAmount: number
  paymentReceivedAt: string | null
}

function DraftsTab() {
  const toast = useToast()
  const [items, setItems] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [busy, setBusy] = useState<number | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  function load() {
    setLoading(true)
    setSelected(new Set())
    void apiFetch<{ items: Draft[] }>(`/api/admin/market/drafts?status=${filter}`)
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  const pendingItems = items.filter((d) => d.status === 'pending')
  const allSelected = pendingItems.length > 0 && pendingItems.every((d) => selected.has(d.id))

  function toggleOne(id: number) {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(pendingItems.map((d) => d.id)))
  }

  async function bulkApprove() {
    if (selected.size === 0) return
    if (!confirm(`선택한 ${selected.size}건을 일괄 승인합니다. 계속하시겠습니까?`)) return
    setBulkBusy(true)
    let ok = 0, fail = 0
    for (const id of selected) {
      try {
        await apiFetch(`/api/admin/market/drafts/${id}/approve`, { method: 'POST' })
        ok++
      } catch { fail++ }
    }
    setBulkBusy(false)
    if (ok > 0) toast.success(`${ok}건 일괄 승인 완료${fail > 0 ? ` (${fail}건 실패)` : ''}`)
    else if (fail > 0) toast.error(`${fail}건 실패`)
    load()
  }

  async function approve(id: number) {
    setBusy(id)
    try {
      const res = await apiFetch<{ ok: true; projectId: number }>(
        `/api/admin/market/drafts/${id}/approve`,
        { method: 'POST' },
      )
      toast.success(`초안 #${id} 승인 완료 — 프로젝트 #${res.projectId} 공개`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '승인 실패')
    } finally {
      setBusy(null)
    }
  }

  async function markPaid(id: number) {
    const ref = prompt('결제 참조(이체 증빙번호 등)를 입력하세요 (선택):', '')
    if (ref === null) return
    setBusy(id)
    try {
      await apiFetch(`/api/admin/market/drafts/${id}/payment`, {
        method: 'POST',
        body: JSON.stringify({ method: 'bank_transfer', reference: ref || undefined }),
      })
      toast.success(`초안 #${id} 결제 완료 처리`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '결제 처리 실패')
    } finally { setBusy(null) }
  }

  async function refund(id: number) {
    if (!confirm(`초안 #${id}의 등록비를 환불 처리합니다. 계속하시겠습니까?`)) return
    setBusy(id)
    try {
      await apiFetch(`/api/admin/market/drafts/${id}/refund`, { method: 'POST' })
      toast.info(`초안 #${id} 환불 처리`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '환불 처리 실패')
    } finally { setBusy(null) }
  }

  async function reject(id: number) {
    const reason = prompt('반려 사유를 입력해주세요 (요청자에게는 보이지 않습니다):', '')
    if (reason === null) return
    setBusy(id)
    try {
      await apiFetch(`/api/admin/market/drafts/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || '반려' }),
      })
      toast.info(`초안 #${id} 반려 완료`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '반려 실패')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="market-tab-content">
      <div className="market-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="market-select">
          <option value="pending">승인 대기</option>
          <option value="approved">승인됨</option>
          <option value="rejected">반려됨</option>
          <option value="all">전체</option>
        </select>
        <span className="market-count"><strong>{items.length}</strong>건</span>
        {filter === 'pending' && pendingItems.length > 0 && (
          <>
            <label className="market-bulk-check">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>전체 선택 ({selected.size}/{pendingItems.length})</span>
            </label>
            {selected.size > 0 && (
              <button type="button" className="market-btn-sm market-btn-approve" onClick={bulkApprove} disabled={bulkBusy}>
                <CheckCircle2 size={11} /> {selected.size}건 일괄 승인
              </button>
            )}
          </>
        )}
        <button type="button" className="market-btn" onClick={load} style={{ marginLeft: 'auto' }}><RefreshCw size={12} strokeWidth={2} /> 새로고침</button>
      </div>

      {loading ? (
        <div className="market-skeleton">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="market-empty">
          {filter === 'pending' ? '승인 대기 중인 초안이 없습니다. 🎉' : '해당 상태의 초안이 없습니다.'}
        </div>
      ) : (
        <ul className="market-draft-list">
          {items.map((d) => (
            <li key={d.id} className={`market-draft-card status-${d.status}${selected.has(d.id) ? ' is-selected' : ''}`}>
              <header className="market-draft-head">
                <div>
                  {d.status === 'pending' && (
                    <input
                      type="checkbox"
                      className="market-draft-check"
                      checked={selected.has(d.id)}
                      onChange={() => toggleOne(d.id)}
                      aria-label={`${d.id} 선택`}
                    />
                  )}
                  <span className="market-draft-id">#{d.id}</span>
                  <strong>{d.requesterName}</strong>
                  <span className="market-draft-contact">{d.requesterContact}</span>
                </div>
                <StatusPill status={d.status} />
              </header>

              <div className="market-draft-meta">
                <span className="market-draft-chip">{d.industry}</span>
                <span className="market-draft-chip">{d.marketingType}</span>
                <span className="market-draft-chip">{d.budgetRange}</span>
                <span
                  className="market-draft-chip"
                  style={{
                    background: d.paymentStatus === 'paid' ? '#DCFCE7' : d.paymentStatus === 'refunded' ? '#E0E7FF' : '#FEF3C7',
                    color: d.paymentStatus === 'paid' ? '#14532D' : d.paymentStatus === 'refunded' ? '#3730A3' : '#854D0E',
                    fontWeight: 700,
                  }}
                >
                  {d.paymentStatus === 'paid' ? '✓ 결제완료' : d.paymentStatus === 'refunded' ? '↺ 환불됨' : '• 미결제'} ₩{(d.paymentAmount ?? 10000).toLocaleString()}
                </span>
              </div>

              {d.message && <p className="market-draft-msg">{d.message}</p>}

              {d.status === 'rejected' && d.rejectReason && (
                <div className="market-draft-reject-note">반려 사유: {d.rejectReason}</div>
              )}
              {d.status === 'approved' && d.approvedProjectId && (
                <div className="market-draft-approved-note">
                  ✓ 프로젝트 <a href={`/project/${d.approvedProjectId}`} target="_blank" rel="noopener">#{d.approvedProjectId}</a>로 공개됨
                </div>
              )}

              <div className="market-draft-footer">
                <time>{fmtRel(d.submittedAt)}</time>
                {d.status === 'pending' && (
                  <div className="market-draft-actions">
                    {d.paymentStatus !== 'paid' && (
                      <button
                        type="button"
                        className="market-btn-sm"
                        onClick={() => markPaid(d.id)}
                        disabled={busy === d.id}
                        style={{ background: '#F59E0B', color: 'white' }}
                      >
                        결제 완료 처리
                      </button>
                    )}
                    {d.paymentStatus === 'paid' && d.status === 'pending' && (
                      <button
                        type="button"
                        className="market-btn-sm"
                        onClick={() => refund(d.id)}
                        disabled={busy === d.id}
                        style={{ background: '#E5E7EB', color: '#374151' }}
                      >
                        환불
                      </button>
                    )}
                    <button
                      type="button"
                      className="market-btn-sm market-btn-approve"
                      onClick={() => approve(d.id)}
                      disabled={busy === d.id || d.paymentStatus !== 'paid'}
                      title={d.paymentStatus !== 'paid' ? '결제 완료 후 승인 가능' : undefined}
                    >
                      <CheckCircle2 size={11} /> 승인 · 공개
                    </button>
                    <button
                      type="button"
                      className="market-btn-sm market-btn-danger"
                      onClick={() => reject(d.id)}
                      disabled={busy === d.id}
                    >
                      <XCircle size={11} /> 반려
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:  { label: '대기', cls: 'badge-amber' },
    approved: { label: '승인', cls: 'badge-mint' },
    rejected: { label: '반려', cls: 'badge-gray' },
  }
  const m = map[status] ?? { label: status, cls: 'badge-gray' }
  return <span className={`market-pill ${m.cls}`}>{m.label}</span>
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
  const toast = useToast()
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
    try {
      await apiFetch(`/api/admin/market/projects/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      })
      toast.success(`프로젝트 #${id} 단계를 "${stage}"로 전환했습니다.`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '단계 전환 실패')
    }
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
  const toast = useToast()
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
    try {
      await apiFetch(`/api/admin/market/agencies/${id}/verified`, {
        method: 'PATCH',
        body: JSON.stringify({ verified }),
      })
      toast.success(verified ? `대행사 #${id} 인증 승인` : `대행사 #${id} 인증 해제`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '인증 상태 변경 실패')
    }
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
  const toast = useToast()
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
    try {
      await apiFetch(`/api/admin/market/consultations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      const labelMap = { pending: '대기', contacted: '연락 완료', closed: '종료' }
      toast.success(`상담 #${id} 상태를 "${labelMap[status]}"로 변경`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '상태 변경 실패')
    }
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
  const toast = useToast()
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
    try {
      await apiFetch(`/api/admin/market/reviews/${id}`, { method: 'DELETE' })
      toast.success(`리뷰 #${id} 삭제 완료`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '리뷰 삭제 실패')
    }
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
   Verifications — 대행사 사업자등록증 검증 큐
============================================================= */

type Verification = {
  id: number
  slug: string
  name: string
  verified: boolean
  status: 'none' | 'submitted' | 'approved' | 'rejected'
  submittedAt: string | null
  reviewedAt: string | null
  rejectReason: string | null
  businessRegNo: string | null
  ceoName: string | null
  businessRegImgUrl: string | null
  userId: number | null
  userEmail: string | null
  userName: string | null
}

function VerificationsTab() {
  const toast = useToast()
  const [items, setItems] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'submitted' | 'approved' | 'rejected' | 'all'>('submitted')
  const [busy, setBusy] = useState<number | null>(null)
  const [zoom, setZoom] = useState<string | null>(null)

  function load() {
    setLoading(true)
    void apiFetch<{ items: Verification[] }>(`/api/admin/market/agency-verifications?status=${filter}`)
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false))
  }
  useEffect(load, [filter])

  async function approve(id: number) {
    if (!confirm(`대행사 #${id}를 검증 승인합니다. 계속하시겠습니까?`)) return
    setBusy(id)
    try {
      await apiFetch(`/api/admin/market/agencies/${id}/verify-approve`, { method: 'POST' })
      toast.success(`대행사 #${id} 검증 승인`)
      load()
    } catch (err) { toast.error(err instanceof Error ? err.message : '승인 실패') } finally { setBusy(null) }
  }

  async function reject(id: number) {
    const reason = prompt('반려 사유 (대행사에게 노출됩니다):', '')
    if (reason === null) return
    setBusy(id)
    try {
      await apiFetch(`/api/admin/market/agencies/${id}/verify-reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || '검증 기준 미충족' }),
      })
      toast.info(`대행사 #${id} 검증 반려`)
      load()
    } catch (err) { toast.error(err instanceof Error ? err.message : '반려 실패') } finally { setBusy(null) }
  }

  return (
    <div className="market-tab-content">
      <div className="market-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="market-select">
          <option value="submitted">검토 대기</option>
          <option value="approved">승인됨</option>
          <option value="rejected">반려됨</option>
          <option value="all">전체</option>
        </select>
        <span className="market-count"><strong>{items.length}</strong>건</span>
      </div>

      {loading ? (
        <div className="market-skeleton">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="market-empty">
          {filter === 'submitted' ? '검증 대기중인 대행사가 없습니다.' : '해당 상태의 대행사가 없습니다.'}
        </div>
      ) : (
        <ul className="market-draft-list">
          {items.map((v) => (
            <li key={v.id} className={`market-draft-card status-${v.status === 'submitted' ? 'pending' : v.status}`}>
              <header className="market-draft-head">
                <div>
                  <span className="market-draft-id">#{v.id}</span>
                  <strong>{v.name}</strong>
                  {v.userEmail && <span className="market-draft-contact">{v.userEmail}</span>}
                </div>
                <StatusPill status={v.status === 'submitted' ? 'pending' : v.status} />
              </header>

              <div className="market-draft-meta">
                <span className="market-draft-chip">사업자번호: {v.businessRegNo ?? '—'}</span>
                <span className="market-draft-chip">대표자: {v.ceoName ?? '—'}</span>
                {v.verified && <span className="market-draft-chip" style={{ background: '#DCFCE7', color: '#14532D', fontWeight: 700 }}>✓ 이미 인증</span>}
              </div>

              {v.businessRegImgUrl && (
                <div style={{ margin: '10px 0' }}>
                  <img
                    src={v.businessRegImgUrl}
                    alt="사업자등록증"
                    onClick={() => setZoom(v.businessRegImgUrl)}
                    style={{ maxWidth: 240, maxHeight: 160, borderRadius: 6, border: '1px solid #E5E7EB', cursor: 'zoom-in' }}
                  />
                </div>
              )}

              {v.rejectReason && (
                <div className="market-draft-reject-note">반려 사유: {v.rejectReason}</div>
              )}

              <div className="market-draft-footer">
                <time>{v.submittedAt ? fmtRel(v.submittedAt) : '-'}</time>
                {v.status === 'submitted' && (
                  <div className="market-draft-actions">
                    <button
                      type="button"
                      className="market-btn-sm market-btn-approve"
                      onClick={() => approve(v.id)}
                      disabled={busy === v.id}
                    >
                      <CheckCircle2 size={11} /> 검증 승인
                    </button>
                    <button
                      type="button"
                      className="market-btn-sm market-btn-danger"
                      onClick={() => reject(v.id)}
                      disabled={busy === v.id}
                    >
                      <XCircle size={11} /> 반려
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {zoom && (
        <div
          onClick={() => setZoom(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'grid', placeItems: 'center', zIndex: 2000, cursor: 'zoom-out',
          }}
        >
          <img src={zoom} alt="사업자등록증 확대" style={{ maxWidth: '92vw', maxHeight: '92vh', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}

/* =============================================================
   Unused export pacifier (avoid dead-code TS warnings)
============================================================= */
export const _icons = { X }
