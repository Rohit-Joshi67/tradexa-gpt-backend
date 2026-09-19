import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AboutVision() {
  const { scrollYProgress } = useScroll();
  const { isAuthenticated, authReady } = useAuth();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  return (
    <div className="min-h-[200vh] bg-neutral-950 text-white overflow-hidden relative">
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-neutral-950/50 backdrop-blur-md">
        <Link to="/" className="font-bold text-xl">T Tradexa GPT</Link>
        {authReady && isAuthenticated ? (
          <Link to="/dashboard" className="bg-emerald-500 text-white px-4 py-2 rounded-full font-medium">Dashboard</Link>
        ) : (
          <Link to="/register" className="bg-emerald-500 text-white px-4 py-2 rounded-full font-medium">Get started</Link>
        )}
      </nav>
      
      <motion.div 
        style={{ scale, opacity }}
        className="fixed inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">Our Vision</h1>
        <p className="text-2xl text-neutral-400 max-w-2xl">Scroll to begin the journey</p>
      </motion.div>

      <div className="relative z-10 pt-[100vh]">
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="min-h-screen flex items-center justify-center p-6"
        >
          <div className="max-w-4xl text-center bg-neutral-900/50 p-12 rounded-3xl border border-white/10 backdrop-blur-xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Trading is Math, Not Magic</h2>
            <p className="text-xl leading-relaxed text-neutral-300">
              Our goal is simple: We want to equip everyday people with institutional-grade risk management tools. Too many traders rely on emotion. We believe that with the right mathematics, discipline, and AI tools, anyone can become a consistently profitable trader.
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="min-h-screen flex items-center justify-center p-6"
        >
          <div className="max-w-4xl text-center bg-neutral-900/50 p-12 rounded-3xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px]"></div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10">Building a Disciplined Generation</h2>
            <p className="text-xl leading-relaxed text-neutral-300 relative z-10">
              By removing the guesswork from position sizing and exposure tracking, we allow you to focus on what matters: the process. Welcome to the future of trading intelligence.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

