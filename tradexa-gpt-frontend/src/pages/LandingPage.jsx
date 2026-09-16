import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BrainCircuit, ShieldAlert, LineChart, ChevronRight, Activity, BookOpen, Brain, Terminal, ChevronDown } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/50 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm">T</div>
          TheFinanceWorld
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <Link to="/tradexa-gpt" className="hover:text-white transition-colors">Tradexa-GPT</Link>
          <Link to="/blogs" className="hover:text-white transition-colors">Finance Blogs</Link>
          <Link to="/risk-calculator" className="hover:text-white transition-colors">Risk Calculator</Link>
          <Link to="/vision" className="hover:text-white transition-colors">Our Vision</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-white hover:text-indigo-400 transition-colors">Log in</Link>
          <Link to="/dashboard" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] mb-8">
            Trade Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Manage Risk Better.</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed mb-10 max-w-2xl">
            The intelligence layer for disciplined traders. Powerful AI-driven tools, risk management calculators, and financial insights to help you make informed decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/risk-calculator" className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-neutral-200 transition-colors">
              Explore Risk Tools <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/tradexa-gpt" className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white/10 transition-colors">
              Meet Tradexa-GPT
            </Link>
          </div>
        </motion.div>

        {/* Abstract Chart Graphic */}
        <motion.div 
          style={{ y }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[600px] hidden lg:block pointer-events-none"
        >
          <div className="w-full h-full border border-white/10 rounded-3xl bg-neutral-900/30 backdrop-blur-sm p-8 relative overflow-hidden">
            <div className="absolute top-10 left-10 w-40 h-24 bg-indigo-500/20 rounded-xl border border-indigo-500/30 flex flex-col justify-center p-4">
              <span className="text-xs text-indigo-300 mb-1">Risk Exposure</span>
              <span className="text-2xl font-bold text-white">1.25%</span>
            </div>
            <div className="absolute bottom-20 right-10 w-48 h-32 bg-emerald-500/20 rounded-xl border border-emerald-500/30 flex flex-col justify-center p-4">
              <span className="text-xs text-emerald-300 mb-1">Win Rate</span>
              <span className="text-3xl font-bold text-white">64.2%</span>
            </div>
            <svg viewBox="0 0 400 400" className="w-full h-full opacity-30">
               <path d="M 0 300 Q 100 200 200 250 T 400 100" fill="none" stroke="url(#grad)" strokeWidth="4" />
               <defs>
                 <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                   <stop offset="0%" stopColor="#6366f1" />
                   <stop offset="100%" stopColor="#10b981" />
                 </linearGradient>
               </defs>
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Value Strip */}
      <div className="w-full border-y border-white/10 bg-white/5 py-4 overflow-hidden flex whitespace-nowrap">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex gap-16 text-sm font-medium tracking-widest uppercase text-neutral-400 items-center"
        >
          <span>Risk Intelligence</span><span>·</span>
          <span>Position Sizing</span><span>·</span>
          <span>Trading Psychology</span><span>·</span>
          <span>Market Insights</span><span>·</span>
          <span>AI Assistance</span><span>·</span>
          <span>Risk Intelligence</span><span>·</span>
          <span>Position Sizing</span><span>·</span>
          <span>Trading Psychology</span><span>·</span>
          <span>Market Insights</span><span>·</span>
          <span>AI Assistance</span>
        </motion.div>
      </div>

      {/* Built for Better Decisions */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Trading isn't about predicting everything.<br />
              It's about managing what you can control.
            </h2>
            <p className="text-xl text-neutral-400 leading-relaxed">
              Tradexa brings essential trading intelligence into one place — helping you understand risk, size positions responsibly, and approach markets with unwavering discipline.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] rounded-3xl border border-white/10 bg-neutral-900/50 p-8 flex flex-col justify-center items-center"
          >
             <div className="flex flex-col gap-4 w-full max-w-sm">
               <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex justify-between items-center">
                  <span className="text-emerald-400 text-sm font-medium">Target</span>
                  <span className="text-white font-mono">24,500</span>
               </div>
               <div className="w-px h-8 bg-neutral-800 mx-auto"></div>
               <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center">
                  <span className="text-neutral-400 text-sm font-medium">Entry</span>
                  <span className="text-white font-mono">24,200</span>
               </div>
               <div className="w-px h-8 bg-neutral-800 mx-auto"></div>
               <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex justify-between items-center">
                  <span className="text-red-400 text-sm font-medium">Stop Loss</span>
                  <span className="text-white font-mono">24,100</span>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Core Tools Bento Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center">Everything you need to trade with discipline.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Card 1 */}
          <Link to="/tradexa-gpt" className="group md:col-span-2 relative rounded-3xl border border-white/10 bg-neutral-900/50 overflow-hidden hover:border-indigo-500/50 transition-colors p-8 flex flex-col justify-end">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] group-hover:bg-indigo-500/30 transition-colors"></div>
            <BrainCircuit className="w-12 h-12 text-indigo-400 mb-auto" />
            <h3 className="text-2xl font-bold mb-2">Tradexa-GPT</h3>
            <p className="text-neutral-400 mb-6 max-w-md">Your AI-powered trading intelligence companion. Analyze markets and manage risk instantly.</p>
            <span className="inline-flex items-center text-sm font-medium text-white gap-2 group-hover:gap-3 transition-all">Explore Tradexa-GPT <ArrowRight className="w-4 h-4"/></span>
          </Link>
          
          {/* Card 2 */}
          <Link to="/risk-calculator" className="group relative rounded-3xl border border-white/10 bg-neutral-900/50 overflow-hidden hover:border-emerald-500/50 transition-colors p-8 flex flex-col justify-end">
            <ShieldAlert className="w-12 h-12 text-emerald-400 mb-auto" />
            <h3 className="text-2xl font-bold mb-2">Risk Calculator</h3>
            <p className="text-neutral-400 mb-6 text-sm">Calculate position size and exposure before entering.</p>
            <span className="inline-flex items-center text-sm font-medium text-white gap-2 group-hover:gap-3 transition-all">Calculate Risk <ArrowRight className="w-4 h-4"/></span>
          </Link>

          {/* Card 3 */}
          <Link to="/blogs" className="group relative rounded-3xl border border-white/10 bg-neutral-900/50 overflow-hidden hover:border-white/30 transition-colors p-8 flex flex-col justify-end">
            <BookOpen className="w-12 h-12 text-neutral-300 mb-auto" />
            <h3 className="text-xl font-bold mb-2">Finance Intelligence</h3>
            <p className="text-neutral-400 mb-6 text-sm">Read practical insights on markets and psychology.</p>
          </Link>

          {/* Card 4 */}
          <div className="group md:col-span-2 relative rounded-3xl border border-white/10 bg-neutral-900/50 overflow-hidden p-8 flex flex-col justify-end">
            <Activity className="w-12 h-12 text-blue-400 mb-auto" />
            <h3 className="text-2xl font-bold mb-2">Know Your Exposure</h3>
            <p className="text-neutral-400 mb-6 max-w-md">Understand exactly how much you're risking across all your active positions in real-time.</p>
          </div>
        </div>
      </section>

      {/* Tradexa-GPT Preview Section */}
      <section className="py-32 border-y border-white/10 bg-neutral-900/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Your trading questions.<br/>One intelligent interface.</h2>
            <p className="text-xl text-neutral-400 leading-relaxed mb-8">
              Tradexa-GPT helps you explore trading concepts, analyze risk scenarios, understand financial concepts, and structure your thinking around the markets.
            </p>
            <Link to="/tradexa-gpt" className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors">
              Try Tradexa-GPT <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="max-w-3xl rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
            <div className="flex gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex-shrink-0 flex items-center justify-center">U</div>
              <div className="bg-neutral-900 rounded-2xl rounded-tl-none p-4 text-sm text-neutral-200">
                How much should I risk on a NIFTY options trade if my account size is ?1,00,000 and my stop loss is 20 points?
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center">T</div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-tl-none p-4 text-sm text-neutral-200 leading-relaxed">
                Based on a standard 1% risk rule, you should risk ?1,000 per trade.<br/><br/>
                With a 20-point stop loss on NIFTY, your risk per lot (25 qty) is ?500.<br/>
                Therefore, your optimal position size is **2 lots (50 quantity)**.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-8 leading-tight italic">
          "The first rule of trading isn't finding the opportunity. It's surviving long enough to find the next one."
        </h2>
        <p className="text-neutral-400 uppercase tracking-widest text-sm font-semibold">Tradexa Risk Philosophy</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-neutral-950 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-white mb-6">
              <div className="w-6 h-6 rounded-md bg-indigo-500 flex items-center justify-center text-xs">T</div>
              Tradexa
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link to="/tradexa-gpt" className="hover:text-white">Tradexa-GPT</Link></li>
              <li><Link to="/risk-calculator" className="hover:text-white">Risk Calculator</Link></li>
              <li><Link to="/blogs" className="hover:text-white">Finance Blogs</Link></li>
              <li><Link to="/login" className="hover:text-white">Trading Tools</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link to="/vision" className="hover:text-white">Our Vision</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/risk-disclaimer" className="hover:text-white">Risk Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-xs text-neutral-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Tradexa. All rights reserved.</p>
          <p className="max-w-2xl text-center md:text-right">
            Tradexa provides educational and informational tools. Nothing on this platform constitutes financial, investment, or trading advice. Trading and investing involve risk, and users should make decisions based on their own circumstances.
          </p>
        </div>
      </footer>
    </div>
  );
}

