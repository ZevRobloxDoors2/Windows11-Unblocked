import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Home, Library, Users, Bell, Headphones, Trophy, Store, ChevronLeft, Flame, Search,
  Battery, BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, ChevronDown
, Zap, Play } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, serverTimestamp, collection, query, where, increment, addDoc, setDoc } from 'firebase/firestore';

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
import { InstallPromptModal } from './components/InstallPromptModal';

import { ActivityFeed } from './components/ActivityFeed';
import { GlobalSearch } from './components/GlobalSearch';
import { Desktop } from './components/Desktop';
import { ModerationPanel } from './components/ModerationPanel';
import { VerificationModal } from './components/VerificationModal';
import { Minus, Square, X } from 'lucide-react';
import { Window } from './components/Window';
import { AppIframe } from './components/AppIframe';
import { WinStore } from './components/WinStore';
import { GTAVModal } from './components/GTAVModal';
import { LocalShare } from './components/LocalShare';
import { Classroom } from './components/Classroom';
import { FakeUpdate } from './components/FakeUpdate';
import { FakeDeadComputer } from './components/FakeDeadComputer';

type View = 'home' | 'store' | 'profile' | 'settings' | 'notifications' | 'friends' | 'chat' | 'party' | 'activity' | 'local-share' | 'classroom';

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
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userAuth, setUserAuth] = useState(auth.currentUser);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [openViews, setOpenViews] = useState<View[]>([]);
  const [minimizedViews, setMinimizedViews] = useState<View[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [reloadTriggers, setReloadTriggers] = useState<Record<string, number>>({});

  const handleReloadGame = (instanceId?: string) => {
    if (!instanceId) return;
    setReloadTriggers(prev => ({ ...prev, [instanceId]: (prev[instanceId] || 0) + 1 }));
  };

  const handleSetCurrentView = (view: View) => {
    setCurrentView(view);
    if (view !== 'home' && !openViews.includes(view)) {
      setOpenViews([...openViews, view]);
    }
    if (minimizedViews.includes(view)) {
      setMinimizedViews(minimizedViews.filter(v => v !== view));
    }
  };

  const handleCloseView = (view: View) => {
    setOpenViews(openViews.filter(v => v !== view));
    setMinimizedViews(minimizedViews.filter(v => v !== view));
    if (currentView === view) setCurrentView('home');
  };

  const handleMinimizeView = (view: View) => {
    if (!minimizedViews.includes(view)) {
      setMinimizedViews([...minimizedViews, view]);
    }
    if (currentView === view) setCurrentView('home');
  };
  const [libraryTab, setLibraryTab] = useState<'games'|'apps'>('games');
  
  const builtInApps = ['app-local-share', 'app-classroom', 'app-fake-update'];
  const [installedApps, setInstalledApps] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('installed_apps') || '[]');
    } catch(e) {
      return [...builtInApps];
    }
  });

  const handleInstallApp = (id: string) => {
    const newApps = [...installedApps, id];
    setInstalledApps(newApps);
    localStorage.setItem('installed_apps', JSON.stringify(newApps));
  };
  
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
  const [showInstallModal, setShowInstallModal] = useState(() => !localStorage.getItem('pwa_prompt_dismissed'));
  
  // Playing state
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showGreetingToast, setShowGreetingToast] = useState(false);
  const [showFakeUpdate, setShowFakeUpdate] = useState(false);
  const [showDeadComputer, setShowDeadComputer] = useState(false);
  const [showTrophyToast, setShowTrophyToast] = useState(false);
  const [playingGame, setPlayingGame] = useState<{ id: string, title: string, file: string, instanceId?: string } | null>(null);
  const [playMinutes, setPlayMinutes] = useState(0);
  const [suspendedGames, setSuspendedGames] = useState<{game: {id: string, title: string, file: string, instanceId?: string}, minutes: number}[]>([]);
  const [pendingGameToPlay, setPendingGameToPlay] = useState<{id: string, title: string, file: string, instanceId?: string} | null>(null);
  const [warningGame, setWarningGame] = useState<{id: string, title: string, file: string, instanceId?: string} | null>(null);
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

  const getUrl = (file: string, index: number) => {
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return file;
    }
    return file.startsWith('/') ? `.${file}` : `./${file}`;
  };

  const actuallyPlayGame = async (game: {id: string, title: string, file: string, instanceId?: string}) => {
    const isNewLaunch = !game.instanceId;
    const gameInstance = isNewLaunch ? { ...game, instanceId: `${game.id}-${Date.now()}-${Math.floor(Math.random()*1000)}` } : game;

    setIsLoadingGame(true);
    setPlayingGame(gameInstance);
    setMinimizedWindows(prev => prev.filter(id => id !== gameInstance.instanceId));
    
    // Restore minutes if resuming
    if (!isNewLaunch) {
      const suspended = suspendedGames.find(s => s.game.instanceId === gameInstance.instanceId);
      if (suspended) {
        setPlayMinutes(suspended.minutes);
        setSuspendedGames(prev => prev.filter(s => s.game.instanceId !== gameInstance.instanceId));
      }
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
        console.warn("Failed to update recent games", err);
      }
    }
    setTimeout(() => {
      setIsLoadingGame(false);
    }, 2000);
  };

  const handlePlayGame = async (game: {id: string, title: string, file: string, instanceId?: string, type?: string}) => {
    if (game.id === 'app-local-share') {
      handleSetCurrentView('local-share');
      return;
    }
    if (game.id === 'app-classroom') {
      handleSetCurrentView('classroom');
      return;
    }
    if (game.id === 'app-fake-update') {
      setShowFakeUpdate(true);
      return;
    }
    if (game.id === 'Roblox' || game.id === 'TikTok') {
      setWarningGame(game);
      return;
    }

    if (playingGame) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.instanceId !== playingGame.instanceId);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
    }

    const isNewLaunch = !game.instanceId;
    if (isNewLaunch && profile?.quickResumeEnabled && suspendedGames.length >= 6) {
      setPendingGameToPlay(game);
      return;
    }
    await actuallyPlayGame(game);
  };

  const handleMinimizeGame = (instanceId: string) => {
    setMinimizedWindows(prev => [...prev, instanceId]);
    if (playingGame?.instanceId === instanceId) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.instanceId !== playingGame.instanceId);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
      setPlayingGame(null);
    }
  };

  const handleStopGame = (instanceId?: string) => {
    if (instanceId) {
      if (playingGame?.instanceId === instanceId) {
        setPlayingGame(null);
        setPlayMinutes(0);
      } else {
        setSuspendedGames(prev => prev.filter(s => s.game.instanceId !== instanceId));
      }
    } else {
      setPlayingGame(null);
      setPlayMinutes(0);
    }
  };

  useEffect(() => {
    if (!profile || profile.uid === 'guest') return;
    const qReqs = query(collection(db, 'friendRequests'), where('toUid', '==', activeProfile.uid), where('status', '==', 'pending'));
    const qAlerts = query(collection(db, 'systemAlerts'), where('toUid', '==', activeProfile.uid), where('read', '==', false));
    
    let reqsCount = 0;
    let alertsCount = 0;

    const unsubReqs = onSnapshot(qReqs, (snap) => {
      reqsCount = snap.docs.length;
      setNotificationCount(reqsCount + alertsCount);
    }, () => {});
    
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      alertsCount = snap.docs.length;
      setNotificationCount(reqsCount + alertsCount);
    }, () => {});
    
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
    const defaultProfile: UserProfile = {
      uid: userAuth.uid,
      email: userAuth.email || '',
      gamertag: userAuth.email ? userAuth.email.split('@')[0] : 'Player',
      gamertagLower: userAuth.email ? userAuth.email.split('@')[0].toLowerCase() : 'player',
      avatar: userAuth.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userAuth.uid}`,
      status: 'Online',
      score: 0,
      homeTheme: 'default',
      recentGames: [],
      lastTrophyAt: new Date().toISOString(),
      role: userAuth.email === 'zaellacruze1@gmail.com' ? 'owner' : 'user'
    };

    // Set immediate fallback profile so UI never shows black screen
    setProfile(defaultProfile);

    const unsub = onSnapshot(doc(db, 'users', userAuth.uid), async (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        try {
          await setDoc(doc(db, 'users', userAuth.uid), {
            ...defaultProfile,
            lastTrophyAt: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.warn("Could not create fallback profile:", e);
        }
      }
      setProfileLoaded(true);
    }, (err) => {
      console.warn("Snapshot error:", err);
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
              console.warn("Trophy error:", e);
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

  if (!isGuestMode && (!userAuth || !activeSessionConfirmed)) {
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

  if (!isGuestMode && userAuth && !profileLoaded) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div>
        <div className="text-sm text-zinc-400 font-mono">Loading profile data...</div>
      </div>
    );
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
      {showInstallModal && (
        <InstallPromptModal onDismiss={() => {
          localStorage.setItem('pwa_prompt_dismissed', 'true');
          setShowInstallModal(false);
        }} />
      )}
      <GlobalNotifications profile={activeProfile} playingGame={!!playingGame} activeChatId={currentView === 'chat' && chatConfig ? (chatConfig.isGroup ? chatConfig.id : chatConfig.id) : null} onNavigateToChat={(id, isGroup, name) => { setChatConfig({id, name, isGroup}); handleSetCurrentView('chat'); }} onNavigateToParty={(id) => { setActivePartyId(id); handleSetCurrentView('party'); }} />
      <div className={`h-screen bg-black text-white font-sans overflow-hidden flex flex-col relative z-0`}>
      <div className={`flex-1 min-h-0 flex flex-col relative z-10`}>
        
        <Desktop 
          profile={activeProfile} 
          installedApps={installedApps} 
          onOpenStore={() => handleSetCurrentView('store')} 
          onOpenSearch={() => setIsSearchOpen(true)}
          onPlayGame={handlePlayGame}
          time={time}
          batteryInfo={batteryInfo}
          currentView={currentView}
          setCurrentView={(v) => handleSetCurrentView(v as View)}
          openViews={openViews}
          onActivateDeadComputer={() => setShowDeadComputer(true)}
          minimizedViews={minimizedViews}
          playingGame={playingGame}
          suspendedGames={suspendedGames}
          onMinimizeGame={handleMinimizeGame}
          notificationCount={notificationCount}
          onLogout={handleLogout}
          onOpenModerationPanel={() => setShowModerationPanel(true)}
        />

        {showModerationPanel && (
          <ModerationPanel onClose={() => setShowModerationPanel(false)} userProfile={activeProfile} />
        )}

        <WelcomeMessage />
        <div className="fixed inset-0 z-[-1] opacity-50">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/40" />
        </div>

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
                      setSuspendedGames(prev => prev.slice(1));
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

        {showFakeUpdate && <FakeUpdate onClose={() => setShowFakeUpdate(false)} />}
        {showDeadComputer && <FakeDeadComputer batteryInfo={batteryInfo} />}

        {openViews.map(view => (
          <div 
            key={view} 
            className={`absolute inset-0 pointer-events-none ${minimizedViews.includes(view) ? 'hidden' : 'block'}`}
            style={{ zIndex: currentView === view ? 200 : 100 }}
          >
              <Window 
                title={view.charAt(0).toUpperCase() + view.slice(1)} 
                onClose={() => handleCloseView(view)} 
                onMinimize={() => handleMinimizeView(view)}
                onGuide={() => setIsGuideOpen(true)}
                isActive={currentView === view}
                onFocus={() => { if (currentView !== view) setCurrentView(view); }}
              >
                {view === 'store' && <WinStore installedApps={installedApps} onInstall={handleInstallApp} onPlay={handlePlayGame} />}
                {view === 'profile' && <Profile userProfile={activeProfile as any} onBack={() => handleSetCurrentView('home')} />}
                {view === 'settings' && <SettingsView profile={activeProfile as any} onBack={() => handleSetCurrentView('home')} onLogout={handleLogout} isGuestMode={isGuestMode} />}
                {view === 'friends' && <Friends userProfile={activeProfile as any} onBack={() => handleSetCurrentView('home')} onChat={(id, name, isGroup) => { setChatConfig({id, name, isGroup: !!isGroup}); handleSetCurrentView('chat'); }} onCall={(friendUid) => { const callId = 'call_' + [activeProfile.uid, friendUid].sort().join('_'); setActivePartyId(callId); setCurrentView('party'); }} />}
                {view === 'chat' && (chatConfig ? <Chat userProfile={activeProfile as any} friendId={!chatConfig.isGroup ? chatConfig.id : undefined} friendGamertag={!chatConfig.isGroup ? chatConfig.name : undefined} chatId={chatConfig.isGroup ? chatConfig.id : undefined} isGroup={chatConfig.isGroup} chatName={chatConfig.isGroup ? chatConfig.name : undefined} onBack={() => handleSetCurrentView('friends')} /> : <div className="flex h-full items-center justify-center text-zinc-400 flex-col gap-4"><div>Select a friend to start chatting</div><button onClick={() => handleSetCurrentView('friends')} className="px-4 py-2 bg-[#00A4EF] text-white rounded">Open Friends</button></div>)}
                {view === 'party' && <Party profile={activeProfile as any} initialPartyId={activePartyId} onBack={() => { setActivePartyId(undefined); handleSetCurrentView('home'); }} />}
                {view === 'notifications' && <Notifications userProfile={activeProfile as any} onBack={() => handleSetCurrentView('home')} />}
                {view === 'activity' && <ActivityFeed profile={activeProfile as any} />}
                {view === 'local-share' && <LocalShare profile={activeProfile as any} />}
                {view === 'classroom' && <Classroom />}
              </Window>
          </div>
        ))}

        {(() => {
          const allActive = [...suspendedGames.map(s => s.game)];
          if (playingGame && !allActive.find(g => g.instanceId === playingGame.instanceId)) {
            allActive.push(playingGame);
          }
          // Sort instances by their ID to ensure stable DOM ordering so iframes don't reload
          allActive.sort((a, b) => {
            const idA = a.instanceId || a.id;
            const idB = b.instanceId || b.id;
            return idA.localeCompare(idB);
          });
          return (
            <AnimatePresence>
              {allActive.map((g, idx) => {
                const isActive = playingGame?.instanceId === g.instanceId;
                const isMinimized = minimizedWindows.includes(g.instanceId || '');
                // The user asked to "Allow to run multiple apps at once", meaning we should have multiple windows open at once.
                return (
                  <div 
                    key={g.instanceId || g.id}
                    className={`absolute inset-0 pointer-events-none ${isMinimized ? 'hidden' : 'block'}`}
                    style={{ zIndex: isActive ? 150 : 140 }}
                  >
                    <Window
                      title={g.title}
                      onClose={() => handleStopGame(g.instanceId)}
                      onMinimize={() => handleMinimizeGame(g.instanceId || '')}
                      onGuide={() => setIsGuideOpen(true)}
                      onReload={() => handleReloadGame(g.instanceId)}
                      isActive={isActive}
                      isMinimized={isMinimized}
                      onFocus={() => {
                        if (!isActive) {
                          if (playingGame) {
                            setSuspendedGames(prev => {
                              const filtered = prev.filter(s => s.game.instanceId !== playingGame.instanceId);
                              return [...filtered, { game: playingGame, minutes: playMinutes }];
                            });
                          }
                          const suspended = suspendedGames.find(s => s.game.instanceId === g.instanceId);
                          if (suspended) {
                            setPlayMinutes(suspended.minutes);
                            setSuspendedGames(prev => prev.filter(s => s.game.instanceId !== g.instanceId));
                          }
                          setPlayingGame(g);
                          setMinimizedWindows(prev => prev.filter(id => id !== g.instanceId));
                        }
                      }}
                      className={`transition-opacity duration-300 ${isMinimized ? 'opacity-0 pointer-events-none translate-y-24 scale-95' : 'opacity-100'}`}
                    >
                    <AnimatePresence>
                      {isLoadingGame && isActive && (
                        <motion.div 
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 top-10 z-[110] bg-black flex flex-col items-center justify-center gap-6"
                        >
                          <div className="w-16 h-16 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
                          <p className="text-xl font-semibold animate-pulse text-white">Loading {g.title}...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex-1 w-full h-full relative bg-white block">
                      {localStorage.getItem('anti_deledao') === 'true' && (
                        <div className="absolute inset-0 pointer-events-none z-[105]" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/c/c3/Google_Docs_logo_%282014-2020%29.svg)', backgroundRepeat: 'repeat', opacity: 0.1 }} />
                      )}
                      {g.id === 'GTA V' && !isLoadingGame && (
                        <GTAVModal />
                      )}
                      <AppIframe
                        src={getUrl(g.file, idx)}
                        isActive={isActive}
                        onLoadStart={() => { if (isActive) setIsLoadingGame(true); }}
                        onLoadEnd={() => { if (isActive) setIsLoadingGame(false); }}
                        reloadTrigger={reloadTriggers[g.instanceId || ''] || 0}
                      />
                    </div>
                  </Window>
                  </div>
                );
              })}
            </AnimatePresence>
          );
        })()}

      </div>
      </div>
    </>
  );
}