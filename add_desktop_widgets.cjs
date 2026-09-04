const fs = require('fs');
let code = fs.readFileSync('src/components/Desktop.tsx', 'utf8');

if (!code.includes("import { DesktopWidgets }")) {
  code = code.replace(
    "import { UserProfile } from '../types';",
    "import { UserProfile } from '../types';\nimport { DesktopWidgets } from './DesktopWidgets';"
  );
  
  code = code.replace(
    "{/* Top Area / Desktop Background */}",
    "{/* Top Area / Desktop Background */}\n      <DesktopWidgets />"
  );
  fs.writeFileSync('src/components/Desktop.tsx', code);
}
