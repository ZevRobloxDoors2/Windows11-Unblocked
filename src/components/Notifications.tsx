import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell, UserPlus, Info } from 'lucide-react';
import { UserProfile, FriendRequest } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';

interface NotificationsProps {
  key?: string;
  userProfile: UserProfile;
  onBack: () => void;
}

export function Notifications({ userProfile, onBack }: NotificationsProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Listen to friend requests
    const qReqs = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', userProfile.uid),
      where('status', '==', 'pending')
    );
    const unsubReqs = onSnapshot(qReqs, (snap) => {
      const data: FriendRequest[] = [];
      snap.forEach(d => {
        data.push({ id: d.id, ...d.data() } as FriendRequest);
      });
      setRequests(data);
    }, (err) => console.error(err));

    // Listen to system alerts
    const qAlerts = query(
      collection(db, 'systemAlerts'),
      where('toUid', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      const data: any[] = [];
      snap.forEach(d => {
        data.push({ id: d.id, ...d.data() });
      });
      setAlerts(data);
    }, (err) => console.error(err));

    return () => {
      unsubReqs();
      unsubAlerts();
    };
  }, [userProfile.uid]);

  const handleAction = async (reqId: string, action: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'friendRequests', reqId), { status: action });
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const markAlertRead = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'systemAlerts', alertId), { read: true });
    } catch(e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      for (const alert of alerts) {
        await deleteDoc(doc(db, 'systemAlerts', alert.id));
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-4xl mx-auto flex flex-col gap-8 pt-8 pb-12 h-full overflow-y-auto w-full">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2">
          <ChevronLeft size={24} />
        </button>
        <Bell size={28} className="text-zinc-100" />
        <h2 className="text-3xl font-black tracking-tight">Notifications</h2>
      </div>
      
      <div className="flex flex-col gap-6">
        {requests.length === 0 && alerts.length === 0 && (
          <div className="text-zinc-400 py-8 text-center flex flex-col items-center gap-3">
            <Bell size={48} className="opacity-20" />
            <p>You have no new notifications.</p>
          </div>
        )}

        {requests.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold text-zinc-300 uppercase tracking-wider text-sm mb-2">Friend Requests</h3>
            {requests.map(req => (
              <div key={req.id} className="bg-zinc-800/80 p-4 rounded-lg flex items-center justify-between border border-transparent hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-900 text-green-400 rounded-full flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-lg">{req.fromGamertag}</span>
                    <p className="text-zinc-400 text-sm">wants to be your friend</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req.id, 'accepted')} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md font-bold transition-colors">Accept</button>
                  <button onClick={() => handleAction(req.id, 'rejected')} className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-md font-bold transition-colors">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {alerts.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-zinc-300 uppercase tracking-wider text-sm">System Alerts</h3>
              <button onClick={handleClearAll} className="text-red-400 hover:text-red-300 text-sm font-bold bg-red-900/20 px-3 py-1 rounded-md transition-colors">Clear All</button>
            </div>
            {alerts.map(alert => (
              <div key={alert.id} className={`bg-zinc-800/80 p-4 rounded-lg flex items-start gap-4 border border-transparent hover:border-white/10 transition-colors ${!alert.read ? 'border-l-4 border-l-blue-500' : 'opacity-70'}`}>
                <div className="w-10 h-10 bg-blue-900/50 text-blue-400 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Info size={20} />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-lg">{alert.title}</span>
                  <p className="text-zinc-300 mt-1">{alert.message}</p>
                  <p className="text-zinc-500 text-xs mt-2">{alert.createdAt ? (alert.createdAt.toDate ? alert.createdAt.toDate().toLocaleString() : new Date(alert.createdAt).toLocaleString()) : 'Just now'}</p>
                </div>
                {!alert.read && (
                  <button onClick={() => markAlertRead(alert.id)} className="text-sm font-bold text-blue-400 hover:text-blue-300">Mark Read</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
