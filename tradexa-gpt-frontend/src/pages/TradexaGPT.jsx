import { Link } from 'react-router-dom'
import { ArrowRight, Brain, ShieldAlert, BarChart3, Zap, Upload, MessageSquare, Compass, Crown, Check } from 'lucide-react'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import SectionHead from '../components/ui/SectionHead'
import FaqAccordion from '../components/ui/FaqAccordion'
import Reveal from '../components/ui/Reveal'
import Candles from '../components/ui/Candles'
import TickerTape from '../components/ui/TickerTape'

const FEATURES = [
  {
    icon: ShieldAlert,
    title: 'Risk Calculation',
    body: 'Instantly calculate position sizes, stop-loss distances, and portfolio exposure by simply typing your parameters in plain English.',
  },
  {
    icon: BarChart3,
    title: 'Journal Analysis',
    body: 'Upload your trading journal and let Tradexa-GPT find the mathematical leaks in your strategy, from win-rate drops to outsized losses.',
  },
  {
    icon: Zap,
    title: 'Discipline Engine',
    body: 'Get unbiased, emotionless feedback on your trade ideas before you execute them, forcing you to stick to your own rules.',
  },
]

const STEPS = [
  {
    icon: Upload,
    n: '01',
    title: 'Connect your journal',
    body: 'Import your Zerodha or Dhan trades. Your data stays private to your account — the copilot only sees what you journal.',
  },
  {
    icon: MessageSquare,
    n: '02',
    title: 'Ask in plain English',
    body: 'Chat about risk, run a journal leak report, or put a trade idea through a pre-trade discipline check — streaming, in seconds.',
  },
  {
    icon: Compass,
    n: '03',
    title: 'Execute with discipline',
    body: 'Get the math and the mirror: position sizes you can defend and feedback that keeps your emotions out of the trade.',
  },
]

const COPILOT_FAQS = [
  {
    q: 'What exactly is the Tradexa-GPT copilot?',
    a: 'A specialized financial language model built for traders. It analyzes risk, reads your journal, and coaches discipline — not a generic chatbot, but a quantitative co-pilot trained on the workflow of systematic trading.',
  },
  {
    q: 'What can I ask it to do?',
    a: 'Calculate position sizes and stop distances in plain English, generate journal leak reports that name your costliest habits, and run pre-trade discipline checks that score a trade idea against your own rules — all over streaming chat.',
  },
  {
    q: 'Is the copilot included in the free plan?',
    a: 'No. The copilot is a Pro feature, and it is never included in the 3-day free journal trial. Pro unlocks full streaming chat, leak reports and pre-trade checks with a daily usage quota.',
  },
  {
    q: 'Does the copilot tell me what to buy or sell?',
    a: 'Never. It helps you analyze risk and process — sizing, expectancy, exposure, discipline. Everything is educational; nothing on the platform is financial advice.',
  },
]

