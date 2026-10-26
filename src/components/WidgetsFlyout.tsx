import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CloudRain, Sun, Trophy, Compass, Film, Gamepad2, Plus, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { LockscreenTimerWidget } from './LockscreenTimerWidget';

interface WidgetsFlyoutProps {
  onClose: () => void;
  weather: { temp: number; condition: string } | null;
}

export const WidgetsFlyout: React.FC<WidgetsFlyoutProps> = ({ onClose, weather }) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[350] bg-black/40 backdrop-blur-xs flex justify-start items-start p-3 sm:p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: -480, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -480, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="win11-mica border border-white/[0.14] w-full max-w-lg h-[90vh] rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.7)] p-6 text-white flex flex-col overflow-hidden cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Windows 11 Widgets Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight">Widgets</span>
              <span className="text-xs bg-white/[0.08] px-2.5 py-1 rounded-full text-zinc-300 font-medium">
                {dateFormatted}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-white/[0.08] flex items-center justify-center transition-colors text-zinc-400 hover:text-white cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Widgets Scrollable Container */}
          <div className="flex-1 overflow-y-auto pr-1 mt-4 flex flex-col gap-4 custom-scrollbar">
            
            {/* Timer Widget Card */}
            <div className="bg-gradient-to-br from-blue-900/40 via-indigo-950/40 to-black/40 border border-blue-500/30 rounded-2xl p-5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={13} /> Active Timer Widget
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              </div>
              <LockscreenTimerWidget />
            </div>

            {/* Weather Card */}
            <div className="bg-gradient-to-br from-blue-600/30 via-sky-600/20 to-zinc-900/40 border border-blue-400/30 rounded-2xl p-5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Current Forecast</span>
                <Sun size={20} className="text-amber-400 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold">{weather ? `${weather.temp}°F` : '72°F'}</span>
                <span className="text-sm text-blue-200">{weather ? weather.condition : 'Partly cloudy'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.08] text-center text-xs text-zinc-300">
                <div className="p-1 rounded bg-black/20">
                  <span className="block text-[10px] text-zinc-400">Today</span>
                  <span className="font-bold">{weather ? `${weather.temp}°` : '72°'}</span>
                </div>
                <div className="p-1 rounded bg-black/20">
                  <span className="block text-[10px] text-zinc-400">Tomorrow</span>
                  <span className="font-bold">{weather ? `${weather.temp - 2}°` : '70°'}</span>
                </div>
                <div className="p-1 rounded bg-black/20">
                  <span className="block text-[10px] text-zinc-400">Wednesday</span>
                  <span className="font-bold">{weather ? `${weather.temp + 3}°` : '75°'}</span>
                </div>
              </div>
            </div>

            {/* Discover & Featured Games Card */}
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gamepad2 size={15} /> Top Games & Community
                </span>
                <span className="text-[10px] text-zinc-400">Updated Live</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 rounded-xl p-3 text-center text-xs font-semibold border border-white/[0.06] hover:border-blue-500/40 hover:bg-blue-600/10 transition-all cursor-pointer">
                  🎮 GTA V / VI
                </div>
                <div className="bg-black/30 rounded-xl p-3 text-center text-xs font-semibold border border-white/[0.06] hover:border-blue-500/40 hover:bg-blue-600/10 transition-all cursor-pointer">
                  🧱 Eaglercraft
                </div>
                <div className="bg-black/30 rounded-xl p-3 text-center text-xs font-semibold border border-white/[0.06] hover:border-blue-500/40 hover:bg-blue-600/10 transition-all cursor-pointer">
                  🎯 1v1 LOL
                </div>
              </div>
            </div>

            {/* Sports & Trophy Milestones */}
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy size={14} /> E-Box Community Scoreboard
                </span>
                <span className="text-[10px] text-zinc-400">Live</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-black/30 p-3 rounded-xl border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white">Arcade Champions</span>
                </div>
                <span className="font-bold text-amber-400">+100 🏆 Milestone</span>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
export default WidgetsFlyout;
