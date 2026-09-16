import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8 pt-32">
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="font-bold text-xl text-white">T TheFinanceWorld</Link>
      </nav>
      <div className="max-w-3xl mx-auto bg-neutral-900/50 p-8 rounded-3xl border border-white/10">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="space-y-6 text-sm leading-relaxed">
          <p>Last updated: September 2026</p>
          <h2 className="text-xl text-white font-semibold">1. Acceptance of Terms</h2>
          <p>By accessing and using TheFinanceWorld and Tradexa tools, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2 className="text-xl text-white font-semibold">2. Educational Purposes Only</h2>
          <p>All content, tools, calculators, and AI responses provided by Tradexa are for educational and informational purposes only. We do not provide financial, investment, or trading advice.</p>
          
          <h2 className="text-xl text-white font-semibold">3. Assumption of Risk</h2>
          <p>Trading financial markets involves a high degree of risk. You alone assume the sole responsibility of evaluating the merits and risks associated with the use of any information or other content on our platform.</p>
        </div>
      </div>
    </div>
  );
}

