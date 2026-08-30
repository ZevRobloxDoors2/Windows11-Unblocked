import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function WelcomeMessage() {
  const [show, setShow] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem('ebox_welcome_message_shown');
    if (!hasShown) {
      // Delay showing until the sign-in screen finishes its fade-in
      const t0 = setTimeout(() => {
        setShow(true);
        localStorage.setItem('ebox_welcome_message_shown', 'true');
      }, 1000);
      
      const t1 = setTimeout(() => {
        setFade(true);
      }, 5000);
      
      const t2 = setTimeout(() => {
        setShow(false);
      }, 6000);

      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {show && !fade && (
        <motion.div
          initial={{ y: '-100vh', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center p-4"
        >
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="bg-black/80 backdrop-blur-md border border-green-500/30 p-8 rounded-2xl shadow-2xl max-w-2xl text-center pointer-events-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              This is the best unblocked website i've ever made, Enjoy!! <br/>
              <span className="text-green-400 text-lg md:text-xl font-medium mt-2 block">This message will only show once.</span>
            </h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
