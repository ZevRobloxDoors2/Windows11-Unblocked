const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { FakeUpdate } from './components/FakeUpdate';",
  "import { FakeUpdate } from './components/FakeUpdate';\nimport { FakeDeadComputer } from './components/FakeDeadComputer';"
);

code = code.replace(
  "const [showFakeUpdate, setShowFakeUpdate] = useState(false);",
  "const [showFakeUpdate, setShowFakeUpdate] = useState(false);\n  const [showDeadComputer, setShowDeadComputer] = useState(false);"
);

code = code.replace(
  "{showFakeUpdate && <FakeUpdate onClose={() => setShowFakeUpdate(false)} />}",
  "{showFakeUpdate && <FakeUpdate onClose={() => setShowFakeUpdate(false)} />}\n        {showDeadComputer && <FakeDeadComputer batteryInfo={batteryInfo} />}"
);

code = code.replace(
  "openViews={openViews}",
  "openViews={openViews}\n          onActivateDeadComputer={() => setShowDeadComputer(true)}"
);

fs.writeFileSync('src/App.tsx', code);
