import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Settings as SettingsIcon, MessageSquare, Users, Store, Box, User, Activity, Image as ImageIcon } from 'lucide-react';
import { ALL_GAMES } from '../games';
import { UserProfile } from '../types';

export const Desktop = ({ 
  profile, 
  installedApps, 
  onOpenStore, 
  onOpenSearch,
  onPlayGame,
  time,
  batteryInfo,
  currentView,
  setCurrentView,
  notificationCount,
  onLogout
}: { 
  profile: UserProfile, 
  installedApps: string[],
  onOpenStore: () => void,
  onOpenSearch: () => void,
  onPlayGame: (game: any) => void,
  time: string,
  batteryInfo: any,
  currentView: string,
  setCurrentView: (view: string) => void,
  notificationCount: number,
  onLogout: () => void
}) => {
  const [startOpen, setStartOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('win11_bg') || 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&w=2000&q=80');

  const installedGames = ALL_GAMES.filter(g => installedApps.includes(g.id));

  const handleStartToggle = () => setStartOpen(!startOpen);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    if (contextMenu) setContextMenu(null);
  };

  const handleChangeBg = () => {
    const url = prompt('Enter image URL for background:');
    if (url) {
      setBgImage(url);
      localStorage.setItem('win11_bg', url);
    }
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  return (
    <div 
      className="absolute inset-0 bg-cover bg-center overflow-hidden z-0" 
      style={{ backgroundImage: `url('${bgImage}')` }}
      onContextMenu={handleContextMenu}
    >
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute bg-[#242424]/90 backdrop-blur-xl border border-white/10 rounded-md shadow-2xl py-1 z-[300] min-w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button onClick={handleChangeBg} className="w-full px-4 py-1.5 text-sm text-left text-white hover:bg-white/10 flex items-center gap-2">
              <ImageIcon size={14} /> Change Background
            </button>
            <div className="h-px bg-white/10 my-1"></div>
            <button onClick={() => setCurrentView('settings')} className="w-full px-4 py-1.5 text-sm text-left text-white hover:bg-white/10 flex items-center gap-2">
              <SettingsIcon size={14} /> Settings
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Icons */}
      <div className="absolute top-0 left-0 bottom-12 p-2 flex flex-col flex-wrap gap-2 content-start w-full pointer-events-none">
        <motion.div drag dragMomentum={false} className="pointer-events-auto">
          <button 
            onClick={onOpenStore}
            className="w-20 p-2 flex flex-col items-center gap-1 hover:bg-white/10 rounded-sm transition-colors text-white"
            onDoubleClick={onOpenStore}
          >
            <div className="w-10 h-10 bg-[#00A4EF] rounded-md flex items-center justify-center shadow-lg">
              <Store size={24} className="text-white" />
            </div>
            <span className="text-xs text-center text-shadow-sm font-medium line-clamp-2 leading-tight drop-shadow-md">Microsoft Store</span>
          </button>
        </motion.div>

        {installedGames.map(game => (
          <motion.div drag dragMomentum={false} key={game.id} className="pointer-events-auto">
            <button 
              onClick={() => onPlayGame(game)}
              onDoubleClick={() => onPlayGame(game)}
              className="w-20 p-2 flex flex-col items-center gap-1 hover:bg-white/10 rounded-sm transition-colors text-white"
            >
              <div className="w-10 h-10 bg-white/10 rounded-md overflow-hidden flex items-center justify-center shadow-lg border border-white/20">
                <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-center text-shadow-sm font-medium line-clamp-2 leading-tight drop-shadow-md">{game.title}</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Start Menu Overlay */}
      <AnimatePresence>
        {startOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[600px] h-[700px] max-h-[80vh] bg-[#242424]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl flex flex-col p-6 z-[200]"
          >
            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Type here to search" className="w-full bg-[#1c1c1c] border-b-2 border-blue-500 rounded-t-md px-4 py-2 pl-10 text-sm text-white focus:outline-none" />
            </div>

            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-sm font-semibold text-white">Pinned</h3>
              <button className="text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors">All apps {'>'}</button>
            </div>

            <div className="grid grid-cols-6 gap-4 mb-8 px-2">
              <button onClick={() => { setStartOpen(false); onOpenStore(); }} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 bg-[#00A4EF] rounded-md flex items-center justify-center group-hover:scale-105 transition-transform"><Store size={20} className="text-white"/></div>
                <span className="text-[11px] text-white/90">Store</span>
              </button>
              <button onClick={() => { setStartOpen(false); setCurrentView('settings'); }} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 bg-zinc-700 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform"><SettingsIcon size={20} className="text-white"/></div>
                <span className="text-[11px] text-white/90">Settings</span>
              </button>
              <button onClick={() => { setStartOpen(false); setCurrentView('friends'); }} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform"><Users size={20} className="text-white"/></div>
                <span className="text-[11px] text-white/90">Friends</span>
              </button>
              <button onClick={() => { setStartOpen(false); setCurrentView('chat'); }} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 bg-purple-600 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform"><MessageSquare size={20} className="text-white"/></div>
                <span className="text-[11px] text-white/90">Chat</span>
              </button>
              <button onClick={() => { setStartOpen(false); setCurrentView('activity'); }} className="flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform"><Activity size={20} className="text-white"/></div>
                <span className="text-[11px] text-white/90">Activity</span>
              </button>
            </div>

            <div className="mt-auto flex items-center justify-between bg-[#1c1c1c] -mx-6 -mb-6 p-4 rounded-b-xl border-t border-white/5">
              <div onClick={() => { setStartOpen(false); setCurrentView('profile'); }} className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-md cursor-pointer transition-colors">
                <img src={profile.avatar} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium text-white">{profile.gamertag}</span>
              </div>
              <button onClick={onLogout} className="text-zinc-400 hover:text-white p-2 hover:bg-white/10 rounded-md transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-[#101010]/80 backdrop-blur-3xl border-t border-white/10 shadow-[0_-2px_15px_rgba(255,255,255,0.03)] flex items-center justify-between px-2 z-[250]">
        <div className="flex-1"></div>
        <div className="flex items-center gap-1.5 justify-center absolute left-1/2 -translate-x-1/2 h-full">
          {/* Windows Start Button */}
          <button 
            onClick={handleStartToggle}
            className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors ${startOpen ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`}
          >
            <svg viewBox="0 0 88 88" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h42v42H0zm46 0h42v42H46zM0 46h42v42H0zm46 0h42v42H46z" fill="#00A4EF"/>
            </svg>
          </button>
          
          <button onClick={() => { setStartOpen(false); onOpenSearch(); }} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors">
            <Search size={20} className="text-white" />
          </button>
          
          <button onClick={() => { setStartOpen(false); setCurrentView('home'); }} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative group">
            {/* Guide Button using an Xbox style icon */}
            <div className="w-7 h-7 rounded-full border-[1.5px] border-white flex items-center justify-center group-hover:bg-green-500 group-hover:border-green-500 transition-colors">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
            </div>
          </button>

          <button onClick={() => { setStartOpen(false); setCurrentView('store'); }} className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors ${currentView === 'store' ? 'bg-white/10 shadow-[0_0_10px_rgba(0,164,239,0.2)]' : ''}`}>
            <Store size={22} className="text-[#00A4EF]" />
          </button>
        </div>
        
        <div className="flex-1 flex justify-end h-full">
          <div className="flex items-center gap-1 hover:bg-white/10 px-2 rounded-md cursor-pointer transition-colors" onClick={() => setCurrentView('notifications')}>
            {batteryInfo.isSupported && (
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect><line x1="22" y1="11" x2="22" y2="13"></line></svg>
                </div>
              </div>
            )}
            <div className="flex flex-col items-end justify-center px-1">
              <span className="text-[11px] font-medium text-white">{time}</span>
              <span className="text-[11px] text-white/80">{new Date().toLocaleDateString()}</span>
            </div>
            {notificationCount > 0 && (
              <div className="relative">
                <Bell size={14} className="text-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
