const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "isActive={isActive}",
  "isActive={isActive}\n                    isMinimized={isMinimized}"
);

fs.writeFileSync('src/App.tsx', code);
