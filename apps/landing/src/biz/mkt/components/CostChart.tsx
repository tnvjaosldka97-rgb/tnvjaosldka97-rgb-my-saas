import { pageUrl } from '../../../com/url'

const scenarios = [
  { label: 'MVP (500만 req)', aws: 35, cf: 5, save: 86 },
  { label: '중규모 (1억 req)', aws: 505, cf: 38, save: 93 },
  { label: 'AI 앱 (1천만 req)', aws: 170, cf: 35, save: 79 },
]

const devItems = [
  { label: '인증 시스템', weeks: 3 },
  { label: '어드민 대시보드', weeks: 4 },
  { label: 'CRM / 리드 관리', weeks: 3 },
  { label: 'CMS 페이지', weeks: 3 },
  { label: '이메일 시스템', weeks: 2 },
  { label: 'CI/CD 파이프라인', weeks: 1 },
]

export function CostChart() {
  const maxAws = Math.max(...scenarios.map(s => s.aws))

  return (
    <div className="cost-chart-wrap">
      <div className="cost-chart-section">
        <h3 className="cost-chart-title">월 인프라 비용 비교</h3>
        <div className="cost-chart">
          {scenarios.map((s) => (
            <div key={s.label} className="cost-row">
              <span className="cost-label">{s.label}</span>
              <div className="cost-bars">
                <div className="cost-bar-group">
                  <span className="cost-bar-label">AWS</span>
                  <div className="cost-bar-track">
                    <div className="cost-bar aws" style={{ width: `${(s.aws / maxAws) * 100}%` }} />
                  </div>
                  <span className="cost-value">${s.aws}</span>
                </div>
                <div className="cost-bar-group">
                  <span className="cost-bar-label">CF</span>
                  <div className="cost-bar-track">
                    <div className="cost-bar cf" style={{ width: `${(s.cf / maxAws) * 100}%` }} />
                  </div>
                  <span className="cost-value cost-highlight">${s.cf}</span>
                </div>
              </div>
              <span className="cost-save">-{s.save}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cost-chart-section">
        <h3 className="cost-chart-title">개발 기간 절감 (11~16주 → 0주)</h3>
        <div className="dev-chart">
          {devItems.map((d) => (
            <div key={d.label} className="dev-row">
              <span className="dev-label">{d.label}</span>
              <div className="dev-bar-track">
                <div className="dev-bar" style={{ width: `${(d.weeks / 4) * 100}%` }} />
                <div className="dev-bar-included" />
              </div>
              <span className="dev-weeks">{d.weeks}주 → <strong>포함</strong></span>
            </div>
          ))}
        </div>
      </div>

      <a href={pageUrl('pricing-guide')} className="cost-link">요금 상세 가이드 보기 &rarr;</a>
    </div>
  )
}
