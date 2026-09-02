const fs = require('fs');
let code = fs.readFileSync('src/components/Desktop.tsx', 'utf8');

code = code.replace(
  "onLogout",
  "onLogout,\n  onActivateDeadComputer"
);

code = code.replace(
  "onLogout: () => void\n}) => {",
  "onLogout: () => void,\n  onActivateDeadComputer?: () => void\n}) => {"
);

code = code.replace(
  "import { Search, Bell, Settings as SettingsIcon, MessageSquare, Users, Store, Box, User, Activity, Image as ImageIcon, Mic } from 'lucide-react';",
  "import { Search, Bell, Settings as SettingsIcon, MessageSquare, Users, Store, Box, User, Activity, Image as ImageIcon, Mic, GraduationCap } from 'lucide-react';"
);

const teacherIconHtml = `
          {/* Teacher Icon for Dead Computer */}
          <button
            onClick={onActivateDeadComputer}
            className="flex items-center gap-2 hover:bg-white/10 px-2 h-full rounded-md cursor-pointer transition-colors"
            title="School Mode"
          >
            <GraduationCap size={16} className="text-white" />
          </button>
          
          {/* Microphone Icon for Party */}`;

code = code.replace(
  "{/* Microphone Icon for Party */}",
  teacherIconHtml
);

fs.writeFileSync('src/components/Desktop.tsx', code);
