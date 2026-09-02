const fs = require('fs');
let code = fs.readFileSync('src/games.ts', 'utf8');

const newApps = `
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
`;

code = code.replace(
  "export const ALL_GAMES = [",
  "export const ALL_GAMES = [" + newApps
);

fs.writeFileSync('src/games.ts', code);
