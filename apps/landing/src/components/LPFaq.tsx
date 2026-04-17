import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Faq = { q: string; a: string }

const FAQS: Faq[] = [
  {
    q: '정말 광고주는 100% 무료인가요?',
    a: '네. 프로젝트 등록 · 견적 수신 · 비교 · 계약 · 리뷰 작성까지 모든 기능이 무료이며, 숨은 수수료는 없습니다. 마케팅천재는 대행사 파트너십을 통해 운영됩니다.',
  },
  {
    q: '평균 첫 견적 28시간은 어떻게 계산되나요?',
    a: '최근 12개월 간 프로젝트 등록 시각과 첫 대행사 견적 제출 시각의 차이를 집계한 중앙값입니다. 업종·예산 규모에 따라 편차가 있을 수 있습니다.',
  },
  {
    q: '어떤 대행사가 검증을 통과하나요?',
    a: '사업자등록증 보유 · 최근 6개월 마케팅 실적 3건 이상 · 포트폴리오 또는 사례 자료를 제출한 뒤 운영팀 심사를 거친 대행사만 인증 뱃지를 받습니다. 심사는 영업일 기준 3~5일이 소요됩니다.',
  },
  {
    q: '견적 내용이 다른 대행사에게 공개되나요?',
    a: '아니요. 모든 견적은 광고주에게만 공개됩니다. 대행사는 자신의 견적만 확인할 수 있고, 다른 대행사의 가격·일정은 알 수 없습니다.',
  },
  {
    q: '계약 후 분쟁이 생기면 어떻게 하나요?',
    a: '운영팀이 1차 중재를 제공합니다. 양측의 계약서와 소통 기록을 확인해 해결 방안을 제시하며, 필요 시 환불·재집행 조정에도 참여합니다. 자세한 내용은 이용약관을 참고해 주세요.',
  },
  {
    q: '회원가입 없이도 사용 가능한가요?',
    a: '랜딩의 "간편 1분 등록" 혹은 프로젝트 상세 페이지의 "비회원 빠른 상담"을 통해 연락처만 남겨도 담당자가 연결해드립니다. 다만 프로젝트 상태 추적 · 대시보드 · 리뷰 작성은 로그인 후 사용할 수 있습니다.',
  },
]

export function LPFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="oc-section oc-section-faq">
      <div className="oc-container oc-faq-grid">
        <div className="oc-faq-head">
          <span className="oc-section-eyebrow">자주 묻는 질문</span>
          <h2>궁금증은 여기서 한 번에 해결됩니다.</h2>
          <p className="oc-section-sub">
            이용 전에 확인하고 싶은 질문을 정리했습니다. 더 알고 싶은 내용이 있다면 <a href="/pages/contact">문의 페이지</a>로 연락해주세요.
          </p>
        </div>

        <ul className="oc-faq-list" aria-label="FAQ">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <li key={i} className={`oc-faq-item${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="oc-faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{f.q}</span>
                  <ChevronDown size={16} strokeWidth={2} aria-hidden className="oc-faq-caret" />
                </button>
                <div className="oc-faq-a" role="region" aria-hidden={!isOpen}>
                  <p>{f.a}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
