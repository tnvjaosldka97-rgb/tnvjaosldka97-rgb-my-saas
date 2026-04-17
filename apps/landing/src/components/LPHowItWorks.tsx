type Step = {
  num: string
  title: string
  desc: string
  eta: string
  emoji: string
}

const STEPS: Step[] = [
  {
    num: '01',
    title: '프로젝트 1분 등록',
    desc: '업종과 예산, 원하는 마케팅 유형만 입력하면 끝. 회원가입 없이도 시작할 수 있습니다.',
    eta: '약 1분',
    emoji: '📝',
  },
  {
    num: '02',
    title: '검증 대행사 자동 매칭',
    desc: '포트폴리오·리뷰·업종 경험을 기반으로 적합한 대행사에게만 프로젝트가 노출됩니다.',
    eta: '즉시',
    emoji: '🎯',
  },
  {
    num: '03',
    title: '견적 비교 · 협상',
    desc: '평균 28시간 안에 3~5개 견적이 도착합니다. 가격·일정·실적을 한 화면에서 비교하세요.',
    eta: '평균 28시간',
    emoji: '📊',
  },
  {
    num: '04',
    title: '계약 · 진행 · 리뷰',
    desc: '선택한 대행사와 바로 계약하고, 완료 후 리뷰를 남기면 다음 광고주에게 도움이 됩니다.',
    eta: '프로젝트 기간',
    emoji: '🤝',
  },
]

export function LPHowItWorks() {
  return (
    <section id="guide" className="oc-section oc-section-guide">
      <div className="oc-container">
        <div className="oc-section-head">
          <span className="oc-section-eyebrow">이용 가이드</span>
          <h2>복잡한 대행사 선정, 4단계로 끝냅니다.</h2>
          <p className="oc-section-sub">
            직접 연락하고 견적 받고 비교하던 일을 모두 OnlyUp Compare가 대신합니다.
          </p>
        </div>

        <ol className="oc-steps" aria-label="이용 4단계">
          {STEPS.map((s) => (
            <li key={s.num} className="oc-step">
              <div className="oc-step-index">
                <span className="oc-step-num">{s.num}</span>
                <span className="oc-step-emoji" aria-hidden>{s.emoji}</span>
              </div>
              <div className="oc-step-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="oc-step-eta">⏱ {s.eta}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
