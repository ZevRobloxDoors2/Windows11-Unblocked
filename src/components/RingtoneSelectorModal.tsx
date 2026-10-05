import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Music, Play, Upload, X } from 'lucide-react';

const RINGTONE_PRESETS = [
  { id: 'classic', name: 'Classic Discord' },
  { id: 'marimba', name: 'Marimba Chime' },
  { id: 'retro', name: 'Retro Arcade' },
  { id: 'chime', name: 'Crystal Chime' },
  { id: 'digital', name: 'Digital Beep' },
];

export function RingtoneSelectorModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(() => localStorage.getItem('selected_ringtone') || 'classic');
  const [customUrl, setCustomUrl] = useState(() => localStorage.getItem('custom_ringtone_url') || '');

  const playPreview = (type: string, custom?: string) => {
    if (custom) {
      const audio = new Audio(custom);
      audio.play().catch(() => {});
      return;
    }
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      let notes = [523.25, 659.25, 783.99, 1046.5];
      if (type === 'marimba') notes = [440, 880, 659.25, 523.25];
      if (type === 'retro') notes = [300, 450, 600, 900];
      if (type === 'chime') notes = [880, 987.77, 1046.5, 1318.51];
      if (type === 'digital') notes = [700, 700, 900, 900];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type === 'retro' ? 'square' : (type === 'digital' ? 'sawtooth' : 'sine');
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.2, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.25);
      });
    } catch(e) {}
  };

  const handleSelect = (id: string) => {
    setSelected(id);
    localStorage.setItem('selected_ringtone', id);
    playPreview(id);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomUrl(url);
      localStorage.setItem('custom_ringtone_url', url);
      setSelected('custom');
      localStorage.setItem('selected_ringtone', 'custom');
      const audio = new Audio(url);
      audio.play().catch(() => {});
    }
  };

  const isHalloween = localStorage.getItem('halloween_theme') === 'true';

  return (
    <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${isHalloween ? 'bg-[#1c0c03] border-orange-500/40 shadow-[0_0_40px_rgba(255,107,0,0.3)]' : 'bg-zinc-900 border-white/15 shadow-2xl'} border rounded-3xl p-8 w-full max-w-md text-white`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2.5">
            <Music size={26} className={isHalloween ? 'text-orange-400' : 'text-indigo-400'} /> Ringtone Selector
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><X size={20} /></button>
        </div>

        <p className="text-xs text-zinc-300 mb-6 leading-relaxed">Choose your preferred call ringtone preset or upload a custom MP3 audio file. Click Preview to listen!</p>

        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scroll mb-6">
          {RINGTONE_PRESETS.map(preset => (
            <div 
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${selected === preset.id ? (isHalloween ? 'bg-orange-600/30 border-orange-500 text-white' : 'bg-indigo-600/30 border-indigo-500 text-white') : 'bg-black/40 border-white/5 hover:bg-black/60 text-zinc-300'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${selected === preset.id ? (isHalloween ? 'bg-orange-500 shadow-[0_0_10px_orange]' : 'bg-indigo-500 shadow-[0_0_10px_indigo]') : 'bg-zinc-700'}`} />
                <span className="font-bold text-sm">{preset.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); playPreview(preset.id); }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-xs font-semibold transition-colors"
              >
                <Play size={12} /> Preview
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Custom MP3 Ringtone</label>
          <label className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-black/50 border border-dashed border-zinc-600 hover:border-zinc-400 cursor-pointer transition-colors text-sm font-semibold text-zinc-300">
            <Upload size={18} />
            <span>{customUrl ? 'Custom MP3 Loaded ✓' : 'Upload MP3 File...'}</span>
            <input type="file" accept="audio/mp3,audio/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        <button 
          onClick={onClose}
          className={`w-full py-3.5 rounded-2xl font-bold transition-all shadow-lg text-sm ${isHalloween ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
        >
          Save & Close
        </button>
      </motion.div>
    </div>
  );
}
