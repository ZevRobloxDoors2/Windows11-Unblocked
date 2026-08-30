const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const cursorTarget = `        if (preset === 'default') url = "url('https://cdn-icons-png.flaticon.com/512/2722/2722237.png') 16 16, auto";
        if (preset === 'gaming') url = "url('https://cdn-icons-png.flaticon.com/512/751/751463.png') 16 16, auto";
        setCursorCss(\`* { cursor: \${url} !important; }\`);`;

const cursorReplacement = `        if (preset === 'default') url = "url('https://cdn-icons-png.flaticon.com/512/2722/2722237.png') 16 16, auto";
        if (preset === 'gaming') url = "url('https://cdn-icons-png.flaticon.com/512/751/751463.png') 16 16, auto";
        
        // Also apply cursor to iframes by overriding their pointer events conceptually or applying it to wrapping containers
        setCursorCss(\`
          *, *::before, *::after, button, a, input, select { 
            cursor: \${url} !important; 
          }
        \`);`;

code = code.replace(cursorTarget, cursorReplacement);
fs.writeFileSync('src/App.tsx', code);
