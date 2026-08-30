import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { UserProfile } from '../types';

export function Settings({ profile, onBack, onLogout, isGuestMode }: { profile: UserProfile, onBack: () => void, onLogout: () => void, isGuestMode: boolean }) {
  const [activeTab, setActiveTab] = useState<'general' | 'cloak'>('general');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const accounts = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
  const thisAccIndex = accounts.findIndex((a: any) => a.uid === profile.uid);
  const thisAcc = accounts[thisAccIndex];
  
  const [isAutoSignIn, setIsAutoSignIn] = useState(thisAcc?.autoSignIn || false);

  const handleToggleAutoSignIn = () => {
    if (isAutoSignIn) {
      if (thisAccIndex !== -1) {
        accounts[thisAccIndex].autoSignIn = false;
        accounts[thisAccIndex].pin = null;
        localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
      }
      setIsAutoSignIn(false);
    } else {
      setPinStep('enter');
      setPinInput('');
      setFirstPin('');
      setPinError('');
      setShowPinModal(true);
    }
  };

  useEffect(() => {
    if (pinInput.length === 4 && showPinModal) {
      if (pinStep === 'enter') {
        setFirstPin(pinInput);
        setPinInput('');
        setPinStep('confirm');
      } else {
        if (pinInput === firstPin) {
          if (thisAccIndex !== -1) {
            accounts.forEach((a: any) => { a.autoSignIn = false; });
            accounts[thisAccIndex].autoSignIn = true;
            accounts[thisAccIndex].pin = pinInput;
            localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
          }
          setIsAutoSignIn(true);
          setShowPinModal(false);
        } else {
          setPinError('PINs do not match. Try again.');
          setTimeout(() => {
            setPinInput('');
            setPinStep('enter');
            setFirstPin('');
            setPinError('');
          }, 1500);
        }
      }
    }
  }, [pinInput, showPinModal, pinStep, firstPin]);

  useEffect(() => {
    if (showPinModal) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (/\d/.test(e.key) && pinInput.length < 4) {
          setPinInput(p => p + e.key);
        } else if (e.key === 'Backspace') {
          setPinInput(p => p.slice(0, -1));
        } else if (e.key === 'Escape') {
          setShowPinModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showPinModal, pinInput]);

  const handleRemoveAccount = () => {
    if (confirm("Are you sure you want to remove this account from this device? You can sign in again later.")) {
      if (thisAccIndex !== -1) {
        accounts.splice(thisAccIndex, 1);
        localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
      }
      onLogout();
    }
  };


  // Load cloaking states
  const [cloakTitle, setCloakTitle] = useState(localStorage.getItem('cloak_title') || 'Google');
  const [cloakIcon, setCloakIcon] = useState(localStorage.getItem('cloak_icon') || 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico');
  const [panicKey, setPanicKey] = useState(localStorage.getItem('panic_key') || '`');

  const [mobileSizer, setMobileSizer] = useState(localStorage.getItem('mobile_sizer') === 'true');
  const [sortAZ, setSortAZ] = useState(localStorage.getItem('sort_az') === 'true');
  const [antiDeledao, setAntiDeledao] = useState(localStorage.getItem('anti_deledao') === 'true');
  const [drmEnabled, setDrmEnabled] = useState(localStorage.getItem('drm_enabled') !== 'false');
  const [autoAboutBlank, setAutoAboutBlank] = useState(localStorage.getItem('auto_about_blank') === 'true');
  const [notDisturb, setNotDisturb] = useState(localStorage.getItem('not_disturb') === 'true');
  const [muteNotifications, setMuteNotifications] = useState(localStorage.getItem('mute_notifications') === 'true');
  const [customCursor, setCustomCursor] = useState(localStorage.getItem('custom_cursor') !== 'false');
  const [cursorPreset, setCursorPreset] = useState(localStorage.getItem('cursor_preset') || 'crosshair');
  const [ideMode, setIdeMode] = useState(localStorage.getItem('ide_mode') === 'true');

  useEffect(() => {
    localStorage.setItem('mobile_sizer', mobileSizer.toString());
    localStorage.setItem('sort_az', sortAZ.toString());
    localStorage.setItem('anti_deledao', antiDeledao.toString());
    localStorage.setItem('drm_enabled', drmEnabled.toString());
    localStorage.setItem('auto_about_blank', autoAboutBlank.toString());
    localStorage.setItem('not_disturb', notDisturb.toString());
    localStorage.setItem('mute_notifications', muteNotifications.toString());
    window.dispatchEvent(new Event('storage'));
  }, [mobileSizer, sortAZ, antiDeledao, drmEnabled, autoAboutBlank, notDisturb, muteNotifications]);

  // Set default cloak to Google Classroom on first load
  useEffect(() => {
    if (!localStorage.getItem('cloak_title')) {
      localStorage.setItem('cloak_title', 'Classes');
      localStorage.setItem('cloak_icon', 'https://ssl.gstatic.com/classroom/favicon.png');
      document.title = 'Classes';
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = 'https://www.google.com/favicon.ico';
    }
  }, []);

  const applyCloak = (title: string, icon: string) => {
    setCloakTitle(title);
    setCloakIcon(icon);
    localStorage.setItem('cloak_title', title);
    localStorage.setItem('cloak_icon', icon);
    document.title = title || 'Google';
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = icon || 'https://www.google.com/favicon.ico';
  };

  const handleResetCloak = () => applyCloak('Google Docs - Edit Document', 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico');
  const handleSetCloakGoogle = () => applyCloak('Google Docs - Edit Document', 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico');
  const handleSetCloakCanvas = () => applyCloak('Canvas', 'https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e10d657a73.ico');

  const openAboutBlank = () => {
    let win = window.open('about:blank', '_blank');
    if (!win) return;
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
  };

  return (
    <>

      {showPinModal && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6">
            {pinStep === 'enter' ? 'Create a 4-Digit PIN' : 'Confirm your PIN'}
          </h2>
          <div className="flex gap-4 mb-8">
             {[0,1,2,3].map(i => (
               <div key={i} className={`w-4 h-4 rounded-full transition-colors ${pinInput.length > i ? 'bg-green-500' : 'bg-zinc-700'}`} />
             ))}
          </div>
          {pinError && <p className="text-red-500 mb-4 font-bold">{pinError}</p>}
          <div className="grid grid-cols-3 gap-4">
             {[1,2,3,4,5,6,7,8,9].map(num => (
               <button key={num} onClick={() => pinInput.length < 4 && setPinInput(p => p + num)} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-2xl font-bold flex items-center justify-center transition-colors">
                 {num}
               </button>
             ))}
             <button onClick={() => setShowPinModal(false)} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors">
               Cancel
             </button>
             <button onClick={() => pinInput.length < 4 && setPinInput(p => p + '0')} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-2xl font-bold flex items-center justify-center transition-colors">
               0
             </button>
             <button onClick={() => setPinInput(p => p.slice(0, -1))} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors">
               ⌫
             </button>
          </div>
        </div>
      )}
    <motion.div key="settings" initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="flex flex-1 min-h-0 h-full pb-12 px-12 w-full max-w-7xl mx-auto gap-8 overflow-y-auto">
      <div className="w-64 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-4">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-black">Settings</h2>
        </div>
        <button onClick={() => setActiveTab('general')} className={`text-left px-4 py-3 rounded-md font-bold transition-colors ${activeTab === 'general' ? 'bg-green-600 text-white' : 'hover:bg-white/10 text-zinc-400'}`}>
          General
        </button>
        <button onClick={() => setActiveTab('cloak')} className={`text-left px-4 py-3 rounded-md font-bold transition-colors ${activeTab === 'cloak' ? 'bg-green-600 text-white' : 'hover:bg-white/10 text-zinc-400'}`}>
          Anti-Teacher Mode
        </button>
        <button onClick={onLogout} className="text-left px-4 py-3 rounded-md font-bold transition-colors bg-red-600 text-white mt-auto mb-4 hover:bg-red-500">
          {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
        </button>
      </div>
      
      <div className="flex-1 bg-zinc-900/50 rounded-xl p-8 border border-transparent flex flex-col gap-8 overflow-y-auto custom-scroll min-h-0">
        {activeTab === 'general' && (
          <>

            <div>
              <h3 className="text-xl font-bold mb-4">Account</h3>
              <p className="text-zinc-400 mb-6">{isGuestMode ? 'Playing as Guest' : `Signed in as ${profile.gamertag}`}</p>
              
              {!isGuestMode && (
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                    <div>
                      <span className="font-bold">Auto Sign-in & PIN</span>
                      <p className="text-xs text-zinc-400">Skip the 'Who's playing today?' screen</p>
                    </div>
                    <button 
                      onClick={handleToggleAutoSignIn} 
                      className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${isAutoSignIn ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                    >
                      {isAutoSignIn ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  
                  <button onClick={handleRemoveAccount} className="px-4 py-3 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-md text-sm font-bold transition-colors w-fit">
                    Remove Account from this Device
                  </button>
                </div>
              )}
            </div>

            
            <div>
              <h3 className="text-xl font-bold mb-4">Display & Interface</h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold">Mobile Screen Sizer</span>
                    <p className="text-xs text-zinc-400">Adjust scaling for mobile</p>
                  </div>
                  <input type="checkbox" checked={mobileSizer} onChange={(e) => setMobileSizer(e.target.checked)} className="w-5 h-5 accent-green-500" />
                </label>

                <label className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold">Games Sorted A - Z</span>
                    <p className="text-xs text-zinc-400">Alphabetical sorting in library</p>
                  </div>
                  <input type="checkbox" checked={sortAZ} onChange={(e) => setSortAZ(e.target.checked)} className="w-5 h-5 accent-green-500" />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">System</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                  <div>
                    <span className="font-bold">Clear Cache</span>
                    <p className="text-xs text-zinc-400">Fixes most loading issues. App will reload.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to clear the cache? You will not be signed out, but app settings may reset.')) {
                        sessionStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-bold transition-colors"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Notifications</h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold">Do Not Disturb While Gaming</span>
                    <p className="text-xs text-zinc-400">Mute party/message notifications</p>
                  </div>
                  <input type="checkbox" checked={notDisturb} onChange={(e) => setNotDisturb(e.target.checked)} className="w-5 h-5 accent-green-500" />
                </label>

                <label className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold">Mute All Notifications</span>
                    <p className="text-xs text-zinc-400">Turn off toast notifications</p>
                  </div>
                  <input type="checkbox" checked={muteNotifications} onChange={(e) => setMuteNotifications(e.target.checked)} className="w-5 h-5 accent-green-500" />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Advanced</h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold text-red-400">DRM and Protected Content Extensions</span>
                    <p className="text-xs text-zinc-400">Forces the OS to black out this window if a screenshot, screen recording software, or school service attempts to capture it.</p>
                  </div>
                  <input type="checkbox" checked={drmEnabled} onChange={(e) => setDrmEnabled(e.target.checked)} className="w-5 h-5 accent-red-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold text-blue-400">Study Mode (IDE Camouflage)</span>
                    <p className="text-xs text-zinc-400">Redesigns the site to look like VS Code. Great for defeating thumbnail screenshots.</p>
                  </div>
                  <input type="checkbox" checked={ideMode} onChange={(e) => { setIdeMode(e.target.checked); localStorage.setItem('ide_mode', String(e.target.checked)); }} className="w-5 h-5 accent-blue-500" />
                </label>
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold">Panic Button Key</span>
                    <p className="text-xs text-zinc-400">Pressing this key instantly redirects you to Google Classroom.</p>
                  </div>
                  <input type="text" maxLength={1} value={panicKey} onChange={(e) => { setPanicKey(e.target.value); localStorage.setItem('panic_key', e.target.value); }} className="w-12 h-10 bg-zinc-900 border border-zinc-700 text-center font-bold text-xl rounded focus:border-green-500 outline-none uppercase" />
                </div>
                <div className="flex flex-col gap-2 p-4 bg-black/40 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold">Custom Cursor</span>
                      <p className="text-xs text-zinc-400">Use a custom Ebox cursor instead of default system cursor.</p>
                    </div>
                    <input type="checkbox" checked={customCursor} onChange={(e) => { setCustomCursor(e.target.checked); localStorage.setItem('custom_cursor', String(e.target.checked)); window.dispatchEvent(new Event('storage')); }} className="w-5 h-5 accent-green-500" />
                  </label>
                  {customCursor && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                      <span className="font-bold text-sm text-zinc-400">Preset</span>
                      <select value={cursorPreset} onChange={(e) => { setCursorPreset(e.target.value); localStorage.setItem('cursor_preset', e.target.value); window.dispatchEvent(new Event('storage')); }} className="bg-zinc-800 border border-zinc-700 rounded p-1 text-sm outline-none">
                        <option value="crosshair">Crosshair</option>
                        <option value="default">Default Pointer</option>
                        <option value="gaming">Gaming Neon</option>
                      </select>
                    </div>
                  )}
                </div>
                <label className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold text-red-400">Anti Deledao</span>
                    <p className="text-xs text-zinc-400">Adds a static image over your game to prevent detection. Might not always work.</p>
                  </div>
                  <input type="checkbox" checked={antiDeledao} onChange={(e) => setAntiDeledao(e.target.checked)} className="w-5 h-5 accent-red-500" />
                </label>

                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                  <div>
                    <span className="font-bold">Debug Mode</span>
                    <p className="text-xs text-zinc-400">Enter debug mode</p>
                  </div>
                  <button onClick={() => alert('Debug mode activated')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-bold">Debug</button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <button onClick={() => window.dispatchEvent(new CustomEvent('open-dmca'))} className="text-zinc-500 hover:text-white text-sm transition-colors">
                DMCA Policy
              </button>
            </div>
          </>
        )}

        {activeTab === 'cloak' && (
          <>
            <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg mb-4">
              <p className="text-blue-300 text-sm font-semibold">
                ℹ️ <strong>Google (Default):</strong> Cloaks as Google to bypass filters<br/>
                ℹ️ <strong>Canvas:</strong> Uses Canvas Learning Management System<br/>
                ℹ️ <strong>about:blank:</strong> Opens a completely blank window (see below)
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">about:blank Cloaker</h3>
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-4 bg-black/40 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-bold">Auto about:blank</span>
                    <p className="text-xs text-zinc-400">Automatically open in about:blank on load (Default off)</p>
                  </div>
                  <input type="checkbox" checked={autoAboutBlank} onChange={(e) => setAutoAboutBlank(e.target.checked)} className="w-5 h-5 accent-green-500" />
                </label>
                
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                  <div>
                    <span className="font-bold">Manual about:blank Cloak</span>
                    <p className="text-xs text-zinc-400">Double click the button to cloak</p>
                  </div>
                  <button onDoubleClick={openAboutBlank} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all">
                    Cloak (Double Click)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Tab Cloak</h3>
              <div className="flex gap-2 mb-6">
                <button onClick={handleSetCloakGoogle} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-bold">Google</button>
                <button onClick={handleSetCloakCanvas} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-bold">Canvas</button>
                <button onClick={handleResetCloak} className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-md text-sm font-bold ml-auto">Reset to Google</button>
              </div>

              <h4 className="font-bold text-sm text-zinc-400 mb-2">Custom Cloak</h4>
              <div className="flex flex-col gap-4 bg-black/40 p-4 rounded-lg">
                <input 
                  type="text" 
                  placeholder="Title" 
                  value={cloakTitle} 
                  onChange={(e) => setCloakTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-4 py-2 focus:border-green-500 focus:outline-none transition-colors"
                />
                <input 
                  type="text" 
                  placeholder="Favicon URL" 
                  value={cloakIcon} 
                  onChange={(e) => setCloakIcon(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-4 py-2 focus:border-green-500 focus:outline-none transition-colors"
                />
                <button onClick={() => applyCloak(cloakTitle, cloakIcon)} className="w-full py-2 bg-green-600 hover:bg-green-500 font-bold rounded-md transition-colors mt-2">
                  Set Custom Cloak
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
    </>
  );
}