const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "type View = 'home' | 'store' | 'profile' | 'settings' | 'notifications' | 'friends' | 'chat' | 'party' | 'activity';",
  "type View = 'home' | 'store' | 'profile' | 'settings' | 'notifications' | 'friends' | 'chat' | 'party' | 'activity' | 'local-share' | 'classroom';"
);

code = code.replace(
  "import { GTAVModal } from './components/GTAVModal';",
  "import { GTAVModal } from './components/GTAVModal';\nimport { LocalShare } from './components/LocalShare';\nimport { Classroom } from './components/Classroom';\nimport { FakeUpdate } from './components/FakeUpdate';"
);

code = code.replace(
  "const [showGreetingToast, setShowGreetingToast] = useState(false);",
  "const [showGreetingToast, setShowGreetingToast] = useState(false);\n  const [showFakeUpdate, setShowFakeUpdate] = useState(false);"
);

code = code.replace(
  "{view === 'activity' && <ActivityFeed profile={activeProfile as any} />}",
  "{view === 'activity' && <ActivityFeed profile={activeProfile as any} />}\n                {view === 'local-share' && <LocalShare profile={activeProfile as any} />}\n                {view === 'classroom' && <Classroom />}"
);

// Add apps to desktop/start menu
code = code.replace(
  "const [desktopIcons, setDesktopIcons] = useState<any[]>([",
  "const [desktopIcons, setDesktopIcons] = useState<any[]>([\n    { id: 'app-local-share', title: 'Local Share', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Google_Drive_Logo_%282014-2020%29.svg', type: 'app', action: () => handleSetCurrentView('local-share') },\n    { id: 'app-classroom', title: 'Google Classroom', image: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png', type: 'app', action: () => handleSetCurrentView('classroom') },\n    { id: 'app-fake-update', title: 'System Update', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Windows_11_logo.svg', type: 'app', action: () => setShowFakeUpdate(true) },"
);

code = code.replace(
  "{openViews.map(view => (",
  "{showFakeUpdate && <FakeUpdate onClose={() => setShowFakeUpdate(false)} />}\n\n        {openViews.map(view => ("
);

// add to pin to taskbar
code = code.replace(
  "const [pinnedApps, setPinnedApps] = useState<string[]>(['store']);",
  "const [pinnedApps, setPinnedApps] = useState<string[]>(['store', 'app-local-share', 'app-classroom']);"
);

fs.writeFileSync('src/App.tsx', code);
