const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Update playingGame type
app = app.replace(
  "const [playingGame, setPlayingGame] = useState<{ id: string, title: string, file: string } | null>(null);",
  "const [playingGame, setPlayingGame] = useState<{ id: string, title: string, file: string, instanceId?: string } | null>(null);"
);

// Update suspendedGames type
app = app.replace(
  "useState<{game: {id: string, title: string, file: string}, minutes: number}[]>([])",
  "useState<{game: {id: string, title: string, file: string, instanceId?: string}, minutes: number}[]>([])"
);

// Update pendingGameToPlay and warningGame
app = app.replace(
  "useState<{id: string, title: string, file: string} | null>(null);",
  "useState<{id: string, title: string, file: string, instanceId?: string} | null>(null);"
);
app = app.replace(
  "useState<{id: string, title: string, file: string} | null>(null);",
  "useState<{id: string, title: string, file: string, instanceId?: string} | null>(null);"
);

// Update actuallyPlayGame
const oldActuallyPlay = `const actuallyPlayGame = async (game: {id: string, title: string, file: string}) => {
    const isAlreadyActive = playingGame?.id === game.id || suspendedGames.some(s => s.game.id === game.id);
    if (!isAlreadyActive) {
      setIsLoadingGame(true);
    }
    setPlayingGame(game);
    setMinimizedWindows(prev => prev.filter(id => id !== game.id));
    
    // Restore minutes if resuming
    const suspended = suspendedGames.find(s => s.game.id === game.id);
    if (suspended) {
      setPlayMinutes(suspended.minutes);
      // Remove from suspended when actively playing
      setSuspendedGames(prev => prev.filter(s => s.game.id !== game.id));
    }`;

const newActuallyPlay = `const actuallyPlayGame = async (game: {id: string, title: string, file: string, instanceId?: string}) => {
    const isNewLaunch = !game.instanceId;
    const gameInstance = isNewLaunch ? { ...game, instanceId: \`\${game.id}-\${Date.now()}-\${Math.floor(Math.random()*1000)}\` } : game;

    setIsLoadingGame(true);
    setPlayingGame(gameInstance);
    setMinimizedWindows(prev => prev.filter(id => id !== gameInstance.instanceId));
    
    // Restore minutes if resuming
    if (!isNewLaunch) {
      const suspended = suspendedGames.find(s => s.game.instanceId === gameInstance.instanceId);
      if (suspended) {
        setPlayMinutes(suspended.minutes);
        setSuspendedGames(prev => prev.filter(s => s.game.instanceId !== gameInstance.instanceId));
      }
    } else {
      setPlayMinutes(0);
    }`;
app = app.replace(oldActuallyPlay, newActuallyPlay);

// Update handlePlayGame
const oldHandlePlay = `const handlePlayGame = async (game: {id: string, title: string, file: string}) => {
    // If they were already playing a game, move it to suspended but KEEP it visible!
    if (playingGame) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.id !== playingGame.id);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
    }

    if (profile?.quickResumeEnabled && suspendedGames.length >= 6 && !suspendedGames.find(s => s.game.id === game.id)) {
      setPendingGameToPlay(game);
      return;
    }
    await actuallyPlayGame(game);
  };`;
const newHandlePlay = `const handlePlayGame = async (game: {id: string, title: string, file: string, instanceId?: string}) => {
    // If they were already playing a game, move it to suspended but KEEP it visible!
    if (playingGame) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.instanceId !== playingGame.instanceId);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
    }

    // Since every click is a new instance (unless instanceId is passed), check max windows
    // We'll limit total windows (suspended + playing) to 6 for performance.
    const isNewLaunch = !game.instanceId;
    if (isNewLaunch && profile?.quickResumeEnabled && suspendedGames.length >= 6) {
      setPendingGameToPlay(game);
      return;
    }
    await actuallyPlayGame(game);
  };`;
app = app.replace(oldHandlePlay, newHandlePlay);

// Update handleMinimizeGame
const oldMinimize = `const handleMinimizeGame = (gameId: string) => {
    setMinimizedWindows(prev => [...prev, gameId]);
    if (playingGame?.id === gameId) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.id !== playingGame.id);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
      setPlayingGame(null);
    }
  };`;
