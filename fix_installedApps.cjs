const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const [installedApps, setInstalledApps] = useState<string[]>(() => {",
  "const builtInApps = ['app-local-share', 'app-classroom', 'app-fake-update'];\n  const [installedApps, setInstalledApps] = useState<string[]>(() => {"
);

code = code.replace(
  "return [];",
  "return [...builtInApps];"
);

code = code.replace(
  "return JSON.parse(saved);",
  "const parsed = JSON.parse(saved);\n      return Array.from(new Set([...parsed, ...builtInApps]));"
);

fs.writeFileSync('src/App.tsx', code);
