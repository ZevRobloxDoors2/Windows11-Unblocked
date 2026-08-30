import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

interface GlobalNotificationsProps {
  profile: UserProfile | null;
  playingGame: boolean;
  activeChatId?: string | null;
  onNavigateToChat: (chatId: string, isGroup: boolean, name: string) => void;
  onNavigateToParty: (partyId: string) => void;
}

export function GlobalNotifications({ profile, playingGame, activeChatId, onNavigateToChat, onNavigateToParty }: GlobalNotificationsProps) {
  useEffect(() => { if (Notification.permission === 'default') { Notification.requestPermission(); } }, []);
  const [activeToasts, setActiveToasts] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'notifications'), where('toUid', '==', profile.uid), where('read', '==', false));
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const notifId = change.doc.id;
          
          const muteAll = localStorage.getItem('mute_notifications') === 'true';
          const dnd = localStorage.getItem('not_disturb') === 'true';
          
          if (muteAll) return;
          if (dnd && playingGame) return;
          
          if (data.type === 'message') {
            if (data.isGroup && (Date.now() - (data.createdAt?.toMillis() || Date.now()) > 10000)) {
               return;
            }
            if (data.chatId === activeChatId || data.fromUid === activeChatId) {
               updateDoc(doc(db, 'notifications', notifId), { read: true }).catch(() => {});
               return;
            }
          }

          setActiveToasts(prev => [...prev, { id: notifId, ...data }]);
          
          if (Notification.permission === 'granted') {
            const title = data.type === 'message' ? (data.isGroup ? `New message in ${data.chatName}` : `New message from ${data.fromGamertag}`) : `Party Invite from ${data.fromGamertag}`;
            const body = data.type === 'message' ? 'Click to open chat' : 'Click to join party';
            new Notification(title, { body });
          }
          
          setTimeout(() => {
            setActiveToasts(prev => prev.filter(t => t.id !== notifId));
          }, 6000);
        }
      });
    });
    return () => unsub();
  }, [profile, playingGame]);

  const handleToastClick = async (toast: any) => {
    try {
      await updateDoc(doc(db, 'notifications', toast.id), { read: true });
    } catch(e) {}
    
    setActiveToasts(prev => prev.filter(t => t.id !== toast.id));

    if (toast.type === 'message') {
      onNavigateToChat(toast.chatId || toast.fromUid, !!toast.isGroup, toast.chatName || toast.fromGamertag);
    } else if (toast.type === 'party_invite') {
      onNavigateToParty(toast.partyId);
    }
  };

  return (
    <div className="fixed bottom-16 right-4 z-[500] flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            className="pointer-events-auto bg-[#242424]/95 backdrop-blur-2xl border border-white/10 w-80 px-4 py-3 rounded-lg shadow-2xl cursor-pointer hover:bg-white/10 transition-colors flex gap-3 relative overflow-hidden group"
            onClick={() => handleToastClick(toast)}
          >
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex justify-between">
                <span>{toast.type === 'message' ? 'Message' : 'Party Invite'}</span>
              </div>
              <div className="text-sm text-white font-medium">
                {toast.type === 'message' 
                  ? (toast.isGroup ? `${toast.fromGamertag} messaged the group ${toast.chatName}` : `${toast.fromGamertag} has messaged you`) 
                  : `${toast.fromGamertag} has invited you to a Party`}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {toast.type === 'message' ? 'Click to reply' : 'Click to join party'}
              </div>
            </div>
            <button 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white/10 hover:bg-red-500 rounded transition-all text-white"
              onClick={(e) => {
                e.stopPropagation();
                setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                updateDoc(doc(db, 'notifications', toast.id), { read: true }).catch(() => {});
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
