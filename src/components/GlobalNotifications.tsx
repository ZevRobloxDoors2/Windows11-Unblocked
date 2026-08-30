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
          
          // Don't toast if we're actively looking at this chat
          // Prevent spam: only toast new group chat messages or unread DMs
          if (data.type === 'message') {
            if (data.isGroup && (Date.now() - (data.createdAt?.toMillis() || Date.now()) > 10000)) {
               // Ignore old group chat messages when opening app
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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto bg-zinc-900 border border-zinc-700 px-6 py-3 rounded-lg shadow-2xl cursor-pointer hover:bg-zinc-800 transition-colors flex items-center gap-3"
            onClick={() => handleToastClick(toast)}
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-white font-semibold text-sm sm:text-base">
              {toast.type === 'message' 
                ? (toast.isGroup ? `${toast.fromGamertag} messaged the group ${toast.chatName}` : `${toast.fromGamertag} has messaged you`) 
                : `${toast.fromGamertag} has invited you to a Party`}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
