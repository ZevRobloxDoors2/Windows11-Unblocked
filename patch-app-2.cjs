const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add sort logic in App component body
content = content.replace(
  "const [time, setTime] = useState('');",
  "const [time, setTime] = useState('');\n  const [sortAZ, setSortAZ] = useState(localStorage.getItem('sort_az') === 'true');\n  const [mobileSizer, setMobileSizer] = useState(localStorage.getItem('mobile_sizer') === 'true');\n  const displayGames = sortAZ ? [...ALL_GAMES].sort((a,b) => a.title.localeCompare(b.title)) : ALL_GAMES;"
);

// We need to also listen to changes of mobile_sizer and sortAZ. We can just use an interval or event listener if they change from Settings.
// Or we can just read from localStorage before rendering. Actually, if Settings changes them, it might not re-render App.
// Let's add a global event listener for settings change.
const listenCode = `
  useEffect(() => {
    const i = setInterval(() => {
      setSortAZ(localStorage.getItem('sort_az') === 'true');
      setMobileSizer(localStorage.getItem('mobile_sizer') === 'true');
    }, 500);
    return () => clearInterval(i);
  }, []);
`;
content = content.replace("useSpatialNavigation();", listenCode + "\n  useSpatialNavigation();");

// Replace ALL_GAMES.slice with displayGames.slice
content = content.replace("ALL_GAMES.slice(0,8)", "displayGames.slice(0,8)");
// Replace ALL_GAMES.filter with displayGames.filter
content = content.replace("ALL_GAMES.filter", "displayGames.filter");

// Mobile Sizer wrap
content = content.replace(
  /<div className=\{\`h-screen \$\{getThemeClasses\(activeProfile\.homeTheme\)\} text-white font-sans overflow-hidden flex flex-col relative z-0\`\}>/,
  "<div className={`h-screen ${getThemeClasses(activeProfile.homeTheme)} text-white font-sans overflow-hidden flex flex-col relative z-0`} style={mobileSizer ? { transform: 'scale(0.8)', transformOrigin: 'center top', width: '125%', height: '125%', left: '-12.5%' } : {}}>"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
