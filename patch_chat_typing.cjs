const fs = require('fs');
let code = fs.readFileSync('src/components/Chat.tsx', 'utf8');

const typingBlock = `        {Object.keys(typingUsers).length > 0 && (
          <div className="text-zinc-400 text-sm px-4 pb-2 italic flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {Object.values(typingUsers).map(u => (u as any).gamertag).join(', ')} {Object.values(typingUsers).length === 1 ? 'is' : 'are'} typing...
          </div>
        )}`;

code = code.replace(typingBlock, `        {Object.values(typingUsers).filter((u: any) => u.isTyping && Date.now() - u.lastTyped < 10000).length > 0 && (
          <div className="text-zinc-400 text-sm px-4 pb-2 italic flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {Object.values(typingUsers).filter((u: any) => u.isTyping && Date.now() - u.lastTyped < 10000).map(u => (u as any).gamertag).join(', ')} {Object.values(typingUsers).filter((u: any) => u.isTyping && Date.now() - u.lastTyped < 10000).length === 1 ? 'is' : 'are'} typing...
          </div>
        )}`);

fs.writeFileSync('src/components/Chat.tsx', code);
