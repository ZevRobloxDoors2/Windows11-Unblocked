const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const targetStr = `  // Set default cloak to Google on first load
  useEffect(() => {
    if (!localStorage.getItem('cloak_title')) {
      localStorage.setItem('cloak_title', 'Google');
      localStorage.setItem('cloak_icon', 'https://www.google.com/favicon.ico');
      document.title = 'Google';`;

const replacementStr = `  // Set default cloak to Google Classroom on first load
  useEffect(() => {
    if (!localStorage.getItem('cloak_title')) {
      localStorage.setItem('cloak_title', 'Classes');
      localStorage.setItem('cloak_icon', 'https://ssl.gstatic.com/classroom/favicon.png');
      document.title = 'Classes';`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/Settings.tsx', code);
