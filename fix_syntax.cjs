const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  `} else {
      setPlayMinutes(0);
    } else {
      setPlayMinutes(0);
    }`,
  `} else {
      setPlayMinutes(0);
    }`
);
fs.writeFileSync('src/App.tsx', code);
