const fs = require('fs');

// App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  `className="flex flex-col flex-1 overflow-hidden px-12 pt-8"`,
  `className="flex flex-col flex-1 min-h-0 h-full overflow-hidden px-12 pt-8"`
);
fs.writeFileSync('src/App.tsx', appCode);

// Friends.tsx
let friendsCode = fs.readFileSync('src/components/Friends.tsx', 'utf8');
friendsCode = friendsCode.replace(
  `className="px-12 max-w-5xl mx-auto flex flex-col gap-8 pt-8 pb-12 h-full overflow-y-auto w-full"`,
  `className="px-12 max-w-5xl mx-auto flex flex-col flex-1 min-h-0 h-full gap-8 pt-8 pb-12 overflow-y-auto w-full"`
);
fs.writeFileSync('src/components/Friends.tsx', friendsCode);

// Settings.tsx
let settingsCode = fs.readFileSync('src/components/Settings.tsx', 'utf8');
settingsCode = settingsCode.replace(
  `className="flex flex-1 min-h-0 h-full pb-12 px-12 w-full max-w-7xl mx-auto gap-8 overflow-y-auto custom-scroll"`,
  `className="flex flex-1 min-h-0 h-full pb-12 px-12 w-full max-w-7xl mx-auto gap-8 overflow-y-auto custom-scroll"`
);
// Settings already has flex-1 min-h-0 h-full ... let's check its inner divs
// The content inside Settings might be overflowing.
