import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

type Props = { children: ReactNode }
type State = { err: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null }

  static getDerivedStateFromError(err: Error): State {
    return { err }
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[Admin ErrorBoundary]', err, info.componentStack)
  }

  reset = () => this.setState({ err: null })

  render() {
    if (this.state.err) {
      return (
        <div className="admin-errbound">
          <div className="admin-errbound-card">
            <AlertTriangle size={32} strokeWidth={1.8} className="admin-errbound-icon" aria-hidden />
            <h1>운영 콘솔 렌더링 실패</h1>
            <p>예상치 못한 오류로 콘솔이 표시되지 않았습니다.</p>
            <details>
              <summary>기술 정보</summary>
              <pre>{this.state.err.name}: {this.state.err.message}</pre>
            </details>
            <div className="admin-errbound-actions">
              <button type="button" onClick={this.reset}><RotateCcw size={12} /> 다시 시도</button>
              <a href="/"><Home size={12} /> 홈으로</a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
