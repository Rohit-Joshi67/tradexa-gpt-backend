import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function OurVision() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div className="min-h-[400vh] bg-[#0a0a0a] text-white overflow-hidden relative">
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-black/50 backdrop-blur-md">
        <Link to="/" className="font-bold text-xl">T TheFinanceWorld</Link>
        <Link to="/dashboard" className="bg-emerald-500 text-white px-4 py-2 rounded-full font-medium">Dashboard</Link>
      </nav>
      
      <motion.div 
        style={{ scale, opacity }}
        className="fixed inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
      >
        <h1 className="text-6xl md:text-9xl font-bold tracking-tight mb-6">The Vision.</h1>
        <p className="text-2xl text-neutral-400 max-w-2xl">Scroll to begin the journey</p>
      </motion.div>

      <div className="relative z-10 pt-[100vh]">
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          className="min-h-screen flex items-center justify-start p-12 md:p-32"
        >
          <div className="max-w-3xl bg-neutral-900/50 p-12 rounded-3xl border border-white/10 backdrop-blur-xl">
            <span className="text-emerald-500 font-mono mb-4 block text-xl">01. The Problem</span>
            <h2 className="text-5xl md:text-7xl font-bold mb-8">Emotions cost money.</h2>
            <p className="text-2xl leading-relaxed text-neutral-300">
              Every day, millions of retail traders enter the market based on gut feelings, hype, and fear. Without a mathematical framework, trading becomes gambling. The house always wins.
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          className="min-h-screen flex items-center justify-end p-12 md:p-32"
        >
          <div className="max-w-3xl bg-neutral-900/50 p-12 rounded-3xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px]"></div>
            <span className="text-indigo-400 font-mono mb-4 block text-xl relative z-10">02. The Mathematics</span>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 relative z-10">Trading is Math, Not Magic.</h2>
            <p className="text-2xl leading-relaxed text-neutral-300 relative z-10">
              We believe that with the right position sizing, risk-to-reward ratios, and strict exposure limits, anyone can achieve consistency. The mathematics of trading are absolute.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          className="min-h-screen flex items-center justify-center p-12 md:p-32 text-center"
        >
          <div className="max-w-4xl bg-neutral-900/80 p-16 rounded-[3rem] border border-emerald-500/30 backdrop-blur-xl">
            <span className="text-emerald-500 font-mono mb-4 block text-xl">03. The Goal</span>
            <h2 className="text-6xl md:text-8xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">A Disciplined Generation.</h2>
            <p className="text-3xl leading-relaxed text-neutral-300">
              Our vision is to equip everyday people with the same risk management intelligence used by institutional quants. We are building a generation of disciplined, emotionless, and mathematically sound traders.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