export default function TradexaGPT() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <PageHero
        kicker="The intelligence layer"
        title={<>Meet <span className="grad-text">Tradexa-GPT</span></>}
        lede="A specialized financial language model designed to analyze markets, calculate risk, and build trading discipline. It's not just a chatbot — it's your quantitative co-pilot."
      >
        <Reveal delay={140} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
          <Link to="/register" className="btn btn-profit btn-lg">
            Try Tradexa-GPT <ArrowRight size={18} />
          </Link>
          <Link to="/pricing" className="btn btn-ghost btn-lg">
            See Pro pricing
          </Link>
        </Reveal>
      </PageHero>

      {/* terminal visual */}
      <section className="pb-4">
        <div className="wrap-wide">
          <Reveal scale>
            <div className="panel overflow-hidden">
              <div className="panel-head">
                <div className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)]">
                    <Brain size={15} className="text-[var(--color-profit)]" />
                  </span>
                  <span className="panel-title">copilot · session</span>
                </div>
                <span className="badge badge-profit"><span className="dot live" /> streaming</span>
              </div>
              <div className="px-5 md:px-7 py-6 font-mono text-[13.5px] md:text-[14.5px] leading-[2] tnum">
                <p><span className="text-[var(--color-profit)]">you ›</span> <span className="text-[var(--color-ink)]">risk 1% of a ₹5L account, stop 42 points away — what&apos;s my size?</span></p>
                <p><span className="text-[var(--color-gold)]">tradexa-gpt ›</span> <span className="text-[var(--color-muted)]">Risk ₹5,000 ÷ 42 pts = <span className="text-[var(--color-ink)]">119 shares</span>. That&apos;s 0.94% of capital at risk — within your 1% rule. ✓</span></p>
                <p><span className="text-[var(--color-profit)]">you ›</span> <span className="text-[var(--color-ink)]">where am I leaking money this month?</span></p>
                <p><span className="text-[var(--color-gold)]">tradexa-gpt ›</span> <span className="text-[var(--color-muted)]">Friday trades: <span className="text-[var(--color-loss)]">−₹18,400</span> at 31% win rate. Your edge lives Mon–Thu — Fridays are revenge trading. Cut Friday size by half. ✓</span></p>
              </div>
              <Candles className="w-full h-[150px] border-t border-[var(--color-line)]" seed={19} />
            </div>
          </Reveal>
        </div>
      </section>

      <TickerTape className="my-6" />

      {/* features */}
      <section className="sec">
        <div className="wrap">
          <SectionHead
            kicker="Capabilities"
            title="Three engines, one co-pilot"
            lede="Everything the copilot does serves a single purpose: replace emotion with arithmetic."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90} scale>
                <div className="card card-hover h-full">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] mb-6">
                    <f.icon size={21} className="text-[var(--color-profit)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[19px] tracking-tight mb-3">{f.title}</h3>
                  <p className="text-[14.5px] text-[var(--color-muted)] leading-relaxed">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="sec border-t border-[var(--color-line)] relative overflow-hidden">
        <div className="bg-glow w-[520px] h-[360px] bg-[rgba(14,203,129,.06)] top-[20%] right-[-160px]" />
        <div className="wrap relative">
          <SectionHead
            kicker="How it works"
            title="From journal to discipline in three steps"
          />
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="panel p-7 h-full relative">
                  <span className="tnum font-mono text-[12px] text-[var(--color-faint)] absolute top-6 right-6">{s.n}</span>
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-[rgba(255,255,255,.04)] border border-[var(--color-line2)] mb-5">
                    <s.icon size={19} className="text-[var(--color-profit)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[17.5px] tracking-tight mb-2.5">{s.title}</h3>
                  <p className="text-[14px] text-[var(--color-muted)] leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* pricing teaser */}
      <section className="sec border-t border-[var(--color-line)]">
        <div className="wrap max-w-4xl">
          <SectionHead
            kicker={{ text: 'Pro access', gold: true }}
            title="The copilot lives on Pro"
            lede="Full streaming chat, journal leak reports and pre-trade discipline checks — plus the complete journal, analytics suite and an ad-free experience."
          />
          <Reveal scale>
            <div className="panel relative overflow-hidden">
              <div className="bg-glow w-[420px] h-[280px] bg-[rgba(240,185,11,.08)] top-[-100px] right-[-80px]" />
              <div className="panel-body !p-8 md:!p-10 relative">
                <div className="flex flex-col md:flex-row md:items-center gap-8 justify-between">
                  <div>
                    <span className="badge badge-gold mb-4"><Crown size={12} /> Tradexa Pro</span>
                    <div className="flex items-baseline gap-5 mt-4">
                      <div>
                        <p className="stat-num tnum text-[38px]">₹1,999<span className="text-[16px] font-sans font-medium text-[var(--color-muted)]">/mo</span></p>
                        <p className="text-[12.5px] text-[var(--color-faint)] mt-1">or ₹19,999/year</p>
                      </div>
                      <div className="h-12 w-px bg-[var(--color-line2)]" />
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--color-gold)] mb-1.5">Launch offer · first 100</p>
                        <p className="stat-num tnum text-[26px] text-[var(--color-gold)]">₹999<span className="text-[14px] font-sans font-medium text-[var(--color-muted)]">/mo</span></p>
                        <p className="text-[12.5px] text-[var(--color-faint)] mt-1">or ₹9,999/year</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/pricing" className="btn btn-gold btn-lg shrink-0">
                    See plans <ArrowRight size={18} />
                  </Link>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-8 pt-8 border-t border-[var(--color-line)]">
                  {['Streaming copilot chat', 'Journal leak reports', 'Pre-trade discipline checks', 'Full journal & analytics', 'Server-side Monte Carlo validator', 'Ad-free experience'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[14px] text-[var(--color-muted)]">
                      <Check size={15} className="text-[var(--color-profit)] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec border-t border-[var(--color-line)]">
        <div className="wrap max-w-3xl">
          <SectionHead
            kicker="Questions"
            title="Copilot FAQ"
          />
          <FaqAccordion items={COPILOT_FAQS} />
        </div>
      </section>

      {/* final CTA */}
      <section className="sec !pt-4">
        <div className="wrap">
          <Reveal scale>
            <div className="panel relative overflow-hidden px-8 py-14 text-center">
              <div className="bg-glow w-[480px] h-[320px] bg-[rgba(14,203,129,.09)] top-[-120px] left-1/2 -translate-x-1/2" />
              <div className="relative">
                <span className="badge badge-profit mb-5"><Brain size={12} /> Tradexa-GPT</span>
                <h2 className="display-2 mb-4 mt-4">Stop trading on gut feel.</h2>
                <p className="lede mx-auto text-center mb-8">
                  Get a quantitative co-pilot that does the math and holds the mirror.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register" className="btn btn-profit btn-lg">
                    Get started free <ArrowRight size={18} />
                  </Link>
                  <Link to="/pricing" className="btn btn-ghost btn-lg">
                    Compare plans
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
