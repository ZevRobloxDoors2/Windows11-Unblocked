const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Home view
appCode = appCode.replace(
  `className="flex flex-col flex-1 overflow-y-auto pb-8"`,
  `className="flex flex-col flex-1 min-h-0 overflow-y-auto pb-8"`
);

// Library view (I replaced it before, let's verify if it's there)

fs.writeFileSync('src/App.tsx', appCode);
