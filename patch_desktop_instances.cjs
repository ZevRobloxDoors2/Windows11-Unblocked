const fs = require('fs');
let content = fs.readFileSync('src/components/Desktop.tsx', 'utf8');

content = content.replace(
  "key={`game-${s.game.id}`}",
  "key={`game-${s.game.instanceId || s.game.id}`}"
);

// update active game taskbar button onClick
content = content.replace(
  "onClick={() => { setStartOpen(false); if (onMinimizeGame) onMinimizeGame(playingGame.id); }}",
  "onClick={() => { setStartOpen(false); if (onMinimizeGame) onMinimizeGame(playingGame.instanceId || playingGame.id); }}"
);

fs.writeFileSync('src/components/Desktop.tsx', content);
