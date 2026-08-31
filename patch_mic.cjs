const fs = require('fs');
let content = fs.readFileSync('src/components/Desktop.tsx', 'utf8');
content = content.replace("import { Search, Bell, Settings as SettingsIcon, MessageSquare, Users, Store, Box, User, Activity, Image as ImageIcon } from 'lucide-react';",
"import { Search, Bell, Settings as SettingsIcon, MessageSquare, Users, Store, Box, User, Activity, Image as ImageIcon, Mic } from 'lucide-react';");

content = content.replace("          {/* Quick Settings Cluster */}", 
`          {/* Microphone Icon for Party */}
          <button
            onClick={() => setCurrentView('party')}
            className="flex items-center gap-2 hover:bg-white/10 px-2 h-full rounded-md cursor-pointer transition-colors"
            title="Create/Join a Party"
          >
            <Mic size={16} className="text-white" />
          </button>
          
          {/* Quick Settings Cluster */}`);
fs.writeFileSync('src/components/Desktop.tsx', content);
