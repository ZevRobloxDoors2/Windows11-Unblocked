import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AppIframeProps {
  src: string;
  isActive: boolean;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  reloadTrigger: number;
  fallbackSrc?: string;
}

export const AppIframe: React.FC<AppIframeProps> = ({ src, isActive, onLoadStart, onLoadEnd, reloadTrigger, fallbackSrc }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [showError, setShowError] = useState(false);
  const [hasUsedFallback, setHasUsedFallback] = useState(false);
  
  const isProxied = src.includes('/service/') || src.includes('error404.n43.pw') || src.includes('scramjet') || src.includes('n43.pw') || src.includes('?q=');
  const [showProxyWarning, setShowProxyWarning] = useState(isProxied);
  const [showContinue, setShowContinue] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (showProxyWarning) {
      const timer = setTimeout(() => {
        setShowContinue(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showProxyWarning]);

  useEffect(() => {
    if (reloadTrigger > 0) {
      setCurrentSrc('');
      setShowError(false);
      setHasUsedFallback(false);
      onLoadStart();
      setTimeout(() => {
        setCurrentSrc(src);
      }, 150);
    }
  }, [reloadTrigger, src]);

  const triggerError = () => {
    if (fallbackSrc && !hasUsedFallback) {
      setHasUsedFallback(true);
      setCurrentSrc(fallbackSrc);
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleLoad = () => {
    if (isActive) onLoadEnd();
    
    try {
      const iframeWindow = iframeRef.current?.contentWindow;
      const iframeDoc = iframeRef.current?.contentDocument || iframeWindow?.document;
      
      if (iframeDoc) {
        // Detect white screen
        if (iframeDoc.body && iframeDoc.body.scrollHeight === 0 && iframeDoc.body.childNodes.length === 0) {
           triggerError();
        }
        
        // Listen for network errors inside the iframe
        if (iframeWindow) {
           iframeWindow.onerror = (msg, url, lineNo, columnNo, error) => {
               triggerError();
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
        {showProxyWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm text-white p-6 text-center"
          >
            <div className="max-w-md">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-[#00A4EF] rounded-full animate-spin mx-auto mb-6" />
              <p className="text-lg font-medium mb-2 leading-relaxed">
                Wait for 10 secs, if it doesn't load, go to Google Chrome in this website then search up the app you're in.
              </p>
              <p className="text-zinc-400 mb-8 text-sm">
                The Darden team is trying to fix this.
              </p>
              
              {showContinue && (
                <div className="flex gap-3 justify-center">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setShowProxyWarning(false)}
                    className="px-6 py-2.5 bg-[#00A4EF] hover:bg-[#008AC9] text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Continue
                  </motion.button>
                  <button
                    onClick={() => window.open(currentSrc, '_blank')}
                    className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Open in New Tab
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      
        {showError && !showProxyWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#202020] text-white p-6 text-center"
          >
            <div>
              <p className="text-xl font-bold mb-4 text-red-400">Proxy blocked or taking too long.</p>
              <p className="text-zinc-400 mb-6">Some proxy servers block embedding inside iframes. Open this proxy URL directly in a new tab to bypass restrictions.</p>
              <div className="flex gap-3 justify-center mb-4">
                <button
                  onClick={() => window.open(currentSrc, '_blank')}
                  className="px-6 py-2.5 bg-[#00A4EF] hover:bg-[#008AC9] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Open Proxy in New Tab
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-4 max-w-sm mx-auto">
                (If this keeps happening, switch to n43.pw in Settings)
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
          onError={() => triggerError()}
        />
      )}
    </div>
  );
};
