import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'

export default function PrivacyPolicy() {
  return (
    <div>
      <SiteNav />
      <PageHero
        kicker="Legal"
        title="Privacy Policy"
        lede="How we collect, use, and protect your information."
      />
      <main className="sec !pt-0">
        <div className="wrap max-w-3xl">
          <Reveal>
            <div className="panel p-8 md:p-12">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--color-faint)] mb-8">
                Last updated: September 2026
              </p>
              <div className="article-body">
                <h2>1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us. This includes your name, email, and trading journal CSV files.</p>

                <h2>2. Use of Information</h2>
                <p>We may use the information we collect to provide, maintain, and improve our services, including calculating your PNL and generating risk analysis via Tradexa-GPT.</p>

                <h2>3. Data Security</h2>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access. All CSV files are processed securely.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
