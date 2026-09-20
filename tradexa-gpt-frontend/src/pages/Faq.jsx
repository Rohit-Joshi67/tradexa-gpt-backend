import { Link } from 'react-router-dom'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import FaqAccordion from '../components/ui/FaqAccordion'
import Reveal from '../components/ui/Reveal'

const FAQS = [
  {
    q: 'What is Tradexa GPT?',
    a: 'Tradexa GPT is a quant copilot for disciplined traders: a trade journal with deep analytics, a Monte Carlo edge validator, free educational articles, and an AI coach (Pro) that finds the leaks in your trading.',
  },
  {
    q: 'What does the free plan include?',
    a: 'Free users get all articles (ad-supported) and a 3-day trial of the trade journal — upload your Zerodha/Dhan CSVs and explore analytics. The AI copilot is never included in the trial.',
  },
  {
    q: 'What do I get with Pro?',
    a: 'Pro unlocks the full journal with unlimited history, the complete analytics suite, the Tradexa-GPT AI copilot (streaming chat, journal leak reports, pre-trade discipline checks), the server-side Monte Carlo edge validator, and an ad-free experience.',
  },
  {
    q: 'How much does Pro cost?',
    a: '₹1,999/month or ₹19,999/year. The first 100 subscribers get launch pricing: ₹999/month or ₹9,999/year, locked for as long as their subscription stays active.',
  },
  {
    q: 'How do payments work?',
    a: 'Payments are processed securely through Razorpay (UPI, cards, netbanking). We never see or store your card details. You can cancel anytime from your dashboard — you keep Pro until the end of the billing period.',
  },
  {
    q: 'Which brokers are supported for journal import?',
    a: 'Zerodha and Dhan CSV exports are supported today, with more brokers on the way. Files are validated and content-sniffed on upload for your safety.',
  },
  {
    q: 'Is Tradexa GPT financial advice?',
    a: 'No. Everything on the platform is educational. The copilot helps you analyze risk and process — it never tells you what to buy or sell. See our Risk Disclaimer for the full picture.',
  },
  {
    q: 'Is my trading data private?',
    a: 'Yes. Your journal data is tied to your account and never shared or sold. See the Privacy Policy for details.',
  },
]

export default function Faq() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        kicker="Help center"
        title="Frequently asked questions"
        lede="Quick answers to the questions we hear most about plans, the journal, the copilot and your data."
      />
      <section className="sec !pt-0">
        <div className="wrap max-w-3xl">
          <FaqAccordion items={FAQS} />
          <Reveal delay={120}>
            <p className="text-[14.5px] text-[var(--color-faint)] mt-10 text-center">
              Still stuck?{' '}
              <Link to="/contact" className="text-[var(--color-profit)] font-semibold hover:underline">
                Contact us
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
