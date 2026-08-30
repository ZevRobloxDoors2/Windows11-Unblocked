const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The incorrect replace was:
// content = content.replace("return (", "return (\n    <>\n      <DMCAModal />");

content = content.replace(
  "return (\n    <>\n      <DMCAModal />) => { unsubReqs(); unsubAlerts(); };",
  "return () => { unsubReqs(); unsubAlerts(); };"
);

// We need to add DMCAModal at the actual main return
// Let's find the main return: `return (\n    <div className={\`h-screen`
content = content.replace(
  /return \(\s*<div className=\{\`h-screen \$\{getThemeClasses/,
  "return (\n    <>\n      <DMCAModal />\n      <div className={`h-screen ${getThemeClasses"
);

// Wait, the end tags:
// "    </div>\n    </>\n  );\n}"
// I did: content.replace("    </div>\n  );\n}", "    </div>\n    </>\n  );\n}");

fs.writeFileSync('src/App.tsx', content, 'utf8');
