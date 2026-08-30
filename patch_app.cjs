const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "{currentView === 'chat' && chatConfig ? <Chat userProfile={activeProfile as any} friendId={!chatConfig.isGroup ? chatConfig.id : undefined} friendGamertag={!chatConfig.isGroup ? chatConfig.name : undefined} chatId={chatConfig.isGroup ? chatConfig.id : undefined} isGroup={chatConfig.isGroup} chatName={chatConfig.isGroup ? chatConfig.name : undefined} onBack={() => setCurrentView('friends')} />}",
  "{currentView === 'chat' && (chatConfig ? <Chat userProfile={activeProfile as any} friendId={!chatConfig.isGroup ? chatConfig.id : undefined} friendGamertag={!chatConfig.isGroup ? chatConfig.name : undefined} chatId={chatConfig.isGroup ? chatConfig.id : undefined} isGroup={chatConfig.isGroup} chatName={chatConfig.isGroup ? chatConfig.name : undefined} onBack={() => setCurrentView('friends')} /> : <div className=\"flex h-full items-center justify-center text-zinc-400 flex-col gap-4\"><div>Select a friend to start chatting</div><button onClick={() => setCurrentView('friends')} className=\"px-4 py-2 bg-blue-600 text-white rounded\">Open Friends</button></div>)}"
);

fs.writeFileSync('src/App.tsx', code);
