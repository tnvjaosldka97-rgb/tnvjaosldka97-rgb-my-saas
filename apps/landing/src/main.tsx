import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { PageView } from './biz/mkt/components/PageView'
import { PageListView } from './biz/mkt/components/PageListView'
import { ProjectDetailPage } from './biz/mkt/components/ProjectDetailPage'
import { ApplicantsManagePage } from './biz/mkt/components/ApplicantsManagePage'
import { QuoteComparePage } from './biz/mkt/components/QuoteComparePage'
import { LoginPage } from './biz/mkt/components/LoginPage'
import { RegisterPage } from './biz/mkt/components/RegisterPage'
import { DashboardPage } from './biz/mkt/components/DashboardPage'
import { CreateProjectPage } from './biz/mkt/components/CreateProjectPage'
import { SubmitQuotePage } from './biz/mkt/components/SubmitQuotePage'
import { NotFoundPage } from './biz/mkt/components/NotFoundPage'
import { AgencyDetailPage } from './biz/mkt/components/AgencyDetailPage'
import { NotificationsPage } from './biz/mkt/components/NotificationsPage'
import { SearchPage } from './biz/mkt/components/SearchPage'
import { ToastProvider } from './com/ui/Toast'
import { ErrorBoundary } from './com/ui/ErrorBoundary'
import { isSaas } from './com/url'
import './styles.css'

function Router() {
  const path = window.location.pathname
    .replace(/^\/landing/, '')
    .replace(/\/$/, '') || '/'

  // /project/:id/applicants 오너 지원자 관리
  const applicantsMatch = path.match(/^\/project\/(\d+)\/applicants$/)
  if (applicantsMatch) {
    return <ApplicantsManagePage projectId={Number.parseInt(applicantsMatch[1], 10)} />
  }

  // /project/:id/quote/submit 견적 제출
  const submitMatch = path.match(/^\/project\/(\d+)\/quote\/submit$/)
  if (submitMatch) {
    return <SubmitQuotePage id={Number.parseInt(submitMatch[1], 10)} />
  }

  // /project/:id/edit 프로젝트 편집
  const projectEditMatch = path.match(/^\/project\/(\d+)\/edit$/)
  if (projectEditMatch) {
    return <CreateProjectPage editId={Number.parseInt(projectEditMatch[1], 10)} />
  }

  // /project/:id 프로젝트 상세
  const projectMatch = path.match(/^\/project\/(\d+)$/)
  if (projectMatch) {
    return <ProjectDetailPage id={Number.parseInt(projectMatch[1], 10)} />
  }

  // /agency/:slug 대행사 상세
  const agencyMatch = path.match(/^\/agency\/([a-z0-9가-힣-]+)$/)
  if (agencyMatch) {
    return <AgencyDetailPage slug={agencyMatch[1]} />
  }

  if (path === '/project/create') return <CreateProjectPage />
  if (path === '/login') return <LoginPage />
  if (path === '/register') return <RegisterPage />
  if (path === '/dashboard') return <DashboardPage />
  if (path === '/notifications') return <NotificationsPage />
  if (path === '/search') {
    const q = new URLSearchParams(window.location.search).get('q') ?? ''
    return <SearchPage initialQuery={q} />
  }
  if (path === '/quotes/compare') {
    const initialId = new URLSearchParams(window.location.search).get('projectId')
    return <QuoteComparePage initialProjectId={initialId ? Number.parseInt(initialId, 10) : undefined} />
  }

  // /pages/:slug 경로
  if (path.startsWith('/pages/')) {
    return <PageView slug={path.replace('/pages/', '')} />
  }

  // app.my-saas.com에서 /:slug 직접 접근
  if (isSaas && path !== '/' && !path.startsWith('/assets')) {
    const slug = path.replace(/^\//, '')
    if (slug && !slug.includes('.')) {
      return <PageView slug={slug} />
    }
  }

  // app.my-saas.com 루트: CMS 페이지 목록
  if (isSaas) {
    return <PageListView />
  }

  // my-saas.com 루트: 마케팅 랜딩
  if (path === '/') return <App />

  // my-saas.com의 정의되지 않은 경로 — 404
  return <NotFoundPage />
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ToastProvider>
      <ErrorBoundary appName="마케팅천재야">
        <Router />
      </ErrorBoundary>
    </ToastProvider>
  </StrictMode>,
)
