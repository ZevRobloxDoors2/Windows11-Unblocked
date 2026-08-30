const fs = require('fs');

let content = fs.readFileSync('src/games.ts', 'utf8');

// The file currently has:
//   }
// ];
//   ,
//   {
//     "id": "TikTok",

// Let's just fix the bracket syntax directly via regex
content = content.replace(/\];\s*,/, ',');

fs.writeFileSync('src/games.ts', content, 'utf8');
