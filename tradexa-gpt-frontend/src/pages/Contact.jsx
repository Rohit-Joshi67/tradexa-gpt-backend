import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, CheckCircle2, Clock, CreditCard, Bot } from 'lucide-react'
import SiteNav from '../components/ui/SiteNav'
import SiteFooter from '../components/ui/SiteFooter'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'

const SUPPORT_EMAIL = 'support@tradexagpt.com'

const TOPICS = [
  { icon: CreditCard, label: 'Billing & subscriptions' },
  { icon: Bot, label: 'The Tradexa-GPT copilot' },
  { icon: Clock, label: 'Journal & analytics' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function onSubmit(event) {
    event.preventDefault()
    const subject = encodeURIComponent(`Tradexa GPT contact — ${form.name}`)
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <PageHero
        kicker="Contact"
        title="Talk to a human"
        lede="Questions about billing, your journal, or the copilot? Send us a message — we usually reply within 2 business days."
      />

      <section className="sec !pt-0">
        <div className="wrap max-w-3xl">
          <Reveal>
            <div className="flex flex-wrap gap-2.5 justify-center mb-10">
              {TOPICS.map((t) => (
                <span key={t.label} className="badge badge-line !normal-case !tracking-normal !font-medium !text-[13px] !py-2 !px-4">
                  <t.icon size={14} className="text-[var(--color-profit)]" /> {t.label}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel">
              <div className="panel-head">
                <span className="panel-title flex items-center gap-2.5">
                  <span className="grid place-items-center w-9 h-9 rounded-xl bg-[var(--color-profit-dim)] border border-[rgba(14,203,129,.3)]">
                    <Mail size={16} className="text-[var(--color-profit)]" />
                  </span>
                  Send us a message
                </span>
              </div>
              <div className="panel-body">
                {sent ? (
                  <div className="alert alert-ok flex items-start gap-3">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    <span>
                      Your email client should have opened with your message addressed to {SUPPORT_EMAIL}.
                      We&apos;ll get back to you shortly.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label" htmlFor="contact-name">Your name</label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          placeholder="Rohit Sharma"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="field"
                        />
                      </div>
                      <div>
                        <label className="label" htmlFor="contact-email">Your email</label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="field"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor="contact-message">How can we help?</label>
                      <textarea
                        id="contact-message"
                        required
                        rows={6}
                        placeholder="Tell us what's going on…"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="field"
                      />
                    </div>
                    <div>
                      <button type="submit" className="btn btn-profit">
                        <Send size={16} /> Send message
                      </button>
                    </div>
                  </form>
                )}
                <p className="text-[13px] text-[var(--color-faint)] mt-7 leading-relaxed">
                  Prefer email directly? Write to{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[var(--color-muted)] font-semibold hover:text-[var(--color-ink)] transition-colors">
                    {SUPPORT_EMAIL}
                  </a>
                  . Please don&apos;t share passwords or payment details over email.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <p className="text-[13.5px] text-[var(--color-faint)] mt-8 text-center">
              Looking for answers first?{' '}
              <Link to="/faq" className="text-[var(--color-profit)] font-semibold hover:underline">
                Browse the FAQ
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
