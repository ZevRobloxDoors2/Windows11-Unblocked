const fs = require('fs');

let content = fs.readFileSync('src/games.ts', 'utf8');

function getLogo(title, type) {
  const t = title.toLowerCase();
  
  if (t === 'roblox') return 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg';
  if (t === 'tiktok') return 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg';
  if (t === 'snapchat') return 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg';
  if (t === 'youtube') return 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg';
  if (t === 'chatgpt') return 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg';
  if (t === 'discord') return 'https://upload.wikimedia.org/wikipedia/commons/9/90/Discord_logo_2021.svg';
  if (t.includes('ebox music') || t.includes('spotify')) return 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg';
  if (t.includes('eboxflix') || t.includes('ebox flix')) return 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg';
  
  const encoded = encodeURIComponent(title);
  if (type === 'app') {
    return `https://ui-avatars.com/api/?name=${encoded}&background=222222&color=10b981&size=256&font-size=0.33&bold=true`;
  }
  return `https://ui-avatars.com/api/?name=${encoded}&background=random&color=fff&size=256&font-size=0.33`;
}

// Manually extract the array string and eval it
const match = content.match(/export const ALL_GAMES = (\[[\s\S]*\]);/);
if (match) {
  let games = eval(match[1]);
  
  // Clean it up
  games = games.map(g => {
    g.image = getLogo(g.title, g.type);
    if (g.title === 'Roblox') {
      g.file = "https://nhjkdbiondnnd.dila.cl/frog/default/ixl/hvtrs8%2F-71.kp%2Cnmweg%2Cfwn-arpq%2Fc%2F39%3B02%2F%60.jtol";
    }
    return g;
  });

  const newApps = [
    {
      id: "TikTok",
      title: "TikTok",
      image: getLogo("TikTok", "app"),
      type: "app",
      file: "https://nhjkdbiondnnd.dila.cl/embed.html#https://tiktok.com"
    },
    {
      id: "Snapchat",
      title: "Snapchat",
      image: getLogo("Snapchat", "app"),
      type: "app",
      file: "https://nhjkdbiondnnd.dila.cl/embed.html#https://snapchat.com/spotlight"
    },
    {
      id: "ChatGPT",
      title: "ChatGPT",
      image: getLogo("ChatGPT", "app"),
      type: "app",
      file: "https://nhjkdbiondnnd.dila.cl/embed.html#https://toolbaz.com/writer/chat-gpt-alternative"
    },
    {
      id: "YouTube",
      title: "YouTube",
      image: getLogo("YouTube", "app"),
      type: "app",
      file: "https://nhjkdbiondnnd.dila.cl/embed.html#https://youtube.com/"
    }
  ];

  // Make sure we aren't adding duplicates if this runs twice
  for (let app of newApps) {
    if (!games.find(g => g.id === app.id)) {
      games.push(app);
    }
  }

  const out = `export const ALL_GAMES = ${JSON.stringify(games, null, 2)};\n`;
  fs.writeFileSync('src/games.ts', out, 'utf8');
}
