const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldFocus = `onFocus={() => {
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
const newFocus = `onFocus={() => {
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
content = content.replace(oldFocus, newFocus);
fs.writeFileSync('src/App.tsx', content);
