const fs = require('fs');
let code = fs.readFileSync('src/games.ts', 'utf8');

const newGames = [
  {
    "id": "TikTok",
    "title": "TikTok",
    "image": "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
    "type": "app",
    "file": "https://galxy.it.com/hive/0s0xxsmz/mfpah4sw/CkNBFkoPFxwVQRMWEg0ITA1aS1peVU4?%24io=CkNBFkoPFxwWXw9MCQ9NWw1c&%24rfs="
  },
  {
    "id": "Chrome",
    "title": "Chrome",
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg",
    "type": "app",
    "file": "https://galxy.it.com/slate"
  },
  {
    "id": "Notepad",
    "title": "Notepad",
    "image": "https://ui-avatars.com/api/?name=Notepad&background=random&color=fff&size=256&font-size=0.33",
    "type": "app",
    "file": "Apps/Notepad.html"
  },
  {
    "id": "My Documents",
    "title": "My Documents",
    "image": "https://ui-avatars.com/api/?name=My%20Documents&background=random&color=fff&size=256&font-size=0.33",
    "type": "app",
    "file": "Apps/MyDocuments.html"
  },
  {
    "id": "AnimeX",
    "title": "AnimeX",
    "image": "https://ui-avatars.com/api/?name=AnimeX&background=random&color=fff&size=256&font-size=0.33",
    "type": "app",
    "file": "https://mlmarshmallow8887dandfriendsonly.djcool.net/hive/ajr5l4j6/m0cimuji/CkNBFkoPFxwDWA1VAxxNVwxUSg"
  },
  {
    "id": "Google Gemini",
    "title": "Google Gemini",
    "image": "https://ui-avatars.com/api/?name=Google%20Gemini&background=random&color=fff&size=256&font-size=0.33",
    "type": "app",
    "file": "https://mlmarshmallow8887dandfriendsonly.djcool.net/hive/ajr5l4j6/m0cimuji/CkNBFkoPFxwFUwlRCA1NXw1eAlVUFgJWXhdZR0g?%24rfp=origin&%24io=CkNBFkoPFxwFUwlRCA1NXw1eAlVUFgJWXg"
  }
];

// parse the current array
const arrayMatch = code.match(/export const ALL_GAMES = (\[[\s\S]*?\]);/);
if (arrayMatch) {
  let games = JSON.parse(arrayMatch[1]);
  // filter out the ones to replace
  games = games.filter(g => !newGames.find(n => n.id === g.id));
  games.push(...newGames);
  
  // Update Roblox
  const roblox = games.find(g => g.id === "Roblox");
  if (roblox) {
    roblox.file = "https://educationbluesky.com/apps/a/19900/b.html";
  }

  code = code.replace(arrayMatch[1], JSON.stringify(games, null, 2));
  fs.writeFileSync('src/games.ts', code);
  console.log("Updated games.ts");
} else {
  console.log("Could not find ALL_GAMES array");
}
