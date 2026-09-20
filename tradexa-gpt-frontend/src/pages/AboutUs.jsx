import { Link } from 'react-router-dom'
import { ArrowRight, Cpu, Workflow, Users, Calculator, LineChart, GraduationCap, Scale } from 'lucide-react'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import SectionHead from '../components/ui/SectionHead'
import Reveal from '../components/ui/Reveal'

const SECTIONS = [
  {
    n: '01',
    title: 'Corporate overview',
    body: 'Tradexa Technologies operates at the intersection of quantitative finance and artificial intelligence. Founded with the mission to democratize institutional-grade trading tools, we provide retail traders with mathematical risk management software and AI-driven market intelligence.',
  },
  {
    n: '02',
    title: 'Core business operations',
    body: "Our primary product suite includes Tradexa-GPT, a specialized financial language model, and our proprietary Risk Calculator engine. These tools are designed to integrate seamlessly into a trader's daily workflow, enforcing strict risk parameters and providing real-time exposure tracking.",
  },
  {
    n: '03',
    title: 'Leadership & engineering',
    body: 'Headquartered in a fully remote environment, our team consists of software engineers, quantitative analysts, and financial technology experts dedicated to building scalable, secure, and highly reliable trading infrastructure.',
  },
]

const PRODUCTS = [
  {
    icon: Cpu,
    title: 'Tradexa-GPT',
    body: 'A specialized financial language model that calculates risk, analyzes journals, and coaches discipline — your quantitative co-pilot.',
  },
  {
    icon: Calculator,
    title: 'Risk Calculator engine',
    body: 'Proprietary position-sizing and exposure math that enforces strict risk parameters on every trade you plan.',
  },
  {
    icon: LineChart,
    title: 'Journal & analytics',
    body: 'A private trade journal with deep analytics — win rates, expectancy, drawdowns and the leaks costing you money.',
  },
]

const VALUES = [
  { icon: Scale, title: 'Math over hype', body: 'Every feature starts from expectancy, risk and probability — never from tips, signals or noise.' },
  { icon: GraduationCap, title: 'Education first', body: 'We build tools that teach process. Nothing on this platform is financial advice, and we say so plainly.' },
  { icon: Users, title: 'Built for retail', body: 'Institutional-grade risk intelligence, priced and packaged for everyday traders in India.' },
]

export default function AboutUs() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        kicker="About us"
        title="Institutional-grade tools, democratized."
        lede="Tradexa Technologies exists for one reason: to put the risk management intelligence of institutional quants into the hands of everyday retail traders."
      />

      {/* company story — original copy preserved */}
      <section className="sec !pt-0">
        <div className="wrap">
          <SectionHead
            kicker="The company"
            title="What Tradexa Technologies is"
            lede="Quantitative finance meets artificial intelligence — built remote, built for traders."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {SECTIONS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} scale>
                <div className="card card-hover h-full">
                  <span className="tnum font-mono text-[13px] text-[var(--color-profit)]">{s.n}</span>
                  <h3 className="font-display font-semibold text-[19px] tracking-tight mt-4 mb-3">{s.title}</h3>
                  <p className="text-[14.5px] text-[var(--color-muted)] leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* product suite */}
      <section className="sec border-t border-[var(--color-line)] relative overflow-hidden">
        <div className="bg-glow w-[520px] h-[360px] bg-[rgba(14,203,129,.06)] top-[15%] left-[-160px]" />
        <div className="wrap relative">
          <SectionHead
            kicker="What we build"
            title="The product suite"
            lede="Three tools, one workflow: plan the risk, log the trade, learn from the math."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div className="panel p-7 h-full">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] mb-6">
                    <p.icon size={21} className="text-[var(--color-profit)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[18px] tracking-tight mb-2.5">{p.title}</h3>
                  <p className="text-[14.5px] text-[var(--color-muted)] leading-relaxed">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="flex items-center gap-3 mt-8 text-[14px] text-[var(--color-muted)]">
              <Workflow size={17} className="text-[var(--color-profit)] shrink-0" />
              <p>
                Designed to integrate seamlessly into a trader&apos;s daily workflow —{' '}
                <Link to="/tradexa-gpt" className="text-[var(--color-profit)] font-semibold hover:underline">
                  explore Tradexa-GPT
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* values */}
      <section className="sec border-t border-[var(--color-line)]">
        <div className="wrap">
          <SectionHead
            kicker="How we work"
            title="Our values"
            lede="The principles behind every line of code and every calculation we ship."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 90}>
                <div className="flex gap-4 panel p-6 h-full">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-[rgba(255,255,255,.04)] border border-[var(--color-line2)] shrink-0">
                    <v.icon size={19} className="text-[var(--color-gold)]" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-[16.5px] tracking-tight mb-1.5">{v.title}</h3>
                    <p className="text-[14px] text-[var(--color-muted)] leading-relaxed">{v.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sec !pt-4">
        <div className="wrap">
          <Reveal scale>
            <div className="panel relative overflow-hidden px-8 py-14 md:py-18 text-center">
              <div className="bg-glow w-[480px] h-[320px] bg-[rgba(14,203,129,.09)] top-[-120px] left-1/2 -translate-x-1/2" />
              <div className="relative">
                <h2 className="display-2 mb-4">Trade like an institution.</h2>
                <p className="lede mx-auto text-center mb-8">
                  Start with a free account — journal trial included, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register" className="btn btn-profit btn-lg">
                    Get started free <ArrowRight size={18} />
                  </Link>
                  <Link to="/vision" className="btn btn-ghost btn-lg">
                    Read our vision
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
