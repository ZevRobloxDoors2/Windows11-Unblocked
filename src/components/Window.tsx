import React, { ReactNode, useState, useRef } from 'react';
import { motion, useDragControls, useMotionValue, useVelocity, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { X, Minus, Square, Copy, RefreshCw } from 'lucide-react';

export type WindowSnapState = 
  | 'floating' 
  | 'maximized' 
  | 'left' 
  | 'right' 
  | 'left-wide' 
  | 'right-narrow' 
  | 'col-1' 
  | 'col-2' 
  | 'col-3' 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right';

export const Window = ({ 
  title, 
  onClose, 
  onMinimize, 
  onGuide, 
  onReload, 
  extraHeaderButton, 
  isActive = true, 
  isMinimized = false, 
  onFocus, 
  children, 
  className = '' 
}: { 
  title: string; 
  onClose: () => void; 
  onMinimize?: () => void; 
  onGuide?: () => void; 
  onReload?: () => void; 
  extraHeaderButton?: ReactNode; 
  isActive?: boolean; 
  isMinimized?: boolean; 
  onFocus?: () => void; 
  children: ReactNode; 
  className?: string; 
  key?: string | number; 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [windowState, setWindowState] = useState<WindowSnapState>('floating');
  const [showSnapFlyout, setShowSnapFlyout] = useState(false);
  const snapTimeoutRef = useRef<any>(null);
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
      x.set(0); 
      y.set(0);
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    setIsDragging(false);
    const { point } = info;
    const screenWidth = window.innerWidth;
    
    // Windows 11 edge snapping
    if (point.y < 16) {
      setWindowState('maximized');
      x.set(0); y.set(0);
    } else if (point.x < 16) {
      setWindowState('left');
      x.set(0); y.set(0);
    } else if (point.x > screenWidth - 16) {
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

  const handleSnapSelect = (snap: WindowSnapState) => {
    setWindowState(snap);
    x.set(0);
    y.set(0);
    setShowSnapFlyout(false);
  };

  const getAnimationProps = () => {
    if (isMinimized) return { opacity: 0, scale: 0.8, pointerEvents: 'none', y: 50 };
    const base = { opacity: 1, scale: 1, pointerEvents: 'auto' };
    const taskbarHeight = 48;
    const heightCalc = `calc(100% - ${taskbarHeight}px)`;

    switch (windowState) {
      case 'maximized':
        return { ...base, top: 0, left: 0, width: '100%', height: heightCalc, x: 0, y: 0 };
      case 'left':
        return { ...base, top: 0, left: 0, width: '50%', height: heightCalc, x: 0, y: 0 };
      case 'right':
        return { ...base, top: 0, left: '50%', width: '50%', height: heightCalc, x: 0, y: 0 };
      case 'left-wide':
        return { ...base, top: 0, left: 0, width: '66.6%', height: heightCalc, x: 0, y: 0 };
      case 'right-narrow':
        return { ...base, top: 0, left: '66.6%', width: '33.4%', height: heightCalc, x: 0, y: 0 };
      case 'col-1':
        return { ...base, top: 0, left: 0, width: '33.33%', height: heightCalc, x: 0, y: 0 };
      case 'col-2':
        return { ...base, top: 0, left: '33.33%', width: '33.34%', height: heightCalc, x: 0, y: 0 };
      case 'col-3':
        return { ...base, top: 0, left: '66.67%', width: '33.33%', height: heightCalc, x: 0, y: 0 };
      case 'top-left':
        return { ...base, top: 0, left: 0, width: '50%', height: `calc((100% - ${taskbarHeight}px) / 2)`, x: 0, y: 0 };
      case 'top-right':
        return { ...base, top: 0, left: '50%', width: '50%', height: `calc((100% - ${taskbarHeight}px) / 2)`, x: 0, y: 0 };
      case 'bottom-left':
        return { ...base, top: `calc((100% - ${taskbarHeight}px) / 2)`, left: 0, width: '50%', height: `calc((100% - ${taskbarHeight}px) / 2)`, x: 0, y: 0 };
      case 'bottom-right':
        return { ...base, top: `calc((100% - ${taskbarHeight}px) / 2)`, left: '50%', width: '50%', height: `calc((100% - ${taskbarHeight}px) / 2)`, x: 0, y: 0 };
      case 'floating':
      default:
        return { ...base, width: '80%', height: '75%' };
    }
  };

  const isHalloween = localStorage.getItem('halloween_theme') === 'true';
  const isMaximized = windowState === 'maximized';
  const isSnapped = windowState !== 'floating';

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
        skewX: (localStorage.getItem('wobbly_window') !== 'false') && windowState === 'floating' ? skewX : 0,
        skewY: (localStorage.getItem('wobbly_window') !== 'false') && windowState === 'floating' ? skewY : 0,
        resize: windowState === 'floating' ? 'both' : 'none',
        minWidth: 320,
        minHeight: 220,
        top: windowState === 'floating' ? '8%' : undefined,
        left: windowState === 'floating' ? '10%' : undefined,
      }}
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={getAnimationProps()}
      exit={{ opacity: 0, scale: 0.92, y: 24 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className={`absolute pointer-events-auto flex flex-col overflow-hidden transition-shadow ${
        isHalloween 
          ? 'bg-[#140b04] border border-orange-500/50 shadow-[0_0_35px_rgba(255,107,0,0.35)]' 
          : isActive 
            ? 'bg-[#202020]/95 backdrop-blur-2xl border border-white/[0.14] shadow-[0_24px_64px_rgba(0,0,0,0.65),0_0_1px_rgba(255,255,255,0.2)]' 
            : 'bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.4)] opacity-95'
      } ${isSnapped ? 'rounded-none border-0' : 'rounded-xl'} ${isActive ? 'z-[100]' : 'z-[50]'} ${className}`}
    >
      {/* Windows 11 Titlebar */}
      <div 
        className={`h-9 flex items-center justify-between select-none px-3 shrink-0 border-b transition-colors cursor-grab active:cursor-grabbing ${
          isHalloween 
            ? (isActive ? 'bg-[#260f02] border-orange-500/20' : 'bg-[#180901] border-orange-500/10') 
            : (isActive ? 'bg-[#1c1c1c]/90 border-white/[0.06]' : 'bg-[#161616]/80 border-transparent')
        }`}
        onDoubleClick={toggleMaximize}
        onPointerDown={startDrag}
        style={{ touchAction: 'none' }}
      >
        {/* Title & App Icon */}
        <div className={`text-xs font-medium flex items-center gap-2.5 pointer-events-none z-10 relative truncate max-w-[60%] ${
          isHalloween ? 'text-orange-300' : (isActive ? 'text-zinc-200' : 'text-zinc-500')
        }`}>
          {isHalloween ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#ff7518" stroke="#2b1100" strokeWidth="1.5" className="animate-pulse shrink-0">
              <ellipse cx="12" cy="13" rx="8" ry="7" />
              <path d="M12 4v3" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" fill="none" />
              <polygon points="8,10 10,12 7,13" fill="#ffeb3b" />
              <polygon points="16,10 17,13 14,12" fill="#ffeb3b" />
            </svg>
          ) : (
            <div className="w-3.5 h-3.5 rounded bg-blue-500/30 border border-blue-400/40 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-sm" />
            </div>
          )}
          <span className="truncate">{title}</span>
        </div>

        {/* Windows 11 Caption Buttons */}
        <div className="flex items-center gap-1 z-10 relative">
          {extraHeaderButton}
          
          {onReload && (
            <button 
              onClick={onReload} 
              onPointerDown={e => e.stopPropagation()} 
              className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors`} 
              title="Reload"
            >
              <RefreshCw size={13} />
            </button>
          )}

          {onGuide && (
            <button 
              onClick={onGuide} 
              onPointerDown={e => e.stopPropagation()} 
              className={`px-2 py-0.5 rounded text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors`} 
              title="Guide"
            >
              Guide
            </button>
          )}

          {/* Minimize Button */}
          <button 
            onClick={onMinimize} 
            onPointerDown={e => e.stopPropagation()} 
            className="w-10 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.05] transition-colors"
            title="Minimize"
          >
            <Minus size={14} />
          </button>

          {/* Maximize / Restore Button with Windows 11 Snap Layouts Flyout */}
          <div 
            className="relative"
            onMouseEnter={() => {
              if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
              snapTimeoutRef.current = setTimeout(() => setShowSnapFlyout(true), 250);
            }}
            onMouseLeave={() => {
              if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
              snapTimeoutRef.current = setTimeout(() => setShowSnapFlyout(false), 300);
            }}
          >
            <button 
              onClick={toggleMaximize} 
              onPointerDown={e => e.stopPropagation()} 
              className="w-10 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.05] transition-colors"
              title={isMaximized ? "Restore down" : "Maximize"}
            >
              {isMaximized || isSnapped ? <Copy size={13} /> : <Square size={13} />}
            </button>

            {/* Windows 11 Snap Layouts Flyout */}
            <AnimatePresence>
              {showSnapFlyout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-1.5 p-3 bg-[#242424]/95 backdrop-blur-2xl border border-white/[0.14] rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.6)] z-[500] flex gap-3 text-white cursor-default"
                  onPointerDown={e => e.stopPropagation()}
                >
                  {/* Layout 1: 50 / 50 Split */}
                  <div className="flex flex-col gap-1 items-center">
                    <div className="w-16 h-12 bg-zinc-800 border border-white/20 rounded-md p-1 flex gap-1">
                      <div 
                        onClick={() => handleSnapSelect('left')} 
                        className="flex-1 bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Snap Left (50%)"
                      />
                      <div 
                        onClick={() => handleSnapSelect('right')} 
                        className="flex-1 bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Snap Right (50%)"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400">1/2 Split</span>
                  </div>

                  {/* Layout 2: 2:1 Split (Wide / Narrow) */}
                  <div className="flex flex-col gap-1 items-center">
                    <div className="w-16 h-12 bg-zinc-800 border border-white/20 rounded-md p-1 flex gap-1">
                      <div 
                        onClick={() => handleSnapSelect('left-wide')} 
                        className="w-2/3 bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Snap Left Wide (66%)"
                      />
                      <div 
                        onClick={() => handleSnapSelect('right-narrow')} 
                        className="w-1/3 bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Snap Right Narrow (33%)"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400">2:1 Split</span>
                  </div>

                  {/* Layout 3: 3 Columns */}
                  <div className="flex flex-col gap-1 items-center">
                    <div className="w-16 h-12 bg-zinc-800 border border-white/20 rounded-md p-1 flex gap-1">
                      <div 
                        onClick={() => handleSnapSelect('col-1')} 
                        className="flex-1 bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Left Column"
                      />
                      <div 
                        onClick={() => handleSnapSelect('col-2')} 
                        className="flex-1 bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Center Column"
                      />
                      <div 
                        onClick={() => handleSnapSelect('col-3')} 
                        className="flex-1 bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Right Column"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400">3 Column</span>
                  </div>

                  {/* Layout 4: 4 Quadrants */}
                  <div className="flex flex-col gap-1 items-center">
                    <div className="w-16 h-12 bg-zinc-800 border border-white/20 rounded-md p-1 grid grid-cols-2 grid-rows-2 gap-1">
                      <div 
                        onClick={() => handleSnapSelect('top-left')} 
                        className="bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Top-Left"
                      />
                      <div 
                        onClick={() => handleSnapSelect('top-right')} 
                        className="bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Top-Right"
                      />
                      <div 
                        onClick={() => handleSnapSelect('bottom-left')} 
                        className="bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Bottom-Left"
                      />
                      <div 
                        onClick={() => handleSnapSelect('bottom-right')} 
                        className="bg-zinc-700/60 hover:bg-[#0078D4] transition-colors rounded-sm cursor-pointer"
                        title="Bottom-Right"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400">4 Grid</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Close Button: Authentic Windows 11 Red Hover */}
          <button 
            onClick={onClose} 
            onPointerDown={e => e.stopPropagation()} 
            className="w-10 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-[#c42b1c] active:bg-[#b82415] transition-colors"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      <div className={`flex-1 overflow-auto relative z-10 ${isHalloween ? 'bg-[#140b04]' : 'bg-[#1f1f1f]'} ${!isActive ? 'pointer-events-none' : ''}`}>
        <div className="w-full h-full relative">
          {(!isActive || isDragging) && <div className="absolute inset-0 z-50 bg-transparent" />}
          {children}
        </div>
      </div>
    </motion.div>
  );
};
export default Window;
