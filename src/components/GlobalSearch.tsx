import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Headphones, X, Settings, Users, MessageSquare, Gamepad2, User, Flame } from 'lucide-react';
import { ALL_GAMES } from '../games';

type GlobalSearchProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, props?: any) => void;
  onPlayGame: (game: {id: string, title: string, file: string}) => void;
};

const SYSTEM_APPS = [
  { id: 'settings', title: 'Settings', type: 'system', icon: Settings },
  { id: 'profile', title: 'My Profile', type: 'system', icon: User },
  { id: 'friends', title: 'Friends', type: 'system', icon: Users },
  { id: 'party', title: 'Party', type: 'system', icon: Headphones },
  { id: 'chat', title: 'Messages', type: 'system', icon: MessageSquare },
  { id: 'activity', title: 'Activity Feed', type: 'system', icon: Flame },
  { id: 'library', title: 'My games & apps', type: 'system', icon: Gamepad2 }
];

export function GlobalSearch({ isOpen, onClose, onNavigate, onPlayGame }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredGames = ALL_GAMES.filter(g => g.title.toLowerCase().includes(query.toLowerCase()));
  const filteredApps = SYSTEM_APPS.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
  const results = [...filteredApps, ...filteredGames];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results]);

  const handleSelect = (item: any) => {
    onClose();
    if (item.type === 'system') {
      onNavigate(item.id);
    } else {
      onPlayGame({ id: item.id, title: item.title, file: item.file });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-12 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[1000] overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center gap-4 p-4 border-b border-white/10 shrink-0">
              <Search className="text-zinc-400" size={24} />
              <input 
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games, apps, and more..."
                className="flex-1 bg-transparent text-xl text-white outline-none placeholder:text-zinc-500"
              />
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-zinc-400" />
              </button>
            </div>
            
            {query.length > 0 && (
              <div className="overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {results.map((item, idx) => (
                      <div 
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      >
                        {item.type === 'system' ? (
                          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                            {React.createElement((item as any).icon, { size: 24, className: "text-zinc-300" })}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden">
                            <img src={(item as any).image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{item.title}</span>
                          <span className="text-sm text-zinc-400">{item.type === 'system' ? 'System App' : (item.type === 'game' ? 'Game' : 'App')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {query.length === 0 && (
               <div className="p-8 text-center text-zinc-500">
                  Type to start searching...
               </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
