import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Home, Library, Users, Bell, Headphones, Trophy, Store, ChevronLeft, Flame, Search,
  Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, ChevronDown
, Zap, Play } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where, increment, addDoc } from 'firebase/firestore';

import { auth, db } from './firebase';
import { UserProfile } from './types';
import { AuthFlow } from './components/AuthFlow';
import { Profile } from './components/Profile';
import { Friends } from './components/Friends';
import { Chat } from './components/Chat';
import { Notifications } from './components/Notifications';
import { Party } from './components/Party';
import { GuideMenu } from './components/GuideMenu';
import { EboxMusicToast } from './components/EboxMusicToast';
import { Settings as SettingsView } from './components/Settings';
import { DMCAModal } from './components/DMCAModal';
import { StartupAnimation } from './components/StartupAnimation';
import { BetaWarningModal } from './components/BetaWarningModal';
import { WelcomeMessage } from './components/WelcomeMessage';
import { useSpatialNavigation } from './hooks/useSpatialNavigation';
import { ALL_GAMES } from './games';
import { GlobalNotifications } from './components/GlobalNotifications';

import { ActivityFeed } from './components/ActivityFeed';
import { GlobalSearch } from './components/GlobalSearch';

type View = 'home' | 'library' | 'profile' | 'settings' | 'notifications' | 'friends' | 'chat' | 'party' | 'activity';

const getThemeClasses = (themeId?: string) => {
  switch (themeId) {
    case 'midnight': return 'bg-blue-950';
    case 'forest': return 'bg-green-950';
    case 'purple': return 'bg-purple-950';
    case 'crimson': return 'bg-red-950';
    case 'cosmic': return 'bg-gradient-to-br from-indigo-950 via-purple-900 to-black';
    case 'ocean': return 'bg-gradient-to-br from-blue-900 via-cyan-950 to-black';
    case 'default':
    default: return 'bg-[#101010]';
  }
};

