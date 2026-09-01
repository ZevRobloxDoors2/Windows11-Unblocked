const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add minimizedWindows state
content = content.replace(
  "const [minimizedViews, setMinimizedViews] = useState<View[]>([]);",
  "const [minimizedViews, setMinimizedViews] = useState<View[]>([]);\n  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);"
);

// Update handleMinimizeGame
content = content.replace(
  `const handleMinimizeGame = () => {
    if (playingGame) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.id !== playingGame.id);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
      setPlayingGame(null);
    }
  };`,
  `const handleMinimizeGame = (gameId: string) => {
    setMinimizedWindows(prev => [...prev, gameId]);
    if (playingGame?.id === gameId) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.id !== playingGame.id);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
      setPlayingGame(null);
    }
  };`
);

// Update actuallyPlayGame to remove from minimized
content = content.replace(
  `setPlayingGame(game);`,
  `setPlayingGame(game);
    setMinimizedWindows(prev => prev.filter(id => id !== game.id));`
);

// Update handlePlayGame to not automatically minimize the previous playingGame!
content = content.replace(
  `// If they were already playing a game, move it to suspended
    if (playingGame) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.id !== playingGame.id);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
    }`,
  `// If they were already playing a game, move it to suspended but KEEP it visible!
    if (playingGame) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.id !== playingGame.id);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
    }`
);

// In the render loop, only render if !minimizedWindows.includes(g.id)
const oldWindowRender = `return (
            <AnimatePresence>
              {allActive.map((g, idx) => {
                const isActive = playingGame?.id === g.id;`;
                
const newWindowRender = `return (
            <AnimatePresence>
              {allActive.map((g, idx) => {
                const isActive = playingGame?.id === g.id;
                if (minimizedWindows.includes(g.id)) return null;`;

content = content.replace(oldWindowRender, newWindowRender);

// Also pass game.id to handleMinimizeGame
content = content.replace(
  `onMinimize={() => {
                      if (isActive) handleMinimizeGame();
                    }}`,
  `onMinimize={() => handleMinimizeGame(g.id)}`
);

fs.writeFileSync('src/App.tsx', content);
