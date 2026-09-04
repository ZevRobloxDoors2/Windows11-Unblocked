const fs = require('fs');
let content = fs.readFileSync('src/games.ts', 'utf8');

const newGames = `[
  {
    "id": "app-local-share",
    "title": "Local Share",
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Google_Drive_Logo_%282014-2020%29.svg",
    "type": "app"
  },
  {
    "id": "app-classroom",
    "title": "Google Classroom",
    "image": "https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png",
    "type": "app"
  },
  {
    "id": "app-fake-update",
    "title": "System Update",
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Windows_11_logo.svg",
    "type": "app"
  },
  {
    "id": "1v1 LOL",
    "title": "1v1 LOL",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2303030/header.jpg",
    "type": "game",
    "file": "Games/1v1 LOL.html"
  },
  {
    "id": "Backrooms",
    "title": "Backrooms",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1111210/header.jpg",
    "type": "game",
    "file": "Games/Backrooms.html"
  },
  {
    "id": "Bendy and the Ink Machine",
    "title": "Bendy and the Ink Machine",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/622650/header.jpg",
    "type": "game",
    "file": "Games/Bendy and the Ink Machine.html"
  },
  {
    "id": "DoodleJump",
    "title": "DoodleJump",
    "image": "https://upload.wikimedia.org/wikipedia/en/a/a2/Doodle_Jump.png",
    "type": "game",
    "file": "Games/DoodleJump.html"
  },
  {
    "id": "DriftHunters",
    "title": "DriftHunters",
    "image": "https://images.crazygames.com/games/drift-hunters/cover-1586284249110.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/DriftHunters.html"
  },
  {
    "id": "Driving Simulator",
    "title": "Driving Simulator",
    "image": "https://images.crazygames.com/games/real-drive/cover-1583344600216.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/Driving Simulator.html"
  },
  {
    "id": "Eaglercraft",
    "title": "Eaglercraft",
    "image": "https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png",
    "type": "game",
    "file": "Games/Eaglercraft.html"
  },
  {
    "id": "Escape Road 2",
    "title": "Escape Road 2",
    "image": "https://images.crazygames.com/escape-road.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/Escape Road 2.html"
  },
  {
    "id": "Escape Road",
    "title": "Escape Road",
    "image": "https://images.crazygames.com/escape-road.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/Escape Road.html"
  },
  {
    "id": "Five Nights at Epstein's",
    "title": "Five Nights at Epstein's",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/319510/header.jpg",
    "type": "game",
    "file": "Games/Five Nights at Epstein's.html"
  },
  {
    "id": "FridayNightFunk",
    "title": "FridayNightFunk",
    "image": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Friday_Night_Funkin%27_logo.svg",
    "type": "game",
    "file": "Games/FridayNightFunk.html"
  },
  {
    "id": "GTA-Vice",
    "title": "GTA-Vice",
    "image": "https://upload.wikimedia.org/wikipedia/en/c/ce/Vice-city-cover.jpg",
    "type": "game",
    "file": "Games/GTA-Vice.html"
  },
  {
    "id": "Geo-Dash",
    "title": "Geo-Dash",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322170/header.jpg",
    "type": "game",
    "file": "Games/Geo-Dash.html"
  },
  {
    "id": "Grand Theft Auto 3",
    "title": "Grand Theft Auto 3",
    "image": "https://upload.wikimedia.org/wikipedia/en/c/c4/Grand_Theft_Auto_III_cover.jpg",
    "type": "game",
    "file": "Games/Grand Theft Auto 3.html"
  },
  {
    "id": "Granny",
    "title": "Granny",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962400/header.jpg",
    "type": "game",
    "file": "Games/Granny.html"
  },
  {
    "id": "HypperSand",
    "title": "HypperSand",
    "image": "https://images.crazygames.com/sandtrix.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/HypperSand.html"
  },
  {
    "id": "Kindergarten",
    "title": "Kindergarten",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/589590/header.jpg",
    "type": "game",
    "file": "Games/Kindergarten.html"
  },
  {
    "id": "ParkingGTV",
    "title": "ParkingGTV",
    "image": "https://images.crazygames.com/parking-fury-3.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/ParkingGTV.html"
  },
  {
    "id": "PixelFruit",
    "title": "PixelFruit",
    "image": "https://images.crazygames.com/melons-merge-fruit-puzzle_16x9/20231130095819/melons-merge-fruit-puzzle_16x9-cover?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/PixelFruit.html"
  },
  {
    "id": "Ragdoll Hit",
    "title": "Ragdoll Hit",
    "image": "https://images.crazygames.com/games/ragdoll-hit/cover-1699960249279.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/Ragdoll Hit.html"
  },
  {
    "id": "roblox",
    "title": "Roblox",
    "image": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg",
    "type": "game",
    "file": "https://nowgg.fun/apps/a/19900/b.html"
  },
  {
    "id": "RobloxOLD",
    "title": "RobloxOLD",
    "image": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg",
    "type": "game",
    "file": "Games/RobloxOLD.html"
  },
  {
    "id": "Rocket League",
    "title": "Rocket League",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252950/header.jpg",
    "type": "game",
    "file": "Games/Rocket League.html"
  },
  {
    "id": "Solar Smash",
    "title": "Solar Smash",
    "image": "https://images.crazygames.com/games/solar-smash/cover-1647413627993.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/Solar Smash.html"
  },
  {
    "id": "Steal a Brainrot",
    "title": "Steal a Brainrot",
    "image": "https://images.crazygames.com/games/thief-puzzle/cover-1645003310068.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/Steal a Brainrot.html"
  },
  {
    "id": "Totally Accurate Battle Simulator (TABS)",
    "title": "Totally Accurate Battle Simulator (TABS)",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/508440/header.jpg",
    "type": "game",
    "file": "Games/Totally Accurate Battle Simulator (TABS).html"
  },
  {
    "id": "aceattorney",
    "title": "aceattorney",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/787480/header.jpg",
    "type": "game",
    "file": "Games/aceattorney.html"
  },
  {
    "id": "bitlife",
    "title": "bitlife",
    "image": "https://images.crazygames.com/games/bitlife-life-simulator/cover-1672322307300.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/bitlife.html"
  },
  {
    "id": "effing zombies",
    "title": "effing zombies",
    "image": "https://images.crazygames.com/games/zombie-derby-pixel-survival/cover-1627918546522.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/effing zombies.html"
  },
  {
    "id": "football-bros",
    "title": "football-bros",
    "image": "https://images.crazygames.com/games/retro-bowl/cover-1585648834464.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/football-bros.html"
  },
  {
    "id": "granny2",
    "title": "granny2",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1071880/header.jpg",
    "type": "game",
    "file": "Games/granny2.html"
  },
  {
    "id": "granny3",
    "title": "granny3",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1707550/header.jpg",
    "type": "game",
    "file": "Games/granny3.html"
  },
  {
    "id": "miside",
    "title": "miside",
    "image": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2527500/header.jpg",
    "type": "game",
    "file": "Games/miside.html"
  },
  {
    "id": "not-my-neigh",
    "title": "not-my-neigh",
    "image": "https://img.itch.zone/aW1nLzE0NzU4NTEyLnBuZw==/315x250%23c/H0o69S.png",
    "type": "game",
    "file": "Games/not-my-neigh.html"
  },
  {
    "id": "parkingfury",
    "title": "parkingfury",
    "image": "https://images.crazygames.com/games/parking-fury-3/cover-1586282855140.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/parkingfury.html"
  },
  {
    "id": "smash carts",
    "title": "smash carts",
    "image": "https://images.crazygames.com/games/smash-karts/cover-1586282834015.png?auto=format,compress&q=75&cs=strip",
    "type": "game",
    "file": "Games/smash carts.html"
  },
  {
    "id": "undertaleyellow",
    "title": "undertaleyellow",
    "image": "https://upload.wikimedia.org/wikipedia/en/0/07/Undertale_Yellow_logo.png",
    "type": "game",
    "file": "Games/undertaleyellow.html"
  },
  {
    "id": "tiktok",
    "title": "TikTok",
    "image": "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
    "type": "app",
    "file": getProxiedUrl("https://www.tiktok.com/")
  },
  {
    "id": "Chrome",
    "title": "Chrome",
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg",
    "type": "app",
    "file": "https://error404.n43.pw/"
  },
  {
    "id": "Notepad",
    "title": "Notepad",
    "image": "https://upload.wikimedia.org/wikipedia/commons/2/22/Notepad_Windows_11.svg",
    "type": "app",
    "file": "Apps/Notepad.html"
  },
  {
    "id": "My Documents",
    "title": "My Documents",
    "image": "https://upload.wikimedia.org/wikipedia/commons/3/36/Folder_Icon.svg",
    "type": "app",
    "file": "Apps/MyDocuments.html"
  },
  {
    "id": "aniwaves",
    "title": "Aniwaves",
    "image": "https://upload.wikimedia.org/wikipedia/commons/8/89/Anime_Eye.svg",
    "type": "app",
    "file": getProxiedUrl("https://aniwaves.ru/")
  },
  {
    "id": "gemini",
    "title": "Google Gemini",
    "image": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg",
    "type": "app",
    "file": getProxiedUrl("https://gemini.google.com/")
  }
];`;

content = content.replace(/export const ALL_GAMES = \[[\s\S]*?\];/, `export const ALL_GAMES = ${newGames}`);
fs.writeFileSync('src/games.ts', content);
console.log('Successfully updated games.ts');
