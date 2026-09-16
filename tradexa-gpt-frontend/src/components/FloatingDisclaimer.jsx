import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function FloatingDisclaimer() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 z-50"
      >
        <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-md">
          <div className="bg-emerald-500/20 p-2 rounded-full">
            <AlertTriangle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-1">Risk Disclaimer</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Trading involves significant risk. The tools provided are for educational and informational purposes only. Do not risk money you cannot afford to lose.
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

