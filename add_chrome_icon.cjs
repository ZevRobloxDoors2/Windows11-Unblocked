const fs = require('fs');
let code = fs.readFileSync('src/components/Desktop.tsx', 'utf8');

const chromeIconStr = `
          {/* Pinned Chrome */}
          <motion.div layout className="relative group flex items-center h-full">
            <button 
              onClick={() => { 
                const chromeApp = ALL_GAMES.find(g => g.id === 'Chrome');
                if (chromeApp) onPlayGame(chromeApp); 
              }} 
              className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors relative"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg" className="w-5 h-5 object-contain" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-transparent rounded-full transition-all w-1.5 group-hover:bg-[#00A4EF]" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[1000] drop-shadow-2xl flex flex-col items-center">
              <div className="bg-zinc-900 border border-white/20 p-2 rounded-lg shadow-xl mb-2 min-w-[120px] flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-white truncate max-w-[100px] capitalize">Chrome</span>
              </div>
            </div>
          </motion.div>
`;

code = code.replace(
  "{/* Pinned Chat */}",
  chromeIconStr + "\n          {/* Pinned Chat */}"
);

fs.writeFileSync('src/components/Desktop.tsx', code);
