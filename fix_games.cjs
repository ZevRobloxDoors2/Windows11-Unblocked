const fs = require('fs');
const gamesDir = 'public/Games';
const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

let gamesArray = [];
for (let gameFile of games) {
  let title = gameFile.replace('.html', '');
  gamesArray.push({
    id: title,
    title: title,
    image: `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=random&color=fff&size=256&font-size=0.33`,
    type: 'game',
    file: `Games/${gameFile}`
  });
}

// Now we need to update src/games.ts
// We'll preserve any existing images if they had custom ones
let existingGamesTs = fs.readFileSync('src/games.ts', 'utf8');
// Parse the existing ALL_GAMES array
let existingGames = [];
try {
  let match = existingGamesTs.match(/export const ALL_GAMES = (\[[\s\S]*\]);/);
  if (match) {
    existingGames = JSON.parse(match[1]);
  }
} catch (e) {
  console.log('could not parse existing', e.message);
}

// merge
for (let g of gamesArray) {
  let existing = existingGames.find(x => x.id === g.id);
  if (existing) {
    g.image = existing.image;
  }
}

// We should also keep games that might not be HTML files? Or maybe just rewrite it.
let newGamesTs = `export const ALL_GAMES = ${JSON.stringify(gamesArray, null, 2)};\n`;
fs.writeFileSync('src/games.ts', newGamesTs);
console.log('done updating games.ts');
