import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BadgeCheck, Check, CheckCircle2, Loader2, ShieldCheck, Sparkles, XCircle, Zap } from 'lucide-react'
import { apiErrorMessage } from '../api/client'
import { createSubscription, verifyPayment } from '../api/billing'
import { useAuth } from '../context/AuthContext'
import { usePlan } from '../context/PlanContext'
import { formatPaise } from '../utils/format'

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

function FeatureList({ items, accent }) {
  return (
    <ul className="space-y-3 text-left">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-neutral-300">
          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${accent}`} />
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
        name: 'Tradexa',
        description: 'Tradexa Pro',
        prefill: {
          name: details.customerName || '',
          email: details.customerEmail || '',
        },
        theme: { color: '#6366f1' },
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm">T</div>
            Tradexa
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {stage === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-12"
          >
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Welcome to Tradexa Pro</h1>
            <p className="text-neutral-400 mb-8">
              Your subscription is active. Unlimited journal, deep analytics, the AI copilot —
              and zero ads. Trade with discipline.
            </p>
            <Link
              to="/dashboard"
              className="inline-block w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Heading */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Launch offer — first 100 members pay 50% off
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                Trade like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">professional</span>
              </h1>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                Start free. Upgrade when you're ready for the full quant toolkit —
                unlimited journal, deep analytics, and your AI copilot.
              </p>
            </div>

            {/* Interval toggle */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex rounded-full border border-white/10 bg-neutral-900/50 p-1">
                {Object.entries(INTERVALS).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInterval(key)}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                      interval === key ? 'bg-indigo-500 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Already Pro state */}
            {!planLoading && plan === 'PRO' ? (
              <div className="max-w-lg mx-auto text-center rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-12">
                <BadgeCheck className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">You're on Tradexa Pro</h2>
                <p className="text-neutral-400 mb-8">
                  Your subscription is active. Everything is unlocked — enjoy the full toolkit.
                </p>
                <Link
                  to="/dashboard"
                  className="inline-block w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
                {/* Free card */}
                <div className="rounded-3xl border border-white/10 bg-neutral-900/50 p-8 flex flex-col">
                  <h2 className="text-xl font-bold mb-2">Free</h2>
                  <p className="text-neutral-400 text-sm mb-6">Learn the craft, on us.</p>
                  <div className="mb-8">
                    <span className="text-5xl font-bold">₹0</span>
                    <span className="text-neutral-500"> forever</span>
                  </div>
                  <div className="flex-1 mb-8">
                    <FeatureList items={FREE_FEATURES} accent="text-neutral-400" />
                  </div>
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/register?next=/pricing'}
                    className="block text-center w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                  </Link>
                </div>

                {/* Pro card */}
                <div className="relative rounded-3xl border border-indigo-500/50 bg-gradient-to-b from-indigo-500/15 to-neutral-900/50 p-8 flex flex-col shadow-[0_0_60px_rgba(99,102,241,0.15)]">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-indigo-500 text-white rounded-full px-4 py-1.5">
                    <Zap className="w-3.5 h-3.5" /> Most popular
                  </div>
                  <h2 className="text-xl font-bold mb-2">Tradexa Pro</h2>
                  <p className="text-neutral-400 text-sm mb-6">The full quant toolkit for serious traders.</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">{prices.price}</span>
                    <span className="text-neutral-500">{prices.suffix}</span>
                  </div>
                  <p className="text-sm text-emerald-400 font-semibold mb-8">
                    Launch price: {prices.launchPrice}
                    {prices.launchSuffix} for the first 100 members
                  </p>
                  <div className="flex-1 mb-8">
                    <FeatureList items={PRO_FEATURES} accent="text-indigo-400" />
                  </div>

                  {stage === 'confirm' && details ? (
                    <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 mb-4">
                      <p className="text-sm text-neutral-300 mb-1">Confirm your subscription</p>
                      <p className="text-2xl font-bold text-white mb-1">
                        {formatPaise(details.amountPaise)}
                        <span className="text-sm font-normal text-neutral-400">
                          {interval === 'monthly' ? ' /month' : ' /year'}
                        </span>
                      </p>
                      {details.planCode === 'PRO_LAUNCH' && (
                        <p className="text-xs text-emerald-400 font-semibold mb-4">
                          Launch offer applied — you locked in 50% off.
                        </p>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStage('idle')}
                          className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={openCheckout}
                          className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors"
                        >
                          Pay Securely
                        </button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-4 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Payments processed securely by Razorpay (UPI, cards, netbanking)
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={stage === 'creating' || stage === 'verifying'}
                      className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-bold transition-colors inline-flex items-center justify-center gap-2"
                    >
                      {(stage === 'creating' || stage === 'verifying') && <Loader2 className="w-5 h-5 animate-spin" />}
                      {stage === 'creating'
                        ? 'Preparing checkout…'
                        : stage === 'verifying'
                          ? 'Confirming payment…'
                          : isAuthenticated
                            ? `Upgrade to Pro`
                            : 'Create Account & Upgrade'}
                    </button>
                  )}

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-2">
                      <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trust row */}
            <div className="mt-12 text-center text-xs text-neutral-500 max-w-2xl mx-auto">
              <p>
                Cancel anytime — your Pro access continues until the end of the billing period.
                Tradexa provides educational tools only; nothing here is financial advice.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
