const fs = require('fs');
let code = fs.readFileSync('src/components/GlobalNotifications.tsx', 'utf8');

const targetStr = `            if (data.isGroup && (Date.now() - (data.createdAt?.toMillis() || Date.now()) > 10000)) { 
               // Ignore old group chat messages when opening app
               return;
            }`;

const replacementStr = `            // Only toast if the message is new (created within the last 15 seconds)
            // This prevents the notification spam when loading old messages
            const msgTime = data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now();
            if (Date.now() - msgTime > 15000) { 
               return;
            }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/GlobalNotifications.tsx', code);
