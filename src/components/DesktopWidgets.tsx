import React, { useState, useEffect, useRef } from 'react';
import { motion, useDragControls } from 'motion/react';
import { X, Plus, Settings2, Ghost, NotebookPen } from 'lucide-react';

export const DesktopWidgets = () => {
  const [notes, setNotes] = useState<{id: string, text: string, color: string, x: number, y: number}[]>(() => JSON.parse(localStorage.getItem('desktop_notes') || '[]'));
  const [petEnabled, setPetEnabled] = useState(localStorage.getItem('desktop_pet') === 'true');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [petPos, setPetPos] = useState({ x: 200, y: window.innerHeight - 150 });
  
  // OS Customization states (just applying some simple CSS vars/classes to body for effect)
  const [wobble, setWobble] = useState(localStorage.getItem('os_wobble') || '0');
  const [roundness, setRoundness] = useState(localStorage.getItem('os_roundness') || '8');
  
  useEffect(() => {
    localStorage.setItem('desktop_notes', JSON.stringify(notes));
  }, [notes]);
  
  useEffect(() => {
    localStorage.setItem('desktop_pet', String(petEnabled));
  }, [petEnabled]);

  useEffect(() => {
    localStorage.setItem('os_wobble', wobble);
    localStorage.setItem('os_roundness', roundness);
    document.documentElement.style.setProperty('--window-radius', `${roundness}px`);
    document.documentElement.style.setProperty('--window-wobble', `${wobble}deg`);
  }, [wobble, roundness]);

  // Pet movement logic
  useEffect(() => {
    if (!petEnabled) return;
    const interval = setInterval(() => {
      setPetPos(prev => {
        let newX = prev.x + (Math.random() * 40 - 20);
        let newY = prev.y; // keep it bottom
        if (newX < 0) newX = 50;
        if (newX > window.innerWidth - 100) newX = window.innerWidth - 100;
        return { x: newX, y: newY };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [petEnabled]);

  const addNote = () => {
    const colors = ['#fef08a', '#fbcfe8', '#bfdbfe', '#bbf7d0', '#fed7aa'];
    setNotes([...notes, {
      id: Date.now().toString(),
      text: 'New note...',
      color: colors[Math.floor(Math.random() * colors.length)],
      x: 100,
      y: 100
    }]);
  };

  const updateNote = (id: string, text: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text } : n));
  };
  
  const moveNote = (id: string, point: {x: number, y: number}) => {
     setNotes(notes.map(n => n.id === id ? { ...n, x: n.x + point.x, y: n.y + point.y } : n));
  }

  const removeNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <>
      {/* Widget Toggle Menu (small FAB on desktop) */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
        <button onClick={addNote} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20 transition-all shadow-lg" title="Add Sticky Note">
          <NotebookPen size={18} />
        </button>
        <button onClick={() => setPetEnabled(!petEnabled)} className={`w-10 h-10 ${petEnabled ? 'bg-indigo-500/80 hover:bg-indigo-500' : 'bg-white/10 hover:bg-white/20'} backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20 transition-all shadow-lg`} title="Toggle Desktop Pet">
          <Ghost size={18} />
        </button>
        <button onClick={() => setShowCustomizer(!showCustomizer)} className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white border border-white/20 transition-all shadow-lg" title="OS Customizer">
          <Settings2 size={18} />
        </button>
      </div>

      {/* OS Customizer Widget */}
      {showCustomizer && (
        <motion.div 
          drag 
          dragMomentum={false}
          className="absolute z-50 bg-[#252525] border border-white/10 p-4 rounded-xl shadow-2xl w-64 text-white"
          initial={{ opacity: 0, scale: 0.9, x: window.innerWidth - 300, y: 150 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">OS Customizer</h3>
            <button onClick={() => setShowCustomizer(false)} className="text-white/50 hover:text-white"><X size={16} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/70 flex justify-between">Window Roundness <span>{roundness}px</span></label>
              <input type="range" min="0" max="32" value={roundness} onChange={e => setRoundness(e.target.value)} className="w-full accent-blue-500 h-1 mt-1 bg-white/20 rounded-full appearance-none" />
            </div>
            <div>
              <label className="text-xs text-white/70 flex justify-between">Window Wobble <span>{wobble}deg</span></label>
              <input type="range" min="0" max="5" step="0.5" value={wobble} onChange={e => setWobble(e.target.value)} className="w-full accent-purple-500 h-1 mt-1 bg-white/20 rounded-full appearance-none" />
            </div>
            <p className="text-[10px] text-white/40 mt-2 leading-tight">These inject CSS vars that would affect windows if they were mapped to them.</p>
          </div>
        </motion.div>
      )}

      {/* Sticky Notes */}
      {notes.map(note => (
        <motion.div
          key={note.id}
          drag
          dragMomentum={false}
          onDragEnd={(e, info) => moveNote(note.id, info.offset)}
          initial={{ x: note.x, y: note.y }}
          className="absolute z-30 w-48 min-h-[150px] shadow-lg rounded-sm overflow-hidden flex flex-col group cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: note.color, x: note.x, y: note.y }}
        >
          <div className="h-6 bg-black/10 flex items-center justify-between px-2 shrink-0">
             <span className="text-[10px] font-medium text-black/50">Note</span>
             <button onClick={() => removeNote(note.id)} className="text-black/40 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
          </div>
          <textarea 
            value={note.text} 
            onChange={e => updateNote(note.id, e.target.value)}
            className="flex-1 w-full bg-transparent p-3 text-black/80 font-medium text-sm resize-none focus:outline-none placeholder-black/30"
            placeholder="Type here..."
          />
        </motion.div>
      ))}

      {/* Desktop Pet */}
      {petEnabled && (
        <motion.div
          animate={{ x: petPos.x, y: petPos.y }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute z-20 cursor-pointer pointer-events-auto drop-shadow-xl"
          whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const sounds = ['Meow!', 'Purrr...', 'Hello!', '?'];
            alert(`Pet says: ${sounds[Math.floor(Math.random() * sounds.length)]}`);
          }}
        >
          {/* Simple SVG pixel cat */}
          <div className="w-12 h-12 relative flex items-end">
            <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
               <path fill="#ffffff" d="M12 16h8v8h-8z"/>
               <path fill="#ffffff" d="M10 12h4v4h-4z"/>
               <path fill="#ffffff" d="M18 12h4v4h-4z"/>
               <path fill="#000000" d="M13 18h2v2h-2z"/>
               <path fill="#000000" d="M17 18h2v2h-2z"/>
               <path fill="#ff9999" d="M15 20h2v2h-2z"/>
            </svg>
          </div>
        </motion.div>
      )}
    </>
  );
};
