const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  `<div className="flex-1 overflow-y-auto">`,
  `<div className="flex-1 overflow-y-auto min-h-0">`
);
fs.writeFileSync('src/App.tsx', code);
