import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Star, Shield, Lock, Search, Plus, X, Globe, Bookmark, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomChromeBrowserProps {
  onBackToDefault?: () => void;
}

export const CustomChromeBrowser: React.FC<CustomChromeBrowserProps> = ({ onBackToDefault }) => {
  const [showWarning, setShowWarning] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [inputUrl, setInputUrl] = useState('https://www.google.com');
  const [history, setHistory] = useState<string[]>(['https://www.google.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [tabs, setTabs] = useState<{ id: string, title: string, url: string }[]>([
    { id: '1', title: 'Google', url: 'https://www.google.com' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [bookmarks, setBookmarks] = useState<string[]>([
    'https://www.google.com',
    'https://www.youtube.com',
    'https://github.com',
    'https://wikipedia.org'
  ]);

  const handleStartBrowser = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowWarning(false);
      setIsFadingOut(false);
    }, 1000);
  };

  const navigateTo = (url: string) => {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        finalUrl = 'https://' + url;
      } else {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }
    setCurrentUrl(finalUrl);
    setInputUrl(finalUrl);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // update active tab
    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, title: finalUrl, url: finalUrl } : t));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo(inputUrl);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
    }
  };

  const reload = () => {
    const temp = currentUrl;
    setCurrentUrl('');
    setTimeout(() => setCurrentUrl(temp), 100);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] text-white relative select-none">
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isFadingOut ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="max-w-lg flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-400">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-bold text-red-500 tracking-wide">WARNING</h2>
              <p className="text-xl text-zinc-200 font-medium leading-relaxed">
                Whatever you search on here will appear in your search history, Beware.
              </p>
              <button
                onClick={handleStartBrowser}
                className="mt-4 px-8 py-3 bg-[#00A4EF] hover:bg-[#008AC9] text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Proceed to Chrome Browser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chrome Tab Bar */}
      <div className="bg-[#202124] px-3 pt-2 flex items-center gap-1 border-b border-[#3c4043] shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => { setActiveTabId(tab.id); setCurrentUrl(tab.url); setInputUrl(tab.url); }}
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-t-lg max-w-[200px] min-w-[120px] cursor-pointer text-xs transition-colors ${activeTabId === tab.id ? 'bg-[#35363a] text-white font-medium' : 'bg-[#202124] text-zinc-400 hover:bg-[#2a2b2e]'}`}
            >
              <Globe size={14} className="text-blue-400 shrink-0" />
              <span className="truncate flex-1">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (tabs.length > 1) {
                    const filtered = tabs.filter(t => t.id !== tab.id);
                    setTabs(filtered);
                    if (activeTabId === tab.id) {
                      setActiveTabId(filtered[0].id);
                      setCurrentUrl(filtered[0].url);
                      setInputUrl(filtered[0].url);
                    }
                  }
                }}
                className="p-1 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newId = Date.now().toString();
              setTabs([...tabs, { id: newId, title: 'New Tab', url: 'https://www.google.com' }]);
              setActiveTabId(newId);
              setCurrentUrl('https://www.google.com');
              setInputUrl('https://www.google.com');
            }}
            className="p-1.5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white ml-1"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Navigation Toolbar */}
      <div className="bg-[#35363a] px-3 py-2 flex items-center gap-2 border-b border-[#202124] shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={goBack} disabled={historyIndex === 0} className="p-1.5 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:hover:bg-transparent text-zinc-300">
            <ArrowLeft size={16} />
          </button>
          <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-1.5 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:hover:bg-transparent text-zinc-300">
            <ArrowRight size={16} />
          </button>
          <button onClick={reload} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-300">
            <RotateCw size={16} />
          </button>
          <button onClick={() => navigateTo('https://www.google.com')} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-300">
            <Home size={16} />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 bg-[#202124] border border-[#5f6368] rounded-full px-4 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <Lock size={12} className="text-emerald-400 shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-xs text-white outline-none"
            placeholder="Search Google or type a URL"
          />
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => { if (!bookmarks.includes(currentUrl)) setBookmarks([...bookmarks, currentUrl]); }} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-300" title="Bookmark this tab">
            <Star size={16} className={bookmarks.includes(currentUrl) ? 'text-yellow-400 fill-yellow-400' : ''} />
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded-full text-zinc-300">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="bg-[#202124] px-4 py-1 flex items-center gap-3 border-b border-[#3c4043] text-xs text-zinc-300 shrink-0 overflow-x-auto">
        <span className="text-zinc-500 flex items-center gap-1 font-semibold"><Bookmark size={12} /> Bookmarks:</span>
        {bookmarks.map((bm, idx) => (
          <button
            key={idx}
            onClick={() => navigateTo(bm)}
            className="hover:bg-white/10 px-2 py-1 rounded truncate max-w-[150px] flex items-center gap-1.5"
          >
            <Globe size={12} className="text-blue-400 shrink-0" />
            <span className="truncate">{bm.replace('https://', '').replace('http://', '').replace('www.', '')}</span>
          </button>
        ))}
      </div>

      {/* Viewport / Iframe */}
      <div className="flex-1 w-full h-full relative bg-white">
        <iframe
          src={currentUrl}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-presentation"
          allow="fullscreen; autoplay; gamepad"
        />
      </div>
    </div>
  );
};
