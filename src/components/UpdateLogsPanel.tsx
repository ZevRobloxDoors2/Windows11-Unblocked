import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { UPDATE_LOGS } from '../data/updateLogs';

export const UpdateLogsPanel: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    return localStorage.getItem('ebox_updatelogs_minimized') === 'true';
  });

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isMinimized;
    setIsMinimized(next);
    localStorage.setItem('ebox_updatelogs_minimized', String(next));
  };

  // Helper to parse **bold** markdown syntax in items
  const renderFormattedItem = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-white">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div 
      className="z-20 bg-black/40 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl p-5 w-80 text-white flex flex-col cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/10 cursor-pointer" onClick={toggleMinimize}>
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-blue-400" />
          <h2 className="text-lg font-bold tracking-wide">Update Logs</h2>
        </div>
        <button 
          onClick={toggleMinimize}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
          title={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="max-h-[280px] overflow-y-auto pr-2 mt-4 flex flex-col gap-4 custom-scrollbar">
              {UPDATE_LOGS.map((log, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <h3 className="text-blue-400 font-bold text-base tracking-wide">
                    {log.version}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-300 leading-relaxed">
                    {log.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        {renderFormattedItem(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
