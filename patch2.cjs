const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldBlock = `            <div 
              className={\`fixed z-[150] bg-black flex flex-col overflow-hidden transition-all duration-300 \${playingGame ? 'inset-4 sm:inset-12 border border-white/10 rounded-lg shadow-2xl' : 'inset-0 pointer-events-none opacity-0'}\`}
              style={{ display: (playingGame || suspendedGames.length > 0) ? 'flex' : 'none', visibility: playingGame ? 'visible' : 'hidden' }}
            >
              {playingGame && (
                <div className="h-10 bg-[#181818] flex items-center justify-between select-none px-4 shrink-0 border-b border-white/5">
                  <div className="text-xs font-semibold text-zinc-300">{playingGame.title}</div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setIsGuideOpen(true)} className="text-zinc-400 hover:text-white transition-colors" title="Guide">
                      <span className="font-bold text-sm">E</span>
                    </button>
                    <button onClick={handleMinimizeGame} className="text-zinc-400 hover:text-white transition-colors"><Minus size={16} /></button>
                    <button className="text-zinc-400 hover:text-white transition-colors"><Square size={14} /></button>
                    <button onClick={handleStopGame} className="text-zinc-400 hover:bg-red-500 hover:text-white transition-colors p-1 rounded-sm"><X size={18} /></button>
                  </div>
                </div>
              )}`;

const newBlock = `            <Window
              title={playingGame?.title || 'App'}
              onClose={handleStopGame}
              onMinimize={handleMinimizeGame}
              onGuide={() => setIsGuideOpen(true)}
              isActive={!!playingGame}
              className={\`\${playingGame ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 z-[150]\`}
            >`;

content = content.replace(oldBlock, newBlock);

content = content.replace(/<\/div>\s*<\/AnimatePresence>\s*<AnimatePresence>\s*{pendingGameToPlay/g, '</Window>\n        </AnimatePresence>\n\n        <AnimatePresence>\n          {pendingGameToPlay');

content = content.replace(
  `                  </div>\n                ));\n              })()}\n            </div>\n          )}\n        </AnimatePresence>\n\n        <AnimatePresence>\n          {warningGame`,
  `                  </div>\n                ));\n              })()}\n            </Window>\n          )}\n        </AnimatePresence>\n\n        <AnimatePresence>\n          {warningGame`
);

fs.writeFileSync('src/App.tsx', content);
