import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useVelocity, useTransform, useSpring, PanInfo } from 'motion/react';
import { X, Minus, Square, Copy } from 'lucide-react';

export const Window = ({ title, onClose, onMinimize, isActive = true, onFocus, children, className = '' }: { title: string, onClose: () => void, onMinimize?: () => void, isActive?: boolean, onFocus?: () => void, children: ReactNode, className?: string }) => {
  const [windowState, setWindowState] = useState<'floating' | 'maximized' | 'left' | 'right'>('floating');
  const windowRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const xVelocity = useVelocity(x);
  const yVelocity = useVelocity(y);
  
  const smoothVelocityX = useSpring(xVelocity, { damping: 50, stiffness: 400 });
  const smoothVelocityY = useSpring(yVelocity, { damping: 50, stiffness: 400 });
  
  // Wobble effect: mapping velocity to skew/rotate for a jelly feel
  const skewX = useTransform(smoothVelocityX, [-1000, 1000], [5, -5]);
  const skewY = useTransform(smoothVelocityY, [-1000, 1000], [-5, 5]);

  const toggleMaximize = () => {
    if (windowState === 'maximized') {
      setWindowState('floating');
    } else {
      setWindowState('maximized');
      x.set(0);
      y.set(0);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { point } = info;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    if (point.y < 20) {
      setWindowState('maximized');
      x.set(0); y.set(0);
    } else if (point.x < 20) {
      setWindowState('left');
      x.set(0); y.set(0);
    } else if (point.x > screenWidth - 20) {
      setWindowState('right');
      x.set(0); y.set(0);
    } else {
      if (windowState !== 'floating') {
        // If it was snapped and they drag it away, make it floating again
        setWindowState('floating');
        x.set(info.point.x - (window.innerWidth * 0.4)); // Approximation
        y.set(info.point.y - 20);
      }
    }
  };

  const getAnimationProps = () => {
    switch (windowState) {
      case 'maximized':
        return { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)' };
      case 'left':
        return { top: 0, left: 0, width: '50%', height: 'calc(100% - 48px)' };
      case 'right':
        return { top: 0, left: '50%', width: '50%', height: 'calc(100% - 48px)' };
      case 'floating':
      default:
        return { top: '10%', left: '10%', width: '80%', height: '75%' };
    }
  };

  return (
    <motion.div
      ref={windowRef}
      drag={windowState === 'floating'}
      dragMomentum={false}
      dragListener={false} // We will attach drag to the header only
      onMouseDownCapture={onFocus}
      style={{
        x,
        y,
        skewX: windowState === 'floating' ? skewX : 0,
        skewY: windowState === 'floating' ? skewY : 0,
        resize: windowState === 'floating' ? 'both' : 'none',
        minWidth: 300,
        minHeight: 200,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, ...getAnimationProps() }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      className={`absolute bg-[#202020] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden ${isActive ? 'z-[100]' : 'z-[50] opacity-90 shadow-none'} ${className} ${windowState !== 'floating' ? 'rounded-none border-0' : ''}`}
    >
      <div 
        className={`h-10 ${isActive ? 'bg-[#181818]' : 'bg-[#121212]'} flex items-center justify-between select-none px-4 shrink-0 border-b border-white/5 cursor-grab active:cursor-grabbing transition-colors`}
        onDoubleClick={toggleMaximize}
        style={{ touchAction: 'none' }}
      >
        {/* We use a separate drag control for the header */}
        <motion.div 
          className="absolute inset-0 right-32" 
          drag 
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          onDrag={(e, info) => {
            if (windowState !== 'floating') {
              setWindowState('floating');
              x.set(info.point.x - (windowRef.current?.offsetWidth || 800) / 2);
              y.set(info.point.y - 20);
            } else {
              x.set(x.get() + info.delta.x);
              y.set(y.get() + info.delta.y);
            }
          }}
        />
        
        <div className={`text-xs font-semibold ${isActive ? 'text-zinc-300' : 'text-zinc-500'} pointer-events-none z-10 relative`}>{title}</div>
        <div className="flex items-center gap-1 z-10 relative">
          <button className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm" title="Guide">
            <span className="font-bold text-sm">E</span>
          </button>
          <button onClick={onMinimize} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm"><Minus size={16} /></button>
          <button onClick={toggleMaximize} className="text-zinc-400 hover:bg-white/10 hover:text-white transition-colors p-1.5 rounded-sm">
            {windowState === 'maximized' ? <Copy size={14} /> : <Square size={14} />}
          </button>
          <button onClick={onClose} className="text-zinc-400 hover:bg-red-500 hover:text-white transition-colors p-1.5 rounded-sm"><X size={16} /></button>
        </div>
      </div>
      <div className={`flex-1 overflow-auto bg-[#202020] relative z-10 ${!isActive && 'pointer-events-none'}`}>
        {isActive ? children : (
           <div className="w-full h-full relative">
              <div className="absolute inset-0 z-50 bg-transparent" />
              {children}
           </div>
        )}
      </div>
    </motion.div>
  );
};
