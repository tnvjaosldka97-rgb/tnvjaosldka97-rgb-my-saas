import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

type Props = { children: ReactNode; appName?: string }
type State = { err: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null }

  static getDerivedStateFromError(err: Error): State {
    return { err }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', err, info.componentStack)
  }

  reset = () => this.setState({ err: null })

  render() {
    if (this.state.err) {
      return <ErrorFallback err={this.state.err} onReset={this.reset} appName={this.props.appName} />
    }
    return this.props.children
  }
}

function ErrorFallback({ err, onReset, appName }: { err: Error; onReset: () => void; appName?: string }) {
  return (
    <div className="oc-errbound">
      <div className="oc-errbound-card">
        <div className="oc-errbound-icon" aria-hidden>
          <AlertTriangle size={32} strokeWidth={1.8} />
        </div>
        <h1>예상치 못한 오류가 발생했어요</h1>
        <p>
          {appName ? `${appName}에서 ` : ''}페이지를 렌더링하는 도중 문제가 생겼습니다.
          잠시 후 다시 시도하거나 홈으로 이동해주세요.
        </p>
        <details className="oc-errbound-details">
          <summary>기술 정보 (운영팀 공유용)</summary>
          <pre>{err.name}: {err.message}</pre>
        </details>
        <div className="oc-errbound-actions">
          <button type="button" className="oc-btn oc-btn-primary" onClick={onReset}>
            <RotateCcw size={14} strokeWidth={2} aria-hidden /> 다시 시도
          </button>
          <a href="/" className="oc-btn oc-btn-outline">
            <Home size={14} strokeWidth={2} aria-hidden /> 홈으로
          </a>
        </div>
      </div>
    </div>
  )
}
