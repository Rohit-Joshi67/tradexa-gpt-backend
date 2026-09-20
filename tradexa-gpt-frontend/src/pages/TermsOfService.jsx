import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'

export default function TermsOfService() {
  return (
    <div>
      <SiteNav />
      <PageHero
        kicker="Legal"
        title="Terms of Service"
        lede="The rules of the road for using Tradexa GPT."
      />
      <main className="sec !pt-0">
        <div className="wrap max-w-3xl">
          <Reveal>
            <div className="panel p-8 md:p-12">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-faint)] mb-8">
                Last updated: September 2026
              </p>
              <div className="article-body">
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using Tradexa GPT, you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h2>2. Educational Purposes Only</h2>
                <p>All content, tools, calculators, and AI responses provided by Tradexa are for educational and informational purposes only. We do not provide financial, investment, or trading advice.</p>

                <h2>3. Assumption of Risk</h2>
                <p>Trading financial markets involves a high degree of risk. You alone assume the sole responsibility of evaluating the merits and risks associated with the use of any information or other content on our platform.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
