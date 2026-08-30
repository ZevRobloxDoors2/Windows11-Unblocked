import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Gamepad2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function ActivityFeed() {
  const [showWarning, setShowWarning] = useState(!localStorage.getItem('beta_warning_seen'));
  const [warningTimer, setWarningTimer] = useState(10);
  useEffect(() => {
    if (!showWarning) return;
    if (warningTimer > 0) {
      const t = setTimeout(() => setWarningTimer(warningTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [showWarning, warningTimer]);
  const dismissWarning = () => { localStorage.setItem('beta_warning_seen', 'true'); setShowWarning(false); };
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pt-8 pb-12">
      <h2 className="text-2xl font-bold mb-4">Who's Playing Today (Activity)</h2>
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-red-900/20 border-2 border-red-500 rounded-xl p-8 max-w-2xl text-center shadow-2xl">
              <h1 className="text-4xl font-black text-red-500 mb-4">READ ME, WARNING!!</h1>
              <p className="text-xl font-bold mb-6 text-white leading-relaxed">
                This is a Educational Website, This website is in BETA! Some games/apps won't work.<br/><br/>
                DO NOT SHARE WITH OTHERS UNTIL BETA IS OVER, IF YOU ARE CAUGHT SHARING WITH OTHERS YOU WILL BE REMOVED FROM THIS WEBSITE FOREVER!!!<br/><br/>
                You are a tester for now....
              </p>
              {warningTimer > 0 ? (
                <div className="py-3 text-red-400 font-bold">
                  You can close this in {warningTimer} seconds...
                </div>
              ) : (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={dismissWarning} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md transition-colors">
                  I Understand
                </motion.button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {activities.length === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-center py-12">
               No recent activity.
             </motion.div>
          )}
          {activities.map(a => (
            <motion.div 
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 p-4 rounded-xl flex items-center gap-4"
            >
              <img src={a.avatar || `https://picsum.photos/seed/${a.gamertag}/50/50`} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{a.gamertag}</p>
                <p className="text-zinc-400 text-sm">{a.details}</p>
              </div>
              <div>
                {a.type === 'trophy' && <Trophy className="text-yellow-500" size={24} />}
                {a.type === 'party' && <Users className="text-blue-500" size={24} />}
                {a.type === 'game' && <Gamepad2 className="text-green-500" size={24} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
