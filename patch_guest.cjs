const fs = require('fs');
let content = fs.readFileSync('src/components/AuthFlow.tsx', 'utf8');

const oldGuest = `const handleGuestPlay = () => {
    onConfirm();
  };`;

const newGuest = `const handleGuestPlay = () => {
    sessionStorage.setItem('ebox_guest_mode', 'true');
    window.location.reload();
  };`;

content = content.replace(oldGuest, newGuest);
fs.writeFileSync('src/components/AuthFlow.tsx', content);
