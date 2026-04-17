import type { ReactNode } from 'react'
import { Inbox, Search, AlertCircle, PackageOpen } from 'lucide-react'

export type EmptyStateVariant = 'no-data' | 'no-result' | 'error' | 'package'

const VARIANT_ICON = {
  'no-data': PackageOpen,
  'no-result': Search,
  'error': AlertCircle,
  'package': Inbox,
}

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  action,
}: {
  variant?: EmptyStateVariant
  title: string
  description?: string
  action?: ReactNode
}) {
  const Icon = VARIANT_ICON[variant]
  return (
    <div className={`oc-empty-state oc-empty-${variant}`} role="status">
      <div className="oc-empty-icon" aria-hidden>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {action && <div className="oc-empty-action">{action}</div>}
    </div>
  )
}
