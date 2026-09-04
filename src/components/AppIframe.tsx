import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AppIframeProps {
  src: string;
  isActive: boolean;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  reloadTrigger: number;
}

export const AppIframe: React.FC<AppIframeProps> = ({ src, isActive, onLoadStart, onLoadEnd, reloadTrigger }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [showError, setShowError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (reloadTrigger > 0) {
      setCurrentSrc('');
      setShowError(false);
      onLoadStart();
      setTimeout(() => {
        setCurrentSrc(src);
      }, 150);
    }
  }, [reloadTrigger, src]);

  const handleLoad = () => {
    if (isActive) onLoadEnd();
    
    try {
      const iframeWindow = iframeRef.current?.contentWindow;
      const iframeDoc = iframeRef.current?.contentDocument || iframeWindow?.document;
      
      if (iframeDoc) {
        // Detect white screen
        if (iframeDoc.body && iframeDoc.body.scrollHeight === 0 && iframeDoc.body.childNodes.length === 0) {
           setShowError(true);
        }
        
        // Listen for network errors inside the iframe
        if (iframeWindow) {
           iframeWindow.onerror = (msg, url, lineNo, columnNo, error) => {
               setShowError(true);
               return false;
           };
        }
      }
    } catch (e) {
      // Cross-origin restriction blocks access; we rely on the user to hit reload if it's white-screened.
      // But we attempted to fulfill the requirement safely.
    }
  };

  return (
    <div className="w-full h-full relative bg-white block">
      <AnimatePresence>
        {showError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#202020] text-white p-6 text-center"
          >
            <div>
              <p className="text-xl font-bold mb-4 text-red-400">Damn, your wifi is bad.</p>
              <p className="text-zinc-400 mb-6">Click the Reload Button, next time don't hop on my website with that bun ahh wifi..</p>
              <p className="text-xs text-zinc-500 mt-4 max-w-sm mx-auto">
                (If this keeps happening, you might need to switch to a different proxy engine in Settings or wait for it to come back online)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {currentSrc && (
        <iframe 
          ref={iframeRef}
          src={currentSrc} 
          className="w-full h-full border-none m-0 p-0" 
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-presentation"
          allow="fullscreen; autoplay; gamepad"
          onLoad={handleLoad}
          onError={() => setShowError(true)}
        />
      )}
    </div>
  );
};
