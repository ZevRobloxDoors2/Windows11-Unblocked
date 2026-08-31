const fs = require('fs');

const code = `import React, { ReactNode, useState, useRef } from 'react';
import { motion, useDragControls } from 'motion/react';
import { X, Minus, Square, Copy } from 'lucide-react';

export const Window = ({ title, onClose, onMinimize, onGuide, isActive = true, onFocus, children, className = '' }: { title: string, onClose: () => void, onMinimize?: () => void, onGuide?: () => void, isActive?: boolean, onFocus?: () => void, children: ReactNode, className?: string }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [windowState, setWindowState] = useState<'floating' | 'maximized' | 'left' | 'right'>('floating');
  const windowRef = useRef<HTMLDivElement>(null);
  
  const dragControls = useDragControls();

  const toggleMaximize = () => {
    if (windowState === 'maximized') {
      setWindowState('floating');
    } else {
      setWindowState('maximized');
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const { point } = info;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Snapping logic
    if (point.y < 20) {
      setWindowState('maximized');
    } else if (point.x < 20) {
      setWindowState('left');
    } else if (point.x > screenWidth - 20) {
      setWindowState('right');
    }
  };

  const startDrag = (e: any) => {
    if (windowState !== 'floating') {
       setWindowState('floating');
    }
    setIsDragging(true);
    dragControls.start(e);
  };

  const getAnimationProps = () => {
    switch (windowState) {
      case 'maximized':
        return { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'left':
        return { top: 0, left: 0, width: '50%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'right':
        return { top: 0, left: '50%', width: '50%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'floating':
      default:
        // When floating, let drag control the x/y, but give it a default centered start
        return { width: '80%', height: '75%' };
    }
  };

  return (
    <motion.div
      ref={windowRef}
      drag={windowState === 'floating'}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onMouseDownCapture={onFocus}
      style={{
        resize: windowState === 'floating' ? 'both' : 'none',
        minWidth: 300,
        minHeight: 200,
        top: windowState === 'floating' ? '10%' : undefined,
        left: windowState === 'floating' ? '10%' : undefined,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, ...getAnimationProps() }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      className={\`absolute bg-[#202020] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden \${isActive ? 'z-[100]' : 'z-[50] opacity-90 shadow-none'} \${className} \${windowState !== 'floating' ? 'rounded-none border-0' : ''}\`}
    >
      <div 
        className={\`h-10 \${isActive ? 'bg-[#181818]' : 'bg-[#121212]'} flex items-center justify-between select-none px-4 shrink-0 border-b border-white/5 cursor-grab active:cursor-grabbing transition-colors\`}
        onDoubleClick={toggleMaximize}
        onPointerDown={startDrag}
        style={{ touchAction: 'none' }}
      >
        <div className={\`text-xs font-semibold \${isActive ? 'text-zinc-300' : 'text-zinc-500'} pointer-events-none z-10 relative\`}>{title}</div>
        <div className="flex items-center gap-1 z-10 relative">
          <button onClick={onGuide} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm" title="Guide">
            <span className="font-bold text-sm">E</span>
          </button>
          <button onClick={onMinimize} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm"><Minus size={16} /></button>
          <button onClick={toggleMaximize} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm">
            {windowState === 'maximized' ? <Copy size={14} /> : <Square size={14} />}
          </button>
          <button onClick={onClose} className="text-zinc-400 hover:bg-red-500 hover:text-white transition-colors p-1.5 rounded-sm" onPointerDown={e => e.stopPropagation()}><X size={16} /></button>
        </div>
      </div>
      <div className={\`flex-1 overflow-auto bg-[#202020] relative z-10 \${!isActive && 'pointer-events-none'}\`}>
        {isActive && !isDragging ? children : (
           <div className="w-full h-full relative">
              <div className="absolute inset-0 z-50 bg-transparent" />
              {children}
           </div>
        )}
      </div>
    </motion.div>
  );
};
`;

fs.writeFileSync('src/components/Window.tsx', code);
