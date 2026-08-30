const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { EboxMusicToast } from './components/EboxMusicToast';",
  "import { EboxMusicToast } from './components/EboxMusicToast';\nimport { Settings as SettingsView } from './components/Settings';\nimport { DMCAModal } from './components/DMCAModal';"
);

// 2. Guest mode state & logic
// find: const [isGuideOpen, setIsGuideOpen] = useState(false);
const guestCode = `
  const isGuestMode = sessionStorage.getItem('ebox_guest_mode') === 'true';
`;
content = content.replace("const [isGuideOpen, setIsGuideOpen] = useState(false);", guestCode + "\n  const [isGuideOpen, setIsGuideOpen] = useState(false);");

// 3. activeProfile logic
const profileCode = `
  const activeProfile = isGuestMode ? {
    uid: 'guest',
    gamertag: 'Guest Player',
    gamertagLower: 'guest player',
    avatar: 'https://ui-avatars.com/api/?name=Guest&background=10b981&color=fff',
    status: 'Online',
    score: 0,
    homeTheme: 'default',
    recentGames: []
  } : profile;
`;
content = content.replace("const [time, setTime] = useState('');", profileCode + "\n  const [time, setTime] = useState('');");

// 4. Update the handleLogout function to clear guest state
content = content.replace(
  "const handleLogout = () => signOut(auth);",
  "const handleLogout = () => {\n    if (isGuestMode) {\n      sessionStorage.removeItem('ebox_guest_mode');\n      window.location.reload();\n    } else {\n      signOut(auth);\n    }\n  };"
);

// 5. Update auth checks
content = content.replace(
  "if (!authLoaded || (userAuth && !profileLoaded)) {",
  "if (!isGuestMode && (!authLoaded || (userAuth && !profileLoaded))) {"
);

content = content.replace(
  "if (!userAuth || !profile) {",
  "if (!isGuestMode && (!userAuth || !profile)) {"
);

// add DMCAModal to auth flow
content = content.replace(
  "<WelcomeMessage />",
  "<WelcomeMessage />\n        <DMCAModal />"
);

// 6. Replace `profile` with `activeProfile` in rendering, but exclude the `setProfile` and `const [profile...` declarations.
// This is a bit tricky, but mostly inside the return statement.
// Since it's easier, we can just replace `profile` with `activeProfile` anywhere it accesses properties like `profile.homeTheme`
content = content.replace(/profile\./g, 'activeProfile.');
content = content.replace(/profile={profile}/g, 'profile={activeProfile}');
content = content.replace(/userProfile={profile}/g, 'userProfile={activeProfile}');

// 7. Update Settings View
const oldSettingsMatch = content.match(/{currentView === 'settings' && \([\s\S]*?<\/motion\.div>\n\s*\)}/);
if (oldSettingsMatch) {
  content = content.replace(oldSettingsMatch[0], `{currentView === 'settings' && <SettingsView profile={activeProfile as any} onBack={() => setCurrentView('home')} onLogout={handleLogout} isGuestMode={isGuestMode} />}`);
}

// 8. Add DMCAModal outside everything
content = content.replace(
  "return (",
  "return (\n    <>\n      <DMCAModal />"
);
content = content.replace(
  "    </div>\n  );\n}",
  "    </div>\n    </>\n  );\n}"
);

// 9. E button animation
// Replace the old button with motion.button
const oldBtnRegex = /<button\s+onClick=\{\(\) => setIsGuideOpen\(true\)\}\s+className="fixed top-8 right-8 z-\[260\][^>]*>\s*E\s*<\/button>/;

content = content.replace(oldBtnRegex, `{!playingGame && (
        <motion.button 
          layoutId="guide-button"
          onClick={() => setIsGuideOpen(true)}
          className="fixed top-8 right-8 z-[260] w-12 h-12 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-500/50"
        >
          E
        </motion.button>
      )}`);

// Add it to the playingGame top bar
const stopGameRegex = /<button onClick=\{handleStopGame\} className="bg-red-600 px-4 py-1.5 rounded-md font-bold hover:bg-red-500 transition-colors flex items-center gap-2">\s*Stop Game\s*<\/button>/;

content = content.replace(stopGameRegex, `<div className="flex items-center gap-4">
                  <motion.button 
                    layoutId="guide-button"
                    onClick={() => setIsGuideOpen(true)}
                    className="z-[260] w-8 h-8 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                  >
                    E
                  </motion.button>
                  <button onClick={handleStopGame} className="bg-red-600 px-4 py-1.5 rounded-md font-bold hover:bg-red-500 transition-colors flex items-center gap-2">
                     Stop Game
                  </button>
                </div>`);

// 10. Anti-Deledao logic inside iframe rendering
const antiDeledaoCode = `
                  {localStorage.getItem('anti_deledao') === 'true' && playingGame?.id === g.id && (
                    <div className="absolute inset-0 pointer-events-none z-[105]" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/c/c3/Google_Docs_logo_%282014-2020%29.svg)', opacity: 0.05, backgroundSize: '100px', backgroundRepeat: 'repeat' }} />
                  )}
`;

content = content.replace(/<iframe\s+key=\{g\.id\}[\s\S]*?\/>/, (match) => {
  return `<div className={playingGame?.id === g.id ? "flex-1 w-full relative bg-white block" : "hidden"} key={g.id}>
                  ${antiDeledaoCode}
                  ${match.replace(/className=\{[^\}]*\}/, 'className="w-full h-full"')}
                </div>`;
});


fs.writeFileSync('src/App.tsx', content, 'utf8');

