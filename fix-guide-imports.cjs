const fs = require('fs');

let content = fs.readFileSync('src/components/GuideMenu.tsx', 'utf8');

content = content.replace("import { Settings, motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");
content = content.replace("import { User, MessageSquare", "import { Settings, User, MessageSquare");

fs.writeFileSync('src/components/GuideMenu.tsx', content, 'utf8');
