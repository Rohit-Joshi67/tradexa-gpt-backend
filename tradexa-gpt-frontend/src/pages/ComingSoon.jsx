import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[800px] -top-[400px] -left-[400px] bg-indigo-500/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute w-[600px] h-[600px] -bottom-[300px] -right-[300px] bg-emerald-500/10 rounded-full blur-3xl opacity-50"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-lg"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-6xl mb-6 inline-block"
        >
          ??
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          We're cooking something <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">fire</span>.
        </h1>
        
        <p className="text-neutral-400 text-lg mb-8">
          This feature is currently in the lab. Check back soon for the drop.
        </p>
        
        <Link 
          to="/"
          className="inline-block px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-neutral-200 transition-colors"
        >
          Back to Homepage
        </Link>
      </motion.div>
    </div>
  );
}

