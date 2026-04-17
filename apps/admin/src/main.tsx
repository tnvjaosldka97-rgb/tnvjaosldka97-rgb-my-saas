import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ToastProvider } from './com/ui/Toast'
import { ErrorBoundary } from './com/ui/ErrorBoundary'
import './styles.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ToastProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ToastProvider>
  </StrictMode>,
)
