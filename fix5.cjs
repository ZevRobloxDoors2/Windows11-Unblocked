const fs = require('fs');
let content = fs.readFileSync('src/components/Party.tsx', 'utf8');
content = content.replace('      }));\n    };', '      }, (err) => { console.warn(err); }));\n    };');
fs.writeFileSync('src/components/Party.tsx', content);
