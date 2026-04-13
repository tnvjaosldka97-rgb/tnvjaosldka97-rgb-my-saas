import { Section } from './com/ui/Section'
import { FeatureGrid } from './biz/mkt/components/FeatureGrid'
import { HeroPanel } from './biz/mkt/components/HeroPanel'
import { DownloadPanel } from './biz/mkt/components/DownloadPanel'
import { StackDetail } from './biz/mkt/components/StackDetail'
import { ModuleList } from './biz/mkt/components/ModuleList'
import { SamplePages } from './biz/mkt/components/SamplePages'
import { usePublicBootstrap } from './biz/mkt/hooks/usePublicBootstrap'
import { adminUrl, pageUrl } from './com/url'

const GITHUB_URL = 'https://github.com/johunsang/octoworkers'

export function App() {
  const { data, loading } = usePublicBootstrap()

  const metrics = [
    { label: 'Stack', value: data?.settings?.brand ?? 'Hono + D1' },
    { label: 'Runtime', value: 'Cloudflare Workers' },
    { label: 'License', value: '교육용 오픈' },
  ]

  return (
    <main className="landing-shell">
      <nav className="top-nav">
        <strong className="nav-brand">옥토워커스</strong>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#get-started">Quick Start</a>
          <a href="#docs">Docs</a>
          <a href="#pricing">Pricing</a>
          <a href={adminUrl()} className="nav-cta">Admin Console</a>
        </div>
      </nav>
      <HeroPanel metrics={metrics} loading={loading} />

      <a href={pageUrl('my-project-setup')} className="setup-banner">
        <span className="setup-banner-badge">Step-by-Step Guide</span>
        <strong>내 SaaS 만들기: 처음부터 배포까지 완벽 가이드</strong>
        <p>사전 설치 → 클론 → AI 세팅 → 테마 → 콘텐츠 → 배포. 14단계를 따라하면 사이트가 완성됩니다.</p>
        <span className="setup-banner-arrow">가이드 시작하기 &rarr;</span>
      </a>

      <Section id="features" eyebrow="AI-First Development" title="AI에게 말하면 SaaS가 만들어집니다"
        description="CLAUDE.md 문서 시스템으로 AI가 프로젝트를 완벽히 이해합니다. 코드를 직접 쓸 필요 없이 기능 요청, 버그 수정, 배포를 자연어로 수행하세요.">
        <FeatureGrid />
      </Section>

      <Section eyebrow="Tech Stack" title="Cloudflare 네이티브 풀스택"
        description="모든 인프라가 Cloudflare 안에서 돌아갑니다. 별도 서버, 별도 DB, 별도 스토리지 없이 하나의 플랫폼에서 해결됩니다.">
        <StackDetail />
      </Section>

      <Section id="modules" eyebrow="Modules" title="14개 비즈니스 모듈이 기본 탑재"
        description="3글자 약어 기반 모듈 시스템. 필요한 것만 남기고 나머지는 제거하세요. 새 모듈은 템플릿에서 복사해서 추가합니다.">
        <ModuleList />
      </Section>

      <DownloadPanel />

      <Section id="docs" eyebrow="Documentation" title="모든 설정을 AI에게 맡기세요"
        description="각 가이드에 AI 프롬프트 예시가 포함되어 있습니다. 가이드를 읽고 AI에게 말하면 끝.">
        <div className="module-list">
          <a href={pageUrl('ai-dev-guide')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">AI</span>
            <div><strong>AI 개발 가이드</strong><p>서브에이전트, Hooks, MCP, Skills, 프롬프트 작성법</p></div>
          </a>
          <a href={pageUrl('guide')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">CF</span>
            <div><strong>Cloudflare 실전 가이드</strong><p>가입 → Wrangler → D1/KV → 배포 14단계</p></div>
          </a>
          <a href={pageUrl('token-setup')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">KEY</span>
            <div><strong>토큰 & 권한 설정</strong><p>wrangler login, API 토큰 생성, 권한 매핑, CI/CD</p></div>
          </a>
          <a href={pageUrl('domain-setup')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">DNS</span>
            <div><strong>도메인 설정</strong><p>커스텀 도메인, DNS, SSL, 멀티 도메인 구조</p></div>
          </a>
          <a href={pageUrl('auth-setup')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">AUTH</span>
            <div><strong>로그인 & 인증</strong><p>GitHub OAuth, JWT 세션, Cloudflare Access</p></div>
          </a>
          <a href={pageUrl('ai-setup')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">LLM</span>
            <div><strong>AI 기능 설정</strong><p>Workers AI, AI Gateway, 외부 AI 연동</p></div>
          </a>
          <a href={pageUrl('email-setup')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">EML</span>
            <div><strong>이메일 설정</strong><p>Resend API, 도메인 인증, Email Routing</p></div>
          </a>
          <a href={pageUrl('db-rag-guide')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">DB</span>
            <div><strong>D1 & RAG 가이드</strong><p>D1 마이그레이션, Vectorize 시맨틱 검색, KV, R2</p></div>
          </a>
          <a href={pageUrl('design-guide')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">CSS</span>
            <div><strong>디자인 커스터마이징</strong><p>디자인 토큰, 컴포넌트 패턴, 테마 변경 프롬프트</p></div>
          </a>
          <a href={pageUrl('prerequisites')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">0</span>
            <div><strong>사전 설치 가이드</strong><p>Node.js, pnpm, Wrangler, Claude Code 설치 (macOS/Windows/Linux)</p></div>
          </a>
          <a href={pageUrl('my-project-setup')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">1</span>
            <div><strong>내 프로젝트 세팅</strong><p>클론 → 프로젝트명 교체 → 도메인 → 시크릿 → 문서 재생성 → 배포 14단계</p></div>
          </a>
          <a href={pageUrl('pricing-guide')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">$</span>
            <div><strong>요금제 완벽 가이드</strong><p>서비스별 요금, AWS 비교, 시나리오별 비용</p></div>
          </a>
          <a href={pageUrl('faq')} className="module-item" style={{ color: 'inherit' }}>
            <span className="module-code">?</span>
            <div><strong>FAQ</strong><p>시작, 비용, 기술, 배포, 보안, 문제 해결 30개 Q&A</p></div>
          </a>
        </div>
      </Section>

      <Section id="sample-pages" eyebrow="SaaS CMS" title="샘플 페이지를 직접 확인하세요"
        description="마크다운으로 작성한 CMS 페이지가 API를 통해 공개됩니다. 아래 탭을 클릭하면 실제 DB에서 읽어온 콘텐츠를 볼 수 있습니다.">
        <SamplePages />
      </Section>

      <Section eyebrow="Architecture" title="미들웨어부터 배포까지 설계됨"
        description="보안 헤더, 인증, CORS, ETag 캐싱이 미들웨어 스택으로 자동 적용됩니다. GitHub Actions CI/CD로 staging과 production을 분리 배포합니다.">
        <div className="ops-rail">
          <article><h3>보안 미들웨어</h3><p>CSP, HSTS, X-Frame-Options, nosniff가 모든 응답에 자동 적용. WebSocket은 예외 처리됨.</p></article>
          <article><h3>인증 시스템</h3><p>JWT 세션 + GitHub OAuth + Cloudflare Access 하이브리드. 허용 이메일 목록으로 접근 제어.</p></article>
          <article><h3>CI/CD 파이프라인</h3><p>PR마다 타입체크 + 테스트 + 빌드. develop → staging, main → production 자동 배포.</p></article>
        </div>
      </Section>

      <Section id="pricing" eyebrow="Cost Savings" title="AWS 대비 80~93% 비용 절감"
        description="옥토워커스 + Cloudflare 조합은 기존 클라우드 대비 압도적으로 저렴합니다.">
        <div className="feature-grid">
          <article>
            <h3>인프라 비용</h3>
            <p><strong style={{ color: '#ffb259', fontSize: '1.4em' }}>$5/월</strong>로 프로덕션 운영. AWS 동일 구성 $35~505/월. 이그레스 비용 $0, CPU 대기 시간 무과금, Cold Start 없음.</p>
          </article>
          <article>
            <h3>개발 비용</h3>
            <p><strong style={{ color: '#ffb259', fontSize: '1.4em' }}>11~16주 단축</strong>. 인증, 어드민, CRM, CMS, 이메일, CI/CD가 전부 포함. clone 후 AI에게 말하면 바로 시작.</p>
          </article>
        </div>
        <div className="ops-rail" style={{ marginTop: 18 }}>
          <article>
            <h3>MVP (500만 req/월)</h3>
            <p>AWS ~$35/월 → Cloudflare <strong style={{ color: '#4ade80' }}>$5/월</strong><br />86% 절감</p>
          </article>
          <article>
            <h3>중규모 (1억 req/월)</h3>
            <p>AWS ~$505/월 → Cloudflare <strong style={{ color: '#4ade80' }}>$38/월</strong><br />93% 절감</p>
          </article>
          <article>
            <h3>AI 앱 (1천만 req/월)</h3>
            <p>AWS ~$170/월 → Cloudflare <strong style={{ color: '#4ade80' }}>$35/월</strong><br />79% 절감. <a href={pageUrl('pricing-guide')} style={{ color: '#ffb259' }}>요금 상세 보기</a></p>
          </article>
        </div>
      </Section>

      <footer className="landing-footer">
        <div className="footer-links">
          <a href={pageUrl('guide')}>Cloudflare 가이드</a>
          <a href={pageUrl('pricing-guide')}>요금제 가이드</a>
          <a href={pageUrl('ai-dev-guide')}>AI 개발 가이드</a>
          <a href={adminUrl()}>Admin Console</a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <p>Built with Hono + Vite + D1 on Cloudflare Workers</p>
      </footer>
    </main>
  )
}
