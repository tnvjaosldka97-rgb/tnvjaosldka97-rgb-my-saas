import './landing-page.css'
import { LPHeader } from './components/LPHeader'
import { LPHero } from './components/LPHero'
import { LPLiveTicker } from './components/LPLiveTicker'
import { LPProjectGrid } from './components/LPProjectGrid'
import { LPTrustedAgencies } from './components/LPTrustedAgencies'
import { LPHowItWorks } from './components/LPHowItWorks'
import { LPLeadStart } from './components/LPLeadStart'
import { LPPartner } from './components/LPPartner'
import { LPFooter } from './components/LPFooter'
import { LPAnnouncementModal } from './components/LPAnnouncementModal'

export function LandingPage() {
  return (
    <div className="onlyup-scope">
      <LPHeader />
      <main>
        <LPHero />
        <LPLiveTicker />
        <LPProjectGrid />
        <LPTrustedAgencies />
        <LPHowItWorks />
        <LPLeadStart />
        <LPPartner />
      </main>
      <LPFooter />
      <LPAnnouncementModal />
    </div>
  )
}
