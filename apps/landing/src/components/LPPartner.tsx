const PERKS = [
  { icon: '🎯', title: '조건 맞는 프로젝트만', desc: '업종·예산·지역 필터로 내 전문 영역의 프로젝트만 받아봅니다.' },
  { icon: '📈', title: '실적이 곧 자산', desc: '완료한 프로젝트와 리뷰가 쌓여 상위 노출과 전환율로 이어집니다.' },
  { icon: '💼', title: '수수료 없는 직거래', desc: '광고주와 직접 계약하고 OnlyUp Compare는 검증·중개만 담당합니다.' },
]

const REQUIREMENTS = [
  '사업자 등록증 보유',
  '최근 6개월 내 마케팅 실적 3건 이상',
  '포트폴리오 또는 사례 자료',
]

export function LPPartner() {
  return (
    <section id="partner" className="oc-section oc-section-partner">
      <div className="oc-container">
        <div className="oc-partner-head">
          <div>
            <span className="oc-section-eyebrow oc-eyebrow-light">파트너 대행사 모집</span>
            <h2>좋은 광고주만 만나고 싶다면, 파트너가 되세요.</h2>
            <p className="oc-section-sub oc-sub-light">
              이미 68개 검증 대행사가 합류했습니다. 매주 평균 22건의 신규 프로젝트가 등록됩니다.
            </p>
          </div>
          <a href="#partner-apply" className="oc-btn oc-btn-amber oc-btn-lg">파트너 지원하기</a>
        </div>

        <div className="oc-partner-grid">
          {PERKS.map((p) => (
            <div key={p.title} className="oc-perk">
              <span className="oc-perk-icon" aria-hidden>{p.icon}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="oc-partner-req">
          <strong>지원 요건</strong>
          <ul>
            {REQUIREMENTS.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
