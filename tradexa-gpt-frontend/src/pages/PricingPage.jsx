import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Check, CheckCircle2, Loader2, ShieldCheck, Sparkles, XCircle, Zap, Lock } from 'lucide-react'
import { apiErrorMessage } from '../api/client'
import { createSubscription, verifyPayment } from '../api/billing'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../context/PlanContext'
import { formatPaise } from '../utils/format'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import SectionHead from '../components/ui/SectionHead'
import FaqAccordion from '../components/ui/FaqAccordion'

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error('Could not load the payment gateway. Check your connection and try again.'))
    document.body.appendChild(script)
  })
}

const FREE_FEATURES = [
  'Finance articles with ads',
  '3-day free trial of the trade journal',
  'Basic edge validator metrics',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited trade journal and file uploads',
  'Deep analytics: per-symbol, market-hours, advanced stats',
  'Monte Carlo sims, risk of ruin, survival probability, Kelly sizing',
  'Tradexa-GPT AI copilot (50 messages/day)',
  'Weekly AI journal leak reports',
  'Completely ad-free experience',
]

const INTERVALS = {
  monthly: { label: 'Monthly', price: '₹1,999', suffix: '/month', launchPrice: '₹999', launchSuffix: '/month' },
  yearly: { label: 'Yearly', price: '₹19,999', suffix: '/year', launchPrice: '₹9,999', launchSuffix: '/year' },
}

const PLAN_FAQS = [
  {
    q: 'How does the launch offer work?',
    a: 'The first 100 Pro subscribers lock in 50% off — ₹999/month or ₹9,999/year — for as long as they stay subscribed. Once the 100 slots are gone, Pro is ₹1,999/month or ₹19,999/year.',
  },
  {
    q: 'What happens after my 3-day free trial?',
    a: 'The journal locks and articles stay free with ads. Nothing is charged — ever — unless you explicitly choose a Pro plan.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Anytime, in one click from your dashboard. You keep Pro until the end of your billing period. No calls, no retention maze.',
  },
  {
    q: 'Which payment methods are accepted?',
    a: 'UPI, credit/debit cards and netbanking — processed securely through Razorpay. We never see or store your card details.',
  },
]

