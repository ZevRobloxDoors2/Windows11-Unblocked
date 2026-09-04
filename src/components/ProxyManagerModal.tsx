import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Server, Activity } from 'lucide-react';
import { getProxyBase, DEFAULT_PROXY_BASE } from '../games';

export const PROXY_OPTIONS = [
  { url: DEFAULT_PROXY_BASE, label: "Default Proxy (n43.pw)" },
  { url: "https://ultraviolet-proxy.vercel.app", label: "Ultraviolet Ver. (Coming Soon)" },
];

export function ProxyManagerModal({ onClose }: { onClose: () => void }) {
  const [selectedProxy, setSelectedProxy] = useState(getProxyBase());
  const [pingStatus, setPingStatus] = useState<Record<string, 'checking' | 'online' | 'offline'>>({});

  const handleSelect = (url: string) => {
    setSelectedProxy(url);
    localStorage.setItem('proxy_base', url);
    window.location.reload();
  };

  const pingProxy = async (url: string) => {
    setPingStatus(prev => ({ ...prev, [url]: 'checking' }));
    try {
      await fetch(url, { mode: 'no-cors' });
      // In no-cors, it always succeeds if the network connection is established
      setPingStatus(prev => ({ ...prev, [url]: 'online' }));
    } catch (e) {
      setPingStatus(prev => ({ ...prev, [url]: 'offline' }));
    }
  };

  return (
      <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl shadow-2xl flex flex-col w-full max-w-[450px]">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Server size={20} className="text-[#00A4EF]" /> Proxy Manager
             </h2>
             <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-zinc-400"><X size={16} /></button>
           </div>
           
           <div className="space-y-3">
             {PROXY_OPTIONS.map((opt) => (
                <div key={opt.url} className={`p-3 rounded-lg border flex items-center justify-between ${selectedProxy === opt.url ? 'bg-[#00A4EF]/10 border-[#00A4EF]' : 'bg-black/20 border-white/10'}`}>
                  <div>
                    <div className="font-semibold text-sm text-white">{opt.label}</div>
                    <div className="text-xs text-zinc-400">{opt.url}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => pingProxy(opt.url)} 
                      className="p-1.5 hover:bg-white/10 rounded text-zinc-400 transition-colors relative"
                      title="Ping / Test Connection"
                    >
                      <Activity size={16} className={pingStatus[opt.url] === 'online' ? 'text-green-400' : pingStatus[opt.url] === 'offline' ? 'text-red-400' : pingStatus[opt.url] === 'checking' ? 'animate-pulse text-yellow-400' : ''} />
                    </button>
                    {selectedProxy === opt.url ? (
                      <span className="text-xs font-bold text-[#00A4EF] px-3 py-1.5 bg-[#00A4EF]/20 rounded border border-[#00A4EF]/30">Active</span>
                    ) : (
                      <button onClick={() => handleSelect(opt.url)} className="text-xs font-bold text-white px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors border border-white/10">Use This</button>
                    )}
                  </div>
                </div>
             ))}
           </div>
           <p className="text-xs text-zinc-500 mt-6 text-center">Changing proxies will instantly reload the desktop to apply changes to proxy links.</p>
        </motion.div>
      </div>
  );
}
