import { AlertTriangle } from 'lucide-react'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'

export default function RiskDisclaimer() {
  return (
    <div>
      <SiteNav />
      <PageHero
        kicker="Legal"
        title="Risk Disclaimer"
        lede="Read this before you use any tool on this platform."
      >
        <div className="alert alert-error !flex !gap-3 items-start max-w-2xl text-left">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span className="text-[14px] leading-relaxed">
            Trading involves substantial risk of loss. Everything on Tradexa GPT is educational —
            never financial advice. Never risk money you cannot afford to lose.
          </span>
        </div>
      </PageHero>
      <main className="sec !pt-0">
        <div className="wrap max-w-3xl">
          <Reveal>
            <div className="panel p-8 md:p-12 !border-[rgba(246,70,93,.25)]">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-faint)] mb-8">
                Last updated: September 2026
              </p>
              <div className="article-body">
                <h2>1. Trading Involves Substantial Risk</h2>
                <p>Trading in equities, derivatives, commodities, and currencies involves a high level of risk and may not be suitable for all investors. You could lose some or all of your invested capital. Never trade with money you cannot afford to lose.</p>

                <h2>2. No Financial Advice</h2>
                <p>Tradexa GPT provides educational and informational tools only. Nothing on this platform — including the AI copilot, leak reports, pre-trade checks, analytics, or articles — constitutes financial, investment, legal, or tax advice, or a recommendation to buy, sell, or hold any security or derivative. All outputs are for your own analysis and decision-making.</p>

                <h2>3. No Guaranteed Returns</h2>
                <p>We make no representation or warranty, express or implied, about profits, returns, or the accuracy of any calculation, simulation, or AI-generated output. Monte Carlo simulations and backtested-style statistics are based on historical or hypothetical data and do not predict future performance.</p>

                <h2>4. Past Performance</h2>
                <p>Past performance of any trading strategy, including your own journaled trades, is not indicative of future results. Market conditions change, and strategies that worked previously may not work going forward.</p>

                <h2>5. AI-Generated Content</h2>
                <p>The Tradexa-GPT copilot generates responses using a language model. It can make mistakes, misinterpret data, or produce plausible-sounding but incorrect analysis. Always verify critical numbers yourself before acting on them.</p>

                <h2>6. Seek Professional Advice</h2>
                <p>Consider consulting a SEBI-registered investment adviser or your financial professional before making investment decisions. You are solely responsible for your own trading decisions and their outcomes.</p>

                <h2>7. Your Responsibility</h2>
                <p>By using Tradexa GPT, you acknowledge that you understand these risks and accept full responsibility for any trades you place and any losses you may incur.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
