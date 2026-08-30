import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function StartupAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Sequence timing
    // Phase 0: Cool animation (0-2s)
    // Phase 1: Welcome text bounce in (2s-4s)
    // Phase 2: Created by Zael bounce in (4s-6s)
    // Phase 3: Fade everything out (6s-7s)
    
    const timers = [
      setTimeout(() => setPhase(1), 2000), // Show Welcome
      setTimeout(() => setPhase(2), 3500), // Show Created by
      setTimeout(() => setPhase(3), 5500), // Fade out
      setTimeout(() => onComplete(), 6500) // Unmount
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white overflow-hidden"
        >
          {/* Phase 0 Cool abstract animation */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
             <motion.div
               animate={{ 
                 scale: [1, 2, 2, 1, 1],
                 rotate: [0, 90, 180, 270, 360],
                 borderRadius: ["20%", "50%", "50%", "20%", "20%"]
               }}
               transition={{
                 duration: 4,
                 ease: "easeInOut",
                 times: [0, 0.2, 0.5, 0.8, 1],
                 repeat: Infinity,
               }}
               className="w-64 h-64 bg-green-500/20 blur-3xl"
             />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <AnimatePresence>
              {phase >= 1 && (
                <motion.h1
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.6, duration: 1 }}
                  className="text-4xl md:text-6xl font-black tracking-tight text-center bg-gradient-to-br from-green-400 to-emerald-600 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  Welcome to Darden Ebox V3
                </motion.h1>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.6, duration: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-px bg-green-500/50"></div>
                  <p className="text-zinc-400 font-medium tracking-widest uppercase text-sm">
                    Created by Zael
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
