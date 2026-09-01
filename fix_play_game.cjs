const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  `const handlePlayGame = async (game: {id: string, title: string, file: string}) => {
    if (game.id === 'Roblox' || game.id === 'TikTok') {
      setWarningGame(game);
      return;
    }

    if (profile?.quickResumeEnabled && suspendedGames.length >= 6 && !suspendedGames.find(s => s.game.id === game.id)) {
      setPendingGameToPlay(game);
      return;
    }`,
  `const handlePlayGame = async (game: {id: string, title: string, file: string, instanceId?: string}) => {
    if (game.id === 'Roblox' || game.id === 'TikTok') {
      setWarningGame(game);
      return;
    }

    if (playingGame) {
      setSuspendedGames(prev => {
        const filtered = prev.filter(s => s.game.instanceId !== playingGame.instanceId);
        return [...filtered, { game: playingGame, minutes: playMinutes }];
      });
    }

    const isNewLaunch = !game.instanceId;
    if (isNewLaunch && profile?.quickResumeEnabled && suspendedGames.length >= 6) {
      setPendingGameToPlay(game);
      return;
    }`
);
fs.writeFileSync('src/App.tsx', code);
