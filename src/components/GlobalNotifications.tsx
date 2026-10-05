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
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    if (!profile || profile.uid === 'guest') return;
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

          if (data.type === 'incoming_call') {
            setIncomingCall({ id: notifId, ...data });
            if (Notification.permission === 'granted') {
              new Notification(`Incoming Call from ${data.fromGamertag}`, { body: 'Click to answer 1-on-1 voice call' });
            }
            return;
          }
          
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

  const isHalloween = localStorage.getItem('halloween_theme') === 'true';

  return (
    <>
      {/* Incoming Call Modal */}
      <AnimatePresence>
        {incomingCall && (
          <div className="fixed inset-0 z-[2500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`${isHalloween ? 'bg-[#1c0c03] border-orange-500/50 shadow-[0_0_40px_rgba(255,107,0,0.4)]' : 'bg-zinc-900 border-white/25 shadow-2xl'} border p-8 rounded-3xl flex flex-col items-center gap-6 max-w-sm w-full relative overflow-hidden`}
            >
              <div className={`absolute top-0 inset-x-0 h-1.5 ${isHalloween ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500' : 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-500'} animate-pulse`} />
              
              <div className="relative">
                {incomingCall.fromAvatar ? (
                  <img src={incomingCall.fromAvatar} alt={incomingCall.fromGamertag} className={`w-24 h-24 rounded-full object-cover border-4 ${isHalloween ? 'border-orange-500/60 shadow-[0_0_25px_rgba(255,107,0,0.5)]' : 'border-green-500/60 shadow-[0_0_25px_rgba(34,197,94,0.5)]'}`} />
                ) : (
                  <div className={`w-24 h-24 rounded-full bg-zinc-800 border-4 ${isHalloween ? 'border-orange-500/60' : 'border-green-500/60'} flex items-center justify-center text-zinc-300 text-3xl font-bold`}>
                    {incomingCall.fromGamertag?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`absolute -inset-2 rounded-full border ${isHalloween ? 'border-orange-500' : 'border-green-500'} animate-ping opacity-75 pointer-events-none`} />
              </div>

              <div className="flex flex-col items-center text-center">
                <span className={`text-xs uppercase tracking-widest font-bold mb-1 ${isHalloween ? 'text-orange-400' : 'text-green-400'}`}>Incoming 1-on-1 Call</span>
                <h3 className="text-2xl font-bold text-white">{incomingCall.fromGamertag}</h3>
                <p className="text-xs text-zinc-400 mt-1">Calling you in private voice room...</p>
              </div>

              <div className="flex items-center gap-8 w-full justify-center mt-2">
                <button 
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, 'notifications', incomingCall.id), { read: true });
                    } catch(e) {}
                    const callId = incomingCall.callId;
                    setIncomingCall(null);
                    onNavigateToParty(callId);
                  }}
                  className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-900/60 hover:scale-110 transition-transform"
                  title="Accept Call"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, 'notifications', incomingCall.id), { read: true });
                    } catch(e) {}
                    setIncomingCall(null);
                  }}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-900/60 hover:scale-110 transition-transform"
                  title="Decline Call"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standard Notification Toasts */}
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
    </>
  );
}
