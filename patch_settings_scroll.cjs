const fs = require('fs');

let settingsCode = fs.readFileSync('src/components/Settings.tsx', 'utf8');

settingsCode = settingsCode.replace(
  `className="flex flex-1 min-h-0 h-full pb-12 px-12 w-full max-w-7xl mx-auto gap-8 overflow-y-auto custom-scroll"`,
  `className="flex flex-1 min-h-0 h-full pb-12 px-12 w-full max-w-7xl mx-auto gap-8 overflow-hidden"`
);

settingsCode = settingsCode.replace(
  `className="flex-1 bg-zinc-900/50 rounded-xl p-8 border border-transparent flex flex-col gap-8"`,
  `className="flex-1 bg-zinc-900/50 rounded-xl p-8 border border-transparent flex flex-col gap-8 overflow-y-auto custom-scroll min-h-0"`
);

fs.writeFileSync('src/components/Settings.tsx', settingsCode);
