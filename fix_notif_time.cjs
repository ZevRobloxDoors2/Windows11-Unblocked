const fs = require('fs');
let code = fs.readFileSync('src/components/GlobalNotifications.tsx', 'utf8');

const targetStr = `            if (data.isGroup && (Date.now() - (data.createdAt?.toMillis() || Date.now()) > 10000)) { 
               // Ignore old group chat messages when opening app
               return;
            }`;

const replacementStr = `            // Ignore any message that is older than 15 seconds to prevent startup spam
            const msgTime = data.createdAt ? (typeof data.createdAt.toMillis === 'function' ? data.createdAt.toMillis() : Date.now()) : Date.now();
            if (Date.now() - msgTime > 15000) { 
               return;
            }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/GlobalNotifications.tsx', code);
