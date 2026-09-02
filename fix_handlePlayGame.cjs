const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandle = `const handlePlayGame = async (game: {id: string, title: string, file: string, instanceId?: string}) => {`;
const newHandle = `const handlePlayGame = async (game: {id: string, title: string, file: string, instanceId?: string, type?: string}) => {
    if (game.id === 'app-local-share') {
      handleSetCurrentView('local-share');
      return;
    }
    if (game.id === 'app-classroom') {
      handleSetCurrentView('classroom');
      return;
    }
    if (game.id === 'app-fake-update') {
      setShowFakeUpdate(true);
      return;
    }`;

code = code.replace(oldHandle, newHandle);
fs.writeFileSync('src/App.tsx', code);
