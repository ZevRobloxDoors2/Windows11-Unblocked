const fs = require('fs');
let content = fs.readFileSync('src/components/Desktop.tsx', 'utf8');

const oldMap = `          {/* Dynamic App Icons with Layout animation */}
          <AnimatePresence mode="popLayout">
            {(openViews || []).map(view => {`;

const newMap = `          {/* Pinned Chat */}
          <motion.div layout className="relative group flex items-center h-full">
            <button 
              onClick={() => { setStartOpen(false); setCurrentView('chat'); }} 
              className={\`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative \${currentView === 'chat' || currentView === 'friends' ? 'bg-white/10' : ''}\`}
            >
              <MessageSquare size={20} className={currentView === 'chat' || currentView === 'friends' ? 'text-[#00A4EF]' : 'text-white'} />
              <div className={\`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-[#00A4EF] rounded-full transition-all \${currentView === 'chat' || currentView === 'friends' ? 'w-4' : 'w-1.5'}\`} />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[1000] drop-shadow-2xl flex flex-col items-center">
              <div className="bg-zinc-900 border border-white/20 p-2 rounded-lg shadow-xl mb-2 min-w-[120px] flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-white truncate max-w-[100px] capitalize">Chat</span>
                <div className="w-24 h-16 bg-black rounded flex items-center justify-center border border-white/10">
                  <MessageSquare size={24} className="text-white/30" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dynamic App Icons with Layout animation */}
          <AnimatePresence mode="popLayout">
            {(openViews || []).filter(v => v !== 'chat' && v !== 'friends').map(view => {`;

content = content.replace(oldMap, newMap);
fs.writeFileSync('src/components/Desktop.tsx', content);
