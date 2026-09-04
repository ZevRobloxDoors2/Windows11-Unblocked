const fs = require('fs');
let code = fs.readFileSync('public/Apps/WinFlix.html', 'utf8');

code = code.replace(
  "const VideoSources = [",
  "const VideoSources = [\n      { \n        name: '111movies', \n        url: 'https://111movies.com/embed/\\${t}/\\${id}', \n        quality: 'HD', \n        speed: 'fast',\n        priority: 1,\n        note: 'Default Movie Server'\n      },\n      {\n        name: 'Videasy',\n        url: 'https://videasy.net/embed/\\${t}/\\${id}',\n        quality: 'HD',\n        speed: 'fast',\n        priority: 1,\n        note: 'Best for Anime'\n      },"
);

fs.writeFileSync('public/Apps/WinFlix.html', code);
