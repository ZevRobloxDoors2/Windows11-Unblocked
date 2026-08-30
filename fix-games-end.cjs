const fs = require('fs');

let content = fs.readFileSync('src/games.ts', 'utf8');

// Find the first occurrence of "];  ," and replace everything around it to fix the array
content = content.replace(/\];\n  ,/, ',');

fs.writeFileSync('src/games.ts', content, 'utf8');
