const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Inside award function
content = content.replace(
  "const award = async () => {\n            try {\n              await updateDoc",
  "const award = async () => {\n            if (isGuestMode) return;\n            try {\n              await updateDoc"
);

// We should also check for `handlePlayGame` and `handleStopGame` to not add to recent games in DB
content = content.replace(
  "if (userAuth) {",
  "if (userAuth && !isGuestMode) {"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
