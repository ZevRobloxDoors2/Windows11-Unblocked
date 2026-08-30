const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
if (html.includes('id="root"')) { console.log('ROOT FOUND'); } else { console.log('NO ROOT'); }
if (html.includes('Search')) { console.log('SEARCH FOUND'); } else { console.log('NO SEARCH'); }
