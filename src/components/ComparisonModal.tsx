import React from 'react';
import { motion } from 'motion/react';
import { Zap, Feather, Check, X } from 'lucide-react';

interface ComparisonModalProps {
  onSelectPreset: (preset: 'high' | 'low') => void;
}

export function ComparisonModal({ onSelectPreset }: ComparisonModalProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl max-w-4xl w-full shadow-2xl text-white flex flex-col gap-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-blue-400 mb-2">Choose Your Experience Preset</h2>
          <p className="text-zinc-400 text-sm">Select the performance and visual mode that best fits your computer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* High Preset */}
          <div className="bg-zinc-800/80 border-2 border-blue-500/80 rounded-xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-blue-400 transition-all">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMMENDED FOR FAST PCS
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Zap size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">High Preset</h3>
                  <p className="text-xs text-blue-300">Maximum visual fidelity & features</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>Wobbly Window animations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>Quick Resume (save game states)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>High Quality App / Games Images</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>Taskbar Blur & Glassmorphism</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>More UI Animations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-yellow-400 shrink-0" />
                  <span>Standard Loading Speed</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => onSelectPreset('high')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg transition-colors text-white shadow-lg"
            >
              Select High Preset
            </button>
          </div>

          {/* Low Preset */}
          <div className="bg-zinc-800/80 border-2 border-emerald-500/80 rounded-xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-400 transition-all">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              OPTIMIZED FOR SCHOOL LAPTOPS
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Feather size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Low Preset</h3>
                  <p className="text-xs text-emerald-300">Maximum speed & lightweight</p>
                </div>
              </div>

              <ul className="space-y-3 mb-8 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>Faster Loading & Performance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>Less Files Running in Page Background</span>
                </li>
                <li className="flex items-center gap-2">
                  <X size={18} className="text-red-400 shrink-0" />
                  <span className="line-through text-zinc-500">Wobbly Window</span>
                </li>
                <li className="flex items-center gap-2">
                  <X size={18} className="text-red-400 shrink-0" />
                  <span className="line-through text-zinc-500">Quick Resume</span>
                </li>
                <li className="flex items-center gap-2">
                  <X size={18} className="text-red-400 shrink-0" />
                  <span className="line-through text-zinc-500">High Quality App / Games Images</span>
                </li>
                <li className="flex items-center gap-2">
                  <X size={18} className="text-red-400 shrink-0" />
                  <span className="line-through text-zinc-500">Taskbar Blur</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-400 shrink-0" />
                  <span>Less Animations & Fan-made SVG Images</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => onSelectPreset('low')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg transition-colors text-white shadow-lg"
            >
              Select Low Preset
            </button>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-400 italic">
            "You can change your choices in the settings"
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
