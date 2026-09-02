const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldAllActive = `const allActive = [...suspendedGames.map(s => s.game)];
          if (playingGame && !allActive.find(g => g.instanceId === playingGame.instanceId)) {
            allActive.push(playingGame);
          }`;

const newAllActive = `const allActive = [...suspendedGames.map(s => s.game)];
          if (playingGame && !allActive.find(g => g.instanceId === playingGame.instanceId)) {
            allActive.push(playingGame);
          }
          // Sort instances by their ID to ensure stable DOM ordering so iframes don't reload
          allActive.sort((a, b) => {
            const idA = a.instanceId || a.id;
            const idB = b.instanceId || b.id;
            return idA.localeCompare(idB);
          });`;

code = code.replace(oldAllActive, newAllActive);
fs.writeFileSync('src/App.tsx', code);