function FeatureList({ items, iconClass }) {
  return (
    <ul className="space-y-3.5 text-left">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[14.5px] text-[var(--color-muted)]">
          <span className="grid place-items-center w-[22px] h-[22px] rounded-full bg-[var(--color-profit-dim)] shrink-0 mt-0.5">
            <Check size={13} className={iconClass} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PricingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { plan, loading: planLoading, refresh } = usePlan()

  const [interval, setInterval] = useState('monthly')
  // idle | creating | confirm | verifying | success | error
  const [stage, setStage] = useState('idle')
  const [details, setDetails] = useState(null)
  const [error, setError] = useState('')
  const processingRef = useRef(false)

  const prices = INTERVALS[interval]

  async function handleUpgrade() {
    if (!isAuthenticated) {
      navigate('/register?next=/pricing')
      return
    }
    setError('')
    setStage('creating')
    processingRef.current = true
    try {
      const data = await createSubscription(interval)
      setDetails(data)
      // Amounts shown to the user always come from the backend response.
      setStage('confirm')
    } catch (err) {
      setError(apiErrorMessage(err))
      setStage('error')
    } finally {
      processingRef.current = false
    }
  }

  async function openCheckout() {
    if (!details) return
    setError('')
    setStage('verifying')
    processingRef.current = true
    try {
      await loadRazorpay()
      const options = {
        key: details.keyId,
        subscription_id: details.razorpaySubscriptionId,
        name: 'Tradexa GPT',
        description: 'Tradexa Pro',
        prefill: {
          name: details.customerName || '',
          email: details.customerEmail || '',
        },
        theme: { color: '#0ecb81' },
        modal: {
          ondismiss: () => {
            if (processingRef.current) {
              processingRef.current = false
              setStage('idle')
              setError('Payment was cancelled before completion. No money was charged.')
            }
          },
        },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            await refresh()
            processingRef.current = false
            setStage('success')
          } catch (err) {
            processingRef.current = false
            setError(
              `${apiErrorMessage(err)} If money was deducted, it will be refunded automatically — contact support with your payment ID.`,
            )
            setStage('error')
          }
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        processingRef.current = false
        setError('The payment failed. No money was charged. Please try again or use a different payment method.')
        setStage('error')
      })
      rzp.open()
    } catch (err) {
      processingRef.current = false
      setError(apiErrorMessage(err))
      setStage('error')
    }
  }

  const busy = stage === 'creating' || stage === 'verifying'

  return (
    <div className="min-h-screen bg-[var(--color-abyss)] text-[var(--color-ink)]">
      <SiteNav />

      <PageHero
        kicker="Pricing"
        title={<>Trade like a <span className="grad-gold">professional.</span></>}
        lede="Start free. Upgrade when you're ready for the full quant toolkit — unlimited journal, deep analytics, and your AI copilot."
      >
        <Reveal delay={120}>
          <span className="badge badge-gold !text-[12px] !py-2 !px-4">
            <Sparkles size={13} /> Launch offer — first 100 members pay 50% off
          </span>
        </Reveal>
      </PageHero>

      <main className="wrap pb-24">
        {stage === 'success' ? (
          <Reveal scale className="max-w-lg mx-auto">
            <div className="panel p-10 md:p-12 text-center !border-[rgba(14,203,129,.35)] bg-[linear-gradient(180deg,rgba(14,203,129,.08),var(--color-panel))]">
              <span className="grid place-items-center w-16 h-16 rounded-full bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.4)] mx-auto mb-6">
                <CheckCircle2 size={30} className="text-[var(--color-profit)]" />
              </span>
              <h2 className="font-display font-bold text-[26px] tracking-tight mb-3">Welcome to Tradexa Pro</h2>
              <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed mb-8">
                Your subscription is active. Unlimited journal, deep analytics, the AI copilot —
                and zero ads. Trade with discipline.
              </p>
              <Link to="/dashboard" className="btn btn-profit btn-lg w-full">
                Go to Dashboard
              </Link>
            </div>
          </Reveal>
        ) : (
          <>
            {/* Interval toggle */}
            <Reveal className="flex justify-center mb-10">
              <div className="inline-flex rounded-2xl border border-[var(--color-line2)] bg-[var(--color-panel)] p-1.5 gap-1" role="tablist" aria-label="Billing interval">
                {Object.entries(INTERVALS).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={interval === key}
                    onClick={() => setInterval(key)}
                    className={`px-7 py-2.5 rounded-xl text-[14px] font-semibold transition-all cursor-pointer ${
                      interval === key
                        ? 'bg-[var(--color-profit)] text-[#04120c] shadow-[0_6px_20px_rgba(14,203,129,.3)]'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {value.label}
                    {key === 'yearly' && <span className={`ml-2 text-[11px] font-bold ${interval === key ? 'text-[#04120c]/70' : 'text-[var(--color-profit)]'}`}>−17%</span>}
                  </button>
                ))}
              </div>
            </Reveal>

            {!planLoading && plan === 'PRO' ? (
              <Reveal scale className="max-w-lg mx-auto">
                <div className="panel p-10 md:p-12 text-center !border-[rgba(240,185,11,.35)] bg-[linear-gradient(180deg,rgba(240,185,11,.07),var(--color-panel))]">
                  <span className="grid place-items-center w-16 h-16 rounded-full bg-[var(--color-gold-dim)] border border-[rgba(240,185,11,.4)] mx-auto mb-6">
                    <BadgeCheck size={30} className="text-[var(--color-gold)]" />
                  </span>
                  <h2 className="font-display font-bold text-[26px] tracking-tight mb-3">You're on Tradexa Pro</h2>
                  <p className="text-[var(--color-muted)] text-[14.5px] leading-relaxed mb-8">
                    Your subscription is active. Everything is unlocked — enjoy the full toolkit.
                  </p>
                  <Link to="/dashboard" className="btn btn-gold btn-lg w-full">
                    Go to Dashboard
                  </Link>
                </div>
              </Reveal>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
                {/* Free */}
                <Reveal>
                  <div className="panel p-8 md:p-9 flex flex-col h-full">
                    <h2 className="font-display font-semibold text-[20px] tracking-tight">Free</h2>
                    <p className="text-[var(--color-muted)] text-[13.5px] mt-1 mb-7">Learn the craft, on us.</p>
                    <p className="mb-8">
                      <span className="stat-num tnum text-[52px] leading-none">₹0</span>
                      <span className="text-[var(--color-faint)] text-[14px]"> forever</span>
                    </p>
                    <div className="flex-1 mb-8">
                      <FeatureList items={FREE_FEATURES} iconClass="text-[var(--color-muted)]" />
                    </div>
                    <Link
                      to={isAuthenticated ? '/dashboard' : '/register?next=/pricing'}
                      className="btn btn-ghost w-full"
                    >
                      {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                    </Link>
                  </div>
                </Reveal>

                {/* Pro */}
                <Reveal delay={110} scale>
                  <div className="relative panel p-8 md:p-9 flex flex-col h-full !border-[rgba(240,185,11,.4)] bg-[linear-gradient(180deg,rgba(240,185,11,.06),var(--color-panel))] shadow-[0_24px_70px_rgba(240,185,11,.08)]">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 badge badge-gold !text-[11px] whitespace-nowrap shadow-lg">
                      <Zap size={12} /> Most popular
                    </span>
                    <h2 className="font-display font-semibold text-[20px] tracking-tight">Tradexa Pro</h2>
                    <p className="text-[var(--color-muted)] text-[13.5px] mt-1 mb-7">The full quant toolkit for serious traders.</p>
                    <div className="mb-1.5 flex items-baseline gap-3">
                      <span className="tnum font-mono text-[15px] text-[var(--color-faint)] line-through">{prices.price}</span>
                      <span className="stat-num tnum text-[52px] leading-none grad-gold">{prices.launchPrice}</span>
                      <span className="text-[var(--color-faint)] text-[14px]">{prices.launchSuffix}</span>
                    </div>
                    <p className="text-[13px] text-[var(--color-gold)] font-semibold mb-8">
                      Launch price locked for the first 100 members
                    </p>
                    <div className="flex-1 mb-8">
                      <FeatureList items={PRO_FEATURES} iconClass="text-[var(--color-gold)]" />
                    </div>

                    {stage === 'confirm' && details ? (
                      <div className="rounded-2xl border border-[rgba(240,185,11,.35)] bg-[rgba(240,185,11,.06)] p-5 mb-2">
                        <p className="text-[13px] text-[var(--color-muted)] mb-1">Confirm your subscription</p>
                        <p className="stat-num tnum text-[30px] mb-1">
                          {formatPaise(details.amountPaise)}
                          <span className="text-[14px] font-sans font-normal text-[var(--color-muted)]">
                            {interval === 'monthly' ? ' /month' : ' /year'}
                          </span>
                        </p>
                        {details.planCode === 'PRO_LAUNCH' && (
                          <p className="text-[12.5px] text-[var(--color-profit)] font-semibold mb-4">
                            Launch offer applied — you locked in 50% off.
                          </p>
                        )}
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setStage('idle')} className="btn btn-ghost flex-1">
                            Back
                          </button>
                          <button type="button" onClick={openCheckout} className="btn btn-gold flex-1">
                            <Lock size={15} /> Pay Securely
                          </button>
                        </div>
                        <p className="text-[12px] text-[var(--color-faint)] mt-4 flex items-center gap-1.5">
                          <ShieldCheck size={14} className="shrink-0" /> UPI, cards &amp; netbanking via Razorpay
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleUpgrade}
                        disabled={busy}
                        className="btn btn-gold btn-lg w-full"
                      >
                        {busy && <Loader2 size={18} className="animate-spin" />}
                        {stage === 'creating'
                          ? 'Preparing checkout…'
                          : stage === 'verifying'
                            ? 'Confirming payment…'
                            : isAuthenticated
                              ? 'Upgrade to Pro'
                              : 'Create Account & Upgrade'}
                      </button>
                    )}

                    {error && (
                      <div className="alert alert-error mt-4 flex items-start gap-2.5">
                        <XCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            )}

            <Reveal className="mt-10 text-center">
              <p className="text-[12.5px] text-[var(--color-faint)] max-w-2xl mx-auto leading-relaxed">
                Cancel anytime — Pro access continues until the end of your billing period.
                Tradexa provides educational tools only; nothing here is financial advice.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 mt-6 text-[13.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors">
                <ArrowLeft size={15} /> Back home
              </Link>
            </Reveal>
          </>
        )}

        {/* FAQ */}
        {stage !== 'success' && (
          <div className="max-w-3xl mx-auto mt-24">
            <SectionHead kicker="FAQ" title="Pricing questions." />
            <FaqAccordion items={PLAN_FAQS} />
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
