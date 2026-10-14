import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CloudRain, Sun, Trophy, Compass, Film, Gamepad2 } from 'lucide-react';
import { LockscreenTimerWidget } from './LockscreenTimerWidget';

interface WidgetsFlyoutProps {
  onClose: () => void;
  weather: { temp: number, condition: string } | null;
}

export const WidgetsFlyout: React.FC<WidgetsFlyoutProps> = ({ onClose, weather }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex justify-start items-start p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-[#202020]/95 backdrop-blur-2xl border border-white/15 w-full max-w-lg h-[85vh] rounded-3xl shadow-2xl p-6 text-white flex flex-col overflow-hidden cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">Widgets</span>
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-zinc-300">October 14</span>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-zinc-300 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Widgets Scrollable Container */}
          <div className="flex-1 overflow-y-auto pr-2 mt-4 flex flex-col gap-4 custom-scrollbar">
            
            {/* Timer Widget Card (Requested to be inside the weather/widgets panel) */}
            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Active Widget</span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              </div>
              <LockscreenTimerWidget />
            </div>

            {/* Weather Card */}
            <div className="bg-gradient-to-br from-blue-600/30 to-sky-600/30 border border-blue-400/30 rounded-2xl p-5 flex flex-col gap-2 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Joliet</span>
                <CloudRain size={20} className="text-blue-300" />
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold">{weather ? `${weather.temp}°F` : '64°F'}</span>
                <span className="text-sm text-blue-200">{weather ? weather.condition : 'Raining off and on'}</span>
              </div>
            </div>

            {/* Discover / Games Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-2"><Gamepad2 size={16} className="text-emerald-400" /> Featured Games</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 rounded-xl p-3 text-center text-xs font-semibold border border-white/5 hover:border-white/20 transition-all cursor-pointer">GTA V / VI</div>
                <div className="bg-black/30 rounded-xl p-3 text-center text-xs font-semibold border border-white/5 hover:border-white/20 transition-all cursor-pointer">Eaglercraft</div>
                <div className="bg-black/30 rounded-xl p-3 text-center text-xs font-semibold border border-white/5 hover:border-white/20 transition-all cursor-pointer">1v1 LOL</div>
              </div>
            </div>

            {/* MLB Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-2"><Trophy size={16} className="text-amber-400" /> MLB Scoreboard</span>
                <span className="text-xs text-zinc-400">Final</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-black/30 p-3 rounded-xl border border-white/5">
                <span>Guardians</span>
                <span className="font-bold">1 - 3</span>
                <span>Rays</span>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
