import React, { ReactNode, useState, useRef } from 'react';
import { motion, useDragControls, useMotionValue, useVelocity, useSpring, useTransform } from 'motion/react';
import { X, Minus, Square, Copy, RefreshCw } from 'lucide-react';

export const Window = ({ title, onClose, onMinimize, onGuide, onReload, isActive = true, isMinimized = false, onFocus, children, className = '' }: { title: string, onClose: () => void, onMinimize?: () => void, onGuide?: () => void, onReload?: () => void, isActive?: boolean, isMinimized?: boolean, onFocus?: () => void, children: ReactNode, className?: string, key?: string | number }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [windowState, setWindowState] = useState<'floating' | 'maximized' | 'left' | 'right'>('floating');
  const windowRef = useRef<HTMLDivElement>(null);
  
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const xVelocity = useVelocity(x);
  const yVelocity = useVelocity(y);
  
  const smoothVelocityX = useSpring(xVelocity, { damping: 50, stiffness: 400 });
  const smoothVelocityY = useSpring(yVelocity, { damping: 50, stiffness: 400 });
  
  const skewX = useTransform(smoothVelocityX, [-1000, 1000], [5, -5]);
  const skewY = useTransform(smoothVelocityY, [-1000, 1000], [-5, 5]);

  const toggleMaximize = () => {
    if (windowState === 'maximized') {
      setWindowState('floating');
    } else {
      setWindowState('maximized');
      x.set(0); y.set(0);
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
      x.set(0); y.set(0);
    } else if (point.x < 20) {
      setWindowState('left');
      x.set(0); y.set(0);
    } else if (point.x > screenWidth - 20) {
      setWindowState('right');
      x.set(0); y.set(0);
    }
  };

  const startDrag = (e: any) => {
    if (windowState !== 'floating') {
       setWindowState('floating');
       x.set(0);
       y.set(0);
    }
    setIsDragging(true);
    dragControls.start(e);
  };

  const getAnimationProps = () => {
    if (isMinimized) return { opacity: 0, scale: 0.8, pointerEvents: 'none', y: 50 };
    const base = { opacity: 1, scale: 1, pointerEvents: 'auto' };
    switch (windowState) {
      case 'maximized':
        return { ...base, top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'left':
        return { ...base, top: 0, left: 0, width: '50%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'right':
        return { ...base, top: 0, left: '50%', width: '50%', height: 'calc(100% - 48px)', x: 0, y: 0 };
      case 'floating':
      default:
        // When floating, let drag control the x/y, but give it a default centered start
        return { ...base, width: '80%', height: '75%' };
    }
  };

  const isHalloween = localStorage.getItem('halloween_theme') === 'true';

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
        x,
        y,
        skewX: windowState === 'floating' ? skewX : 0,
        skewY: windowState === 'floating' ? skewY : 0,
        resize: windowState === 'floating' ? 'both' : 'none',
        minWidth: 300,
        minHeight: 200,
        top: windowState === 'floating' ? '10%' : undefined,
        left: windowState === 'floating' ? '10%' : undefined,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={getAnimationProps()}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      className={`absolute pointer-events-auto ${isHalloween ? 'bg-[#140b04] border border-orange-500/50 shadow-[0_0_30px_rgba(255,107,0,0.3)]' : 'bg-[#202020] border border-white/10'} rounded-lg shadow-2xl flex flex-col overflow-hidden ${isActive ? 'z-[100]' : 'z-[50] opacity-90 shadow-none'} ${className} ${windowState !== 'floating' ? 'rounded-none border-0' : ''}`}
    >
      <div 
        className={`h-10 ${isHalloween ? (isActive ? 'bg-[#260f02]' : 'bg-[#180901]') : (isActive ? 'bg-[#181818]' : 'bg-[#121212]')} flex items-center justify-between select-none px-4 shrink-0 border-b ${isHalloween ? 'border-orange-500/20' : 'border-white/5'} cursor-grab active:cursor-grabbing transition-colors`}
        onDoubleClick={toggleMaximize}
        onPointerDown={startDrag}
        style={{ touchAction: 'none' }}
      >
        <div className={`text-xs font-semibold flex items-center gap-2 ${isHalloween ? 'text-orange-300' : (isActive ? 'text-zinc-300' : 'text-zinc-500')} pointer-events-none z-10 relative`}>
          {isHalloween && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff7518" stroke="#2b1100" strokeWidth="1.5" className="animate-pulse">
              <ellipse cx="12" cy="13" rx="8" ry="7" />
              <path d="M12 4v3" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" fill="none" />
              <polygon points="8,10 10,12 7,13" fill="#ffeb3b" />
              <polygon points="16,10 17,13 14,12" fill="#ffeb3b" />
            </svg>
          )}
          {title}
        </div>
        <div className="flex items-center gap-1 z-10 relative">
          {onReload && (
            <button onClick={onReload} onPointerDown={e => e.stopPropagation()} className={`${isHalloween ? 'text-orange-400 hover:bg-orange-500/20 hover:text-orange-200' : 'text-zinc-400 hover:bg-white/10 hover:text-white'} transition-colors p-1.5 rounded-sm`} title="Reload">
              <RefreshCw size={14} />
            </button>
          )}
          <button onClick={onGuide} onPointerDown={e => e.stopPropagation()} className={`${isHalloween ? 'text-orange-400 hover:bg-orange-500/20 hover:text-orange-200' : 'text-zinc-400 hover:bg-white/10 hover:text-white'} transition-colors p-1.5 rounded-sm`} title="Guide">
            <span className="font-bold text-sm">E</span>
          </button>
          <button onClick={onMinimize} onPointerDown={e => e.stopPropagation()} className={`${isHalloween ? 'text-orange-400 hover:bg-orange-500/20 hover:text-orange-200' : 'text-zinc-400 hover:bg-white/10 hover:text-white'} transition-colors p-1.5 rounded-sm`}><Minus size={16} /></button>
          <button onClick={toggleMaximize} onPointerDown={e => e.stopPropagation()} className={`${isHalloween ? 'text-orange-400 hover:bg-orange-500/20 hover:text-orange-200' : 'text-zinc-400 hover:bg-white/10 hover:text-white'} transition-colors p-1.5 rounded-sm`}>
            {windowState === 'maximized' ? <Copy size={14} /> : <Square size={14} />}
          </button>
          <button onClick={onClose} className={`${isHalloween ? 'text-orange-400 hover:bg-red-600 hover:text-white' : 'text-zinc-400 hover:bg-red-500 hover:text-white'} transition-colors p-1.5 rounded-sm`} onPointerDown={e => e.stopPropagation()}><X size={16} /></button>
        </div>
      </div>
      <div className={`flex-1 overflow-auto ${isHalloween ? 'bg-[#140b04]' : 'bg-[#202020]'} relative z-10 ${!isActive && 'pointer-events-none'}`}>
        <div className="w-full h-full relative">
          {(!isActive || isDragging) && <div className="absolute inset-0 z-50 bg-transparent" />}
          {children}
        </div>
      </div>
    </motion.div>
  );
};
