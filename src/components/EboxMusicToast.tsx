import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, Music } from 'lucide-react';

export function EboxMusicToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [song, setSong] = useState({ title: '', artist: '' });

  useEffect(() => {
    const handlePlay = () => {
      setSong({
        title: 'Halo Theme Mjolnir Mix',
        artist: 'Martin O\'Donnell, Michael Salvatori'
      });
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    window.addEventListener('ebox-music-play', handlePlay);
    return () => window.removeEventListener('ebox-music-play', handlePlay);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[260] bg-zinc-900 border border-green-500/30 shadow-2xl rounded-xl p-4 flex items-center gap-4 w-80"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
            <Music size={24} className="text-green-500" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Headphones size={12} /> Ebox Music
            </span>
            <span className="text-white font-medium truncate">{song.title}</span>
            <span className="text-zinc-400 text-sm truncate">{song.artist}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
