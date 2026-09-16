import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function HorizontalDisclaimer() {
  return (
    <div className="w-full bg-red-500/10 border-y border-red-500/20 py-3 overflow-hidden flex whitespace-nowrap">
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        className="flex items-center gap-12 text-sm font-medium uppercase text-red-400 tracking-widest"
      >
        {Array(10).fill(0).map((_, i) => (
          <span key={i} className="flex items-center gap-4">
            <AlertTriangle className="w-4 h-4" />
            RISK DISCLAIMER: TRADING INVOLVES SIGNIFICANT RISK. FOR EDUCATIONAL PURPOSES ONLY. DO NOT RISK MONEY YOU CANNOT AFFORD TO LOSE.
          </span>
        ))}
      </motion.div>
    </div>
  );
}

