const fs = require('fs');
let content = fs.readFileSync('src/components/Party.tsx', 'utf8');

content = content.replace(
  "Object.values(peers.current).forEach(pc => pc.close());",
  "Object.values(peers.current).forEach((pc: any) => pc.close());"
);

fs.writeFileSync('src/components/Party.tsx', content, 'utf8');
