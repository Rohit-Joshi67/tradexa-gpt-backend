import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle } from 'lucide-react';

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
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl bg-neutral-900/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="text-white font-medium">{q}</span>
        <ChevronDown className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Faq() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8 pt-32">
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="font-bold text-xl text-white">T Tradexa GPT</Link>
      </nav>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8 text-indigo-400" />
          <h1 className="text-4xl font-bold text-white">FAQ</h1>
        </div>
        <p className="text-sm mb-8">Quick answers to the questions we hear most.</p>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <Item key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
        <p className="text-sm text-neutral-500 mt-8">
          Still stuck? <Link to="/contact" className="text-indigo-400 hover:text-indigo-300">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
