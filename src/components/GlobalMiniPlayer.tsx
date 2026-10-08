import React from 'react';
import { Play, Pause, Maximize2, X, Film, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface GlobalMiniPlayerProps {
  media: {
    appId: string;
    title: string;
    subtitle: string;
    artwork?: string;
    item?: any;
    track?: any;
  };
  onExpand: (appId: string, mediaData: any) => void;
  onClose: () => void;
}

export const GlobalMiniPlayer: React.FC<GlobalMiniPlayerProps> = ({ media, onExpand, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-6 right-6 z-[9999] w-80 bg-[#12121a]/85 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col p-3 text-white"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          {media.appId === 'WinFlix' ? <Film size={14} /> : <Music size={14} />}
          <span>{media.appId} Miniplayer</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onExpand(media.appId, media)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
            title="Expand to Full Player"
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-red-400 transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
        {media.artwork ? (
          <img src={media.artwork} alt={media.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
        ) : media.item?.poster_path ? (
          <img src={`https://image.tmdb.org/t/p/w200${media.item.poster_path}`} alt={media.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-300 font-bold">
            {media.appId === 'WinFlix' ? '🎬' : '🎵'}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold truncate text-zinc-100">{media.title}</h4>
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{media.subtitle}</p>
        </div>

        <button
          onClick={() => onExpand(media.appId, media)}
          className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          title="Restore / Play"
        >
          <Play size={16} fill="currentColor" />
        </button>
      </div>
    </motion.div>
  );
};
