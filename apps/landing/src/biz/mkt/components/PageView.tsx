import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { LPHeader } from '../../../components/LPHeader'
import { LPFooter } from '../../../components/LPFooter'
import { apiFetch } from '../../../com/api/client'
import { pageUrl } from '../../../com/url'
import { sanitizeHtml } from '../../../com/sanitize'
import '../../../landing-page.css'

type Page = { id: number; slug: string; title: string; contentHtml: string; publishedAt: string | null }
type PageSummary = { id: number; slug: string; title: string }
type TocItem = { id: string; text: string; level: number }

function extractToc(html: string): TocItem[] {
  const items: TocItem[] = []
  const regex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, '').trim()
    const id = text.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/(^-|-$)/g, '')
    items.push({ id, text, level: Number(match[1]) })
  }
  return items
}

function injectHeadingIds(html: string, toc: TocItem[]): string {
  let result = html
  for (const item of toc) {
    const pattern = new RegExp(`(<h${item.level})(>)`, 'i')
    result = result.replace(pattern, `$1 id="${item.id}"$2`)
  }
  return result
}

function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null
  return (
    <aside className="oc-page-toc" aria-label="목차">
      <h4>목차</h4>
      <ul>
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'oc-toc-indent' : ''}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function PageNav({ pages, currentSlug }: { pages: PageSummary[]; currentSlug: string }) {
  const idx = pages.findIndex((p) => p.slug === currentSlug)
  const prev = idx > 0 ? pages[idx - 1] : null
  const next = idx < pages.length - 1 ? pages[idx + 1] : null
  if (!prev && !next) return null

  return (
    <nav className="oc-page-nav" aria-label="페이지 이동">
      {prev ? (
        <a href={pageUrl(prev.slug)} className="oc-page-nav-link">
          <span className="oc-page-nav-dir"><ArrowLeft size={13} strokeWidth={2.2} aria-hidden /> 이전</span>
          <span className="oc-page-nav-title">{prev.title}</span>
        </a>
      ) : <div />}
      {next ? (
        <a href={pageUrl(next.slug)} className="oc-page-nav-link oc-page-nav-next">
          <span className="oc-page-nav-dir">다음 <ArrowRight size={13} strokeWidth={2.2} aria-hidden /></span>
          <span className="oc-page-nav-title">{next.title}</span>
        </a>
      ) : <div />}
    </nav>
  )
}

export function PageView({ slug }: { slug: string }) {
  const [page, setPage] = useState<Page | null>(null)
  const [pages, setPages] = useState<PageSummary[]>([])
  const [error, setError] = useState(false)

  useEffect(() => { apiFetch<PageSummary[]>('/api/public/pages').then(setPages).catch(() => {}) }, [])
  useEffect(() => {
    setError(false)
    setPage(null)
    apiFetch<Page>(`/api/public/pages/${slug}`).then(setPage).catch(() => setError(true))
  }, [slug])

  const toc = useMemo(() => page ? extractToc(page.contentHtml) : [], [page])
  const processedHtml = useMemo(() => {
    if (!page) return ''
    const withIds = injectHeadingIds(page.contentHtml, toc)
    return sanitizeHtml(withIds)
  }, [page, toc])

  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main className="oc-page-main">
        <div className="oc-container oc-page-grid">
          <div className="oc-page-content">
            {!page && !error && <div className="oc-page-loading">불러오는 중…</div>}

            {error && (
              <div className="oc-page-error" role="alert">
                <h1>페이지를 찾을 수 없습니다</h1>
                <p>요청하신 페이지는 존재하지 않거나 비공개 처리되었습니다.</p>
                <a href="/" className="oc-btn oc-btn-primary">홈으로 돌아가기</a>
              </div>
            )}

            {page && !error && (
              <article className="oc-page-article">
                <header className="oc-page-article-head">
                  <span className="oc-page-slug">/{page.slug}</span>
                  {page.publishedAt && <time>{new Date(page.publishedAt).toLocaleDateString('ko-KR')}</time>}
                </header>

                <div className="oc-prose" dangerouslySetInnerHTML={{ __html: processedHtml }} />

                <PageNav pages={pages} currentSlug={slug} />
              </article>
            )}
          </div>

          {page && toc.length >= 2 && <TableOfContents items={toc} />}
        </div>
      </main>
      <LPFooter />
    </div>
  )
}
