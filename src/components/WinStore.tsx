import React, { useState } from 'react';
import { ALL_GAMES } from '../games';
import { Search, Download, Check, Play, LayoutGrid, Gamepad2, Settings, User } from 'lucide-react';
import { motion } from 'motion/react';

export const WinStore = ({ installedApps, onInstall, onPlay }: { installedApps: string[], onInstall: (id: string) => void, onPlay: (game: any) => void }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'apps'>('home');
  
  const filtered = ALL_GAMES.filter(g => g.title.toLowerCase().includes(search.toLowerCase()) && (activeTab === 'home' || (activeTab === 'games' ? g.type === 'game' : g.type === 'app')));

  return (
    <div className="flex h-full bg-[#202020] text-white">
      {/* Sidebar */}
      <div className="w-16 md:w-60 bg-[#1a1a1a] border-r border-white/5 flex flex-col items-center md:items-start shrink-0">
        <div className="p-4 md:px-6 md:py-8 w-full flex justify-center md:justify-start">
          <svg viewBox="0 0 88 88" width="28" height="28" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M0 0h42v42H0zm46 0h42v42H46zM0 46h42v42H0zm46 0h42v42H46z" fill="#00A4EF"/>
          </svg>
          <span className="ml-3 font-semibold text-lg hidden md:block">Store</span>
        </div>
        
        <div className="flex flex-col gap-2 w-full px-2 md:px-4">
          <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 p-3 w-full rounded-md transition-colors ${activeTab === 'home' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}>
            <LayoutGrid size={20} className="shrink-0" />
            <span className="hidden md:block text-sm">Home</span>
          </button>
          <button onClick={() => setActiveTab('games')} className={`flex items-center gap-3 p-3 w-full rounded-md transition-colors ${activeTab === 'games' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}>
            <Gamepad2 size={20} className="shrink-0" />
            <span className="hidden md:block text-sm">Gaming</span>
          </button>
          <button onClick={() => setActiveTab('apps')} className={`flex items-center gap-3 p-3 w-full rounded-md transition-colors ${activeTab === 'apps' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}>
            <LayoutGrid size={20} className="shrink-0" />
            <span className="hidden md:block text-sm">Apps</span>
          </button>
        </div>

        <div className="mt-auto w-full px-2 md:px-4 pb-4 flex flex-col gap-2">
          <button className="flex items-center gap-3 p-3 w-full rounded-md hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <Settings size={20} className="shrink-0" />
            <span className="hidden md:block text-sm">Settings</span>
          </button>
          <button className="flex items-center gap-3 p-3 w-full rounded-md hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
            <User size={20} className="shrink-0" />
            <span className="hidden md:block text-sm">Library</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 border-b border-white/5 shrink-0 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search apps, games, movies, and more"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-full px-4 py-2.5 pl-11 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-zinc-500"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>
          
          <button 
            onClick={() => onPlay({ id: 'suggestion-box', title: 'Suggestion Box', file: 'https://forms.gle/JdsKeea21ZT94edXA', type: 'app', image: '' })}
            className="ml-4 px-4 py-2.5 bg-[#005fb8] hover:bg-[#0078d4] text-white rounded-md text-sm font-semibold whitespace-nowrap transition-colors shadow-sm"
          >
            Suggestion Box
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <h2 className="text-xl font-semibold mb-6">{activeTab === 'games' ? 'Top games' : activeTab === 'apps' ? 'Top apps' : 'Top free games & apps'}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filtered.map(game => {
              const isInstalled = installedApps.includes(game.id);
              return (
                <motion.div 
                  key={game.id}
                  whileHover={{ y: -4 }}
                  className="bg-[#242424] rounded-xl overflow-hidden border border-white/5 flex flex-col shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="aspect-square w-full bg-zinc-800 flex justify-center items-center overflow-hidden">
                    <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4 flex flex-col flex-1 relative">
                    <h3 className="font-medium text-sm truncate mb-1 text-white/90" title={game.title}>{game.title}</h3>
                    <p className="text-[11px] text-zinc-500 mb-4">{game.type === 'game' ? 'Game' : 'App'} &bull; Free</p>
                    <div className="mt-auto pt-2">
                      {isInstalled ? (
                        <button 
                          onClick={() => onPlay(game)}
                          className="w-full bg-[#005fb8] hover:bg-[#0078d4] text-white text-xs font-semibold py-2 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                          <Play size={12} /> Play
                        </button>
                      ) : (
                        <button 
                          onClick={() => onInstall(game.id)}
                          className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2 rounded flex items-center justify-center gap-2 transition-colors"
                        >
                          Get
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
