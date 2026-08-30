import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface ProfileProps {
  key?: string;
  userProfile: UserProfile;
  onBack: () => void;
}

export function Profile({ userProfile, onBack }: ProfileProps) {
  const [gamertag, setGamertag] = useState(userProfile.gamertag);
  const [status, setStatus] = useState(userProfile.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!gamertag.trim() || gamertag.length > 30) {
      alert("Gamertag must be between 1 and 30 characters.");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), {
        gamertag: gamertag.trim(),
        gamertagLower: gamertag.trim().toLowerCase(),
        status
      });
      alert("Profile updated successfully!");
    } catch (e: any) {
      console.error(e);
      alert("Failed to update profile: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto flex flex-col gap-8 pt-8 px-12 pb-12 h-full overflow-y-auto w-full">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-3xl font-black">Customize Profile</h2>
      </div>
      <div className="bg-zinc-900/80 border border-transparent hover:border-white/10 rounded-xl p-8 flex flex-col md:flex-row gap-8 transition-colors">
        <div className="flex flex-col gap-4 items-center">
          <img src={userProfile.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-[#101010] shadow-xl" alt="Avatar" />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Gamertag</label>
            <input 
              type="text" 
              value={gamertag}
              onChange={(e) => setGamertag(e.target.value)}
              className="w-full bg-zinc-800 border border-transparent hover:border-zinc-600 rounded-md px-4 py-3 font-bold focus:outline-none focus:border-green-500 focus:bg-zinc-900 transition-colors text-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Online Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-zinc-800 border border-transparent hover:border-zinc-600 rounded-md px-4 py-3 font-bold focus:outline-none focus:border-green-500 focus:bg-zinc-900 transition-colors text-lg text-white appearance-none"
            >
              <option>Online</option>
              <option>Appear offline</option>
              <option>Do not disturb</option>
            </select>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving || (gamertag === userProfile.gamertag && status === userProfile.status)}
            className="mt-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex justify-center"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
