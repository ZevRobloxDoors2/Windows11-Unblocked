import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Bell, Settings as SettingsIcon, MessageSquare, Users, UserPlus, 
  Store, Box, User, Activity, Image as ImageIcon, GraduationCap, 
  ShieldAlert, Play, Pause, SkipBack, SkipForward, Music, Film, 
  Volume2, VolumeX, Gamepad2, ChevronRight, ChevronUp, Power, RefreshCw, 
  Laptop, Folder, FileText, Terminal, Calculator, Compass, Moon, Sun, 
  Wifi, WifiOff, Bluetooth, Battery, BatteryCharging, ChevronLeft, Calendar as CalendarIcon,
  LayoutGrid, Eye, Check, Sparkles, Monitor
} from 'lucide-react';
import { ALL_GAMES } from '../games';
import { UserProfile } from '../types';
import { DesktopWidgets } from './DesktopWidgets';
import { WidgetsFlyout } from './WidgetsFlyout';

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
  onOpenVerification,
  miniPlayerMedia,
  onExpandMiniPlayer
}: { 
  profile: UserProfile; 
  installedApps: string[];
  onOpenStore: () => void;
  onOpenSearch: () => void;
  onPlayGame: (game: any) => void;
  onMinimizeGame?: (gameId: string) => void;
  time: string;
  batteryInfo: any;
  currentView: string;
  setCurrentView: (view: string) => void;
  openViews?: string[];
  minimizedViews?: string[];
  playingGame?: any;
  suspendedGames?: any[];
  notificationCount: number;
  onLogout: () => void;
  onActivateDeadComputer?: () => void;
  onOpenModerationPanel?: () => void;
  onOpenVerification?: () => void;
  miniPlayerMedia?: any;
  onExpandMiniPlayer?: (appId: string, media: any) => void;
}) => {
  // Navigation & Flyout States
  const [startOpen, setStartOpen] = useState(false);
  const [startTab, setStartTab] = useState<'pinned' | 'all'>('pinned');
  const [startSearchQuery, setStartSearchQuery] = useState('');
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showCalendarFlyout, setShowCalendarFlyout] = useState(false);
  const [showWidgetsFlyout, setShowWidgetsFlyout] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showBatteryNotice, setShowBatteryNotice] = useState(false);
  const [selectedDesktopIcon, setSelectedDesktopIcon] = useState<string | null>(null);

  // Quick Settings States
  const [qsWifi, setQsWifi] = useState(true);
  const [qsBluetooth, setQsBluetooth] = useState(true);
  const [qsSound, setQsSound] = useState(true);
  const [qsDnd, setQsDnd] = useState(false);
  const [qsBatterySaver, setQsBatterySaver] = useState(false);
  const [qsNightLight, setQsNightLight] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(80);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Wallpaper & Theme States
  const [isHalloween, setIsHalloween] = useState(() => localStorage.getItem('halloween_theme') === 'true');
  const WIN11_WALLPAPERS = [
    { id: 'bloom-dark', name: 'Windows 11 Bloom (Dark)', url: 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&w=2560&q=85' },
    { id: 'bloom-light', name: 'Windows 11 Bloom (Light)', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85' },
    { id: 'flow-dark', name: 'Windows 11 Flow', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85' },
    { id: 'sunrise', name: 'Windows 11 Sunrise', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2560&q=85' },
  ];
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('win11_bg') || WIN11_WALLPAPERS[0].url);
  const halloweenBg = `${((import.meta as any).env?.BASE_URL || '/').replace(/\/$/, '')}/minecraft_halloween.jpg`;
  const currentBg = isHalloween ? halloweenBg : bgImage;

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Marquee Selection Box
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Weather State
  const [weather, setWeather] = useState<{ temp: number; condition: string }>({ temp: 72, condition: "Partly cloudy" });

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true&temperature_unit=fahrenheit', { signal: controller.signal });
        clearTimeout(timeout);
        if (!weatherRes.ok) return;
        const data = await weatherRes.json();
        
        const wmoMap: Record<number, string> = {
          0: 'Clear sky',
          1: 'Mainly clear',
          2: 'Partly cloudy',
          3: 'Overcast',
          45: 'Fog',
          51: 'Light Drizzle',
          61: 'Slight Rain',
          63: 'Moderate Rain',
          65: 'Heavy Rain',
          71: 'Slight Snow',
          80: 'Rain Showers',
        };

        if (isMounted && data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            condition: wmoMap[data.current_weather.weathercode] || 'Partly cloudy'
          });
        }
      } catch {
        // Silently retain default weather state
      }
    };
    fetchWeather();
    return () => { isMounted = false; };
  }, []);

  const installedGames = ALL_GAMES.filter(g => installedApps.includes(g.id));

  // Handle Drag & Drop Wallpaper
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (window.confirm("Set this image as your Windows 11 wallpaper?")) {
          setBgImage(dataUrl);
          localStorage.setItem('win11_bg', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    if (contextMenu) setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => {
      closeContextMenu();
      setShowPowerMenu(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu, showPowerMenu]);

  // Marquee Selection Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== desktopRef.current) return;
    setSelectedDesktopIcon(null);
    setStartOpen(false);
    setShowQuickSettings(false);
    setShowCalendarFlyout(false);
    setSelectionBox({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectionBox) return;
    setSelectionBox(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
  };

  const handleMouseUp = () => {
    if (selectionBox) setSelectionBox(null);
  };

  // Keyboard shortcut (Win key to toggle Start)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || (e.altKey && e.key === 'Home')) {
        setStartOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setStartOpen(false);
        setShowQuickSettings(false);
        setShowCalendarFlyout(false);
        setShowWidgetsFlyout(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Panic & Cloak actions
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

  // Calendar Helper Days
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const currentMonthDays = getDaysInMonth(calendarDate.getFullYear(), calendarDate.getMonth());
  const firstDay = getFirstDayOfMonth(calendarDate.getFullYear(), calendarDate.getMonth());
  const today = new Date();

  // Pinned Apps in Windows 11 Start Menu
  const PINNED_APPS = [
    { id: 'edge', title: 'Microsoft Edge', icon: '🌐', color: 'from-blue-500 to-cyan-500', action: () => { const chromeApp = ALL_GAMES.find(g => g.id === 'Chrome'); if (chromeApp) onPlayGame(chromeApp); } },
    { id: 'store', title: 'Microsoft Store', icon: '🛍️', color: 'from-blue-600 to-indigo-600', action: onOpenStore },
    { id: 'settings', title: 'Settings', icon: '⚙️', color: 'from-zinc-600 to-zinc-700', action: () => setCurrentView('settings') },
    { id: 'explorer', title: 'File Explorer', icon: '📁', color: 'from-amber-500 to-yellow-600', action: () => setCurrentView('home') },
    { id: 'chat', title: 'Chat & Friends', icon: '💬', color: 'from-purple-600 to-indigo-600', action: () => setCurrentView('friends') },
    { id: 'activity', title: 'Friend Activity', icon: '🔥', color: 'from-orange-500 to-amber-600', action: () => setCurrentView('activity') },
    { id: 'party', title: 'Voice Lounge', icon: '🎙️', color: 'from-emerald-600 to-teal-600', action: () => setCurrentView('party') },
    { id: 'notifications', title: 'Notifications', icon: '🔔', color: 'from-blue-500 to-sky-600', action: () => setCurrentView('notifications') },
    { id: 'photos', title: 'Photos', icon: '🖼️', color: 'from-pink-500 to-rose-600', action: () => setCurrentView('profile') },
    { id: 'terminal', title: 'Terminal', icon: '💻', color: 'from-zinc-800 to-black', action: () => { const cmd = ALL_GAMES.find(g => g.id === 'cmd' || g.id === 'terminal'); if (cmd) onPlayGame(cmd); else alert('Windows Terminal is ready.'); } },
    { id: 'classroom', title: 'Classroom', icon: '🎓', color: 'from-green-600 to-emerald-700', action: () => setCurrentView('classroom') },
    { id: 'local-share', title: 'Quick Share', icon: '📡', color: 'from-indigo-600 to-blue-700', action: () => setCurrentView('local-share') }
  ];

  const filteredPinnedApps = PINNED_APPS.filter(app => 
    app.title.toLowerCase().includes(startSearchQuery.toLowerCase())
  );

  return (
    <div 
      ref={desktopRef}
      className={`absolute inset-0 bg-cover bg-center overflow-hidden z-0 select-none ${isHalloween ? 'brightness-90 saturate-125' : ''}`} 
      style={{ backgroundImage: `url('${currentBg}')` }}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Ambient Lighting Filter for Windows 11 Depth */}
      <div className="absolute inset-0 pointer-events-none bg-black/10 z-[1]" />

      {/* Marquee Drag Selection Box */}
      {selectionBox && (
        <div 
          className="absolute z-30 pointer-events-none bg-[#0078D4]/20 border border-[#0078D4]/70 rounded-xs"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY)
          }}
        />
      )}

      {/* Modern Windows 11 Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute bg-[#242424]/95 backdrop-blur-2xl border border-white/[0.14] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] py-1.5 z-[400] min-w-[220px] text-xs text-white"
            style={{ left: Math.min(contextMenu.x, window.innerWidth - 240), top: Math.min(contextMenu.y, window.innerHeight - 280) }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => { closeContextMenu(); window.location.reload(); }} 
              className="w-full px-3 py-2 text-left hover:bg-white/[0.08] flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-2.5"><RefreshCw size={14} className="text-zinc-400" /> Refresh</span>
              <span className="text-[10px] text-zinc-500">F5</span>
            </button>
            <div className="h-px bg-white/[0.08] my-1" />
            <button 
              onClick={() => { 
                const nextIdx = (WIN11_WALLPAPERS.findIndex(w => w.url === bgImage) + 1) % WIN11_WALLPAPERS.length;
                const nextW = WIN11_WALLPAPERS[nextIdx];
                setBgImage(nextW.url);
                localStorage.setItem('win11_bg', nextW.url);
                closeContextMenu();
              }} 
              className="w-full px-3 py-2 text-left hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors"
            >
              <ImageIcon size={14} className="text-blue-400" /> Next desktop background
            </button>
            <button 
              onClick={() => { closeContextMenu(); onOpenStore(); }} 
              className="w-full px-3 py-2 text-left hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors"
            >
              <Store size={14} className="text-emerald-400" /> Open Microsoft Store
            </button>
            <div className="h-px bg-white/[0.08] my-1" />
            <button 
              onClick={() => { closeContextMenu(); setCurrentView('settings'); }} 
              className="w-full px-3 py-2 text-left hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors"
            >
              <SettingsIcon size={14} className="text-zinc-400" /> Display settings
            </button>
            <button 
              onClick={() => { closeContextMenu(); setCurrentView('settings'); }} 
              className="w-full px-3 py-2 text-left hover:bg-white/[0.08] flex items-center gap-2.5 transition-colors"
            >
              <Sparkles size={14} className="text-amber-400" /> Personalize
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Windows 11 Desktop Icons */}
      <div className="absolute top-2 left-2 bottom-14 flex flex-col flex-wrap gap-2 content-start z-10 pointer-events-none">
        {/* Recycle Bin */}
        <div className="pointer-events-auto">
          <button 
            onClick={() => setSelectedDesktopIcon('recycle')}
            className={`w-[78px] p-2 flex flex-col items-center gap-1.5 rounded-lg transition-all ${
              selectedDesktopIcon === 'recycle' 
                ? 'bg-[#0078D4]/25 border border-[#0078D4]/60 shadow-sm' 
                : 'hover:bg-white/[0.08] border border-transparent'
            }`}
          >
            <div className="w-11 h-11 flex items-center justify-center text-3xl filter drop-shadow-md">
              🗑️
            </div>
            <span className="text-[11px] text-center text-white font-medium line-clamp-2 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Recycle Bin
            </span>
          </button>
        </div>

        {/* This PC */}
        <div className="pointer-events-auto">
          <button 
            onClick={() => { setSelectedDesktopIcon('this-pc'); }}
            onDoubleClick={() => setCurrentView('home')}
            className={`w-[78px] p-2 flex flex-col items-center gap-1.5 rounded-lg transition-all ${
              selectedDesktopIcon === 'this-pc' 
                ? 'bg-[#0078D4]/25 border border-[#0078D4]/60 shadow-sm' 
                : 'hover:bg-white/[0.08] border border-transparent'
            }`}
          >
            <div className="w-11 h-11 flex items-center justify-center text-3xl filter drop-shadow-md">
              💻
            </div>
            <span className="text-[11px] text-center text-white font-medium line-clamp-2 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              This PC
            </span>
          </button>
        </div>

        {/* Microsoft Store Desktop Shortcut */}
        <div className="pointer-events-auto">
          <button 
            onClick={() => setSelectedDesktopIcon('store')}
            onDoubleClick={onOpenStore}
            className={`w-[78px] p-2 flex flex-col items-center gap-1.5 rounded-lg transition-all ${
              selectedDesktopIcon === 'store' 
                ? 'bg-[#0078D4]/25 border border-[#0078D4]/60 shadow-sm' 
                : 'hover:bg-white/[0.08] border border-transparent'
            }`}
          >
            <div className="w-11 h-11 bg-gradient-to-br from-[#0078D4] to-[#00A4EF] rounded-xl flex items-center justify-center shadow-lg border border-white/20">
              <Store size={22} className="text-white" />
            </div>
            <span className="text-[11px] text-center text-white font-medium line-clamp-2 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Microsoft Store
            </span>
          </button>
        </div>

        {/* Installed Games Shortcuts */}
        {installedGames.slice(0, 10).map(game => (
          <div key={game.id} className="pointer-events-auto">
            <button 
              onClick={() => setSelectedDesktopIcon(game.id)}
              onDoubleClick={() => onPlayGame(game)}
              className={`w-[78px] p-2 flex flex-col items-center gap-1.5 rounded-lg transition-all ${
                selectedDesktopIcon === game.id 
                  ? 'bg-[#0078D4]/25 border border-[#0078D4]/60 shadow-sm' 
                  : 'hover:bg-white/[0.08] border border-transparent'
              }`}
            >
              <div className="w-11 h-11 bg-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center shadow-lg border border-white/15">
                <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] text-center text-white font-medium line-clamp-2 leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {game.title}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* WINDOWS 11 START MENU                                    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {startOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[640px] max-w-[95vw] h-[660px] max-h-[85vh] win11-mica rounded-2xl shadow-[0_32px_72px_rgba(0,0,0,0.7),0_0_1px_rgba(255,255,255,0.2)] flex flex-col p-6 z-[300] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Windows 11 Search Input */}
            <div className="relative mb-5 shrink-0">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Type here to search" 
                value={startSearchQuery}
                onChange={(e) => setStartSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1c]/80 border border-white/[0.08] focus:border-[#0078D4] focus:ring-2 focus:ring-[#0078D4]/30 rounded-xl px-4 py-2.5 pl-11 text-xs text-white placeholder-zinc-400 transition-all outline-none shadow-inner"
              />
            </div>

            {/* Pinned vs All Apps Header */}
            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
              <h3 className="text-xs font-bold text-white tracking-wide">
                {startTab === 'pinned' ? 'Pinned' : 'All apps'}
              </h3>
              <button 
                onClick={() => setStartTab(startTab === 'pinned' ? 'all' : 'pinned')}
                className="text-[11px] text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                {startTab === 'pinned' ? 'All apps >' : '< Back to Pinned'}
              </button>
            </div>

            {/* TAB: PINNED APPS */}
            {startTab === 'pinned' && (
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-1">
                {/* 6-Column Grid of Windows 11 Pinned Icons */}
                <div className="grid grid-cols-6 gap-y-4 gap-x-2 mb-6 px-1">
                  {filteredPinnedApps.map(app => (
                    <button 
                      key={app.id}
                      onClick={() => { setStartOpen(false); app.action(); }} 
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/[0.08] active:bg-white/[0.04] active:scale-95 transition-all group cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-transform`}>
                        {app.icon}
                      </div>
                      <span className="text-[11px] text-zinc-200 group-hover:text-white truncate max-w-[80px] text-center">
                        {app.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Recommended Section */}
                <div className="mt-auto border-t border-white/[0.08] pt-4 px-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-white tracking-wide">Recommended</h4>
                    <span className="text-[11px] text-zinc-400">Recent games & apps</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {installedGames.slice(0, 4).map(game => (
                      <button 
                        key={`rec-${game.id}`}
                        onClick={() => { setStartOpen(false); onPlayGame(game); }} 
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.08] active:scale-98 transition-all text-left cursor-pointer"
                      >
                        <img src={game.image} alt={game.title} className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-white truncate">{game.title}</span>
                          <span className="text-[10px] text-zinc-400">Recently opened</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ALL APPS (ALPHABETICAL LIST) */}
            {startTab === 'all' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2">A - Z Community Catalog</div>
                {ALL_GAMES.map(game => (
                  <button 
                    key={`all-${game.id}`}
                    onClick={() => { setStartOpen(false); onPlayGame(game); }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.08] transition-all text-left cursor-pointer"
                  >
                    <img src={game.image} alt={game.title} className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">{game.title}</span>
                      <span className="text-[10px] text-zinc-400">{game.type || 'Game'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Bottom User & Power Footer */}
            <div className="mt-auto flex items-center justify-between bg-black/40 -mx-6 -mb-6 p-4 border-t border-white/[0.08] shrink-0">
              <div 
                onClick={() => { setStartOpen(false); setCurrentView('profile'); }} 
                className="flex items-center gap-3 hover:bg-white/[0.08] p-1.5 px-3 rounded-xl cursor-pointer transition-colors"
              >
                <div className="relative">
                  <img src={profile.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="Avatar" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-white">{profile.gamertag}</span>
                  <span className="text-[10px] text-zinc-400">{profile.email || 'Online'}</span>
                </div>
              </div>

              {/* Power Button & Flyout */}
              <div className="relative">
                <button 
                  onClick={() => setShowPowerMenu(!showPowerMenu)} 
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
                  title="Power"
                >
                  <Power size={18} />
                </button>

                <AnimatePresence>
                  {showPowerMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 w-48 bg-[#242424]/95 backdrop-blur-2xl border border-white/[0.14] rounded-xl shadow-2xl p-1.5 text-xs text-white z-[500]"
                    >
                      <button 
                        onClick={() => { setShowPowerMenu(false); setStartOpen(false); onLogout(); }} 
                        className="w-full p-2 rounded-lg hover:bg-white/[0.08] text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User size={14} className="text-zinc-400" /> Sign out
                      </button>
                      <button 
                        onClick={() => { setShowPowerMenu(false); window.location.reload(); }} 
                        className="w-full p-2 rounded-lg hover:bg-white/[0.08] text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={14} className="text-zinc-400" /> Restart E-Box
                      </button>
                      <button 
                        onClick={() => { setShowPowerMenu(false); if (onActivateDeadComputer) onActivateDeadComputer(); }} 
                        className="w-full p-2 rounded-lg hover:bg-red-500/20 text-red-400 text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Power size={14} /> Shut down
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* WINDOWS 11 QUICK SETTINGS FLYOUT                         */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showQuickSettings && (
          <motion.div 
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className="absolute bottom-14 right-3 w-84 win11-mica rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.65)] p-5 z-[300] flex flex-col gap-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Toggle Tiles */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Wi-Fi */}
              <button 
                onClick={() => setQsWifi(!qsWifi)} 
                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  qsWifi ? 'bg-[#0078D4] text-white shadow-md' : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400'
                }`}
              >
                {qsWifi ? <Wifi size={18} /> : <WifiOff size={18} />}
                <span className="text-[10px] font-semibold truncate max-w-full">Wi-Fi</span>
              </button>

              {/* Bluetooth */}
              <button 
                onClick={() => setQsBluetooth(!qsBluetooth)} 
                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  qsBluetooth ? 'bg-[#0078D4] text-white shadow-md' : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400'
                }`}
              >
                <Bluetooth size={18} />
                <span className="text-[10px] font-semibold truncate max-w-full">Bluetooth</span>
              </button>

              {/* Do Not Disturb */}
              <button 
                onClick={() => setQsDnd(!qsDnd)} 
                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  qsDnd ? 'bg-[#0078D4] text-white shadow-md' : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400'
                }`}
              >
                <Moon size={18} />
                <span className="text-[10px] font-semibold truncate max-w-full">Focus</span>
              </button>

              {/* Low Power */}
              <button 
                onClick={() => setQsBatterySaver(!qsBatterySaver)} 
                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  qsBatterySaver ? 'bg-amber-600 text-white shadow-md' : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400'
                }`}
              >
                <Battery size={18} />
                <span className="text-[10px] font-semibold truncate max-w-full">Saver</span>
              </button>

              {/* Night Light */}
              <button 
                onClick={() => setQsNightLight(!qsNightLight)} 
                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  qsNightLight ? 'bg-amber-500 text-black shadow-md' : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400'
                }`}
              >
                <Sun size={18} />
                <span className="text-[10px] font-semibold truncate max-w-full">Night light</span>
              </button>

              {/* Panic Cloak */}
              <button 
                onClick={handlePanicMode} 
                className="p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white transition-all cursor-pointer"
                title="Immediate Google Classroom cloak"
              >
                <GraduationCap size={18} />
                <span className="text-[10px] font-semibold truncate max-w-full">School Cloak</span>
              </button>
            </div>

            {/* Sliders: Brightness & Volume */}
            <div className="flex flex-col gap-3 pt-2 border-t border-white/[0.08]">
              {/* Brightness */}
              <div className="flex items-center gap-3">
                <Sun size={16} className="text-zinc-400 shrink-0" />
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/20 accent-[#0078D4] rounded-lg cursor-pointer" 
                />
                <span className="text-[10px] text-zinc-400 w-7 text-right">{brightness}%</span>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                {volume === 0 ? <VolumeX size={16} className="text-zinc-400 shrink-0" /> : <Volume2 size={16} className="text-zinc-400 shrink-0" />}
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/20 accent-[#0078D4] rounded-lg cursor-pointer" 
                />
                <span className="text-[10px] text-zinc-400 w-7 text-right">{volume}%</span>
              </div>
            </div>

            {/* Footer: Battery & All Settings */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <BatteryCharging size={16} className="text-emerald-400" />
                <span>{batteryInfo?.isSupported ? `${batteryInfo.level}%` : '100% Plugged in'}</span>
              </div>
              <button 
                onClick={() => { setShowQuickSettings(false); setCurrentView('settings'); }} 
                className="p-1.5 hover:bg-white/[0.08] rounded-lg text-zinc-300 hover:text-white transition-colors"
                title="All settings"
              >
                <SettingsIcon size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* WINDOWS 11 CALENDAR & ACTION CENTER FLYOUT               */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showCalendarFlyout && (
          <motion.div 
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 350 }}
            className="absolute bottom-14 right-3 w-80 win11-mica rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.65)] p-5 z-[300] flex flex-col gap-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Month & Year */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-sm font-bold">
                {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                  className="p-1 hover:bg-white/[0.08] rounded-md transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                  className="p-1 hover:bg-white/[0.08] rounded-md transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-zinc-500 font-semibold py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: currentMonthDays }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === today.getDate() && calendarDate.getMonth() === today.getMonth() && calendarDate.getFullYear() === today.getFullYear();
                return (
                  <div 
                    key={`day-${dayNum}`}
                    className={`h-8 flex items-center justify-center rounded-full text-xs transition-colors cursor-pointer ${
                      isToday 
                        ? 'bg-[#0078D4] text-white font-bold shadow-md' 
                        : 'hover:bg-white/[0.08] text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>

            {/* Focus Assist Pill */}
            <div className="border-t border-white/[0.08] pt-3 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Moon size={14} className="text-purple-400" />
                <span>Focus session</span>
              </div>
              <button 
                onClick={() => alert("Focus session started! Do Not Disturb active.")}
                className="px-2.5 py-1 bg-[#0078D4] text-white rounded-md text-[11px] font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
              >
                25 min
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* WINDOWS 11 AUTHENTIC CENTERED TASKBAR                    */}
      {/* ======================================================== */}
      <div className={`absolute bottom-0 left-0 w-full h-12 win11-taskbar flex items-center justify-between px-2 z-[250]`}>
        {/* Left Side: Windows 11 Weather & Widgets Button */}
        <div className="flex-1 flex items-center h-full gap-1">
          <div 
            onClick={() => setShowWidgetsFlyout(true)} 
            className="flex items-center gap-2.5 hover:bg-white/[0.08] active:bg-white/[0.04] px-2.5 py-1.5 rounded-md cursor-pointer transition-all text-white group"
            title="Open Widgets board"
          >
            <div className="w-5 h-5 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Sun size={18} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-semibold leading-tight">{weather ? `${weather.temp}°F` : '72°F'}</span>
              <span className="text-[10px] text-zinc-400 leading-tight truncate max-w-[80px]">{weather ? weather.condition : 'Clear'}</span>
            </div>
          </div>
        </div>

        {/* Center: Windows 11 Centered App Icons */}
        <div className="flex items-center gap-1.5 justify-center absolute left-1/2 -translate-x-1/2 h-full">
          {/* Windows 11 Start Button */}
          <button 
            onClick={() => setStartOpen(!startOpen)}
            className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:bg-white/[0.04] active:scale-90 transition-all ${
              startOpen ? 'bg-white/[0.1] shadow-inner' : ''
            }`}
            title="Start"
          >
            <svg viewBox="0 0 88 88" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h42v42H0zm46 0h42v42H46zM0 46h42v42H0zm46 0h42v42H46z" fill="#0078D4"/>
            </svg>
          </button>

          {/* Windows 11 Search Button */}
          <button 
            onClick={() => { setStartOpen(false); onOpenSearch(); }} 
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all"
            title="Search"
          >
            <Search size={18} className="text-zinc-200" />
          </button>

          {/* Windows 11 Task View / Desktops */}
          <button 
            onClick={() => setCurrentView('home')} 
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all"
            title="Task View"
          >
            <LayoutGrid size={18} className="text-zinc-200" />
          </button>

          {/* Windows 11 Widgets Board Shortcut */}
          <button 
            onClick={() => setShowWidgetsFlyout(true)} 
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all"
            title="Widgets"
          >
            <Compass size={18} className="text-blue-400" />
          </button>

          {/* Pinned Chrome */}
          <motion.div layout className="relative group flex items-center h-full">
            <button 
              onClick={() => { 
                const chromeApp = ALL_GAMES.find(g => g.id === 'Chrome');
                if (chromeApp) onPlayGame(chromeApp); 
              }} 
              className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all relative"
              title="Google Chrome"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" className="w-5 h-5 object-contain" alt="Chrome" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-transparent rounded-full transition-all w-1.5 group-hover:bg-[#0078D4]" />
            </button>
          </motion.div>

          {/* Pinned Microsoft Store */}
          <motion.div layout className="relative group flex items-center h-full">
            <button 
              onClick={onOpenStore} 
              className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all relative"
              title="Microsoft Store"
            >
              <div className="w-6 h-6 rounded bg-[#0078D4] flex items-center justify-center shadow-md">
                <Store size={15} className="text-white" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-transparent rounded-full transition-all w-1.5 group-hover:bg-[#0078D4]" />
            </button>
          </motion.div>

          {/* Pinned Chat / Friends */}
          <motion.div layout className="relative group flex items-center h-full">
            <button 
              onClick={() => { setStartOpen(false); setCurrentView('friends'); }} 
              className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all relative ${
                currentView === 'friends' || currentView === 'chat' ? 'bg-white/[0.1]' : ''
              }`}
              title="Friends & Chat"
            >
              <MessageSquare size={18} className={currentView === 'friends' || currentView === 'chat' ? 'text-[#0078D4]' : 'text-zinc-200'} />
              {/* Authentic Windows 11 Running Indicator Pill */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all ${
                currentView === 'friends' || currentView === 'chat' ? 'w-4 bg-[#0078D4]' : 'w-1.5 bg-white/40 group-hover:bg-white/80'
              }`} />
            </button>
          </motion.div>

          {/* Dynamic Open Windows */}
          <AnimatePresence mode="popLayout">
            {(openViews || []).filter(v => v !== 'chat' && v !== 'friends').map(view => {
              let Icon = Box;
              if (view === 'store') Icon = Store;
              if (view === 'profile') Icon = User;
              if (view === 'settings') Icon = SettingsIcon;
              if (view === 'party') Icon = Users;
              if (view === 'notifications') Icon = Bell;
              if (view === 'activity') Icon = Activity;
              
              const isFocused = currentView === view;
              return (
                <motion.div 
                  key={`sys-${view}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="relative group flex items-center h-full"
                >
                  <button 
                    onClick={() => { setStartOpen(false); setCurrentView(view); }} 
                    className={`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all relative ${
                      isFocused ? 'bg-white/[0.1]' : ''
                    }`}
                  >
                    <Icon size={18} className={isFocused ? 'text-[#0078D4]' : 'text-zinc-200'} />
                    {/* Windows 11 Running Pill */}
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all ${
                      isFocused ? 'w-4 bg-[#0078D4]' : 'w-1.5 bg-white/60'
                    }`} />
                  </button>
                </motion.div>
              );
            })}

            {/* Active Game */}
            {playingGame && (
              <motion.div 
                key={`game-${playingGame.instanceId || playingGame.id}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="relative group flex items-center h-full"
              >
                <button 
                  onClick={() => { setStartOpen(false); if (onMinimizeGame) onMinimizeGame(playingGame.instanceId || playingGame.id); }}
                  className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/[0.08] active:scale-90 transition-all relative bg-white/[0.1]"
                  title={playingGame.title}
                >
                  <img src={playingGame.image} alt={playingGame.title} className="w-5 h-5 rounded-md object-cover" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-[#0078D4] rounded-full w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Windows 11 System Tray & Action Center */}
        <div className="flex-1 flex justify-end items-center h-full gap-1">
          {/* Overflow Chevron */}
          <button 
            onClick={() => setShowCredits(!showCredits)}
            className="w-7 h-8 flex items-center justify-center rounded-md hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
            title="Show hidden icons"
          >
            <ChevronUp size={14} />
          </button>

          {/* Quick Settings Pill (Wi-Fi + Audio + Battery unified capsule) */}
          <div 
            onClick={() => { setShowQuickSettings(!showQuickSettings); setShowCalendarFlyout(false); }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-white/[0.08] active:bg-white/[0.04] cursor-pointer transition-all border border-transparent ${
              showQuickSettings ? 'bg-white/[0.1] border-white/[0.1]' : ''
            }`}
            title="Internet, audio, and battery controls"
          >
            <Wifi size={14} className={qsWifi ? "text-white" : "text-zinc-500"} />
            <Volume2 size={14} className={qsSound ? "text-white" : "text-zinc-500"} />
            <BatteryCharging size={14} className="text-emerald-400" />
          </div>

          {/* Clock & Date Pill */}
          <div 
            onClick={() => { setShowCalendarFlyout(!showCalendarFlyout); setShowQuickSettings(false); }}
            className={`flex flex-col items-end justify-center px-2 py-1 rounded-md hover:bg-white/[0.08] active:bg-white/[0.04] cursor-pointer transition-all border border-transparent ${
              showCalendarFlyout ? 'bg-white/[0.1] border-white/[0.1]' : ''
            }`}
            title="Calendar and Notifications"
          >
            <span className="text-[11px] font-semibold text-white leading-tight">{time}</span>
            <span className="text-[10px] text-zinc-400 leading-tight">{new Date().toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {/* Notification Bell */}
          <button 
            onClick={() => setCurrentView('notifications')}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/[0.08] relative text-zinc-300 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell size={15} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#0078D4] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Authentic 2px "Show Desktop" line at far right edge */}
          <div 
            onClick={() => {
              // Minimize / show desktop
              if (openViews && openViews.length > 0) {
                setCurrentView('home');
              }
            }}
            className="w-1.5 h-8 border-l border-white/20 hover:bg-white/30 transition-colors cursor-pointer ml-1"
            title="Show desktop"
          />
        </div>
      </div>

      {/* Widgets Flyout Modal */}
      {showWidgetsFlyout && <WidgetsFlyout onClose={() => setShowWidgetsFlyout(false)} weather={weather} />}
    </div>
  );
};
export default Desktop;