export default function App() {
  const [activeSessionConfirmed, setActiveSessionConfirmed] = useState(false);
  const [startupDone, setStartupDone] = useState(() => {
    return sessionStorage.getItem('ebox_startup_done') === 'true';
  });

  const handleStartupComplete = () => {
    sessionStorage.setItem('ebox_startup_done', 'true');
    setStartupDone(true);
  };

  
  useEffect(() => {
    // Tab Cloak
    const title = localStorage.getItem('cloak_title') || 'Classes';
    const icon = localStorage.getItem('cloak_icon') || 'https://ssl.gstatic.com/classroom/favicon.png';
    if (title) document.title = title;
    if (icon) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link') as HTMLLinkElement;
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = icon;
    }

    // Auto about:blank
    if (localStorage.getItem('auto_about_blank') === 'true') {
      if (window.location.href !== 'about:blank' && window.self === window.top) {
        let win = window.open('about:blank', '_blank');
        if (win) {
          let iframe = win.document.createElement('iframe');
          iframe.src = window.location.href;
          iframe.style.width = '100vw';
          iframe.style.height = '100vh';
          iframe.style.border = 'none';
          iframe.style.margin = '0';
          iframe.style.padding = '0';
          win.document.body.style.margin = '0';
          win.document.body.appendChild(iframe);
          window.location.replace('https://www.google.com');
        }
      }
    }
  }, []);

  
  useEffect(() => {
    const i = setInterval(() => {
      setSortAZ(localStorage.getItem('sort_az') === 'true');
      setMobileSizer(localStorage.getItem('mobile_sizer') === 'true');
    }, 500);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);


  // Panic Button Hook
  useEffect(() => {
    const handlePanic = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) return;
      
      const panicKey = localStorage.getItem('panic_key') || '`';
      if (e.key === panicKey) {
        window.location.replace("https://classroom.google.com");
      }
    };
    window.addEventListener('keydown', handlePanic);
    return () => window.removeEventListener('keydown', handlePanic);
  }, []);

  // Custom Cursor Mode
  const [cursorCss, setCursorCss] = useState('');
  useEffect(() => {
    const updateCursor = () => {
      if (localStorage.getItem('custom_cursor') !== 'false') {
        const preset = localStorage.getItem('cursor_preset') || 'crosshair';
        let url = "url('https://cdn-icons-png.flaticon.com/512/3143/3143160.png') 16 16, auto";
        if (preset === 'default') url = "url('https://cdn-icons-png.flaticon.com/512/2722/2722237.png') 16 16, auto";
        if (preset === 'gaming') url = "url('https://cdn-icons-png.flaticon.com/512/751/751463.png') 16 16, auto";
        
        // Also apply cursor to iframes by overriding their pointer events conceptually or applying it to wrapping containers
        setCursorCss(`
          *, *::before, *::after, button, a, input, select { 
            cursor: ${url} !important; 
          }
        `);
      } else {
        setCursorCss('');
      }
    };
    window.addEventListener('storage', updateCursor);
    updateCursor();
    const interval = setInterval(updateCursor, 1000);
    return () => { clearInterval(interval); window.removeEventListener('storage', updateCursor); };
  }, []);

  // IDE Mode tracking
  const [ideMode, setIdeMode] = useState(localStorage.getItem('ide_mode') === 'true');
  useEffect(() => {
    const i = setInterval(() => {
      setIdeMode(localStorage.getItem('ide_mode') === 'true');
    }, 1000);
    return () => clearInterval(i);
  }, []);

  useSpatialNavigation();
  
  const isGuestMode = sessionStorage.getItem('ebox_guest_mode') === 'true';

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userAuth, setUserAuth] = useState(auth.currentUser);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [libraryTab, setLibraryTab] = useState<'games'|'apps'>('games');
  
  const activeProfile = isGuestMode ? {
    uid: 'guest',
    gamertag: 'Guest Player',
    gamertagLower: 'guest player',
    avatar: 'https://ui-avatars.com/api/?name=Guest&background=10b981&color=fff',
    status: 'Online',
    score: 0,
    homeTheme: 'default',
    recentGames: []
  } : profile;

  const [time, setTime] = useState('');
  const [sortAZ, setSortAZ] = useState(localStorage.getItem('sort_az') === 'true');
  const [mobileSizer, setMobileSizer] = useState(localStorage.getItem('mobile_sizer') === 'true');
  const displayGames = sortAZ ? [...ALL_GAMES].sort((a,b) => a.title.localeCompare(b.title)) : ALL_GAMES;
  const [batteryInfo, setBatteryInfo] = useState<{ level: number, charging: boolean, isSupported: boolean }>({ level: 100, charging: false, isSupported: true });

  useEffect(() => {
    // Battery Status API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryInfo = () => {
          setBatteryInfo({
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            isSupported: true
          });
        };
        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
      });
    } else {
      setBatteryInfo(prev => ({ ...prev, isSupported: false }));
    }
  }, []);
  
  const [activePartyId, setActivePartyId] = useState<string | undefined>(undefined);
  const [chatConfig, setChatConfig] = useState<{id: string, name: string, isGroup: boolean} | null>(null);
  
  // Playing state
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showGreetingToast, setShowGreetingToast] = useState(false);
  const [showTrophyToast, setShowTrophyToast] = useState(false);
  const [playingGame, setPlayingGame] = useState<{ id: string, title: string, file: string } | null>(null);
  const [playMinutes, setPlayMinutes] = useState(0);
  const [suspendedGames, setSuspendedGames] = useState<{game: {id: string, title: string, file: string}, minutes: number}[]>([]);
  const [pendingGameToPlay, setPendingGameToPlay] = useState<{id: string, title: string, file: string} | null>(null);
  const [warningGame, setWarningGame] = useState<{id: string, title: string, file: string} | null>(null);
  const [showDropboxPrompt, setShowDropboxPrompt] = useState(true);
  const [dropboxToast, setDropboxToast] = useState(false);
  const [dropboxSelection, setDropboxSelection] = useState<string>('');

  useEffect(() => {
    const handleStorageChange = () => {
      const isDrmEnabled = localStorage.getItem('drm_enabled') !== 'false';
      if (isDrmEnabled) {
        document.documentElement.setAttribute('data-drm-enabled', 'true');
        // Add fake protected video element trick
        if (!document.getElementById('fake-drm-video')) {
          const video = document.createElement('video');
          video.id = 'fake-drm-video';
          video.style.position = 'fixed';
          video.style.top = '0';
          video.style.left = '0';
          video.style.width = '100vw';
          video.style.height = '100vh';
          video.style.pointerEvents = 'none';
          video.style.zIndex = '999999';
          // Use a CSS filter to make it essentially invisible but still rendered by compositor
          video.style.filter = 'opacity(0.01)';
          video.muted = true;
          document.body.appendChild(video);
          
          const setupDRM = async () => {
            const keySystems = ['com.widevine.alpha', 'com.microsoft.playready', 'com.apple.fps.1_0'];
            const configs = [{
              initDataTypes: ['cenc', 'keyids', 'webm'],
              videoCapabilities: [
                { contentType: 'video/mp4; codecs="avc1.42E01E"' },
                { contentType: 'video/webm; codecs="vp8"' }
              ]
            }];
            
            for (const ks of keySystems) {
              try {
                if (navigator.requestMediaKeySystemAccess) {
                  const access = await navigator.requestMediaKeySystemAccess(ks, configs);
                  const keys = await access.createMediaKeys();
                  await video.setMediaKeys(keys);
                  break; // Stop after first successful attachment
                }
              } catch (e) {
                // Ignore and try next
              }
            }
          };
          
          setupDRM();
        }
      } else {
        document.documentElement.removeAttribute('data-drm-enabled');
        const video = document.getElementById('fake-drm-video');
        if (video) video.remove();
      }
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDropbox = (choice: string) => {
    if (choice === 'never') {
      localStorage.setItem('dropbox_prompt', 'never');
      setShowDropboxPrompt(false);
      setDropboxToast(true);
      setTimeout(() => setDropboxToast(false), 3000);
    } else if (choice === 'just_once') {
      setShowDropboxPrompt(false);
      applyDropboxCloak();
    } else if (choice === 'always') {
      localStorage.setItem('dropbox_prompt', 'always');
      setShowDropboxPrompt(false);
      applyDropboxCloak();
    } else {
      setShowDropboxPrompt(false);
    }
  };

  const applyDropboxCloak = () => {
    const code = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>body,html{margin:0;padding:0;height:100%;overflow:hidden;}</style>
        <title>${localStorage.getItem('cloak_title') || 'Classes'}</title>
        <link rel="icon" href="${localStorage.getItem('cloak_icon') || 'https://ssl.gstatic.com/classroom/favicon.png'}">
      </head>
      <body>
        <iframe src="${window.location.href}" style="border:none;width:100%;height:100%;margin:0;padding:0;"></iframe>
      </body>
      </html>
    `;
    
    let win: any;
    if (dropboxSelection === 'blob') {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      win = window.open(url, '_blank');
      if (win) window.location.replace('https://classroom.google.com');
    } else if (dropboxSelection === 'filesystem') {
      const requestFileSystem = (window as any).requestFileSystem || (window as any).webkitRequestFileSystem;
      if (requestFileSystem) {
        requestFileSystem(0, 1024*1024, (fs: any) => {
          fs.root.getFile('index.html', {create: true}, (fileEntry: any) => {
            fileEntry.createWriter((fileWriter: any) => {
              const blob = new Blob([code], {type: 'text/html'});
              fileWriter.onwriteend = () => {
                win = window.open(fileEntry.toURL(), '_blank');
                if (win) window.location.replace('https://classroom.google.com');
                else alert('Popup blocker prevented the cloak! Please allow popups.');
              };
              fileWriter.write(blob);
            });
          });
        });
        return; 
      } else {
        alert("Filesystem protocol not supported in this browser. Falling back to about:blank.");
        win = window.open('about:blank', '_blank');
        if (win) { win.document.write(code); win.document.close(); window.location.replace('https://classroom.google.com'); }
      }
    } else {
      win = window.open('about:blank', '_blank');
      if (win) {
        win.document.write(code);
        win.document.close();
        window.location.replace('https://classroom.google.com');
      }
    }
    
    if (!win && dropboxSelection !== 'filesystem') {
      alert('Popup blocker prevented the cloak! Please allow popups.');
    }
  };

  const getBasePath = () => { const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'; return !isDev ? '/Ebox-Cloud-Unblocked' : ''; };
  const getUrl = (file: string, index: number) => {
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return file;
    }
    const basePath = getBasePath();
    const cleanFile = file.startsWith('/') ? file : `/${file}`;
    return `${basePath}${cleanFile}`;
  };

  const actuallyPlayGame = async (game: {id: string, title: string, file: string}) => {
    setIsLoadingGame(true);
    setPlayingGame(game);
    
    // Restore minutes if resuming
    const suspended = suspendedGames.find(s => s.game.id === game.id);
    if (suspended) {
      setPlayMinutes(suspended.minutes);
      // Remove from suspended when actively playing
      setSuspendedGames(prev => prev.filter(s => s.game.id !== game.id));
    } else {
      setPlayMinutes(0);
    }

    if (profile) {
      const recent = activeProfile.recentGames || [];
      const updatedRecent = [{ gameId: game.id, lastPlayed: new Date().toISOString() }, ...recent.filter(g => g.gameId !== game.id)].slice(0, 10);
      try {
        await updateDoc(doc(db, 'users', activeProfile.uid), { recentGames: updatedRecent });
        await addDoc(collection(db, 'activities'), {
          type: 'game',
          uid: activeProfile.uid,
          gamertag: activeProfile.gamertag,
          avatar: activeProfile.avatar || '',
          details: `Started playing ${game.title}`,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to update recent games", err);
      }
    }
    setTimeout(() => {
      setIsLoadingGame(false);
    }, 2000);
  };

  const handlePlayGame = async (game: {id: string, title: string, file: string}) => {
    if (game.id === 'Roblox' || game.id === 'TikTok') {
      setWarningGame(game);
      return;
    }

    if (profile?.quickResumeEnabled && suspendedGames.length >= 6 && !suspendedGames.find(s => s.game.id === game.id)) {
      setPendingGameToPlay(game);
      return;
    }
    await actuallyPlayGame(game);
  };

  const handleStopGame = () => {
    if (playingGame && profile?.quickResumeEnabled) {
      // Suspend it
      setSuspendedGames(prev => {
        // If it's already there, replace it, though it shouldn't be
        const filtered = prev.filter(s => s.game.id !== playingGame.id);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
    }
    setPlayingGame(null);
    setPlayMinutes(0);
  };

  useEffect(() => {
    if (!profile) return;
    const qReqs = query(collection(db, 'friendRequests'), where('toUid', '==', activeProfile.uid), where('status', '==', 'pending'));
    const qAlerts = query(collection(db, 'systemAlerts'), where('toUid', '==', activeProfile.uid), where('read', '==', false));
    
    let reqsCount = 0;
    let alertsCount = 0;

    const unsubReqs = onSnapshot(qReqs, (snap) => {
      reqsCount = snap.docs.length;
      setNotificationCount(reqsCount + alertsCount);
    }, (err) => console.error(err));
    
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      alertsCount = snap.docs.length;
      setNotificationCount(reqsCount + alertsCount);
    }, (err) => console.error(err));
    
    return () => { unsubReqs(); unsubAlerts(); };
  }, [profile]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserAuth(u);
      setAuthLoaded(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userAuth) {
      setProfileLoaded(true);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', userAuth.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setProfileLoaded(true);
    }, (error) => {
      console.error(error);
      setProfileLoaded(true);
    });
    return () => unsub();
  }, [userAuth]);

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Trophies logic (Every 2 mins of playing = 10 trophies)
  useEffect(() => {
    if (!playingGame || !profile) return;
    const interval = setInterval(() => {
      setPlayMinutes(prev => {
        const next = prev + 1;
        if (next > 0 && next % 2 === 0) {
          // Give trophies!
          // We must ensure 2 mins passed in firestore terms or just update it
          // Wait, the rule says: request.time.toMillis() >= existing().lastTrophyAt.toMillis() + 120000
          // To make sure it passes, we attempt the update
          const award = async () => {
            if (isGuestMode) return;
            try {
              await updateDoc(doc(db, 'users', activeProfile.uid), {
                score: increment(10),
                lastTrophyAt: serverTimestamp()
              });
              await addDoc(collection(db, 'activities'), {
                type: 'trophy',
                uid: activeProfile.uid,
                gamertag: activeProfile.gamertag,
                avatar: activeProfile.avatar || '',
                details: `Unlocked an achievement! (+10 🏆)`,
                createdAt: serverTimestamp()
              });
              setShowTrophyToast(true);
              
              if (activeProfile.vibrationEnabled !== false && navigator.getGamepads) {
                const gamepads = navigator.getGamepads();
                for (const gp of gamepads) {
                  if (gp && gp.vibrationActuator) {
                    gp.vibrationActuator.playEffect("dual-rumble", {
                      startDelay: 0,
                      duration: 500,
                      weakMagnitude: 1.0,
                      strongMagnitude: 1.0
                    }).catch(() => {});
                  }
                }
              }

              setTimeout(() => setShowTrophyToast(false), 4000);
            } catch(e) {
              console.error("Trophy error:", e);
            }
          };
          award();
        }
        return next;
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [playingGame, profile]);

  if (!startupDone) {
    return (
      <>
        <style>{cursorCss}</style>
        <StartupAnimation onComplete={handleStartupComplete} />
      </>
    );
  }

  if (!authLoaded) {
    return (
      <>
        <style>{cursorCss}</style>
        <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="w-8 h-8 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div></div>
      </>
    );
  }

  if (!isGuestMode && !activeSessionConfirmed) {
    return (
      <>
        <AuthFlow onConfirm={() => setActiveSessionConfirmed(true)} />
        <WelcomeMessage />
        <DMCAModal />
      <BetaWarningModal />
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={(v) => setCurrentView(v as any)} onPlayGame={handlePlayGame} />
      </>
    );
  }

  if (!isGuestMode && (userAuth && !profileLoaded)) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="w-8 h-8 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div></div>;
  }
  
  if (!isGuestMode && (!userAuth || !profile)) {
    return null;
  }

  const handleLogout = () => {
    if (isGuestMode) {
      sessionStorage.removeItem('ebox_guest_mode');
      window.location.reload();
    } else {
      signOut(auth);
      setActiveSessionConfirmed(false);
    }
  };

  return (
    <>
      <style>{cursorCss}</style>
      <DMCAModal />
      <GlobalNotifications profile={activeProfile} playingGame={!!playingGame} activeChatId={currentView === 'chat' && chatConfig ? (chatConfig.isGroup ? chatConfig.id : chatConfig.id) : null} onNavigateToChat={(id, isGroup, name) => { setChatConfig({id, name, isGroup}); setCurrentView('chat'); }} onNavigateToParty={(id) => { setActivePartyId(id); setCurrentView('party'); }} />
      <div className={`h-screen ${ideMode ? "bg-[#1e1e1e]" : getThemeClasses(activeProfile.homeTheme)} text-white font-sans overflow-hidden flex flex-col relative z-0`}>
      {ideMode && (
        <div className="flex h-full w-full absolute inset-0 z-0 pointer-events-none">
          <div className="w-64 bg-[#252526] border-r border-[#333333] flex flex-col">
            <div className="h-9 flex items-center px-4 text-[11px] text-[#cccccc] uppercase tracking-wider font-semibold">Explorer</div>
            <div className="px-4 py-1 text-sm text-[#cccccc] flex items-center gap-2"><ChevronDown size={14}/> PROJECT</div>
            <div className="px-8 py-1 text-sm text-[#4af626] bg-[#37373d]">index.html</div>
            <div className="px-8 py-1 text-sm text-[#cccccc]">style.css</div>
            <div className="px-8 py-1 text-sm text-[#cccccc]">app.js</div>
          </div>
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            <div className="h-9 bg-[#2d2d2d] flex items-center">
              <div className="px-4 h-full bg-[#1e1e1e] border-t-2 border-[#4af626] text-[#4af626] flex items-center text-sm">index.html</div>
            </div>
            <div className="flex-1 relative">
            </div>
          </div>
        </div>
      )}
      <div className={`flex-1 min-h-0 flex flex-col ${ideMode ? "ml-64 mt-9" : ""} relative z-10`}>
        <WelcomeMessage />
        <div className="fixed inset-0 z-[-1] opacity-50">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/40" />
        </div>

        <motion.button 
          layoutId="guide-button"
          onClick={() => setIsGuideOpen(true)}
          className="fixed top-8 right-8 z-[260] w-12 h-12 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 opacity-50 hover:opacity-100"
        >
          E
        </motion.button>

        <EboxMusicToast />
        <GuideMenu 
          isOpen={isGuideOpen} 
          onClose={() => setIsGuideOpen(false)} 
          recentGames={activeProfile.recentGames || []}
          playingGame={playingGame}
          onStopGame={handleStopGame}
          onNavigate={(view) => {
            setCurrentView(view as View);
          }}
        />

        <AnimatePresence>
          {showDropboxPrompt && !playingGame && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-zinc-900 border-2 border-yellow-500 p-8 rounded-lg max-w-2xl w-full shadow-2xl mx-4"
              >
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">🚀 Anti-Teacher Mode</h2>
                <p className="text-zinc-300 mb-6 text-lg leading-relaxed">
                  Choose your cloak method:
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">Select an option:</label>
                  <div className="relative">
                    <select
                      value={dropboxSelection}
                      onChange={(e) => setDropboxSelection(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border-2 border-zinc-700 rounded-md text-white font-semibold appearance-none cursor-pointer hover:border-green-500 focus:border-green-500 focus:outline-none transition-colors"
                    >
                      <option value="">-- Select a cloak method --</option>
                      <option value="about-blank">About:Blank (Might Work)</option>
                      <option value="blob">Blob: Protocol (Recommended)</option>
                      <option value="filesystem">Filesystem: Protocol</option>
                      <option value="html-file">HTML File (Very Recommended, COMING SOON!!!)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" size={20} />
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-6">
                  ℹ️ This is used to bypass School Teachers Watching Your Screen.
                </p>
                <div className="flex gap-4 justify-end">
                  <button 
                    onClick={() => handleDropbox('never')}
                    className="px-6 py-2 rounded-md bg-red-600 hover:bg-red-500 font-bold transition-colors text-white"
                  >
                    Never
                  </button>
                  <button 
                    onClick={() => handleDropbox('ask')}
                    className="px-6 py-2 rounded-md bg-yellow-600 hover:bg-yellow-500 font-bold transition-colors text-white"
                  >
                    Ask Later
                  </button>
                  <button 
                    onClick={() => handleDropbox('always')}
                    disabled={!dropboxSelection}
                    className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-500 disabled:bg-zinc-600 disabled:cursor-not-allowed font-bold transition-colors text-white"
                  >
                    Always
                  </button>
                  <button 
                    onClick={() => handleDropbox('just_once')}
                    disabled={!dropboxSelection}
                    className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-600 disabled:cursor-not-allowed font-bold transition-colors text-white"
                  >
                    Just Once
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {dropboxToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] text-white font-bold text-lg"
            >
              <div className="bg-zinc-900 border border-zinc-700 px-6 py-3 rounded-lg shadow-lg animate-pulse">
                To enable, go to settings
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {warningGame && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-zinc-900 border-2 border-red-500 p-8 rounded-lg max-w-md w-full shadow-2xl mx-4"
              >
                <h2 className="text-2xl font-bold mb-4 text-red-400">⚠️ Warning</h2>
                <p className="text-white mb-6 text-lg font-semibold">
                  DO NOT CLICK NOTHING ON THE SCREEN IF IT SAYS "404 page not found"
                </p>
                <p className="text-zinc-300 mb-8 leading-relaxed">
                  Just click continue and click Stop game, if it shows 404 page not found. If it doesn't, just continue and play the game.
                </p>
                <div className="flex items-center gap-2 mb-6 bg-red-900/30 border border-red-700 p-3 rounded">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-300 text-sm font-semibold">This error is getting fixed as soon as possible.</p>
                </div>
                <div className="flex gap-4 justify-end">
                  <button 
                    onClick={() => setWarningGame(null)}
                    className="px-6 py-2 rounded-md hover:bg-zinc-800 font-bold transition-colors text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      setWarningGame(null);
                      if (warningGame) {
                        await actuallyPlayGame(warningGame);
                      }
                    }}
                    className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-500 font-bold transition-colors text-white"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pendingGameToPlay && (
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg max-w-md w-full shadow-2xl">
                <h2 className="text-xl font-bold mb-2">Quick Resume Limit Reached</h2>
                <p className="text-zinc-400 mb-6 text-sm">
                  You have reached the maximum of 6 suspended games. Would you like to close the oldest suspended game ({suspendedGames[0]?.game.title}) to launch this new game, or cancel?
                </p>
                <div className="flex gap-4 justify-end">
                  <button 
                    onClick={() => setPendingGameToPlay(null)}
                    className="px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      const newSuspended = suspendedGames.slice(1);
                      setSuspendedGames(newSuspended);
                      const game = pendingGameToPlay;
                      setPendingGameToPlay(null);
                      actuallyPlayGame(game);
                    }}
                    className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-500 font-bold transition-colors text-white"
                  >
                    Close Oldest & Play
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="flex items-start justify-between px-12 pt-12 pb-4 z-50 shrink-0">
          <div 
            className="flex items-center gap-4 cursor-pointer hover:bg-white/10 p-2 -ml-2 rounded-xl transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none"
            onClick={() => setCurrentView('profile')}
            tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setCurrentView('profile')}
          >
            <img src={activeProfile.avatar} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-white/20 object-cover" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg leading-tight">
                  {activeProfile.gamertag}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300 mt-0.5">
                <Trophy size={14} className="text-zinc-400" />
                <span className="text-sm font-medium">{activeProfile.score}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-zinc-100">
            <button onClick={() => setIsSearchOpen(true)} className="hover:text-green-400 transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none rounded-full p-1">
              <Search size={22} />
            </button>
            <button onClick={() => setCurrentView('notifications')} className="relative hover:text-green-400 transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none rounded-full p-1">
              <Bell size={22} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-green-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#1a1a1a]">
                  {notificationCount}
                </span>
              )}
            </button>
            <button onClick={() => setCurrentView('friends')} className="hover:text-green-400 transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none rounded-full p-1">
              <Users size={22} />
            </button>
            <div className="flex items-center gap-4">
              {batteryInfo.isSupported && (
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="text-sm font-medium">{batteryInfo.level}%</span>
                  {batteryInfo.charging ? (
                    <BatteryCharging size={20} className="text-green-400" />
                  ) : (
                    <>
                      {batteryInfo.level > 80 && <BatteryFull size={20} />}
                      {batteryInfo.level > 20 && batteryInfo.level <= 80 && <BatteryMedium size={20} />}
                      {batteryInfo.level <= 20 && <BatteryLow size={20} className="text-red-500" />}
                    </>
                  )}
                </div>
              )}
              <span className="font-semibold text-lg">{time}</span>
            </div>
          </div>
        </nav>

        <AnimatePresence>
          {showGreetingToast && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl"
            >
              <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                <span className="text-lg">👋</span>
              </div>
              <div>
                <p className="font-bold text-sm text-white">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour < 12) return 'Good morning, ';
                    if (hour < 18) return 'Good afternoon, ';
                    return 'Good evening, ';
                  })()}
                  {profile?.gamertag}!
                </p>
                <p className="text-zinc-400 text-xs font-semibold">Welcome back to dashboard.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTrophyToast && (
            <motion.div 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-zinc-900/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-4 shadow-2xl"
            >
              <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                <Trophy size={16} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Achievement Unlocked</p>
                <p className="text-green-400 text-xs font-semibold">+10 Trophies earned!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(playingGame || suspendedGames.length > 0) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 z-[100] bg-black flex flex-col ${playingGame ? '' : 'pointer-events-none opacity-0'}`}
              style={{ display: playingGame ? 'flex' : 'none' }}
            >
              <AnimatePresence>
                {isLoadingGame && playingGame && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[110] bg-black flex flex-col items-center justify-center gap-6"
                  >
                    <div className="w-16 h-16 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin" />
                    <p className="text-xl font-semibold animate-pulse">Loading {playingGame.title}...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              
              {(() => {
                const allActive = [...suspendedGames.map(s => s.game)];
                if (playingGame && !allActive.find(g => g.id === playingGame.id)) {
                  allActive.push(playingGame);
                }
                return allActive.map((g, idx) => (
                  <div className={playingGame?.id === g.id ? "flex-1 w-full relative bg-white block" : "hidden"} key={g.id}>
                    
                    {localStorage.getItem('anti_deledao') === 'true' && playingGame?.id === g.id && (
                      <div className="absolute inset-0 pointer-events-none z-[105]" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/c/c3/Google_Docs_logo_%282014-2020%29.svg)', backgroundRepeat: 'repeat', opacity: 0.1 }} />
                    )}

                    {g.id === 'GTA V' && playingGame?.id === g.id && !isLoadingGame && (
                      <div className="absolute top-4 left-4 z-[200] bg-zinc-900 border-2 border-red-500 p-4 rounded-lg shadow-2xl max-w-sm pointer-events-auto">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-red-400 font-bold">GTA V Launch Instructions:</h3>
                        </div>
                        <ol className="text-sm text-white list-decimal list-inside space-y-2 mb-2">
                          <li>Click <strong>Library</strong> on the bottom right corner.</li>
                          <li>Click the <strong>Cloud</strong> button in the search bar.</li>
                          <li>Search up <strong>Grand</strong>.</li>
                          <li>Click on <strong>GTA V</strong>.</li>
                        </ol>
                      </div>
                    )}
                    <iframe 
                    key={g.id}
                    src={getUrl(g.file, idx)} 
                    className="w-full h-full" 
                    sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-presentation"
                    allow="fullscreen; autoplay; gamepad"
                    onLoad={() => { if (playingGame?.id === g.id) setIsLoadingGame(false); }}
                  />
                  </div>
                ));
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 min-h-0 overflow-hidden relative z-10 flex flex-col w-full">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-8">
                <div className="flex gap-4 shrink-0 overflow-x-auto pb-4 items-center px-12 pt-8">
                  <div tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setCurrentView('library')} onClick={() => setCurrentView('library')} className="w-[160px] h-[160px] bg-zinc-800/90 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none group cursor-pointer flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10">
                    <Library className="text-zinc-300 mb-2 group-hover:text-white transition-colors" size={48} />
                    <span className="font-semibold text-sm text-center px-1 text-white">My games & apps</span>
                  </div>
                  
                  {displayGames.slice(0,8).map((g) => (
                    <div tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handlePlayGame({id: g.id, title: g.title, file: g.file})} key={g.id} onClick={() => handlePlayGame({id: g.id, title: g.title, file: g.file})} className="w-[160px] h-[160px] rounded-lg overflow-hidden border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none flex-shrink-0 group cursor-pointer flex-col relative transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10">
                      <img src={g.image} className="w-full h-full object-cover group-hover:scale-105 group-focus:scale-105 transition-transform" />
                    </div>
                  ))}

                  <div tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setCurrentView('settings')} onClick={() => setCurrentView('settings')} className="w-[160px] h-[160px] bg-zinc-800/90 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none group cursor-pointer flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10">
                    <Settings size={48} className="text-zinc-300 group-hover:text-white group-focus:text-white transition-colors mb-2" />
                    <span className="font-semibold text-sm text-white">Settings</span>
                  </div>

                  <div tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setCurrentView('friends')} onClick={() => setCurrentView('friends')} className="w-[160px] h-[160px] bg-purple-600 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none group cursor-pointer flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10">
                    <Users size={48} className="text-white mb-2" />
                    <span className="font-semibold text-sm text-white">Friends</span>
                  </div>

                  <div tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setCurrentView('activity')} onClick={() => setCurrentView('activity')} className="w-[160px] h-[160px] bg-blue-600 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none group cursor-pointer flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10">
                    <Flame size={48} className="text-white mb-2 group-hover:text-yellow-400 transition-colors" />
                    <span className="font-semibold text-sm text-white">Activity</span>
                  </div>
                    
                </div>

                {suspendedGames.length > 0 && (
                  <div className="px-12 mt-4">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                      <Zap size={24} className="fill-green-400 text-green-400" /> Quick Resume
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scroll">
                      {suspendedGames.map((sg) => {
                        const gameData = ALL_GAMES.find(g => g.id === sg.game.id);
                        return (
                          <div tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handlePlayGame(sg.game)} key={sg.game.id} onClick={() => handlePlayGame(sg.game)} className="w-[200px] h-[120px] rounded-lg overflow-hidden border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none flex-shrink-0 group cursor-pointer flex-col relative bg-zinc-800 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10">
                            {gameData?.image && <img src={gameData.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                              <span className="font-bold text-sm text-white line-clamp-1">{sg.game.title}</span>
                              <span className="text-xs text-green-400 font-bold drop-shadow-md">{sg.minutes} min played</span>
                            </div>
                            <div className="absolute top-2 right-2 bg-green-500 text-black p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={14} fill="currentColor" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentView === 'library' && (
              <motion.div key="library" initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="flex flex-col flex-1 min-h-0 h-full overflow-hidden px-12 pt-8">
                <div className="flex items-center gap-4 mb-2 shrink-0">
                  <button onClick={() => setCurrentView('home')} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-3xl font-black">My games & apps</h2>
                </div>
                <div className="flex flex-1 min-h-0 gap-8">
                  <div className="w-48 flex flex-col gap-2 shrink-0">
                    <button 
                      onClick={() => setLibraryTab('games')}
                      className={`text-left px-4 py-3 rounded-md font-bold transition-colors ${libraryTab === 'games' ? 'bg-green-600 text-white' : 'hover:bg-white/10 text-zinc-400'}`}
                    >
                      Games
                    </button>
                    <button 
                      onClick={() => setLibraryTab('apps')}
                      className={`text-left px-4 py-3 rounded-md font-bold transition-colors ${libraryTab === 'apps' ? 'bg-green-600 text-white' : 'hover:bg-white/10 text-zinc-400'}`}
                    >
                      Apps
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-12">
                      {displayGames.filter(g => (g as any).type === (libraryTab === 'games' ? 'game' : 'app')).map(item => (
                        <div tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handlePlayGame({id: item.id, title: item.title, file: item.file})} key={item.id} onClick={() => handlePlayGame({id: item.id, title: item.title, file: item.file})} className="group cursor-pointer">
                          <div className="aspect-[3/4] bg-zinc-800 rounded-md overflow-hidden border-[3px] border-transparent group-hover:border-green-500 group-focus:border-green-500 transition-colors relative">
                            <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 group-focus:scale-105 transition-transform" alt={item.title} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 flex items-center justify-center transition-opacity">
                              <Trophy size={48} className="text-green-500" />
                            </div>
                          </div>
                          <div className="mt-2 px-1">
                            <p className="font-semibold text-sm truncate">{item.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'profile' && <Profile key="profile" userProfile={activeProfile} onBack={() => setCurrentView('home')} />}
            
            {currentView === 'friends' && <Friends key="friends" userProfile={activeProfile} onBack={() => setCurrentView('home')} onChat={(id, name, isGroup) => { setChatConfig({id, name, isGroup: !!isGroup}); setCurrentView('chat'); }} />}
            
            {currentView === 'notifications' && <Notifications key="notifications" userProfile={activeProfile} onBack={() => setCurrentView('home')} />}
            {currentView === 'party' && <Party key="party" profile={activeProfile} initialPartyId={activePartyId} onBack={() => { setActivePartyId(undefined); setCurrentView('home'); }} />}
            {currentView === 'activity' && <ActivityFeed key="activity" />}
            {currentView === 'chat' && chatConfig && <Chat key="chat" userProfile={activeProfile} friendId={!chatConfig.isGroup ? chatConfig.id : undefined} friendGamertag={!chatConfig.isGroup ? chatConfig.name : undefined} chatId={chatConfig.isGroup ? chatConfig.id : undefined} isGroup={chatConfig.isGroup} chatName={chatConfig.isGroup ? chatConfig.name : undefined} onBack={() => setCurrentView('friends')} />}

            {currentView === 'settings' && <SettingsView profile={activeProfile as any} onBack={() => setCurrentView('home')} onLogout={handleLogout} isGuestMode={isGuestMode} />}
          </AnimatePresence>
        </main>
      </div>
      </div>
    </>
  );
}