import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Server, Activity, Plus, Trash2 } from 'lucide-react';
import { getProxyBase, DEFAULT_PROXY_BASE, UV_PROXY_BASE, SCRAMJET_PROXY_BASE } from '../games';

interface ProxyOption {
  url: string;
  label: string;
  isCustom?: boolean;
}

export const PROXY_OPTIONS: ProxyOption[] = [
  { url: UV_PROXY_BASE, label: "UV Proxy (Default)" },
  { url: SCRAMJET_PROXY_BASE, label: "Scramjet Proxy" },
  { url: "https://incog.dev", label: "Incognito Proxy (Incog)" },
  { url: "https://maths.tbg95.co", label: "TBG95 Math Proxy" },
  { url: "https://uv.student-portal.lol", label: "Student Portal UV" },
  { url: "https://error404.n43.pw", label: "n43.pw Error404" }
];

export function ProxyManagerModal({ onClose }: { onClose: () => void }) {
  const [selectedProxy, setSelectedProxy] = useState(getProxyBase());
  const [customProxies, setCustomProxies] = useState<ProxyOption[]>(() => {
    try {
      const saved = localStorage.getItem('custom_proxies');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newProxyUrl, setNewProxyUrl] = useState('');
  const [newProxyLabel, setNewProxyLabel] = useState('');
  const [pingStatus, setPingStatus] = useState<Record<string, 'checking' | 'online' | 'offline'>>({});

  const allProxies = [...PROXY_OPTIONS, ...customProxies];

  const handleSelect = (url: string) => {
    setSelectedProxy(url);
    localStorage.setItem('proxy_base', url);
    window.location.reload();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProxyUrl.trim()) return;
    let formattedUrl = newProxyUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    formattedUrl = formattedUrl.replace(/\/$/, ''); // remove trailing slash
    const label = newProxyLabel.trim() || new URL(formattedUrl).hostname;
    
    const newItem: ProxyOption = { url: formattedUrl, label, isCustom: true };
    const updated = [...customProxies, newItem];
    setCustomProxies(updated);
    localStorage.setItem('custom_proxies', JSON.stringify(updated));
    setNewProxyUrl('');
    setNewProxyLabel('');
  };

  const handleRemoveCustom = (url: string) => {
    const updated = customProxies.filter(p => p.url !== url);
    setCustomProxies(updated);
    localStorage.setItem('custom_proxies', JSON.stringify(updated));
    if (selectedProxy === url) {
      handleSelect(DEFAULT_PROXY_BASE);
    }
  };

  const pingProxy = async (url: string) => {
    setPingStatus(prev => ({ ...prev, [url]: 'checking' }));
    try {
      await fetch(url, { mode: 'no-cors' });
      setPingStatus(prev => ({ ...prev, [url]: 'online' }));
    } catch (e) {
      setPingStatus(prev => ({ ...prev, [url]: 'offline' }));
    }
  };

  return (
      <div className="fixed inset-0 bg-black/80 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl shadow-2xl flex flex-col w-full max-w-[500px] max-h-[90vh] overflow-hidden">
           <div className="flex justify-between items-center mb-6 shrink-0">
             <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Server size={20} className="text-[#00A4EF]" /> Proxy Manager (UV Proxies)
             </h2>
             <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-zinc-400"><X size={16} /></button>
           </div>
           
           <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-xs text-blue-300 mb-3 leading-relaxed">
             💡 <b>Tip:</b> Some UV proxies (like incog.dev) block iframe embedding. If an app shows a webpage error, use the <b>"Open in New Tab"</b> button inside the app or use <b>n43.pw</b>.
           </div>

           <div className="space-y-3 overflow-y-auto flex-1 pr-1">
             <div className="text-xs text-zinc-400 mb-2">Select a working Ultraviolet (UV) proxy server or add your own custom proxy URL below:</div>
             {allProxies.map((opt) => (
                <div key={opt.url} className={`p-3 rounded-lg border flex items-center justify-between ${selectedProxy === opt.url ? 'bg-[#00A4EF]/10 border-[#00A4EF]' : 'bg-black/20 border-white/10'}`}>
                  <div className="overflow-hidden mr-2">
                    <div className="font-semibold text-sm text-white truncate">{opt.label}</div>
                    <div className="text-xs text-zinc-400 truncate">{opt.url}</div>
                  </div>
                  <div className="flex gap-2 items-center shrink-0">
                    {opt.isCustom && (
                      <button onClick={() => handleRemoveCustom(opt.url)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Remove custom proxy">
                        <Trash2 size={14} />
                      </button>
                    )}
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

             {/* Add Custom Proxy Form */}
             <form onSubmit={handleAddCustom} className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
               <div className="text-xs font-semibold text-zinc-300">Add Custom UV Proxy URL</div>
               <div className="flex gap-2">
                 <input
                   type="text"
                   value={newProxyLabel}
                   onChange={(e) => setNewProxyLabel(e.target.value)}
                   placeholder="Proxy Name (optional)"
                   className="w-1/3 bg-black/40 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00A4EF]"
                 />
                 <input
                   type="text"
                   value={newProxyUrl}
                   onChange={(e) => setNewProxyUrl(e.target.value)}
                   placeholder="https://your-proxy-domain.com"
                   className="flex-1 bg-black/40 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#00A4EF]"
                 />
                 <button
                   type="submit"
                   className="px-4 py-1.5 bg-[#00A4EF] hover:bg-[#008AC9] text-white rounded text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                 >
                   <Plus size={14} /> Add
                 </button>
               </div>
             </form>
           </div>
           
           <p className="text-xs text-zinc-500 mt-4 text-center shrink-0">Changing proxies will instantly reload the desktop to apply changes to proxy links.</p>
        </motion.div>
      </div>
  );
}
