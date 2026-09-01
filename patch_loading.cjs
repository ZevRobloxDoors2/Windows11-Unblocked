const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldActuallyPlay = `const actuallyPlayGame = async (game: {id: string, title: string, file: string}) => {
    setIsLoadingGame(true);
    setPlayingGame(game);`;
const newActuallyPlay = `const actuallyPlayGame = async (game: {id: string, title: string, file: string}) => {
    const isAlreadyActive = playingGame?.id === game.id || suspendedGames.some(s => s.game.id === game.id);
    if (!isAlreadyActive) {
      setIsLoadingGame(true);
    }
    setPlayingGame(game);`;

content = content.replace(oldActuallyPlay, newActuallyPlay);
fs.writeFileSync('src/App.tsx', content);
