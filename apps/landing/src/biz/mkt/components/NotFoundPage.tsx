import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import '../../../landing-page.css'

export function NotFoundPage() {
  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-404-main">
        <div className="oc-container">
          <div className="oc-404-card">
            <div className="oc-404-code" aria-hidden>404</div>
            <h1>페이지를 찾을 수 없어요</h1>
            <p>주소가 바뀌었거나, 일시적으로 접근할 수 없는 페이지일 수 있습니다.</p>
            <div className="oc-404-actions">
              <a href="/" className="oc-btn oc-btn-primary oc-btn-lg">홈으로 돌아가기</a>
              <a href="/#market" className="oc-btn oc-btn-outline oc-btn-lg">비교중인 마케팅 보기</a>
            </div>
            <div className="oc-404-hint">
              도움이 필요하시면 <a href="/pages/contact">문의 페이지</a>로 연락해주세요.
            </div>
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
