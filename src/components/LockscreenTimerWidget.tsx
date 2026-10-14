import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Play, Pause, RotateCcw, X, Sparkles } from 'lucide-react';

export const LockscreenTimerWidget: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowModal(true);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div 
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        className="z-20 bg-black/40 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl px-5 py-3.5 text-white flex items-center gap-4 cursor-pointer hover:bg-black/50 transition-all hover:scale-105"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
          <Clock size={20} className="animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} className="text-blue-400" /> Event Timer
          </span>
          <span className="text-lg font-bold font-mono tracking-tight text-blue-300">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-2xl p-6 text-white shadow-2xl flex flex-col gap-6 relative"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-zinc-300 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg">
                  <Clock size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Countdown Timer Window</h2>
                  <p className="text-xs text-zinc-400">Manage your event timer and active countdowns</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 bg-black/40 border border-white/10 rounded-xl">
                <span className="text-5xl font-mono font-extrabold text-blue-400 tracking-wider mb-2">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-zinc-400">
                  {timeLeft === 0 ? "Timer completed!" : isRunning ? "Counting down..." : "Timer paused"}
                </span>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                >
                  {isRunning ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
                </button>
                <button
                  onClick={() => { setTimeLeft(300); setIsRunning(true); }}
                  className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                >
                  <RotateCcw size={16} /> Reset (5m)
                </button>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Close Window
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
