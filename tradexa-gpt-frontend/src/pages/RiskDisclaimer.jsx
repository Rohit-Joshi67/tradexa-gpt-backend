import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function RiskDisclaimer() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8 pt-32">
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="font-bold text-xl text-white">T Tradexa GPT</Link>
      </nav>
      <div className="max-w-3xl mx-auto bg-neutral-900/50 p-8 rounded-3xl border border-white/10">
        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <h1 className="text-4xl font-bold text-white">Risk Disclaimer</h1>
        </div>
        <div className="space-y-6 text-sm leading-relaxed">
          <p>Last updated: September 2026</p>

          <h2 className="text-xl text-white font-semibold">1. Trading Involves Substantial Risk</h2>
          <p>Trading in equities, derivatives, commodities, and currencies involves a high level of risk and may not be suitable for all investors. You could lose some or all of your invested capital. Never trade with money you cannot afford to lose.</p>

          <h2 className="text-xl text-white font-semibold">2. No Financial Advice</h2>
          <p>Tradexa GPT provides educational and informational tools only. Nothing on this platform — including the AI copilot, leak reports, pre-trade checks, analytics, or articles — constitutes financial, investment, legal, or tax advice, or a recommendation to buy, sell, or hold any security or derivative. All outputs are for your own analysis and decision-making.</p>

          <h2 className="text-xl text-white font-semibold">3. No Guaranteed Returns</h2>
          <p>We make no representation or warranty, express or implied, about profits, returns, or the accuracy of any calculation, simulation, or AI-generated output. Monte Carlo simulations and backtested-style statistics are based on historical or hypothetical data and do not predict future performance.</p>

          <h2 className="text-xl text-white font-semibold">4. Past Performance</h2>
          <p>Past performance of any trading strategy, including your own journaled trades, is not indicative of future results. Market conditions change, and strategies that worked previously may not work going forward.</p>

          <h2 className="text-xl text-white font-semibold">5. AI-Generated Content</h2>
          <p>The Tradexa-GPT copilot generates responses using a language model. It can make mistakes, misinterpret data, or produce plausible-sounding but incorrect analysis. Always verify critical numbers yourself before acting on them.</p>

          <h2 className="text-xl text-white font-semibold">6. Seek Professional Advice</h2>
          <p>Consider consulting a SEBI-registered investment adviser or your financial professional before making investment decisions. You are solely responsible for your own trading decisions and their outcomes.</p>

          <h2 className="text-xl text-white font-semibold">7. Your Responsibility</h2>
          <p>By using Tradexa GPT, you acknowledge that you understand these risks and accept full responsibility for any trades you place and any losses you may incur.</p>
        </div>
      </div>
    </div>
  );
}
