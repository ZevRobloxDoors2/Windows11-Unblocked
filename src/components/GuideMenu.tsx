import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, User, MessageSquare, Headphones, Gamepad2, X, Users, Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import { ALL_GAMES } from '../games';

type GuideMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  recentGames: any[];
  onNavigate: (view: string, props?: any) => void;
  playingGame?: any;
  onStopGame?: () => void;
};

export function GuideMenu({ isOpen, onClose, recentGames, onNavigate, playingGame, onStopGame }: GuideMenuProps) {
  const [musicState, setMusicState] = useState({
    isPlaying: false,
    track: '',
    artist: '',
    artwork: '',
    progress: 0
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'echo-music-update') {
        setMusicState({
          isPlaying: event.data.isPlaying,
          track: event.data.track,
          artist: event.data.artist,
          artwork: event.data.artwork,
          progress: event.data.progress
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendCommand = (cmd: string) => {
    // Standard request
    window.parent.postMessage({ type: 'echo-music-command', command: cmd }, '*');
    
    // Direct to iframes (since GuideMenu is technically mounted in parent)
    document.querySelectorAll('iframe').forEach(iframe => {
      iframe.contentWindow?.postMessage({ type: 'echo-music-command', command: cmd }, '*');
    });
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const getGame = (id: string) => ALL_GAMES.find(g => g.id === id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 z-[250]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[320px] bg-[#1a1a1a]/80 backdrop-blur-xl border-r border-white/10 z-[251] flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <div className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center">E</div>
                <span>Guide</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleAction(() => onNavigate('profile'))}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-white/10 transition-colors text-white text-left focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <User size={20} className="text-zinc-400" />
                  <span className="font-medium">My Profile</span>
                </button>
                <button 
                  onClick={() => handleAction(() => onNavigate('chat'))}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-white/10 transition-colors text-white text-left focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <MessageSquare size={20} className="text-zinc-400" />
                  <span className="font-medium">Messages</span>
                </button>
                <button 
                  onClick={() => handleAction(() => onNavigate('party'))}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-white/10 transition-colors text-white text-left focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <Users size={20} className="text-zinc-400" />
                  <span className="font-medium">Party</span>
                </button>
                <button 
                  onClick={() => handleAction(() => {
                    // Trigger Ebox Music toast
                    const event = new CustomEvent('ebox-music-play');
                    window.dispatchEvent(event);
                  })}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-white/10 transition-colors text-white text-left focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <Headphones size={20} className="text-zinc-400" />
                  <span className="font-medium">Ebox Music</span>
                </button>
              </div>

              {playingGame && (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10 mt-2">
                  <div className="px-3 pb-2 text-sm font-semibold text-green-400">Now Playing: {playingGame.title}</div>
                  <button 
                    onClick={() => handleAction(() => { if (onStopGame) onStopGame(); })}
                    className="flex items-center gap-3 p-3 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors text-left focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <Gamepad2 size={20} />
                    <span className="font-bold">Quit Game</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider px-3">Recent Games</span>
                <div className="flex flex-col gap-2">
                  {recentGames.slice(0, 4).map((rg: any, idx: number) => {
                    const game = getGame(rg.gameId);
                    if (!game) return null;
                    return (
                      <button 
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors text-left focus:ring-2 focus:ring-green-500 focus:outline-none"
                        onClick={() => handleAction(() => onNavigate('home'))} // Ideally navigate to game or just play it
                      >
                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                          {game.image ? <img src={game.image} alt="" className="w-full h-full object-cover" /> : <Gamepad2 size={20} className="text-zinc-500" />}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-white text-sm font-medium truncate">{game.title}</span>
                          <span className="text-zinc-500 text-xs truncate">Played {new Date(rg.lastPlayed).toLocaleDateString()}</span>
                        </div>
                      </button>
                    )
                  })}
                  {recentGames.length === 0 && (
                    <div className="px-3 text-sm text-zinc-500">No recent games.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Mini Music Player Widget */}
            <div className="p-4 border-t border-white/10 shrink-0 bg-white/5 backdrop-blur-2xl">
              {musicState.track ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {musicState.artwork ? (
                       <img src={musicState.artwork} className="w-12 h-12 rounded bg-zinc-800 object-cover shrink-0 border border-white/10 shadow-md" alt="Album Art" />
                    ) : (
                       <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 shadow-md">
                         <Music size={20} className="text-zinc-500" />
                       </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                      <span className="text-white text-sm font-bold truncate">{musicState.track}</span>
                      <span className="text-zinc-400 text-xs truncate">{musicState.artist || 'Unknown Artist'}</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-300 ease-linear" style={{ width: `${musicState.progress}%` }} />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4 mt-1">
                    <button 
                      onClick={() => sendCommand('prev')}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                      <SkipBack size={18} fill="currentColor" />
                    </button>
                    <button 
                      onClick={() => sendCommand('togglePlay')}
                      className="p-2 text-black bg-white hover:bg-green-400 hover:scale-105 active:scale-95 rounded-full transition-all focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                      {musicState.isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>
                    <button 
                      onClick={() => sendCommand('next')}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                      <SkipForward size={18} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-50">
                   <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center shrink-0 border border-white/5">
                     <Music size={18} className="text-zinc-500" />
                   </div>
                   <div className="flex flex-col flex-1">
                     <span className="text-white text-sm font-medium">Not Playing</span>
                     <span className="text-zinc-500 text-xs">Ebox Music</span>
                   </div>
                </div>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
