const fs = require('fs');
let content = fs.readFileSync('src/components/Friends.tsx', 'utf8');
content = content.replace('setGroupChats(snap.docs.map(d => ({ id: d.id, name: d.data().name })));\n    });', 'setGroupChats(snap.docs.map(d => ({ id: d.id, name: d.data().name })));\n    }, (err) => { console.warn(err); });');
fs.writeFileSync('src/components/Friends.tsx', content);
