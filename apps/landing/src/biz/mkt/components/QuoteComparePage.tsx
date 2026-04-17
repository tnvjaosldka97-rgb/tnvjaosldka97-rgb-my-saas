import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import '../../../landing-page.css'

// 오픈 입찰 모델로 변경되어 견적서 내용은 비공개입니다.
// 이 페이지는 공개 비교 테이블을 제공하지 않고, 올바른 플로우로 안내만 합니다.
export function QuoteComparePage({ initialProjectId }: { initialProjectId?: number }) {
  const back = initialProjectId ? `/project/${initialProjectId}` : '/'
  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-auth-main">
        <div className="oc-container oc-auth-wrap">
          <div className="oc-auth-card">
            <h1>견적서는 공개되지 않습니다</h1>
            <p className="oc-auth-sub">
              마케팅천재야는 <strong>오픈 입찰</strong> 모델로 운영됩니다.
              프로젝트에 지원한 대행사의 견적서는 <strong>비공개</strong>이며, 광고주가 지원자를 검토한 뒤 선정된 파트너에게만 공개됩니다.
            </p>
            <ul className="oc-cta-perks" style={{ marginTop: 14, marginBottom: 20 }}>
              <li>✓ 대행사는 프로젝트 상세에서 "프로젝트 지원" 버튼으로 지원합니다</li>
              <li>✓ 광고주는 마이페이지에서 지원자를 검토 · 선정합니다</li>
              <li>✓ 선정된 파트너와 계약 · 견적서를 직접 논의합니다</li>
            </ul>
            <div className="oc-form-actions">
              <a href={back} className="oc-btn oc-btn-outline">
                {initialProjectId ? '프로젝트로 돌아가기' : '홈으로'}
              </a>
              <a href="/dashboard" className="oc-btn oc-btn-primary-blue">대시보드</a>
            </div>
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
