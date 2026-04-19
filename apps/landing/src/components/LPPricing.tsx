import { CheckCircle2, RotateCcw, BadgeCheck } from 'lucide-react'

type PolicyItem = {
  tag: string
  amount: string
  sub: string
  detail: string
  accent: 'amber' | 'royal' | 'mint'
  Icon: typeof CheckCircle2
}

const POLICY: PolicyItem[] = [
  {
    tag: '광고주 등록비',
    amount: '₩10,000',
    sub: '노쇼 방지금 · 계약 성사 시 전액 환불',
    detail: '매칭만 받고 연락이 끊기는 사례를 방지하기 위한 최소 안전장치입니다. 실제 계약이 성사되면 등록비를 그대로 돌려드립니다.',
    accent: 'amber',
    Icon: RotateCcw,
  },
  {
    tag: '성공 수수료 (구간제)',
    amount: '15% / 12%',
    sub: '월 150만 이하 15% · 초과 12% · 광고주 청구',
    detail: '계약이 실제 체결된 경우에만 부과됩니다. 소규모 프로젝트(월 150만↓)는 15%, 중·대형 프로젝트(월 150만↑)는 12%. 지원·견적·상담 단계에서는 어떠한 비용도 발생하지 않습니다.',
    accent: 'royal',
    Icon: CheckCircle2,
  },
  {
    tag: '대행사 참여',
    amount: '무료',
    sub: '월정액 · 수주 수수료 모두 0원',
    detail: '검증 심사만 통과하면 별도 비용 없이 모든 프로젝트에 지원·수주할 수 있습니다. 실적·리뷰가 쌓일수록 상위에 노출됩니다.',
    accent: 'mint',
    Icon: BadgeCheck,
  },
]

export function LPPricing() {
  return (
    <section id="pricing" className="oc-section oc-section-policy">
      <div className="oc-container">
        <div className="oc-policy-head">
          <span className="oc-section-eyebrow">요금 정책</span>
          <h2>숨은 수수료 없이, 성사된 계약에만 과금합니다.</h2>
          <p className="oc-section-sub">
            광고주는 노쇼 방지금 1만원만 선결제, 계약 성사 시 전액 환불됩니다.
            체결된 월 광고비 기준 <strong>150만원 이하 15%</strong>, <strong>초과분 12%</strong>만 성공 수수료로 받습니다.
          </p>
        </div>

        <div className="oc-policy-grid">
          {POLICY.map((p) => {
            const Icon = p.Icon
            return (
              <article key={p.tag} className={`oc-policy-card oc-policy-${p.accent}`}>
                <div className="oc-policy-icon" aria-hidden><Icon size={18} strokeWidth={2.2} /></div>
                <span className="oc-policy-tag">{p.tag}</span>
                <span className="oc-policy-amount">{p.amount}</span>
                <span className="oc-policy-sub">{p.sub}</span>
                <p className="oc-policy-detail">{p.detail}</p>
              </article>
            )
          })}
        </div>

        <div className="oc-policy-note">
          <strong>결제 방식</strong>
          <span>
            등록비는 네이버페이·카카오페이·계좌이체로 선결제 · 성공 수수료는 계약 체결 후 익월 정산 ·
            세금계산서는 법인/사업자 요청 시 발행합니다.
          </span>
        </div>
      </div>
    </section>
  )
}
