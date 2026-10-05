import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Bell, ShieldCheck } from 'lucide-react';

export function InstallPromptModal({ onDismiss }: { onDismiss: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      alert("To install this app, open your browser menu (Chrome/Edge) and select 'Install app' or 'Add to Home Screen'.");
    }
    onDismiss();
  };

  const isHalloween = localStorage.getItem('halloween_theme') === 'true';

  return (
    <div className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`${isHalloween ? 'bg-[#1c0c03] border-orange-500/50 shadow-[0_0_40px_rgba(255,107,0,0.4)]' : 'bg-zinc-900 border-white/20 shadow-2xl'} border p-8 rounded-3xl flex flex-col items-center gap-6 max-w-md w-full text-white relative overflow-hidden`}
      >
        <div className={`absolute top-0 inset-x-0 h-1.5 ${isHalloween ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500'} animate-pulse`} />

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isHalloween ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40' : 'bg-blue-600/30 text-blue-400 border border-blue-500/40'} shadow-lg`}>
          <Download size={32} />
        </div>

        <div className="flex flex-col items-center text-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight">Install Windows 11 App</h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Install this website as a native desktop application and enable <span className="font-semibold text-white underline">out-of-site notifications</span> for live text messages and incoming voice calls even when the tab is in the background!
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full bg-black/40 p-4 rounded-2xl border border-white/5 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className={isHalloween ? 'text-orange-400' : 'text-blue-400'} />
            <span>Instant push notifications for calls & chats</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-green-400" />
            <span>Runs offline with fast native performance</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full mt-2">
          <button 
            onClick={handleInstallClick}
            className={`w-full py-4 rounded-xl font-bold transition-all shadow-xl text-base ${isHalloween ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-900/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/30'}`}
          >
            Install App & Enable Notifications
          </button>
          <button 
            onClick={onDismiss}
            className="w-full py-3 rounded-xl font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            Continue in Browser
          </button>
        </div>
      </motion.div>
    </div>
  );
}
