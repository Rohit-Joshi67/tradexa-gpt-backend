import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 p-8 pt-32">
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="font-bold text-xl text-white">T TheFinanceWorld</Link>
        <Link to="/dashboard" className="bg-emerald-500 text-white px-4 py-2 rounded-full font-medium">Dashboard</Link>
      </nav>
      <div className="max-w-4xl mx-auto bg-neutral-900/50 p-12 rounded-3xl border border-white/10">
        <h1 className="text-5xl font-bold text-white mb-12">About The Company</h1>
        <div className="space-y-8 text-base leading-relaxed">
          <section>
            <h2 className="text-2xl text-white font-semibold mb-4">Corporate Overview</h2>
            <p>Tradexa Technologies operates at the intersection of quantitative finance and artificial intelligence. Founded with the mission to democratize institutional-grade trading tools, we provide retail traders with mathematical risk management software and AI-driven market intelligence.</p>
          </section>
          
          <section>
            <h2 className="text-2xl text-white font-semibold mb-4">Core Business Operations</h2>
            <p>Our primary product suite includes Tradexa-GPT, a specialized financial language model, and our proprietary Risk Calculator engine. These tools are designed to integrate seamlessly into a trader's daily workflow, enforcing strict risk parameters and providing real-time exposure tracking.</p>
          </section>
          
          <section>
            <h2 className="text-2xl text-white font-semibold mb-4">Leadership & Engineering</h2>
            <p>Headquartered in a fully remote environment, our team consists of software engineers, quantitative analysts, and financial technology experts dedicated to building scalable, secure, and highly reliable trading infrastructure.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
