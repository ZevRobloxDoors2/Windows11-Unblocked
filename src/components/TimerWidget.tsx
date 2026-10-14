import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Pause, RotateCcw, ExternalLink, X } from 'lucide-react';

interface TimerWidgetProps {
  onOpenRewardWindow: () => void;
}

export function TimerWidget({ onOpenRewardWindow }: TimerWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(300);
  };

  const handleOpenWindow = () => {
    setShowModal(true);
    onOpenRewardWindow();
  };

  return (
    <>
      {/* Desktop Widget */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-6 right-6 w-64 bg-zinc-900/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl text-white z-40 flex flex-col gap-3 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">Focus / Event Timer</h4>
              <p className="text-[10px] text-zinc-400">Countdown timer</p>
            </div>
          </div>
          <button 
            onClick={handleOpenWindow}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            title="Open Window"
          >
            <ExternalLink size={14} />
          </button>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl py-3 px-4 flex items-center justify-between">
          <span className="font-mono text-3xl font-black tracking-widest text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {formatTime(timeLeft)}
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className={`p-2 rounded-lg transition-all ${isRunning ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
              title={isRunning ? "Pause" : "Start"}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button 
              onClick={handleReset} 
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <button 
          onClick={handleOpenWindow}
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Open Window Panel</span>
        </button>
      </motion.div>

      {/* Timer Window Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-white flex flex-col gap-4 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Timer Event Window</h3>
                    <p className="text-xs text-zinc-400">Countdown completed or window opened</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 flex flex-col items-center text-center gap-2">
                <span className="text-3xl">🎉</span>
                <h4 className="font-bold text-lg text-blue-300">Timer Session Finished!</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You have successfully reached your timer milestone. Keep up the amazing focus and enjoy your time exploring Windows 11 Unblocked OS!
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setTimeLeft(300);
                    setIsRunning(true);
                    setShowModal(false);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs transition-colors shadow-lg"
                >
                  Restart Timer (+5m)
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
