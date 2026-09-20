import { Link } from 'react-router-dom'
import { ArrowRight, Scale, TrendingUp, ShieldCheck, ChevronDown } from 'lucide-react'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import Reveal from '../components/ui/Reveal'
import Candles from '../components/ui/Candles'

const PILLARS = [
  {
    icon: Scale,
    n: '01',
    title: 'Position sizing',
    body: 'Every position is sized from your risk, not your conviction. A fixed fraction of capital per trade means no single loss can end the game — the math of survival comes before the math of profit.',
  },
  {
    icon: TrendingUp,
    n: '02',
    title: 'Risk-to-reward ratios',
    body: 'Every setup is scored against its reward multiple. You only take trades where the payoff justifies the risk — so a 40% win rate can still print money, because the math says so.',
  },
  {
    icon: ShieldCheck,
    n: '03',
    title: 'Strict exposure limits',
    body: 'Hard caps on total open risk keep one bad day from becoming a blown account. Discipline is not willpower — it is a limit the system refuses to let you cross.',
  },
]

export default function OurVision() {
  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteNav />

      {/* opener */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="bg-glow w-[720px] h-[480px] bg-[rgba(14,203,129,.08)] top-[8%] left-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_25%,transparent_78%)]" />
        <div className="absolute inset-x-0 bottom-0 opacity-50 [mask-image:linear-gradient(to_top,#000_30%,transparent_95%)]">
          <Candles className="w-full h-[300px]" seed={11} />
        </div>
        <Reveal className="relative flex flex-col items-center gap-6 px-6">
          <span className="kicker">Our vision</span>
          <h1 className="display-1">The Vision.</h1>
          <p className="lede text-center">Scroll to begin the journey.</p>
          <span className="mt-8 text-[var(--color-faint)] animate-bounce" aria-hidden>
            <ChevronDown size={22} />
          </span>
        </Reveal>
      </section>

      {/* 01 — the problem */}
      <section className="sec relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_20%_50%,#000_20%,transparent_75%)]" />
        <div className="wrap-wide relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal>
            <span className="kicker">01 · The problem</span>
            <h2 className="display-2 mt-5 mb-6">
              Emotions <span className="text-[var(--color-loss)]">cost money.</span>
            </h2>
            <p className="lede">
              Every day, millions of retail traders enter the market based on gut feelings, hype, and fear.
              Without a mathematical framework, trading becomes gambling. The house always wins.
            </p>
          </Reveal>
          <Reveal delay={120} scale>
            <div className="panel overflow-hidden">
              <div className="panel-head">
                <span className="panel-title">The cost of no system</span>
                <span className="badge badge-loss">Negative expectancy</span>
              </div>
              <Candles className="w-full h-[220px]" seed={41} />
              <div className="panel-body flex items-end justify-between gap-6 border-t border-[var(--color-line)]">
                <div>
                  <p className="stat-num tnum text-[56px] leading-none text-[var(--color-loss)]">0</p>
                  <p className="text-[13px] text-[var(--color-muted)] mt-2 max-w-[26ch] leading-relaxed">
                    The long-run expectancy of a trader with no mathematical edge — before brokerage.
                  </p>
                </div>
                <p className="tnum font-mono text-[13px] text-[var(--color-faint)] text-right leading-relaxed">
                  gut feel<br />hype<br />fear<br />
                  <span className="text-[var(--color-loss)]">−EV</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 — the mathematics */}
      <section className="sec relative border-t border-[var(--color-line)]">
        <div className="bg-glow w-[560px] h-[380px] bg-[rgba(14,203,129,.06)] top-[10%] right-[-160px]" />
        <div className="wrap relative">
          <Reveal className="max-w-3xl mb-12 md:mb-16">
            <span className="kicker">02 · The mathematics</span>
            <h2 className="display-2 mt-5 mb-6">
              Trading is <span className="grad-text">math, not magic.</span>
            </h2>
            <p className="lede">
              We believe that with the right position sizing, risk-to-reward ratios, and strict exposure
              limits, anyone can achieve consistency. The mathematics of trading are absolute.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => (
              <Reveal key={p.n} delay={i * 90} scale>
                <div className="card card-hover h-full">
                  <div className="flex items-start justify-between mb-6">
                    <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)]">
                      <p.icon size={21} className="text-[var(--color-profit)]" />
                    </span>
                    <span className="tnum font-mono text-[13px] text-[var(--color-faint)]">{p.n}</span>
                  </div>
                  <h3 className="font-display font-semibold text-[19px] tracking-tight mb-3">{p.title}</h3>
                  <p className="text-[14.5px] text-[var(--color-muted)] leading-relaxed">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100}>
            <div className="panel mt-8 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="tnum font-mono text-[13px] text-[var(--color-faint)] shrink-0">THE EQUATION</span>
              <p className="tnum font-mono text-[14.5px] text-[var(--color-muted)] leading-relaxed">
                edge = <span className="text-[var(--color-ink)]">(win% × avg win)</span> − <span className="text-[var(--color-ink)]">(loss% × avg loss)</span>
                {' '}<span className="text-[var(--color-profit)]">&gt; 0</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 03 — the goal */}
      <section className="sec relative overflow-hidden border-t border-[var(--color-line)]">
        <div className="bg-glow w-[680px] h-[440px] bg-[rgba(14,203,129,.09)] top-[20%] left-1/2 -translate-x-1/2" />
        <div className="absolute inset-x-0 top-0 opacity-40 [mask-image:linear-gradient(to_bottom,#000_20%,transparent_90%)]">
          <Candles className="w-full h-[240px]" seed={7} />
        </div>
        <div className="wrap relative max-w-4xl text-center">
          <Reveal>
            <span className="kicker">03 · The goal</span>
            <h2 className="display-1 mt-5 mb-7">
              A <span className="grad-text">disciplined</span> generation.
            </h2>
            <p className="lede mx-auto !max-w-[62ch] !text-[clamp(1.05rem,1.8vw,1.3rem)]">
              Our vision is to equip everyday people with the same risk management intelligence used by
              institutional quants. We are building a generation of disciplined, emotionless, and
              mathematically sound traders.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-11">
              <Link to="/register" className="btn btn-profit btn-lg">
                Start journaling free <ArrowRight size={18} />
              </Link>
              <Link to="/tradexa-gpt" className="btn btn-ghost btn-lg">
                Meet Tradexa-GPT
              </Link>
            </div>
            <p className="text-[13px] text-[var(--color-faint)] mt-6">
              Free plan includes a 3-day journal trial — no credit card required.
            </p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
