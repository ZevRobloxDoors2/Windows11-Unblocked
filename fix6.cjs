const fs = require('fs');
let content = fs.readFileSync('src/components/Party.tsx', 'utf8');
content = content.replace('setFriendsList(list.filter((v,i,a)=>a.findIndex(t=>(t.uid === v.uid))===i));\n    });', 'setFriendsList(list.filter((v,i,a)=>a.findIndex(t=>(t.uid === v.uid))===i));\n    }, (err) => { console.warn(err); });');
fs.writeFileSync('src/components/Party.tsx', content);
