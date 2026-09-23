import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, BrainCircuit, ShieldAlert, BookOpen, Check,
  UploadCloud, ScanSearch, Target, MessageSquareText, Lock, Zap,
} from 'lucide-react'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import TickerTape from '../components/ui/TickerTape'
import Candles from '../components/ui/Candles'
import Reveal from '../components/ui/Reveal'
import SectionHead from '../components/ui/SectionHead'
import FaqAccordion from '../components/ui/FaqAccordion'
import HorizontalDisclaimer from '../components/HorizontalDisclaimer'
import { useAuth } from '../context/AuthContext'

function TerminalMock() {
  return (
    <div className="panel overflow-hidden shadow-[0_40px_90px_rgba(0,0,0,.55)]">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--color-line)]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[12px] text-[var(--color-faint)]">tradexa — journal overview</span>
        <span className="ml-auto badge badge-profit !text-[10px]"><span className="dot live" /> Live</span>
      </div>
      <div className="p-5 md:p-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-faint)] mb-1">Net P&amp;L</p>
            <p className="stat-num tnum text-[34px] md:text-[40px] text-[var(--color-profit)]">₹4,29,290</p>
          </div>
          <span className="badge badge-profit tnum">+12.4% this week</span>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[#080b0d] overflow-hidden">
          <Candles className="w-full h-[190px] md:h-[220px] block" seed={11} />
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { l: 'Win rate', v: '68.4%', c: 'text-[var(--color-ink)]' },
            { l: 'Profit factor', v: '2.31', c: 'text-[var(--color-ink)]' },
            { l: 'Max drawdown', v: '-2.1%', c: 'text-[var(--color-loss)]' },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-[var(--color-line)] bg-[rgba(255,255,255,.015)] px-4 py-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--color-faint)]">{s.l}</p>
              <p className={`stat-num tnum text-[20px] md:text-[24px] mt-1 ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const LEAKS = [
  {
    icon: Target,
    title: 'Revenge trading',
    body: 'One red day spirals into five. Your journal shows the pattern — Tradexa flags it before the next spiral starts.',
  },
  {
    icon: BarChart3,
    title: 'Oversized positions',
    body: 'Risking 5% "just this once" is how accounts die. Position sizing is computed for you, every single trade.',
  },
  {
    icon: ShieldAlert,
    title: 'No verifiable edge',
    body: 'A strategy isn\'t an edge until the math says so. Monte Carlo tells you the truth your gut won\'t.',
  },
]

const FAQS = [
  {
    q: 'Is Tradexa GPT a trading advisor?',
    a: 'No. Tradexa GPT is an analytics and journaling platform with an AI copilot. It helps you measure your own trading, find patterns in your behavior, and manage risk — it never tells you what to buy or sell.',
  },
  {
    q: 'How does the free trial work?',
    a: 'Every new account gets a 3-day free trial of the full trade journal and analytics. No credit card required. The AI copilot is a Pro-only feature.',
  },
  {
    q: 'Which brokers are supported for import?',
    a: 'You can upload trade files from Zerodha and Dhan today, with more brokers on the roadmap. CSV imports work for everything else.',
  },
  {
    q: 'What does the AI copilot actually do?',
    a: 'It reads your journal like a quant coach: it finds your edge leaks (e.g. "you lose money on Fridays after 2pm"), runs pre-trade risk checks, and answers questions about your own data.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel in one click from your dashboard. You keep Pro until the end of your billing period — no retention calls, no dark patterns.',
  },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--color-abyss)] text-[var(--color-ink)] overflow-x-clip">
      <SiteNav />

      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_25%,transparent_78%)]" />
        <div className="bg-glow w-[720px] h-[480px] bg-[rgba(14,203,129,.08)] top-[-140px] left-1/2 -translate-x-1/2" />
        <div className="bg-glow w-[420px] h-[420px] bg-[rgba(76,141,255,.06)] top-[30%] right-[-120px]" />

        <div className="wrap relative pt-[calc(68px+clamp(3.5rem,8vw,6.5rem))] pb-16 md:pb-24 grid lg:grid-cols-[1.02fr_.98fr] gap-14 lg:gap-10 items-center">
          <div>
            <Reveal>
              <span className="badge badge-profit mb-6"><span className="dot live" /> The quant copilot for traders</span>
              <h1 className="display-1 mt-5">
                Turn your trades<br />into <span className="grad-text">an edge.</span>
              </h1>
              <p className="lede mt-6 max-w-xl">
                Tradexa GPT journals every trade, quantifies your behavior, and puts an AI coach on your
                data — so you stop donating money to the market and start trading like a professional.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 mt-9">
                <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-profit btn-lg">
                  {isAuthenticated ? 'Open your dashboard' : 'Start free trial'} <ArrowRight size={18} />
                </Link>
                <Link to="/tradexa-gpt" className="btn btn-ghost btn-lg">
                  Meet Tradexa-GPT
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-7 text-[13.5px] text-[var(--color-muted)]">
                {['3-day free journal trial', 'No credit card required', 'Zerodha & Dhan import'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2">
                    <Check size={15} className="text-[var(--color-profit)]" /> {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={140} scale className="relative">
            <div className="float-slow">
              <TerminalMock />
            </div>
            <div className="hidden md:flex absolute -left-8 -bottom-8 card !p-4 items-center gap-3 shadow-[0_24px_60px_rgba(0,0,0,.5)]">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)]">
                <BrainCircuit size={19} className="text-[var(--color-profit)]" />
              </span>
              <div>
                <p className="text-[12.5px] font-semibold">Copilot insight</p>
                <p className="text-[12px] text-[var(--color-muted)]">“Friday overtrading cost you ₹18,400.”</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <TickerTape />

      {/* ================= STATS ================= */}
      <section className="sec !py-14">
        <div className="wrap grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-line)] rounded-2xl overflow-hidden border border-[var(--color-line)]">
          {[
            { v: '40+', l: 'Journal analytics' },
            { v: '10k', l: 'Monte Carlo paths' },
            { v: '3-day', l: 'Free journal trial' },
            { v: '₹999', l: '/mo launch pricing' },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 70} className="bg-[var(--color-panel)] px-6 py-8 text-center">
              <p className="stat-num tnum text-[30px] md:text-[36px] text-[var(--color-ink)]">{s.v}</p>
              <p className="text-[13px] text-[var(--color-muted)] mt-1.5 font-medium">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= PROBLEM ================= */}
      <section className="sec">
        <div className="wrap">
          <SectionHead
            kicker="The real problem"
            title={<>The market doesn't take your money.<br /><span className="text-[var(--color-loss)]">Your behavior does.</span></>}
            lede="Ninety percent of traders lose because of repeatable, measurable mistakes — not bad luck. Tradexa makes those mistakes visible, then helps you kill them."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {LEAKS.map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <div className="card card-hover h-full">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[var(--color-loss-dim)] border border-[rgba(246,70,93,.28)] mb-5">
                    <c.icon size={22} className="text-[var(--color-loss)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[19px] tracking-tight mb-2.5">{c.title}</h3>
                  <p className="text-[14.5px] text-[var(--color-muted)] leading-relaxed">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TOOLS BENTO ================= */}
      <section className="sec !pt-0">
        <div className="wrap">
          <SectionHead
            kicker="The toolkit"
            title="Everything you need to trade with discipline."
            lede="One workspace: your journal, your edge math, your AI coach, and the education to use them well."
          />
          <div className="grid md:grid-cols-3 gap-5">
            <Reveal className="md:col-span-2">
              <Link to="/tradexa-gpt" className="card card-hover h-full flex flex-col justify-between overflow-hidden group min-h-[320px]">
                <div className="bg-glow w-[380px] h-[280px] bg-[rgba(14,203,129,.09)] -top-24 -right-24" />
                <div className="relative">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] mb-5">
                    <BrainCircuit size={22} className="text-[var(--color-profit)]" />
                  </span>
                  <div className="flex items-center gap-3 mb-2.5">
                    <h3 className="font-display font-semibold text-[22px] tracking-tight">Tradexa-GPT Copilot</h3>
                    <span className="badge badge-gold">Pro</span>
                  </div>
                  <p className="text-[var(--color-muted)] text-[15px] leading-relaxed max-w-md">
                    An AI quant coach trained on <em className="not-italic text-[var(--color-ink)]">your</em> journal.
                    Ask anything, get pre-trade risk checks, and receive leak reports that read your behavior like a book.
                  </p>
                </div>
                <span className="relative inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-profit)] mt-6">
                  Explore the copilot <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
            <Reveal delay={90}>
              <Link to="/tools/edge-validator" className="card card-hover h-full flex flex-col justify-between min-h-[320px] group">
                <div>
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[var(--color-info-dim)] border border-[rgba(76,141,255,.3)] mb-5">
                    <ShieldAlert size={22} className="text-[var(--color-info)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[22px] tracking-tight mb-2.5">Edge Validator</h3>
                  <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed">
                    Win rate, risk of ruin, expectancy and 10,000-path Monte Carlo — free, no signup.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-ink)] mt-6">
                  Validate your edge <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
            <Reveal>
              <Link to="/tools/ipo-evaluator" className="card card-hover h-full flex flex-col justify-between min-h-[260px] group">
                <div>
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[rgba(255,141,76,.1)] border border-[rgba(255,141,76,.3)] mb-5">
                    <ScanSearch size={22} className="text-orange-400" />
                  </span>
                  <h3 className="font-display font-semibold text-[20px] tracking-tight mb-2.5">IPO Evaluator</h3>
                  <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed">
                    AI-driven analysis of DRHPs and RHPs. Evaluates business, earnings, and governance.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-ink)] mt-6">
                  Research IPOs <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
            <Reveal>
              <Link to="/dashboard" className="card card-hover h-full flex flex-col justify-between min-h-[260px] group">
                <div>
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[rgba(240,185,11,.1)] border border-[rgba(240,185,11,.3)] mb-5">
                    <UploadCloud size={22} className="text-[var(--color-gold)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[20px] tracking-tight mb-2.5">Trade Journal</h3>
                  <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed">
                    Import from Zerodha &amp; Dhan in seconds. Forty-plus analytics on every trade you've ever taken.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-ink)] mt-6">
                  Open the journal <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
            <Reveal delay={90}>
              <Link to="/blogs" className="card card-hover h-full flex flex-col justify-between min-h-[260px] group">
                <div>
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[rgba(255,255,255,.05)] border border-[var(--color-line2)] mb-5">
                    <BookOpen size={22} className="text-[var(--color-ink)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[20px] tracking-tight mb-2.5">Finance Intelligence</h3>
                  <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed">
                    Free, ad-supported deep dives on markets, psychology and risk. No paywall on knowledge.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-ink)] mt-6">
                  Read the blog <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
            <Reveal delay={180}>
              <div className="card h-full flex flex-col justify-between min-h-[260px] !border-[rgba(14,203,129,.25)] bg-[linear-gradient(180deg,rgba(14,203,129,.06),var(--color-panel))]">
                <div>
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] mb-5">
                    <ScanSearch size={22} className="text-[var(--color-profit)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[20px] tracking-tight mb-2.5">Leak Reports</h3>
                  <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed">
                    Weekly AI reports that name your costliest habits — in rupees, not platitudes.
                  </p>
                </div>
                <Link to="/pricing" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--color-profit)] mt-6">
                  See Pro plans <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="sec border-y border-[var(--color-line)] bg-[rgba(255,255,255,.012)]">
        <div className="wrap">
          <SectionHead
            kicker="How it works"
            title="From chaos to quantified in three steps."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { n: '01', icon: UploadCloud, t: 'Connect your journal', d: 'Upload your Zerodha or Dhan trade file. Tradexa parses every trade in seconds — no manual entry.' },
              { n: '02', icon: ScanSearch, t: 'Find your leaks', d: 'Analytics and the AI copilot surface the exact behaviors costing you money, ranked by rupees lost.' },
              { n: '03', icon: Target, t: 'Trade the plan', d: 'Pre-trade risk checks and position sizing keep every entry inside the rules you set for yourself.' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="relative panel p-7 h-full">
                  <span className="font-display font-bold text-[44px] leading-none text-[rgba(255,255,255,.06)] absolute top-5 right-6 select-none">{s.n}</span>
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)] mb-5">
                    <s.icon size={20} className="text-[var(--color-profit)]" />
                  </span>
                  <h3 className="font-display font-semibold text-[18px] tracking-tight mb-2">{s.t}</h3>
                  <p className="text-[14.5px] text-[var(--color-muted)] leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COPILOT PREVIEW ================= */}
      <section className="sec">
        <div className="wrap grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="kicker">Tradexa-GPT</span>
            <h2 className="display-2 mt-4 mb-5">Your trading questions.<br />One intelligent interface.</h2>
            <p className="lede mb-7">
              Ask about position sizing, dissect a losing streak, or run a pre-trade check.
              The copilot answers from <em className="not-italic text-[var(--color-ink)]">your</em> data — not generic textbook theory.
            </p>
            <ul className="space-y-3.5 mb-8">
              {['Pre-trade risk checks in seconds', 'Leak reports that quantify bad habits', 'Journal-aware answers, not generic advice'].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-[var(--color-muted)]">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-[var(--color-profit-dim)] shrink-0 mt-0.5">
                    <Check size={13} className="text-[var(--color-profit)]" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link to="/tradexa-gpt" className="btn btn-ink">Try Tradexa-GPT <ArrowRight size={16} /></Link>
              <Link to="/pricing" className="btn btn-line">See Pro pricing</Link>
            </div>
          </Reveal>
          <Reveal delay={120} scale>
            <div className="panel overflow-hidden">
              <div className="panel-head">
                <div className="flex items-center gap-2.5">
                  <span className="grid place-items-center w-8 h-8 rounded-lg bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)]">
                    <MessageSquareText size={15} className="text-[var(--color-profit)]" />
                  </span>
                  <span className="panel-title">Tradexa-GPT</span>
                </div>
                <span className="badge badge-gold">Pro</span>
              </div>
              <div className="p-5 space-y-4 text-[14px] leading-relaxed">
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[var(--color-panel3)] border border-[var(--color-line)] rounded-2xl rounded-br-md px-4 py-3">
                    How much should I risk on a NIFTY trade with ₹1,00,000 capital and a 20-point stop?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[92%] bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.25)] rounded-2xl rounded-bl-md px-4 py-3">
                    <p className="mb-2">At a 1% risk rule: <strong className="text-white tnum">₹1,000</strong> per trade.</p>
                    <p className="text-[var(--color-muted)]">20-pt stop × 25 qty = <span className="tnum">₹500</span> risk per lot → <strong className="text-white">2 lots (50 qty)</strong> is your size. Your journal shows you usually risk 2.3% here — that's a leak.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 bg-[var(--color-panel2)] border border-[var(--color-line)] rounded-xl px-4 py-3 text-[13.5px] text-[var(--color-faint)]">
                    Ask about your trading…
                  </div>
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-[var(--color-profit)] shrink-0">
                    <ArrowRight size={17} className="text-[#04120c]" />
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= PRICING TEASER ================= */}
      <section className="sec !pt-0">
        <div className="wrap">
          <div className="panel overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-12">
                <Reveal>
                  <span className="kicker gold">Pricing</span>
                  <h2 className="h-sec mt-4 mb-4">Free to learn.<br />Pro to earn.</h2>
                  <p className="text-[var(--color-muted)] text-[15px] leading-relaxed mb-7 max-w-md">
                    Blogs are free forever. The journal trial is free for 3 days.
                    Pro unlocks the full journal, analytics and the AI copilot — at a launch price locked for our first 100 traders.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/pricing" className="btn btn-gold">See plans <ArrowRight size={16} /></Link>
                    <Link to="/register" className="btn btn-line">Start free</Link>
                  </div>
                </Reveal>
              </div>
              <div className="border-t lg:border-t-0 lg:border-l border-[var(--color-line)] bg-[rgba(240,185,11,.03)] p-8 md:p-12">
                <Reveal delay={100}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="badge badge-gold">Launch offer · first 100</span>
                    <span className="tnum font-mono text-[13px] text-[var(--color-faint)] line-through">₹1,999</span>
                  </div>
                  <p className="stat-num tnum text-[52px] leading-none">₹999<span className="text-[18px] text-[var(--color-muted)] font-sans font-medium">/mo</span></p>
                  <ul className="mt-7 space-y-3">
                    {['Full journal & 40+ analytics', 'Tradexa-GPT AI copilot', 'Weekly leak reports', 'Ad-free experience'].map((t) => (
                      <li key={t} className="flex items-center gap-3 text-[14.5px] text-[var(--color-muted)]">
                        <Check size={15} className="text-[var(--color-gold)] shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUOTE ================= */}
      <section className="sec !py-20">
        <Reveal className="wrap max-w-3xl text-center">
          <Zap size={22} className="text-[var(--color-profit)] mx-auto mb-6" />
          <p className="font-display text-[clamp(1.4rem,3.2vw,2.1rem)] font-medium leading-snug tracking-tight text-[var(--color-ink)]">
            "The first rule of trading isn't finding the opportunity.<br className="hidden md:block" /> It's surviving long enough to find the next one."
          </p>
          <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.24em] text-[var(--color-faint)]">Tradexa risk philosophy</p>
        </Reveal>
      </section>

      {/* ================= FAQ ================= */}
      <section className="sec !pt-0">
        <div className="wrap max-w-3xl">
          <SectionHead kicker="FAQ" title="Questions, answered." />
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="sec !pt-4">
        <div className="wrap">
          <Reveal scale>
            <div className="relative panel overflow-hidden !p-0">
              <div className="absolute inset-0 bg-grid opacity-70" />
              <div className="bg-glow w-[500px] h-[300px] bg-[rgba(14,203,129,.1)] top-[-100px] left-1/2 -translate-x-1/2" />
              <div className="relative px-8 py-16 md:py-20 text-center max-w-2xl mx-auto">
                <span className="kicker !justify-center">Get started</span>
                <h2 className="display-2 mt-4 mb-5">Stop guessing.<br /><span className="grad-text">Start measuring.</span></h2>
                <p className="lede mx-auto mb-8">Join Tradexa GPT free. Your first leak report is 3 days away.</p>
                <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                  <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-profit btn-lg">
                    {isAuthenticated ? 'Open dashboard' : 'Start free trial'} <ArrowRight size={18} />
                  </Link>
                  <Link to="/pricing" className="btn btn-ghost btn-lg">Compare plans</Link>
                </div>
                <p className="mt-6 text-[12.5px] text-[var(--color-faint)] inline-flex items-center gap-2">
                  <Lock size={13} /> No credit card required · Cancel anytime
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <HorizontalDisclaimer />
      <SiteFooter />
    </div>
  )
}
