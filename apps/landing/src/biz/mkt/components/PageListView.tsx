import { useEffect, useState } from 'react'
import { FileText, ArrowRight } from 'lucide-react'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { apiFetch } from '../../../com/api/client'
import { pageUrl } from '../../../com/url'
import '../../../landing-page.css'

type PageSummary = { id: number; slug: string; title: string; publishedAt: string | null }

export function PageListView() {
  const [pages, setPages] = useState<PageSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<PageSummary[]>('/api/public/pages').then(setPages).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-pagelist-main">
        <div className="oc-container">
          <header className="oc-pagelist-header">
            <span className="oc-section-eyebrow">공식 문서</span>
            <h1>OnlyUp Compare 가이드 & 정책</h1>
            <p>이용 안내, 요금, 법적 고지 등 모든 공식 문서를 한곳에서 확인하세요.</p>
            <div className="oc-pagelist-meta">총 <strong>{pages.length}</strong>개 문서</div>
          </header>

          {loading && <div className="oc-page-loading">불러오는 중…</div>}

          <div className="oc-pagelist-grid">
            {pages.map((page, idx) => (
              <a key={page.id} href={pageUrl(page.slug)} className="oc-pagelist-card">
                <div className="oc-pagelist-card-num">{String(idx + 1).padStart(2, '0')}</div>
                <div className="oc-pagelist-card-body">
                  <div className="oc-pagelist-card-head">
                    <FileText size={14} strokeWidth={2} aria-hidden />
                    <span className="oc-pagelist-slug">/{page.slug}</span>
                  </div>
                  <h2>{page.title}</h2>
                  {page.publishedAt && (
                    <time>{new Date(page.publishedAt).toLocaleDateString('ko-KR')}</time>
                  )}
                </div>
                <ArrowRight size={16} strokeWidth={2} aria-hidden className="oc-pagelist-arrow" />
              </a>
            ))}
          </div>
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
