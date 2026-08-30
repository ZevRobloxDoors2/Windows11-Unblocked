const fs = require('fs');
let code = fs.readFileSync('src/components/Chat.tsx', 'utf8');

// The bug is that group chats are sending notifications on every single message to all members, which triggers old messages. Wait no, if the user was offline, they get a flood of notifications when they log in because they are unread.
