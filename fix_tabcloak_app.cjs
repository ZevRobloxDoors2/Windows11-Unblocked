const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const titleTarget = `    const title = localStorage.getItem('cloak_title') || 'Google Docs - Edit Document';
    const icon = localStorage.getItem('cloak_icon') || 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';`;

const titleReplacement = `    const title = localStorage.getItem('cloak_title') || 'Classes';
    const icon = localStorage.getItem('cloak_icon') || 'https://ssl.gstatic.com/classroom/favicon.png';`;

code = code.replace(titleTarget, titleReplacement);

const htmlTarget = `        <title>\${localStorage.getItem('cloak_title') || 'Google Docs - Edit Document'}</title>
        <link rel="icon" href="\${localStorage.getItem('cloak_icon') || 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'}">`;

const htmlReplacement = `        <title>\${localStorage.getItem('cloak_title') || 'Classes'}</title>
        <link rel="icon" href="\${localStorage.getItem('cloak_icon') || 'https://ssl.gstatic.com/classroom/favicon.png'}">`;
        
code = code.replace(htmlTarget, htmlReplacement);

fs.writeFileSync('src/App.tsx', code);
