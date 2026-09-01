const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldFocus = `onFocus={() => setPlayingGame(g)}`;
const newFocus = `onFocus={() => {
                      if (!isActive) {
                        if (playingGame) {
                          setSuspendedGames(prev => {
                            const filtered = prev.filter(s => s.game.id !== playingGame.id);
                            return [...filtered, { game: playingGame, minutes: playMinutes }];
                          });
                        }
                        setPlayingGame(g);
                      }
                    }}`;
content = content.replace(oldFocus, newFocus);
fs.writeFileSync('src/App.tsx', content);
