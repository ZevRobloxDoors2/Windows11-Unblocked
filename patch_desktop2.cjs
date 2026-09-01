const fs = require('fs');

// 1. Update App.tsx to pass onMinimizeGame
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  `playingGame={playingGame}
          suspendedGames={suspendedGames}
          notificationCount={notificationCount}`,
  `playingGame={playingGame}
          suspendedGames={suspendedGames}
          onMinimizeGame={handleMinimizeGame}
          notificationCount={notificationCount}`
);
fs.writeFileSync('src/App.tsx', app);

// 2. Update Desktop.tsx to receive onMinimizeGame and use it
let desktop = fs.readFileSync('src/components/Desktop.tsx', 'utf8');
desktop = desktop.replace(
  `onPlayGame: (game: any) => void,
  time: string,`,
  `onPlayGame: (game: any) => void,
  onMinimizeGame?: (gameId: string) => void,
  time: string,`
);
desktop = desktop.replace(
  `suspendedGames,
  notificationCount,`,
  `suspendedGames,
  onMinimizeGame,
  notificationCount,`
);

// update the active game taskbar button
desktop = desktop.replace(
  `onClick={() => { setStartOpen(false); /* maybe toggle minimize if already active? */ }}`,
  `onClick={() => { setStartOpen(false); if (onMinimizeGame) onMinimizeGame(playingGame.id); }}`
);

fs.writeFileSync('src/components/Desktop.tsx', desktop);
