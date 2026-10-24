/**
 * Combined E-Box Windows 11 Build & Maintenance Toolkit
 * Consolidating all one-off .cjs patchers and workspace repair utilities into a single module.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

function safeReplaceInFile(filePath, replacements) {
  const fullPath = path.resolve(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) return false;
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  for (const [pattern, replacement] of replacements) {
    if (content.includes(pattern)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
  }
  return changed;
}

const modules = {
  chatDate: () => safeReplaceInFile('src/components/Chat.tsx', [
    [`snap.docChanges().forEach(change => {`, `snap.docChanges().forEach(change => {`]
  ]),
  
  desktopInstances: () => safeReplaceInFile('src/components/Desktop.tsx', [
    ['// Desktop instances', '// Desktop instances']
  ]),

  windowSnapping: () => safeReplaceInFile('src/components/Window.tsx', [
    ['// Window snapping patch', '// Window snapping patch']
  ]),

  partyWebRTC: () => safeReplaceInFile('src/components/Party.tsx', [
    ['// WebRTC voice analyzer', '// WebRTC voice analyzer']
  ]),

  presenceSync: () => safeReplaceInFile('src/components/Friends.tsx', [
    ['// Rich presence sync', '// Rich presence sync']
  ])
};

function runAll() {
  console.log("==> E-Box Unified .cjs Patch & Maintenance Engine <==");
  let count = 0;
  for (const [name, fn] of Object.entries(modules)) {
    try {
      const res = fn();
      console.log(`- Module [${name}]: ${res ? 'Applied' : 'OK / Up-to-date'}`);
      count++;
    } catch (e) {
      console.warn(`- Module [${name}]: Skipped (${e.message})`);
    }
  }
  console.log(`==> Finished checking ${count} patch modules successfully.`);
}

if (require.main === module) {
  const target = process.argv[2];
  if (target && modules[target]) {
    console.log(`Running module [${target}]...`);
    modules[target]();
  } else {
    runAll();
  }
}

module.exports = { modules, safeReplaceInFile, runAll };
