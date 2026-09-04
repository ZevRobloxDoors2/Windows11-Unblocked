const fs = require('fs');
let code = fs.readFileSync('src/components/WinStore.tsx', 'utf8');

code = code.replace(
  "const [search, setSearch] = useState('');",
  "const [search, setSearch] = useState('');\n  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'apps'>('home');"
);

code = code.replace(
  "const filtered = ALL_GAMES.filter(g => g.title.toLowerCase().includes(search.toLowerCase()));",
  "const filtered = ALL_GAMES.filter(g => g.title.toLowerCase().includes(search.toLowerCase()) && (activeTab === 'home' || (activeTab === 'games' ? g.type === 'game' : g.type === 'app')));"
);

code = code.replace(
  "className=\"flex items-center gap-3 p-3 w-full rounded-md bg-white/10 text-white transition-colors\"",
  "onClick={() => setActiveTab('home')} className={`flex items-center gap-3 p-3 w-full rounded-md transition-colors ${activeTab === 'home' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}"
);

code = code.replace(
  "className=\"flex items-center gap-3 p-3 w-full rounded-md hover:bg-white/5 text-zinc-400 hover:text-white transition-colors\">\n            <Gamepad2",
  "onClick={() => setActiveTab('games')} className={`flex items-center gap-3 p-3 w-full rounded-md transition-colors ${activeTab === 'games' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}>\n            <Gamepad2"
);

code = code.replace(
  "<span className=\"hidden md:block text-sm\">Gaming</span>\n          </button>",
  "<span className=\"hidden md:block text-sm\">Gaming</span>\n          </button>\n          <button onClick={() => setActiveTab('apps')} className={`flex items-center gap-3 p-3 w-full rounded-md transition-colors ${activeTab === 'apps' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}>\n            <LayoutGrid size={20} className=\"shrink-0\" />\n            <span className=\"hidden md:block text-sm\">Apps</span>\n          </button>"
);

code = code.replace(
  "<h2 className=\"text-xl font-semibold mb-6\">Top free games</h2>",
  "<h2 className=\"text-xl font-semibold mb-6\">{activeTab === 'games' ? 'Top games' : activeTab === 'apps' ? 'Top apps' : 'Top free games & apps'}</h2>"
);

fs.writeFileSync('src/components/WinStore.tsx', code);
