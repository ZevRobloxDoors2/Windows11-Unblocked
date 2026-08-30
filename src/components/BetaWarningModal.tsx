import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

export function BetaWarningModal() {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!localStorage.getItem('beta_warning_shown')) {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (show && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [show, timeLeft]);

  const handleClose = () => {
    localStorage.setItem('beta_warning_shown', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-red-900/20 border border-red-500/50 p-8 rounded-2xl max-w-2xl w-full text-center shadow-2xl shadow-red-900/20"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-wider text-red-500">READ ME, WARNING!!</h2>
            <div className="space-y-4 text-zinc-300 text-lg leading-relaxed">
              <p>This is a Educational Website, This website is in BETA! Some games/apps won't work.</p>
              <p className="font-bold text-white text-xl uppercase">DO NOT SHARE WITH OTHERS UNTIL BETA IS OVER</p>
              <p>IF YOU ARE CAUGHT SHARING WITH OTHERS YOU WILL BE REMOVED FROM THIS WEBSITE FOREVER!!!</p>
              <p className="text-blue-400 font-medium">You are a tester for now....</p>
            </div>
            
            <div className="mt-10 h-14">
              {timeLeft > 0 ? (
                <div className="text-zinc-500 font-medium text-lg">
                  Please read the warning. You can close this in {timeLeft}s...
                </div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleClose}
                  className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-colors text-lg shadow-lg"
                >
                  I Understand
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
