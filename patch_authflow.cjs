const fs = require('fs');
let content = fs.readFileSync('src/components/AuthFlow.tsx', 'utf8');

// 1. Add owner credentials
const oldTester = `    if (testerUser === 'jascen67' && testerPass === 'matandmat') {
      emailToUse = 'jascen67@ebox.tester';
    } else if (testerUser === 'Sebastianthegoat61' && testerPass === 'Masonisabum61!') {
      emailToUse = 'sebastianthegoat61@ebox.tester';
    } else {`;

const newTester = `    if (testerUser === 'jascen67' && testerPass === 'matandmat') {
      emailToUse = 'jascen67@ebox.tester';
    } else if (testerUser === 'Sebastianthegoat61' && testerPass === 'Masonisabum61!') {
      emailToUse = 'sebastianthegoat61@ebox.tester';
    } else if (testerUser === 'ownertest' && testerPass === 'nohorse') {
      emailToUse = 'ownertest@ebox.owner';
      role = 'owner';
    } else {`;

content = content.replace(oldTester, newTester);

// 2. Fix displacement for login
const oldLoginDiv = `        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="z-10 w-full h-full flex flex-col items-center justify-center"
          >`;

const newLoginDiv = `        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="z-10 absolute inset-0 flex flex-col items-center justify-center"
          >`;

content = content.replace(oldLoginDiv, newLoginDiv);

// Also fix it for other views that might be displaced
content = content.replace(/className="z-10 w-full h-full flex flex-col items-center justify-center"/g, 'className="z-10 absolute inset-0 flex flex-col items-center justify-center"');


fs.writeFileSync('src/components/AuthFlow.tsx', content);
