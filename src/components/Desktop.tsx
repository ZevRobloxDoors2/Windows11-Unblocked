import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Settings as SettingsIcon, MessageSquare, Users, Store, Box, User, Activity, Image as ImageIcon, Mic, GraduationCap, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ALL_GAMES } from '../games';
import { UserProfile } from '../types';
import { DesktopWidgets } from './DesktopWidgets';

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
  openViews,
  minimizedViews,
  playingGame,
  suspendedGames,
  onMinimizeGame,
  notificationCount,
  onLogout,
  onActivateDeadComputer,
  onOpenModerationPanel,
  onOpenVerification
}: { 
  profile: UserProfile, 
  installedApps: string[],
  onOpenStore: () => void,
  onOpenSearch: () => void,
  onPlayGame: (game: any) => void,
  onMinimizeGame?: (gameId: string) => void,
  time: string,
  batteryInfo: any,
  currentView: string,
  setCurrentView: (view: string) => void,
  openViews?: string[],
  minimizedViews?: string[],
  playingGame?: any,
  suspendedGames?: any[],
  notificationCount: number,
  onLogout: () => void,
  onActivateDeadComputer?: () => void,
  onOpenModerationPanel?: () => void,
  onOpenVerification?: () => void
}) => {
  const [startOpen, setStartOpen] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (window.confirm("Do you want to set this image as your wallpaper? (Cancel to save to My Documents/Pictures)")) {
          localStorage.setItem('custom_wallpaper', dataUrl);
          window.location.reload();
        } else {
          const files = JSON.parse(localStorage.getItem('my_documents_files') || '[]');
          files.push({
            id: Date.now().toString(),
            name: file.name,
            type: 'image',
            content: dataUrl,
            folder: 'Pictures'
          });
          localStorage.setItem('my_documents_files', JSON.stringify(files));
          alert('Image saved to My Documents > Pictures!');
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const [weather, setWeather] = useState<{ temp: number, condition: string } | null>(null);
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const ipData = await ipRes.json();
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ipData.latitude}&longitude=${ipData.longitude}&current_weather=true&temperature_unit=fahrenheit`);
        const data = await weatherRes.json();
        
        const wmoMap: Record<number, string> = {
          0: 'Clear sky',
          1: 'Mainly clear',
          2: 'Partly cloudy',
          3: 'Overcast',
          45: 'Fog',
          48: 'Depositing rime fog',
          51: 'Light Drizzle',
          53: 'Moderate Drizzle',
          55: 'Dense Drizzle',
          56: 'Light Freezing Drizzle',
          57: 'Dense Freezing Drizzle',
          61: 'Slight Rain',
          63: 'Moderate Rain',
          65: 'Heavy Rain',
          66: 'Light Freezing Rain',
          67: 'Heavy Freezing Rain',
          71: 'Slight Snow',
          73: 'Moderate Snow',
          75: 'Heavy Snow',
          77: 'Snow grains',
          80: 'Slight Rain Showers',
          81: 'Moderate Rain Showers',
          82: 'Violent Rain Showers',
          85: 'Slight Snow Showers',
          86: 'Heavy Snow Showers',
          95: 'Thunderstorm',
          96: 'Thunderstorm with Hail',
          99: 'Thunderstorm with Heavy Hail'
        };

        setWeather({
          temp: Math.round(data.current_weather.temperature),
          condition: wmoMap[data.current_weather.weathercode] || 'Unknown'
        });
      } catch (e) {
        console.error(e);
        setWeather({ temp: 72, condition: "Partly cloudy" });
      }
    };
    fetchWeather();
  }, []);
  const [showCredits, setShowCredits] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showBatteryNotice, setShowBatteryNotice] = useState(false);
  
  const [qsWifi, setQsWifi] = useState(true);
  const [qsSound, setQsSound] = useState(true);
  const [qsDnd, setQsDnd] = useState(false);
  const [qsLowPower, setQsLowPower] = useState(false);

  const [fullscreenCountdown, setFullscreenCountdown] = useState(5);
  const [showFullscreenModal, setShowFullscreenModal] = useState(true);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const [isHalloween, setIsHalloween] = useState(() => localStorage.getItem('halloween_theme') === 'true');
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('win11_bg') || 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&w=2000&q=80');
  const halloweenBg = '/minecraft_halloween.jpg';
  const currentBg = isHalloween ? halloweenBg : bgImage;

  useEffect(() => {
    if (fullscreenCountdown > 0) {
      const timer = setTimeout(() => setFullscreenCountdown(fullscreenCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (fullscreenCountdown === 0 && showFullscreenModal) {
      setShowFullscreenModal(false);
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => console.log('Fullscreen blocked by browser'));
        }
      } catch(e) {}
    }
  }, [fullscreenCountdown, showFullscreenModal]);

  useEffect(() => {
    // Show battery notice shortly after desktop mounts
    const timer = setTimeout(() => setShowBatteryNotice(true), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  const handlePanicMode = () => {
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.body.style.margin = '0';
      win.document.body.style.height = '100vh';
      const iframe = win.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.margin = '0';
      iframe.src = 'https://classroom.google.com';
      win.document.body.appendChild(iframe);
      window.location.replace('https://google.com');
    } else {
      window.location.replace('https://classroom.google.com');
    }
  };

  const handleDisguiseMode = () => {
    document.title = 'Dashboard';
    let link: HTMLLinkElement = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico';
    setShowQuickSettings(false);
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  return (
    <div 
      className={`absolute inset-0 bg-cover bg-center overflow-hidden z-0 ${isHalloween ? 'brightness-90 saturate-125' : ''}`} 
      style={{ backgroundImage: `url('${currentBg}')` }}
      onContextMenu={handleContextMenu}
    >
      {/* Spooky Halloween ambient glow overlay */}
      {isHalloween && (
        <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px]" />
        </div>
      )}
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

            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-sm font-semibold text-white">Recommended</h3>
              <button className="text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors">More {'>'}</button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4 px-2 overflow-y-auto max-h-[220px]">
              {installedGames.slice(0, 6).map(game => (
                <button 
                  key={`rec-${game.id}`}
                  onClick={() => { setStartOpen(false); onPlayGame(game); }} 
                  className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-md transition-colors"
                >
                  <img src={game.image} alt={game.title} className="w-8 h-8 rounded object-cover" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white truncate max-w-[120px]">{game.title}</span>
                    <span className="text-[10px] text-white/50">Recently opened</span>
                  </div>
                </button>
              ))}
              {openViews && openViews.length > 0 && openViews.slice(0, 2).map(view => (
                <button 
                  key={`rec-app-${view}`}
                  onClick={() => { setStartOpen(false); setCurrentView(view); }} 
                  className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                     <SettingsIcon size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white capitalize">{view}</span>
                    <span className="text-[10px] text-white/50">Recently opened</span>
                  </div>
                </button>
              ))}
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

      {/* Quick Settings Modal */}
      <AnimatePresence>
        {showQuickSettings && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-16 right-4 w-80 bg-[#242424]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl flex flex-col p-5 z-[200]"
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button onClick={() => setQsWifi(!qsWifi)} className="flex flex-col items-center gap-2 group">
                <div className={`w-full aspect-video rounded-md flex items-center justify-center transition-colors ${qsWifi ? 'bg-[#00A4EF]/20 border border-[#00A4EF]/30 group-hover:bg-[#00A4EF]/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={qsWifi ? "#00A4EF" : "white"} strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                </div>
                <span className="text-[10px] text-white/90 font-medium">Wi-Fi</span>
              </button>
              <button onClick={() => setQsSound(!qsSound)} className="flex flex-col items-center gap-2 group">
                <div className={`w-full aspect-video rounded-md flex items-center justify-center transition-colors ${qsSound ? 'bg-[#00A4EF]/20 border border-[#00A4EF]/30 group-hover:bg-[#00A4EF]/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={qsSound ? "#00A4EF" : "white"} strokeWidth="2">{qsSound ? <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></> : <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></>}</svg>
                </div>
                <span className="text-[10px] text-white/90 font-medium">Sound</span>
              </button>
              <button onClick={() => setQsDnd(!qsDnd)} className="flex flex-col items-center gap-2 group">
                <div className={`w-full aspect-video rounded-md flex items-center justify-center transition-colors ${qsDnd ? 'bg-purple-500/20 border border-purple-500/30 group-hover:bg-purple-500/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={qsDnd ? "#a855f7" : "white"} strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <span className="text-[10px] text-white/90 font-medium">Do Not Disturb</span>
              </button>
              <button onClick={handlePanicMode} className="flex flex-col items-center gap-2 group">
                <div className="w-full aspect-video bg-white/10 rounded-md flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white group-hover:text-red-400" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                </div>
                <span className="text-[10px] text-white/90 font-medium">Panic Mode</span>
              </button>
              <button onClick={handlePanicMode} className="flex flex-col items-center gap-2 group">
                <div className="w-full aspect-video bg-white/10 rounded-md flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white group-hover:text-blue-400" strokeWidth="2"><path d="M2 12h20"></path><path d="M12 2v20"></path><path d="M4.93 4.93l14.14 14.14"></path><path d="M4.93 19.07L19.07 4.93"></path></svg>
                </div>
                <span className="text-[10px] text-white/90 font-medium">Teacher Mode</span>
              </button>
              <button onClick={handleDisguiseMode} className="flex flex-col items-center gap-2 group">
                <div className="w-full aspect-video bg-white/10 rounded-md flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white group-hover:text-green-400" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </div>
                <span className="text-[10px] text-white/90 font-medium">Disguise Mode</span>
              </button>
              <button onClick={() => setQsLowPower(!qsLowPower)} className="flex flex-col items-center gap-2 group">
                <div className={`w-full aspect-video rounded-md flex items-center justify-center transition-colors ${qsLowPower ? 'bg-amber-500/20 border border-amber-500/30 group-hover:bg-amber-500/30' : 'bg-white/10 group-hover:bg-white/20'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={qsLowPower ? "#f59e0b" : "white"} strokeWidth="2"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect><line x1="22" y1="11" x2="22" y2="13"></line><line x1="6" y1="12" x2="14" y2="12"></line><line x1="10" y1="8" x2="10" y2="16"></line></svg>
                </div>
                <span className="text-[10px] text-white/90 font-medium">Low Power Mode</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-3 mt-2 border-t border-white/5 pt-4">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                <input type="range" min="0" max="100" defaultValue="50" className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battery Notice (Windows 11 Toast) */}
      <AnimatePresence>
        {showBatteryNotice && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-4 w-80 bg-[#242424]/95 backdrop-blur-2xl border border-white/10 rounded-lg shadow-2xl flex flex-col p-4 z-[300]"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A4EF" strokeWidth="2"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect><line x1="22" y1="11" x2="22" y2="13"></line></svg>
                <span className="text-[11px] font-semibold text-white/90 uppercase tracking-wide">System</span>
              </div>
              <button onClick={() => setShowBatteryNotice(false)} className="text-zinc-400 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Battery status</h3>
            <p className="text-xs text-white/80 leading-relaxed">
              {batteryInfo.isSupported 
                ? `Your battery is at ${batteryInfo.level}% and ${batteryInfo.charging ? 'charging' : 'not charging'}.`
                : "Battery information is not supported on this device or browser."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreenModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-xl shadow-2xl flex flex-col items-center">
              <h2 className="text-2xl font-bold text-white mb-2">Going in Fullscreen</h2>
              <p className="text-4xl font-black text-[#00A4EF]">{fullscreenCountdown}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits Modal */}
      <AnimatePresence>
        {showCredits && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute bottom-16 left-4 w-72 bg-[#242424]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl flex flex-col p-6 z-[200]"
          >
            <h3 className="text-lg font-bold text-white mb-4">Credits</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#00A4EF]">Coders:</h4>
                <p className="text-xs text-white/80 mt-1">EyesHD - Owner</p>
                <p className="text-xs text-white/80">Gemini - Co-Owner</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#00A4EF]">Testers:</h4>
                <p className="text-xs text-white/80 mt-1">Sebastian Call Lopez</p>
                <p className="text-xs text-white/80">Pierre Bell</p>
                <p className="text-xs text-white/80">Cameron Barefield</p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] text-white/60 italic leading-tight">Thank you to all of the Testers for their support and their testing for looking out for problems for our release!!!</p>
                <p className="text-[10px] text-white/80 font-bold mt-2 text-center">THANK YOU ALL FOR TRYING OUT MY WINDOWS 11!!!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-transparent backdrop-blur-[50px] border-t border-white/10 shadow-[0_-2px_15px_rgba(255,255,255,0.03)] flex items-center justify-between px-2 z-[250]">
        <div className="flex-1 flex items-center h-full gap-2 px-2">
          {/* Weather Widget */}
          <div className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-md cursor-pointer transition-colors text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19a4.5 4.5 0 0 0 0-9h-.1A7 7 0 1 0 5 17h12.5Z"></path><path d="M12 2v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="M2 12h2"></path><path d="m4.93 19.07 1.41-1.41"></path></svg>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold">{weather ? `${weather.temp}°F` : `...`}</span>
              <span className="text-[10px] text-white/70 truncate max-w-[60px]">{weather ? weather.condition : `Loading`}</span>
            </div>
          </div>
          <button className="text-white hover:bg-white/10 p-1.5 rounded-md transition-colors" onClick={() => setShowCredits(!showCredits)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
        </div>
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

          {/* Spooky Tilted Pumpkin Button with Glowing Eyes */}
          <button 
            onClick={() => {
              const nextVal = !isHalloween;
              setIsHalloween(nextVal);
              localStorage.setItem('halloween_theme', String(nextVal));
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-md transition-all relative group ${isHalloween ? 'bg-orange-500/30 shadow-[0_0_20px_rgba(255,107,0,0.8)]' : 'hover:bg-orange-500/20'}`}
            title="Toggle Halloween Theme"
          >
            <div className="relative transform -rotate-12 group-hover:rotate-0 transition-transform">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#ff7518" stroke="#2b1100" strokeWidth="1.2">
                <ellipse cx="12" cy="13" rx="8.5" ry="7.5" />
                <path d="M12 3.5v3.5" stroke="#2e7d32" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Glowing Eyes */}
                <polygon points="7.5,10 10.5,12 8,14" fill="#ffeb3b" className="drop-shadow-[0_0_6px_#ffeb3b] animate-pulse" />
                <polygon points="16.5,10 13.5,12 16,14" fill="#ffeb3b" className="drop-shadow-[0_0_6px_#ffeb3b] animate-pulse" />
                {/* Spooky Smile */}
                <path d="M8.5 16.5l1.5 1.5 1-1 1 1 1-1 1.5 1.5" stroke="#ffeb3b" strokeWidth="1.5" fill="none" strokeLinecap="round" className="drop-shadow-[0_0_4px_#ffeb3b]" />
              </svg>
            </div>
          </button>
          
          <button onClick={() => { setStartOpen(false); onOpenSearch(); }} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors">
            <Search size={20} className="text-white" />
          </button>
          
          <button onClick={() => { setStartOpen(false); setCurrentView('home'); }} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative group">
            <div className="w-7 h-7 rounded-full border-[1.5px] border-white flex items-center justify-center group-hover:bg-green-500 group-hover:border-green-500 transition-colors"> 
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
            </div>
          </button>

          
          {/* Pinned Chrome */}
          <motion.div layout className="relative group flex items-center h-full">
            <button 
              onClick={() => { 
                const chromeApp = ALL_GAMES.find(g => g.id === 'Chrome');
                if (chromeApp) onPlayGame(chromeApp); 
              }} 
              className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" className="w-5 h-5 object-contain" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-transparent rounded-full transition-all w-1.5 group-hover:bg-[#00A4EF]" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[1000] drop-shadow-2xl flex flex-col items-center">
              <div className="bg-zinc-900 border border-white/20 p-2 rounded-lg shadow-xl mb-2 min-w-[120px] flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-white truncate max-w-[100px] capitalize">Chrome</span>
              </div>
            </div>
          </motion.div>

          {/* Pinned Chat */}
          <motion.div layout className="relative group flex items-center h-full">
            <button 
              onClick={() => { setStartOpen(false); setCurrentView('chat'); }} 
              className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative ${currentView === 'chat' || currentView === 'friends' ? 'bg-white/10' : ''}`}
            >
              <MessageSquare size={20} className={currentView === 'chat' || currentView === 'friends' ? 'text-[#00A4EF]' : 'text-white'} />
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-[#00A4EF] rounded-full transition-all ${currentView === 'chat' || currentView === 'friends' ? 'w-4' : 'w-1.5'}`} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[1000] drop-shadow-2xl flex flex-col items-center">
              <div className="bg-zinc-900 border border-white/20 p-2 rounded-lg shadow-xl mb-2 min-w-[120px] flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-white truncate max-w-[100px] capitalize">Chat</span>
                <div className="w-24 h-16 bg-black rounded flex items-center justify-center border border-white/10">
                  <MessageSquare size={24} className="text-white/30" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dynamic App Icons with Layout animation */}
          <AnimatePresence mode="popLayout">
            {(openViews || []).filter(v => v !== 'chat' && v !== 'friends').map(view => {
              let Icon = Box;
              if (view === 'store') Icon = Store;
              if (view === 'profile') Icon = User;
              if (view === 'settings') Icon = SettingsIcon;
              if (view === 'friends' || view === 'chat') Icon = MessageSquare;
              if (view === 'party') Icon = Users;
              if (view === 'notifications') Icon = Bell;
              if (view === 'activity') Icon = Activity;
              
              const isFocused = currentView === view;
              return (
                <motion.div 
                  key={`sys-${view}`}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="relative group flex items-center h-full"
                >
                  <button 
                    onClick={() => { setStartOpen(false); setCurrentView(view); }} 
                    className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative ${isFocused ? 'bg-white/10' : ''}`}
                  >
                    <Icon size={20} className={isFocused ? 'text-[#00A4EF]' : 'text-white'} />
                    {/* Running indicator */}
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-[#00A4EF] rounded-full transition-all ${isFocused ? 'w-4' : 'w-1.5'}`} />
                  </button>
                  
                  {/* Hover Preview Window */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[1000] drop-shadow-2xl flex flex-col items-center">
                    <div className="bg-zinc-900 border border-white/20 p-2 rounded-lg shadow-xl mb-2 min-w-[120px] flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-white truncate max-w-[100px] capitalize">{view}</span>
                      <div className="w-24 h-16 bg-black rounded flex items-center justify-center border border-white/10">
                        <Icon size={24} className="text-white/30" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Suspended Games */}
            {(suspendedGames || []).map((s: any) => (
              <motion.div 
                key={`game-${s.game.instanceId || s.game.id}`}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="relative group flex items-center h-full"
              >
                <button 
                  onClick={() => { setStartOpen(false); onPlayGame(s.game); }} 
                  className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative`}
                >
                  <img src={s.game.image} alt={s.game.title} className="w-6 h-6 rounded object-cover" />
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-[#00A4EF] rounded-full transition-all w-1.5`} />
                </button>
                
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[1000] drop-shadow-2xl flex flex-col items-center">
                  <div className="bg-zinc-900 border border-white/20 p-2 rounded-lg shadow-xl mb-2 min-w-[120px] flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate max-w-[120px]">{s.game.title}</span>
                    <div className="w-24 h-16 bg-black rounded flex items-center justify-center border border-white/10 overflow-hidden relative">
                       <img src={s.game.image} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                       <img src={s.game.image} className="w-8 h-8 rounded z-10" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Active Game */}
            {playingGame && (
              <motion.div 
                key={`game-${playingGame.instanceId || playingGame.id}`}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="relative group flex items-center h-full"
              >
                <button 
                  onClick={() => { setStartOpen(false); if (onMinimizeGame) onMinimizeGame(playingGame.instanceId || playingGame.id); }}
                  className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative bg-white/10`}
                >
                  <img src={playingGame.image} alt={playingGame.title} className="w-6 h-6 rounded object-cover" />
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-[#00A4EF] rounded-full transition-all w-4`} />
                </button>
                
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[1000] drop-shadow-2xl flex flex-col items-center">
                  <div className="bg-zinc-900 border border-white/20 p-2 rounded-lg shadow-xl mb-2 min-w-[120px] flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate max-w-[120px]">{playingGame.title}</span>
                    <div className="w-24 h-16 bg-black rounded flex items-center justify-center border border-white/10 overflow-hidden relative">
                       <img src={playingGame.image} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex-1 flex justify-end items-center h-full gap-1">
          
          {/* Teacher Icon for Dead Computer */}
          <button
            onClick={onActivateDeadComputer}
            className="flex items-center gap-2 hover:bg-white/10 px-2 h-full rounded-md cursor-pointer transition-colors"
            title="School Mode"
          >
            <GraduationCap size={16} className="text-white" />
          </button>
          
          {/* Chat Logo for Friends */}
          <button
            onClick={() => setCurrentView('friends')}
            className="flex items-center gap-2 hover:bg-white/10 px-2 h-full rounded-md cursor-pointer transition-colors"
            title="Friends & Chat"
          >
            <MessageSquare size={16} className="text-white" />
          </button>
          
          {(profile?.email === 'zaellacruze1@gmail.com' || profile?.role === 'staff' || profile?.role === 'owner') && (
            <button
              onClick={onOpenModerationPanel}
              className="flex items-center gap-2 hover:bg-red-500/20 px-2 h-full rounded-md cursor-pointer transition-colors"
              title="Moderation & Admin Panel"
            >
              <ShieldAlert size={16} className="text-red-500 animate-pulse" />
            </button>
          )}
          
          {/* Quick Settings Cluster */}
          <div 
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-1 rounded-md cursor-pointer transition-colors"
            onClick={() => setShowQuickSettings(!showQuickSettings)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            {batteryInfo.isSupported && (
              <svg onClick={(e) => { e.stopPropagation(); setShowBatteryNotice(!showBatteryNotice); setShowQuickSettings(false); }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect><line x1="22" y1="11" x2="22" y2="13"></line></svg>
            )}
          </div>
          
          {/* Time and Notifications */}
                      <div className="flex items-center gap-1 hover:bg-white/10 px-2 rounded-md cursor-pointer transition-colors h-full" onClick={() => setCurrentView('notifications')}>
            <div className="flex flex-col items-end justify-center px-1">
              <span className="text-[11px] font-medium text-white">{time}</span>
              <span className="text-[11px] text-white/80">{new Date().toLocaleDateString()}</span>
            </div>
            {notificationCount > 0 && (
              <div className="relative ml-1">
                <Bell size={14} className="text-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-zinc-900"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
