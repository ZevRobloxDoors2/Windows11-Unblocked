const fs = require('fs');

let content = fs.readFileSync('src/components/GuideMenu.tsx', 'utf8');

// Add Settings lucide icon if missing, actually we already import User, etc. Settings might be missing.
if (!content.includes('Settings, ')) {
  content = content.replace(/import { /, 'import { Settings, ');
}

// Find Party button and add Settings after it.
const partyBtn = `                <button 
                  onClick={() => handleAction(() => onNavigate('party'))}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-white/10 transition-colors text-white text-left focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <Users size={20} className="text-zinc-400" />
                  <span className="font-medium">Start a Party</span>
                </button>`;

const settingsBtn = `                <button 
                  onClick={() => handleAction(() => onNavigate('settings'))}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-white/10 transition-colors text-white text-left focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <Settings size={20} className="text-zinc-400" />
                  <span className="font-medium">Settings</span>
                </button>`;

content = content.replace(partyBtn, partyBtn + '\n' + settingsBtn);

fs.writeFileSync('src/components/GuideMenu.tsx', content, 'utf8');
