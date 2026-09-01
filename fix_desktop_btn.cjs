const fs = require('fs');
let code = fs.readFileSync('src/components/Desktop.tsx', 'utf8');
code = code.replace(
  `{playingGame && (
              <motion.div 
                key={\`game-\${playingGame.id}\`}`,
  `{playingGame && (
              <motion.div 
                key={\`game-\${playingGame.instanceId || playingGame.id}\`}`
);
code = code.replace(
  `<button 
                  className={\`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative bg-white/10\`}
                >`,
  `<button 
                  onClick={() => { setStartOpen(false); if (onMinimizeGame) onMinimizeGame(playingGame.instanceId || playingGame.id); }}
                  className={\`w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative bg-white/10\`}
                >`
);
fs.writeFileSync('src/components/Desktop.tsx', code);
