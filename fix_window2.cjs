const fs = require('fs');
let code = fs.readFileSync('src/components/Window.tsx', 'utf8');

const oldBtns = `<button onClick={onGuide} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm" title="Guide">
            <span className="font-bold text-sm">E</span>
          </button>
          <button onClick={onMinimize} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm"><Minus size={16} /></button>
          <button onClick={toggleMaximize} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm">
            {windowState === 'maximized' ? <Copy size={14} /> : <Square size={14} />}
          </button>
          <button onClick={onClose} className="text-zinc-400 hover:bg-red-500 hover:text-white transition-colors p-1.5 rounded-sm" onPointerDown={e => e.stopPropagation()}><X size={16} /></button>`;

const newBtns = `<button onClick={onGuide} onPointerDown={e => e.stopPropagation()} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm" title="Guide">
            <span className="font-bold text-sm">E</span>
          </button>
          <button onClick={onMinimize} onPointerDown={e => e.stopPropagation()} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm"><Minus size={16} /></button>
          <button onClick={toggleMaximize} onPointerDown={e => e.stopPropagation()} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm">
            {windowState === 'maximized' ? <Copy size={14} /> : <Square size={14} />}
          </button>
          <button onClick={onClose} className="text-zinc-400 hover:bg-red-500 hover:text-white transition-colors p-1.5 rounded-sm" onPointerDown={e => e.stopPropagation()}><X size={16} /></button>`;
          
code = code.replace(oldBtns, newBtns);
fs.writeFileSync('src/components/Window.tsx', code);
