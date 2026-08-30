const fs = require('fs');
let code = fs.readFileSync('src/components/Chat.tsx', 'utf8');

const targetStr = `                      {m.createdAt ? (m.createdAt.toDate ? m.createdAt.toDate() : new Date(m.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`;

const replacementStr = `                      {m.createdAt ? (m.createdAt.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (typeof m.createdAt === 'number' || typeof m.createdAt === 'string' ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')) : ''}`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/Chat.tsx', code);
