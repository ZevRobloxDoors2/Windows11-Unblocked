import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function FakeUpdate({ onClose }: { onClose: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret keybind to exit (e.g. Esc)
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    // Slow progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onClose, 2000);
          return 100;
        }
        // Randomly increment by 0, 1, or 2
        return p + Math.floor(Math.random() * 3);
      });
    }, 4000); // Very slow

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0078D7] text-white flex flex-col items-center justify-center font-segoe cursor-none">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-8"></div>
      <h1 className="text-3xl font-light mb-4">Working on updates {progress}%</h1>
      <p className="text-xl font-light">Please keep your computer on.</p>
    </div>
  );
}
