const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "let link = document.querySelector(\"link[rel*='icon']\");",
  "let link = document.querySelector(\"link[rel*='icon']\") as HTMLLinkElement;"
);

content = content.replace(
  "if (!link) {\n        link = document.createElement('link');",
  "if (!link) {\n        link = document.createElement('link') as HTMLLinkElement;"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
