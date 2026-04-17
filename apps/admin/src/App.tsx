import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Activity,
  Users,
  Inbox,
  Image as ImageIcon,
  FileText,
  Mail,
  Settings as SettingsIcon,
  Search,
  LogIn,
  Network,
  Plug,
  LogOut,
  Store,
} from 'lucide-react'
import { MarketPanel } from './biz/amk/MarketPanel'
import { LoginScreen } from './biz/aut/components/LoginScreen'
import { useAuth } from './biz/aut/hooks/useAuth'
import { OverviewPanel } from './biz/dsh/components/OverviewPanel'
import { SystemPanel } from './biz/log/components/SystemPanel'
import { UserPanel } from './biz/usr/components/UserPanel'
import { AccessLogPanel } from './biz/log/components/AccessLogPanel'
import { ApiLogPanel } from './biz/log/components/ApiLogPanel'
import { SearchPanel } from './biz/srh/components/SearchPanel'
import { SettingsPanel } from './biz/set/components/SettingsPanel'
import { LeadListPanel } from './biz/led/components/LeadListPanel'
import { MediaPanel } from './biz/med/components/MediaPanel'
import { EmailPanel } from './biz/eml/components/EmailPanel'
import { PagePanel } from './biz/pag/components/PagePanel'
import { CloudflareExamples } from './biz/ext/components/CloudflareExamples'
import { useLeads } from './biz/led/hooks/useLeads'

type NavItem = {
  id: string
  label: string
  group: string
  Icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',   group: 'Overview',   Icon: LayoutDashboard },
  { id: 'system',      label: 'System',      group: 'Overview',   Icon: Activity },
  { id: 'market',      label: 'Market',      group: 'Marketplace', Icon: Store },
  { id: 'users',       label: 'Users',       group: 'Management', Icon: Users },
  { id: 'leads',       label: 'Leads',       group: 'Management', Icon: Inbox },
  { id: 'media',       label: 'Media',       group: 'Management', Icon: ImageIcon },
  { id: 'pages',       label: 'Pages',       group: 'Management', Icon: FileText },
  { id: 'email',       label: 'Email',       group: 'Management', Icon: Mail },
  { id: 'settings',    label: 'Settings',    group: 'Config',     Icon: SettingsIcon },
  { id: 'search',      label: 'Search',      group: 'Tools',      Icon: Search },
  { id: 'access-logs', label: 'Access Logs', group: 'Logs',       Icon: LogIn },
  { id: 'api-logs',    label: 'API Logs',    group: 'Logs',       Icon: Network },
  { id: 'extensions',  label: 'Extensions',  group: 'Tools',      Icon: Plug },
]

function groupItems(items: NavItem[]): Map<string, NavItem[]> {
  const groups = new Map<string, NavItem[]>()
  for (const item of items) {
    const list = groups.get(item.group) ?? []
    list.push(item)
    groups.set(item.group, list)
  }
  return groups
}

function AuthenticatedAdmin({ email, logout }: { email: string; logout: () => Promise<void> }) {
  const { leads } = useLeads()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const groups = groupItems(NAV_ITEMS)

  function renderPanel() {
    switch (activeTab) {
      case 'dashboard': return <OverviewPanel />
      case 'system': return <SystemPanel />
      case 'market': return <MarketPanel />
      case 'users': return <UserPanel />
      case 'leads': return <LeadListPanel />
      case 'media': return <MediaPanel />
      case 'pages': return <PagePanel />
      case 'email': return <EmailPanel leads={leads} />
      case 'settings': return <SettingsPanel />
      case 'search': return <SearchPanel />
      case 'access-logs': return <AccessLogPanel />
      case 'api-logs': return <ApiLogPanel />
      case 'extensions': return <CloudflareExamples />
      default: return <OverviewPanel />
    }
  }

  return (
    <main className="admin-shell">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? '\u2715' : '\u2630'}
      </button>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-badge">Super Admin</span>
          <h1 className="brand-wordmark">마케팅천재야</h1>
        </div>

        <nav className="sidebar-nav">
          {[...groups.entries()].map(([group, items]) => (
            <div key={group} className="nav-group">
              <span className="nav-group-label">{group}</span>
              {items.map((item) => {
                const Icon = item.Icon
                return (
                  <button
                    key={item.id}
                    className={`nav-item${activeTab === item.id ? ' active' : ''}`}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                  >
                    <Icon size={16} strokeWidth={2} className="nav-icon-svg" aria-hidden />
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{email[0].toUpperCase()}</div>
            <span className="user-email">{email}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={14} strokeWidth={2} aria-hidden /> Log out
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="content-header">
          <h2 className="content-title">
            {NAV_ITEMS.find(i => i.id === activeTab)?.label ?? 'Dashboard'}
          </h2>
        </header>
        <div className="content-body">
          {renderPanel()}
        </div>
      </section>
    </main>
  )
}

export function App() {
  const { loading, user, login, logout } = useAuth()

  if (loading) return <main className="admin-loading">Checking admin session...</main>
  if (!user) return <LoginScreen onLogin={login} />

  return <AuthenticatedAdmin email={user.email} logout={logout} />
}
