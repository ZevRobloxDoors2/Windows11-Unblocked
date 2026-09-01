const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldRender = `const isActive = playingGame?.id === g.id;
                if (minimizedWindows.includes(g.id)) return null;
                // If it's suspended, we want it to still render, but maybe we hide it completely or keep it as a window in the background?`;
const newRender = `const isActive = playingGame?.id === g.id;
                const isMinimized = minimizedWindows.includes(g.id);`;
content = content.replace(oldRender, newRender);

const oldWindow = `className={\`transition-opacity duration-300 \${isActive ? 'z-[150]' : 'z-[140]'}\`}`;
const newWindow = `className={\`transition-opacity duration-300 \${isActive ? 'z-[150]' : 'z-[140]'} \${isMinimized ? 'opacity-0 pointer-events-none translate-y-24 scale-95' : 'opacity-100'}\`}`;
content = content.replace(oldWindow, newWindow);

fs.writeFileSync('src/App.tsx', content);
