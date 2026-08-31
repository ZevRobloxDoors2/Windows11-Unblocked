import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Monitor, Paintbrush, User, ShieldAlert, MonitorPlay, History, Upload } from 'lucide-react';
import { UserProfile } from '../types';

export function Settings({ profile, onBack, onLogout, isGuestMode }: { profile: UserProfile, onBack: () => void, onLogout: () => void, isGuestMode: boolean }) {
  const [activeTab, setActiveTab] = useState<'system' | 'personalization' | 'accounts' | 'privacy' | 'gaming'>('system');
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const accounts = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
  const thisAccIndex = accounts.findIndex((a: any) => a.uid === profile.uid);
  const thisAcc = accounts[thisAccIndex];
  
  const [isAutoSignIn, setIsAutoSignIn] = useState(thisAcc?.autoSignIn || false);

  const [skipPlayingToday, setSkipPlayingToday] = useState(localStorage.getItem('skip_playing_today') === 'true');
  const [showFramerate, setShowFramerate] = useState(localStorage.getItem('show_framerate') === 'true');
  const [antiDeledao, setAntiDeledao] = useState(localStorage.getItem('anti_deledao') === 'true');
  const [autoAboutBlank, setAutoAboutBlank] = useState(localStorage.getItem('auto_about_blank') === 'true');
  const [cloakTitle, setCloakTitle] = useState('');
  const [cloakIcon, setCloakIcon] = useState('');

  useEffect(() => {
    localStorage.setItem('skip_playing_today', String(skipPlayingToday));
  }, [skipPlayingToday]);

  useEffect(() => {
    localStorage.setItem('show_framerate', String(showFramerate));
    window.dispatchEvent(new CustomEvent('toggle-framerate'));
  }, [showFramerate]);

  useEffect(() => {
    localStorage.setItem('anti_deledao', String(antiDeledao));
  }, [antiDeledao]);

  useEffect(() => {
    localStorage.setItem('auto_about_blank', String(autoAboutBlank));
  }, [autoAboutBlank]);

  const handleToggleAutoSignIn = () => {
    if (isAutoSignIn) {
      if (thisAccIndex !== -1) {
        accounts[thisAccIndex].autoSignIn = false;
        accounts[thisAccIndex].pin = null;
        localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
        import('firebase/firestore').then(({ updateDoc, doc, deleteField }) => {
          updateDoc(doc(db, 'users', profile.uid), { pin: deleteField() }).catch(()=> {});
        });
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
            accounts[thisAccIndex].autoSignIn = true;
            accounts[thisAccIndex].pin = pinInput;
            localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
            setIsAutoSignIn(true);
            import('firebase/firestore').then(({ updateDoc, doc }) => {
              updateDoc(doc(db, 'users', profile.uid), { pin: pinInput }).catch(()=> {});
            });
          }
          setShowPinModal(false);
        } else {
          setPinError('PINs do not match. Try again.');
          setPinStep('enter');
          setPinInput('');
        }
      }
    }
  }, [pinInput, showPinModal, pinStep, firstPin, thisAccIndex]);

  const applyCloak = (title: string, icon: string) => {
    if (title) document.title = title;
    if (icon) {
      let link: HTMLLinkElement = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = icon;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        try {
          localStorage.setItem(key, base64String);
          window.location.reload();
        } catch (err) {
          alert("Image is too large for local storage. Please use a smaller image or an image URL instead.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openAboutBlank = () => {
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.body.style.margin = '0';
      win.document.body.style.height = '100vh';
      const iframe = win.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.margin = '0';
      iframe.src = window.location.href;
      win.document.body.appendChild(iframe);
      window.location.replace('https://google.com');
    } else {
      alert('Popup blocker prevented opening about:blank. Please allow popups.');
    }
  };

  const tabs = [
    { id: 'system', icon: Monitor, label: 'System' },
    { id: 'personalization', icon: Paintbrush, label: 'Personalization' },
    { id: 'accounts', icon: User, label: 'Accounts' },
    { id: 'gaming', icon: MonitorPlay, label: 'Gaming' },
    { id: 'privacy', icon: ShieldAlert, label: 'Privacy & security' }
  ] as const;

  return (
    <>
    {showPinModal && (
      <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 w-96">
          <h2 className="text-2xl font-bold text-white mb-2">{pinStep === 'enter' ? 'Create a 4-digit PIN' : 'Confirm your PIN'}</h2>
          {pinError && <p className="text-red-500 font-semibold">{pinError}</p>}
          <div className="flex gap-4 my-4">
            {[0,1,2,3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full transition-colors ${pinInput.length > i ? 'bg-white' : 'bg-zinc-700'}`} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <button key={num} onClick={() => setPinInput(p => p.length < 4 ? p + num : p)} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-2xl font-bold flex items-center justify-center transition-colors shadow-md">
                {num}
              </button>
            ))}
            <button onClick={() => setShowPinModal(false)} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors shadow-md">Cancel</button>
            <button onClick={() => setPinInput(p => p.length < 4 ? p + '0' : p)} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-2xl font-bold flex items-center justify-center transition-colors shadow-md">0</button>
            <button onClick={() => setPinInput(p => p.slice(0, -1))} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors shadow-md">Del</button>
          </div>
        </div>
      </div>
    )}

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full w-full bg-[#1e1e1e] text-white"
    >
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 flex flex-col pt-4 overflow-y-auto">
        <div className="flex items-center gap-3 px-4 mb-6">
          <img src={profile.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{profile.gamertag}</span>
            <span className="text-xs text-zinc-400">{profile.email}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 px-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${activeTab === tab.id ? 'bg-[#00A4EF]/20 text-[#00A4EF]' : 'hover:bg-white/5 text-zinc-300 hover:text-white'}`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-12">
          
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold mb-2">System</h2>
              
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-sm">Framerate Counter</span>
                    <span className="text-xs text-zinc-400 block mt-1">Show FPS overlay in games</span>
                  </div>
                  <input type="checkbox" checked={showFramerate} onChange={(e) => setShowFramerate(e.target.checked)} className="w-4 h-4 accent-[#00A4EF]" />
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block text-sm">Debug Mode</span>
                    <span className="text-xs text-zinc-400 block mt-1">Enter debug mode for troubleshooting</span>
                  </div>
                  <button onClick={() => alert('Debug mode activated')} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold">Activate</button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <button onClick={() => window.dispatchEvent(new CustomEvent('open-dmca'))} className="text-zinc-500 hover:text-white text-xs transition-colors">
                  View DMCA Policy
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'personalization' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold mb-2">Personalization</h2>
              
              <div className="bg-white/5 rounded-lg border border-white/10 p-6 flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Desktop Wallpaper</label>
                  <p className="text-xs text-zinc-400 mb-3">Paste an image URL or upload a file from your computer.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://..." 
                      defaultValue={localStorage.getItem('win11_bg') || ''}
                      onBlur={(e) => {
                        localStorage.setItem('win11_bg', e.target.value);
                        window.location.reload();
                      }}
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-[#00A4EF] outline-none text-sm transition-colors"
                    />
                    <label className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded cursor-pointer transition-colors text-sm font-medium border border-transparent hover:border-white/10">
                      <Upload size={16} />
                      Import File
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'win11_bg')} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10" />

                <div>
                  <label className="block text-sm font-semibold mb-2">Lock Screen Wallpaper</label>
                  <p className="text-xs text-zinc-400 mb-3">Customize the background of your login screen.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="https://..." 
                      defaultValue={localStorage.getItem('win11_lock_bg') || ''}
                      onBlur={(e) => {
                        localStorage.setItem('win11_lock_bg', e.target.value);
                      }}
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-[#00A4EF] outline-none text-sm transition-colors"
                    />
                    <label className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded cursor-pointer transition-colors text-sm font-medium border border-transparent hover:border-white/10">
                      <Upload size={16} />
                      Import File
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'win11_lock_bg')} className="hidden" />
                    </label>
                  </div>
                </div>

                {!isGuestMode && (
                  <>
                    <div className="w-full h-px bg-white/10" />
                    <div>
                      <label className="block text-sm font-semibold mb-2">Profile Picture URL</label>
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        defaultValue={thisAcc?.avatar || ''}
                        onBlur={(e) => {
                          if (thisAccIndex !== -1) {
                            accounts[thisAccIndex].avatar = e.target.value;
                            localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
                            window.location.reload();
                          }
                        }}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded focus:border-[#00A4EF] outline-none text-sm transition-colors"
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'accounts' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold mb-2">Accounts</h2>
              
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={profile.avatar} className="w-16 h-16 rounded-full" />
                    <div>
                      <span className="font-semibold block">{profile.gamertag}</span>
                      <span className="text-sm text-zinc-400 block">{profile.email}</span>
                      <span className="text-xs text-zinc-500 mt-1 inline-block px-2 py-0.5 bg-white/5 rounded">{profile.role || 'User'}</span>
                    </div>
                  </div>
                  <button onClick={onLogout} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm font-semibold transition-colors">
                    Sign out
                  </button>
                </div>
                
                {!isGuestMode && (
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-sm">Sign-in options</span>
                      <span className="text-xs text-zinc-400 block mt-1">Require a PIN for this account</span>
                    </div>
                    {isAutoSignIn ? (
                      <button onClick={handleToggleAutoSignIn} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold">Remove PIN</button>
                    ) : (
                      <button onClick={handleToggleAutoSignIn} className="px-4 py-1.5 bg-[#00A4EF] hover:bg-[#0078D4] text-white rounded text-xs font-semibold transition-colors">Set up PIN</button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'gaming' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold mb-2">Gaming</h2>
              
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-red-400 block text-sm">Anti Deledao</span>
                    <span className="text-xs text-zinc-400 block mt-1">Adds a static image over your game to prevent detection. Might not always work.</span>
                  </div>
                  <input type="checkbox" checked={antiDeledao} onChange={(e) => setAntiDeledao(e.target.checked)} className="w-4 h-4 accent-red-500" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold mb-2">Privacy & security</h2>
              
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <h3 className="font-semibold mb-4 text-sm">about:blank Cloaker</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <span className="font-medium block text-sm">Auto about:blank</span>
                      <span className="text-xs text-zinc-400 block mt-1">Automatically open in about:blank on load</span>
                    </div>
                    <input type="checkbox" checked={autoAboutBlank} onChange={(e) => setAutoAboutBlank(e.target.checked)} className="w-4 h-4 accent-[#00A4EF]" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium block text-sm">Manual about:blank Cloak</span>
                      <span className="text-xs text-zinc-400 block mt-1">Double click to cloak immediately</span>
                    </div>
                    <button onDoubleClick={openAboutBlank} className="px-4 py-1.5 bg-[#00A4EF] hover:bg-[#0078D4] rounded text-xs font-semibold transition-colors">
                      Cloak
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg border border-white/10 p-4 flex flex-col gap-4">
                <h3 className="font-semibold text-sm">Tab Cloak</h3>
                <div className="flex gap-2">
                  <button onClick={() => applyCloak('Google', 'https://www.google.com/favicon.ico')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium">Google</button>
                  <button onClick={() => applyCloak('Dashboard', 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium">Canvas</button>
                  <button onClick={() => applyCloak('E-Box', '')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium ml-auto">Reset</button>
                </div>
                
                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  <h4 className="font-medium text-xs text-zinc-400">Custom Cloak</h4>
                  <input type="text" placeholder="Title" value={cloakTitle} onChange={(e) => setCloakTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 focus:border-[#00A4EF] outline-none text-sm transition-colors" />
                  <input type="text" placeholder="Favicon URL" value={cloakIcon} onChange={(e) => setCloakIcon(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 focus:border-[#00A4EF] outline-none text-sm transition-colors" />
                  <button onClick={() => applyCloak(cloakTitle, cloakIcon)} className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors">Apply Custom Cloak</button>
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
    </>
  );
}
