const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldRender = `<AnimatePresence>
          {(playingGame || suspendedGames.length > 0) && (
            <Window
              title={playingGame?.title || 'App'}
              onClose={handleStopGame}
              onMinimize={handleMinimizeGame}
              onGuide={() => setIsGuideOpen(true)}
              isActive={!!playingGame}
              className={\`\${playingGame ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300 z-[150]\`}
            >

              <AnimatePresence>
                {isLoadingGame && playingGame && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 top-10 z-[110] bg-black flex flex-col items-center justify-center gap-6"
                  >
                    <div className="w-16 h-16 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-xl font-semibold animate-pulse text-white">Loading {playingGame.title}...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {(() => {
                const allActive = [...suspendedGames.map(s => s.game)];
                if (playingGame && !allActive.find(g => g.id === playingGame.id)) {
                  allActive.push(playingGame);
                }
                return allActive.map((g, idx) => (
                  <div className={playingGame?.id === g.id ? "flex-1 w-full h-full relative bg-white block" : "hidden"} key={g.id}>
                    {localStorage.getItem('anti_deledao') === 'true' && playingGame?.id === g.id && (
                      <div className="absolute inset-0 pointer-events-none z-[105]" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/c/c3/Google_Docs_logo_%282014-2020%29.svg)', backgroundRepeat: 'repeat', opacity: 0.1 }} />
                    )}
                    {g.id === 'GTA V' && playingGame?.id === g.id && !isLoadingGame && (
                      <GTAVModal />
                    )}
                    <iframe 
                      key={g.id}
                      src={getUrl(g.file, idx)} 
                      className="w-full h-full" 
                      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-presentation"
                      allow="fullscreen; autoplay; gamepad"
                      onLoad={() => { if (playingGame?.id === g.id) setIsLoadingGame(false); }}
                    />
                  </div>
                ));
              })()}
            </Window>
          )}
        </AnimatePresence>`;

const newRender = `{(() => {
          const allActive = [...suspendedGames.map(s => s.game)];
          if (playingGame && !allActive.find(g => g.id === playingGame.id)) {
            allActive.push(playingGame);
          }
          return (
            <AnimatePresence>
              {allActive.map((g, idx) => {
                const isActive = playingGame?.id === g.id;
                // If it's suspended, we want it to still render, but maybe we hide it completely or keep it as a window in the background?
                // The user asked to "Allow to run multiple apps at once", meaning we should have multiple windows open at once.
                return (
                  <Window
                    key={g.id}
                    title={g.title}
                    onClose={() => {
                      if (isActive) handleStopGame();
                      else setSuspendedGames(prev => prev.filter(s => s.game.id !== g.id));
                    }}
                    onMinimize={() => {
                      if (isActive) handleMinimizeGame();
                    }}
                    onGuide={() => setIsGuideOpen(true)}
                    isActive={isActive}
                    onFocus={() => setPlayingGame(g)}
                    className={\`transition-opacity duration-300 \${isActive ? 'z-[150]' : 'z-[140]'}\`}
                  >
                    <AnimatePresence>
                      {isLoadingGame && isActive && (
                        <motion.div 
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 top-10 z-[110] bg-black flex flex-col items-center justify-center gap-6"
                        >
                          <div className="w-16 h-16 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
                          <p className="text-xl font-semibold animate-pulse text-white">Loading {g.title}...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex-1 w-full h-full relative bg-white block">
                      {localStorage.getItem('anti_deledao') === 'true' && (
                        <div className="absolute inset-0 pointer-events-none z-[105]" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/c/c3/Google_Docs_logo_%282014-2020%29.svg)', backgroundRepeat: 'repeat', opacity: 0.1 }} />
                      )}
                      {g.id === 'GTA V' && !isLoadingGame && (
                        <GTAVModal />
                      )}
                      <iframe 
                        src={getUrl(g.file, idx)} 
                        className="w-full h-full" 
                        sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-presentation"
                        allow="fullscreen; autoplay; gamepad"
                        onLoad={() => { if (isActive) setIsLoadingGame(false); }}
                      />
                    </div>
                  </Window>
                );
              })}
            </AnimatePresence>
          );
        })()}`;
        
content = content.replace(oldRender, newRender);

// Wait, we need to fix getUrl first.
const oldGetUrl = `const getBasePath = () => { const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'; return !isDev ? '/Ebox-Cloud-Unblocked' : ''; };
  const getUrl = (file: string, index: number) => {
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return file;
    }
    const basePath = getBasePath();
    const cleanFile = file.startsWith('/') ? file : \`/\${file}\`;
    return \`\${basePath}\${cleanFile}\`;
  };`;
const newGetUrl = `const getUrl = (file: string, index: number) => {
    if (file.startsWith('http://') || file.startsWith('https://')) {
      return file;
    }
    return file.startsWith('/') ? \`.\${file}\` : \`./\${file}\`;
  };`;
content = content.replace(oldGetUrl, newGetUrl);
fs.writeFileSync('src/App.tsx', content);
