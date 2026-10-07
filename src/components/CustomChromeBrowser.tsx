import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Star, Shield, Lock, Search, Plus, X, Globe, Bookmark, Settings, Play, ThumbsUp, MessageSquare, ExternalLink } from 'lucide-react';
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

  // Simulated browser state for interactive pages
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  const handleStartBrowser = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowWarning(false);
      setIsFadingOut(false);
    }, 800);
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

    // update active tab title & url
    let title = finalUrl;
    if (finalUrl.includes('google.com')) title = finalUrl.includes('search?q=') ? decodeURIComponent(finalUrl.split('search?q=')[1]) : 'Google';
    else if (finalUrl.includes('youtube.com')) title = 'YouTube';
    else if (finalUrl.includes('github.com')) title = 'GitHub';
    else if (finalUrl.includes('wikipedia.org')) title = 'Wikipedia';

    setTabs(tabs.map(t => t.id === activeTabId ? { ...t, title, url: finalUrl } : t));
    setActiveVideo(null);
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
      setActiveVideo(null);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
      setActiveVideo(null);
    }
  };

  const reload = () => {
    const temp = currentUrl;
    setCurrentUrl('');
    setTimeout(() => setCurrentUrl(temp), 100);
  };

  // Render simulated page content based on currentUrl
  const renderPageContent = () => {
    if (currentUrl.includes('google.com')) {
      const isSearch = currentUrl.includes('search?q=');
      const query = isSearch ? decodeURIComponent(currentUrl.split('search?q=')[1]?.split('&')[0] || '') : searchQuery;

      if (isSearch || query) {
        return (
          <div className="w-full h-full bg-[#202124] text-white p-6 overflow-y-auto">
            <div className="max-w-3xl">
              <div className="text-zinc-400 text-xs mb-4">About 1,420,000 results (0.34 seconds) for <span className="font-bold text-white">"{query}"</span></div>
              <div className="space-y-6">
                {[
                  { title: `${query} - Official Website & Latest Updates`, url: `https://www.example.com/${query}`, desc: `Discover everything about ${query}. Fast, secure, and unblocked access to all resources and community guides.` },
                  { title: `Top 10 Things You Need to Know About ${query}`, url: `https://guide.wiki/${query}`, desc: `Comprehensive guide and walkthrough for ${query}. Learn tips, tricks, and expert strategies.` },
                  { title: `${query} Community Hub & Discussions`, url: `https://community.org/${query}`, desc: `Join thousands of users discussing ${query}. Share your experiences and get help instantly.` },
                  { title: `Download and Play ${query} Unblocked`, url: `https://unblocked-games.io/${query}`, desc: `Play ${query} directly in your browser without restrictions. Fast loading and high performance.` }
                ].map((res, i) => (
                  <div key={i} className="group cursor-pointer" onClick={() => navigateTo(res.url)}>
                    <div className="text-xs text-zinc-400">{res.url}</div>
                    <div className="text-base text-[#8ab4f8] group-hover:underline font-medium">{res.title}</div>
                    <div className="text-xs text-zinc-300 mt-1 leading-relaxed">{res.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full h-full bg-[#202124] flex flex-col items-center justify-center p-4 text-white">
          <div className="text-6xl font-black tracking-tighter mb-8 font-sans">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
          <div className="w-full max-w-xl flex items-center gap-3 bg-[#303134] hover:bg-[#3c4043] border border-[#5f6368] rounded-full px-5 py-3 shadow-lg transition-colors">
            <Search size={18} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigateTo(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
              placeholder="Search Google or type a URL"
              className="w-full bg-transparent text-sm text-white outline-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                if (searchQuery.trim()) navigateTo(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);
              }}
              className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] border border-[#5f6368] rounded text-xs text-zinc-200 transition-colors"
            >
              Google Search
            </button>
            <button
              onClick={() => navigateTo('https://www.google.com/search?q=unblocked+games')}
              className="px-4 py-2 bg-[#303134] hover:bg-[#3c4043] border border-[#5f6368] rounded text-xs text-zinc-200 transition-colors"
            >
              I'm Feeling Lucky
            </button>
          </div>
        </div>
      );
    }

    if (currentUrl.includes('youtube.com')) {
      const videos = [
        { id: '1', title: 'Windows 11 Unblocked - Speedrun Any Level (100% WR)', channel: 'RetroGamer99', views: '1.2M views', time: '2 days ago', duration: '14:25', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80' },
        { id: '2', title: 'Lofi Beats to Study / Relax / Unblock to 🎧', channel: 'Lofi Girl', views: '45M views', time: 'Streamed live', duration: 'LIVE', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80' },
        { id: '3', title: 'Top 10 Hidden Features in Windows 11 Unblocked', channel: 'Tech Insider', views: '840K views', time: '1 week ago', duration: '10:02', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
        { id: '4', title: 'Minecraft Halloween Special - Spooky Build Tutorial', channel: 'BlockMaster', views: '2.5M views', time: '3 days ago', duration: '22:15', thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
      ];

      if (activeVideo) {
        return (
          <div className="w-full h-full bg-[#0f0f0f] text-white p-6 overflow-y-auto flex flex-col gap-4">
            <button onClick={() => setActiveVideo(null)} className="text-xs text-blue-400 hover:underline flex items-center gap-1 self-start">
              ← Back to YouTube Feed
            </button>
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-zinc-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <h2 className="text-xl font-bold">{activeVideo.title}</h2>
                <div className="flex items-center justify-between mt-2 text-sm text-zinc-300">
                  <span>{activeVideo.channel} • {activeVideo.views}</span>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"><ThumbsUp size={14} /> Like</button>
                    <button className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"><MessageSquare size={14} /> Comments</button>
                  </div>
                </div>
              </div>
              <Play size={64} className="text-white/80 animate-pulse cursor-pointer" />
            </div>
            <div className="bg-[#272727] p-4 rounded-xl">
              <div className="font-semibold text-sm">Description</div>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">Enjoy watching {activeVideo.title} in high definition without ads or restrictions! Subscribe to {activeVideo.channel} for more awesome content.</p>
            </div>
          </div>
        );
      }

      return (
        <div className="w-full h-full bg-[#0f0f0f] text-white p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 font-bold text-xl text-red-600">
              <div className="bg-red-600 text-white p-1 rounded-lg"><Play size={18} fill="white" /></div>
              YouTube Unblocked
            </div>
            <input
              type="text"
              placeholder="Search videos..."
              className="bg-[#272727] border border-zinc-700 rounded-full px-4 py-1.5 text-xs text-white outline-none w-64"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map(v => (
              <div key={v.id} onClick={() => setActiveVideo(v)} className="group cursor-pointer flex flex-col gap-2">
                <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-zinc-800">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">{v.duration}</span>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs shrink-0">{v.channel[0]}</div>
                  <div>
                    <h3 className="text-xs font-semibold line-clamp-2 text-zinc-100 group-hover:text-blue-400">{v.title}</h3>
                    <p className="text-[11px] text-zinc-400 mt-1">{v.channel}</p>
                    <p className="text-[11px] text-zinc-400">{v.views} • {v.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentUrl.includes('github.com')) {
      return (
        <div className="w-full h-full bg-[#0d1117] text-[#c9d1d9] p-8 overflow-y-auto font-sans">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-lg">W</div>
                <div>
                  <h1 className="text-xl font-bold text-white">zevrobloxdoors2 / Windows11-Unblocked</h1>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">Public Repository</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md text-xs font-medium text-white">⭐ Star (1.4k)</button>
                <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-md text-xs font-medium text-white">Code ▾</button>
              </div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
              <h3 className="font-bold text-white mb-2">About Project</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">The ultimate Windows 11 simulator experience optimized for unblocked web environments, featuring fully working apps, games, Discord integration, and custom browser engines.</p>
              <div className="mt-4 flex gap-4 text-xs text-zinc-400">
                <span>TypeScript 94.2%</span>
                <span>Tailwind CSS 5.8%</span>
                <span>License: MIT</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentUrl.includes('wikipedia.org')) {
      return (
        <div className="w-full h-full bg-white text-zinc-900 p-8 overflow-y-auto font-serif">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b pb-4 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-normal font-sans">Windows 11</h1>
                <p className="text-xs text-zinc-500 mt-1 font-sans">From Wikipedia, the free encyclopedia</p>
              </div>
              <Globe size={24} className="text-zinc-400" />
            </div>
            <p className="text-sm leading-relaxed">
              <b>Windows 11</b> is the major ninth release of Microsoft's Windows operating system, released in October 2021. It succeeded Windows 10 and is available as a free upgrade to compatible Windows 10 devices.
            </p>
            <h2 className="text-xl font-sans border-b pb-1 font-normal">Features & Overview</h2>
            <p className="text-sm leading-relaxed">
              Windows 11 features a modernized user interface, centered taskbar, rounded corners, virtual desktops, integrated Microsoft Teams chat, and the Microsoft Store with support for Android apps.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8 text-center">
        <Globe size={48} className="text-blue-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-zinc-800">Browsing {currentUrl}</h2>
        <p className="text-xs text-zinc-500 mt-2 max-w-md">You are securely browsing via the custom Windows 11 Unblocked Browser engine.</p>
        <button onClick={() => navigateTo('https://www.google.com')} className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium">
          Return to Google Home
        </button>
      </div>
    );
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
              setTabs([...tabs, { id: newId, title: 'Google', url: 'https://www.google.com' }]);
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
          <button onClick={goBack} disabled={historyIndex === 0} className="p-1.5 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:hover:bg-transparent text-zinc-300 cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <button onClick={goForward} disabled={historyIndex === history.length - 1} className="p-1.5 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:hover:bg-transparent text-zinc-300 cursor-pointer">
            <ArrowRight size={16} />
          </button>
          <button onClick={reload} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-300 cursor-pointer">
            <RotateCw size={16} />
          </button>
          <button onClick={() => navigateTo('https://www.google.com')} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-300 cursor-pointer">
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
          <button onClick={() => { if (!bookmarks.includes(currentUrl)) setBookmarks([...bookmarks, currentUrl]); }} className="p-1.5 hover:bg-white/10 rounded-full text-zinc-300 cursor-pointer" title="Bookmark this tab">
            <Star size={16} className={bookmarks.includes(currentUrl) ? 'text-yellow-400 fill-yellow-400' : ''} />
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded-full text-zinc-300 cursor-pointer">
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
            className="hover:bg-white/10 px-2 py-1 rounded truncate max-w-[150px] flex items-center gap-1.5 cursor-pointer"
          >
            <Globe size={12} className="text-blue-400 shrink-0" />
            <span className="truncate">{bm.replace('https://', '').replace('http://', '').replace('www.', '')}</span>
          </button>
        ))}
      </div>

      {/* Viewport / Page Content */}
      <div className="flex-1 w-full h-full relative bg-white overflow-hidden">
        {renderPageContent()}
      </div>
    </div>
  );
};
