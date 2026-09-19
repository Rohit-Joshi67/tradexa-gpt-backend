import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Terminal, Zap, ShieldAlert, BarChart3, ArrowRight } from 'lucide-react';

export default function TradexaGPT() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 overflow-hidden relative">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm">T</div>
            Tradexa GPT
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium bg-indigo-500 text-white px-6 py-2 rounded-full hover:bg-indigo-600 transition-colors">
              Try Now
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col items-center text-center relative z-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] opacity-60"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <Brain className="w-4 h-4" /> The Intelligence Layer
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Tradexa-GPT</span>
          </h1>
          <p className="text-xl text-neutral-400 leading-relaxed mb-10">
            A specialized financial language model designed to analyze markets, calculate risk, and build trading discipline. It's not just a chatbot—it's your quantitative co-pilot.
          </p>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-neutral-200 transition-colors">
            Try Now <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <div className="mt-24 grid md:grid-cols-3 gap-8 w-full">
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10 text-left backdrop-blur-sm">
            <ShieldAlert className="w-10 h-10 text-emerald-400 mb-6" />
            <h3 className="text-xl font-bold mb-3">Risk Calculation</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Instantly calculate position sizes, stop-loss distances, and portfolio exposure by simply typing your parameters in plain English.</p>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.1}} className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10 text-left backdrop-blur-sm">
            <BarChart3 className="w-10 h-10 text-indigo-400 mb-6" />
            <h3 className="text-xl font-bold mb-3">Journal Analysis</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Upload your trading journal and let Tradexa-GPT find the mathematical leaks in your strategy, from win-rate drops to outsized losses.</p>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.2}} className="bg-neutral-900/50 p-8 rounded-3xl border border-white/10 text-left backdrop-blur-sm">
            <Zap className="w-10 h-10 text-amber-400 mb-6" />
            <h3 className="text-xl font-bold mb-3">Discipline Engine</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Get unbiased, emotionless feedback on your trade ideas before you execute them, forcing you to stick to your own rules.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
