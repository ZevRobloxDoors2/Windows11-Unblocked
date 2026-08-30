const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');
code = code.replace(
`    match /chats/{chatId}/messages/{messageId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && isValidMessage(incoming())
        && incoming().createdAt == request.time;
      allow update: if isSignedIn() && existing().senderId == request.auth.uid;
      allow delete: if isSignedIn() && existing().senderId == request.auth.uid;
    }`,
`    match /chats/{chatId}/messages/{messageId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && isValidMessage(incoming())
        && incoming().createdAt == request.time;
      allow update: if isSignedIn() && existing().senderId == request.auth.uid;
      allow delete: if isSignedIn() && existing().senderId == request.auth.uid;
    }
    match /chats/{chatId}/typing/{userId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == userId;
    }`
);
fs.writeFileSync('firestore.rules', code);
