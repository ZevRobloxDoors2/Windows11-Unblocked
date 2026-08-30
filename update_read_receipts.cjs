const fs = require('fs');
let code = fs.readFileSync('src/components/Chat.tsx', 'utf8');

// Inside Chat.tsx, find the useEffect tracking active views
const trackTarget = `      if (snap.metadata.hasPendingWrites) return;`;
const trackReplacement = `      if (snap.metadata.hasPendingWrites) return;
      
      // Update read receipts
      snap.docs.forEach(d => {
        const msg = d.data();
        if (msg.uid !== userProfile.uid && (!msg.readBy || !msg.readBy.includes(userProfile.uid))) {
          updateDoc(doc(db, \`chats/\${computedChatId}/messages\`, d.id), {
            readBy: arrayUnion(userProfile.uid)
          }).catch(()=>{});
        }
      });`;

code = code.replace(trackTarget, trackReplacement);

// Need to import arrayUnion
const importTarget = `import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';`;
const importReplacement = `import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';`;

code = code.replace(importTarget, importReplacement);
fs.writeFileSync('src/components/Chat.tsx', code);