const newMinimize = `const handleMinimizeGame = (instanceId: string) => {
    setMinimizedWindows(prev => [...prev, instanceId]);
    if (playingGame?.instanceId === instanceId) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.instanceId !== playingGame.instanceId);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
      setPlayingGame(null);
    }
  };`;
app = app.replace(oldMinimize, newMinimize);

// Update handleStopGame
const oldStop = `const handleStopGame = () => {
    setPlayingGame(null);
    setPlayMinutes(0);
  };`;
const newStop = `const handleStopGame = (instanceId?: string) => {
    if (instanceId) {
      if (playingGame?.instanceId === instanceId) {
        setPlayingGame(null);
        setPlayMinutes(0);
      } else {
        setSuspendedGames(prev => prev.filter(s => s.game.instanceId !== instanceId));
      }
    } else {
      setPlayingGame(null);
      setPlayMinutes(0);
    }
  };`;
app = app.replace(oldStop, newStop);

// Render loop: allActive.find(g => g.id === playingGame.id) -> instanceId
const oldRenderFind = `const allActive = [...suspendedGames.map(s => s.game)];
          if (playingGame && !allActive.find(g => g.id === playingGame.id)) {
            allActive.push(playingGame);
          }`;
const newRenderFind = `const allActive = [...suspendedGames.map(s => s.game)];
          if (playingGame && !allActive.find(g => g.instanceId === playingGame.instanceId)) {
            allActive.push(playingGame);
          }`;
app = app.replace(oldRenderFind, newRenderFind);

const oldMap = `{allActive.map((g, idx) => {
                const isActive = playingGame?.id === g.id;
                const isMinimized = minimizedWindows.includes(g.id);`;
const newMap = `{allActive.map((g, idx) => {
                const isActive = playingGame?.instanceId === g.instanceId;
                const isMinimized = minimizedWindows.includes(g.instanceId || '');`;
app = app.replace(oldMap, newMap);

const oldWindowClose = `<Window
                    key={g.id}
                    title={g.title}
                    onClose={() => {
                      if (isActive) handleStopGame();
                      else setSuspendedGames(prev => prev.filter(s => s.game.id !== g.id));
                    }}
                    onMinimize={() => handleMinimizeGame(g.id)}
                    onGuide={() => setIsGuideOpen(true)}
                    isActive={isActive}
                    onFocus={() => {
                      if (!isActive) {
                        if (playingGame) {
                          setSuspendedGames(prev => {
                            const filtered = prev.filter(s => s.game.id !== playingGame.id);
                            return [...filtered, { game: playingGame, minutes: playMinutes }];
                          });
                        }
                        const suspended = suspendedGames.find(s => s.game.id === g.id);
                        if (suspended) {
                          setPlayMinutes(suspended.minutes);
                          setSuspendedGames(prev => prev.filter(s => s.game.id !== g.id));
                        }
                        setPlayingGame(g);
                        setMinimizedWindows(prev => prev.filter(id => id !== g.id));
                      }
                    }}`;
const newWindowClose = `<Window
                    key={g.instanceId || g.id}
                    title={g.title}
                    onClose={() => handleStopGame(g.instanceId)}
                    onMinimize={() => handleMinimizeGame(g.instanceId || '')}
                    onGuide={() => setIsGuideOpen(true)}
                    isActive={isActive}
                    onFocus={() => {
                      if (!isActive) {
                        if (playingGame) {
                          setSuspendedGames(prev => {
                            const filtered = prev.filter(s => s.game.instanceId !== playingGame.instanceId);
                            return [...filtered, { game: playingGame, minutes: playMinutes }];
                          });
                        }
                        const suspended = suspendedGames.find(s => s.game.instanceId === g.instanceId);
                        if (suspended) {
                          setPlayMinutes(suspended.minutes);
                          setSuspendedGames(prev => prev.filter(s => s.game.instanceId !== g.instanceId));
                        }
                        setPlayingGame(g);
                        setMinimizedWindows(prev => prev.filter(id => id !== g.instanceId));
                      }
                    }}`;
app = app.replace(oldWindowClose, newWindowClose);

fs.writeFileSync('src/App.tsx', app);
