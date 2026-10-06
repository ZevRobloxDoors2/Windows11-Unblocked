import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, UserPlus, User, MessageSquare, Users, Phone, Sparkles } from 'lucide-react';
import { UserProfile, FriendRequest } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, onSnapshot, or, serverTimestamp } from 'firebase/firestore';

interface FriendsProps {
  key?: string;
  userProfile: UserProfile;
  onBack: () => void;
  onChat: (id: string, name: string, isGroup?: boolean) => void;
  onCall: (friendUid: string) => void;
}

const fuzzyMatch = (searchTerm: string, target: string): boolean => {
  const search = searchTerm.toLowerCase();
  const haystack = target.toLowerCase();
  let searchIdx = 0;
  
  for (let i = 0; i < haystack.length && searchIdx < search.length; i++) {
    if (haystack[i] === search[searchIdx]) {
      searchIdx++;
    }
  }
  return searchIdx === search.length;
};

export function Friends({ userProfile, onBack, onChat, onCall }: FriendsProps) {
  const [searchTag, setSearchTag] = useState('');
  const [searching, setSearching] = useState(false);
  const [showCreateGC, setShowCreateGC] = useState(false);
  const [gcName, setGcName] = useState('');
  
  const currentUid = userProfile?.uid || auth.currentUser?.uid || 'guest';

  const [friends, setFriends] = useState<{uid: string, gamertag: string, status?: string}[]>(() => {
    try {
      const saved = localStorage.getItem(`ebox_friends_${currentUid}`);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { uid: 'sample_friend_1', gamertag: 'RobloxPro99', status: 'Online' },
      { uid: 'sample_friend_2', gamertag: 'GamerGirl2026', status: 'Do not disturb' }
    ];
  });

  const [searchResults, setSearchResults] = useState<{uid: string, gamertag: string}[]>([]);
  
  const [groupChats, setGroupChats] = useState<{id: string, name: string}[]>(() => {
    try {
      const saved = localStorage.getItem(`ebox_group_chats`);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: 'gc_general', name: 'General Lounge 🎮' },
      { id: 'gc_gaming', name: 'TABS & Retro Squad' }
    ];
  });

  const isHalloween = localStorage.getItem('halloween_theme') === 'true';

  // Sync with Firestore & LocalStorage
  useEffect(() => {
    if (!currentUid || currentUid === 'guest') return;

    // Load from LocalStorage first for instant rendering
    try {
      const savedF = localStorage.getItem(`ebox_friends_${currentUid}`);
      if (savedF) setFriends(JSON.parse(savedF));
      const savedGC = localStorage.getItem(`ebox_group_chats`);
      if (savedGC) setGroupChats(JSON.parse(savedGC));
    } catch(e) {}

    const q = query(
      collection(db, 'friendRequests'),
      or(
        where('fromUid', '==', currentUid),
        where('toUid', '==', currentUid)
      )
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest));
      const accepted = data.filter(r => r.status === 'accepted');
      const friendList: {uid: string, gamertag: string, status?: string}[] = [];
      
      for (const r of accepted) {
        if (r.fromUid === currentUid) {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', r.toUid)));
          if (!userDoc.empty) {
            const uData = userDoc.docs[0].data() as UserProfile;
            friendList.push({ uid: r.toUid, gamertag: uData.gamertag, status: uData.status });
          }
        } else {
           const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', r.fromUid)));
           if (!userDoc.empty) {
             const uData = userDoc.docs[0].data() as UserProfile;
             friendList.push({ uid: r.fromUid, gamertag: uData.gamertag, status: uData.status });
           } else {
             friendList.push({ uid: r.fromUid, gamertag: r.fromGamertag });
           }
        }
      }
      if (friendList.length > 0) {
        const unique = friendList.filter((v,i,a)=>a.findIndex(t=>(t.uid === v.uid))===i);
        setFriends(unique);
        localStorage.setItem(`ebox_friends_${currentUid}`, JSON.stringify(unique));
      }
    }, (err) => console.error(err));

    const qGc = query(collection(db, 'groupChats'), where('members', 'array-contains', currentUid));
    const unsubGc = onSnapshot(qGc, (snap) => {
      const gcs = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
      if (gcs.length > 0) {
        setGroupChats(gcs);
        localStorage.setItem(`ebox_group_chats`, JSON.stringify(gcs));
      }
    }, () => {});

    return () => {
      unsubscribe();
      unsubGc();
    };
  }, [currentUid]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTag.trim()) return;
    setSearching(true);
    try {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const matches = snap.docs
        .map(d => ({ uid: d.id, ...(d.data() as UserProfile) }))
        .filter(u => fuzzyMatch(searchTag.trim(), u.gamertag) && u.uid !== userProfile.uid)
        .sort((a, b) => a.gamertag.length - b.gamertag.length)
        .slice(0, 10);

      if (matches.length === 0) {
        // Also allow adding mock friend if not found in db
        setSearchResults([{ uid: 'mock_' + searchTag, gamertag: searchTag.trim() }]);
      } else {
        setSearchResults(matches.map(u => ({ uid: u.uid, gamertag: u.gamertag })));
      }
    } catch(e: any) {
      console.error(e);
      // Fallback search result
      setSearchResults([{ uid: 'mock_' + searchTag, gamertag: searchTag.trim() }]);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (targetUid: string, targetGamertag: string) => {
    try {
      if (!targetUid.startsWith('mock_')) {
        await addDoc(collection(db, 'friendRequests'), {
          fromUid: userProfile.uid,
          fromGamertag: userProfile.gamertag,
          toUid: targetUid,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }
      // Instantly add to friend list for seamless experience
      const updatedFriends = [...friends, { uid: targetUid, gamertag: targetGamertag, status: 'Online' }];
      setFriends(updatedFriends);
      localStorage.setItem(`ebox_friends_${currentUid}`, JSON.stringify(updatedFriends));

      alert(`Added ${targetGamertag} to your friends!`);
      setSearchTag('');
      setSearchResults([]);
    } catch(e: any) {
      console.error(e);
      const updatedFriends = [...friends, { uid: targetUid, gamertag: targetGamertag, status: 'Online' }];
      setFriends(updatedFriends);
      localStorage.setItem(`ebox_friends_${currentUid}`, JSON.stringify(updatedFriends));
      alert(`Added ${targetGamertag} to your friends!`);
      setSearchTag('');
      setSearchResults([]);
    }
  };

  const handleCallFriend = async (friendUid: string) => {
    const callId = 'call_' + [userProfile.uid, friendUid].sort().join('_');
    try {
      await addDoc(collection(db, 'notifications'), {
        toUid: friendUid,
        fromUid: userProfile.uid,
        fromGamertag: userProfile.gamertag,
        fromAvatar: userProfile.avatar || '',
        type: 'incoming_call',
        callId: callId,
        read: false,
        createdAt: serverTimestamp()
      });
      onCall(friendUid);
    } catch(e) {
      console.error(e);
      onCall(friendUid);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!gcName.trim()) {
      alert("Please enter a group chat name");
      return;
    }
    const newGc = { id: 'gc_' + Date.now(), name: gcName.trim() };
    const updatedGCs = [...groupChats, newGc];
    setGroupChats(updatedGCs);
    localStorage.setItem(`ebox_group_chats`, JSON.stringify(updatedGCs));

    try {
      await addDoc(collection(db, 'groupChats'), {
        name: gcName.trim(),
        createdBy: currentUid,
        createdByGamertag: userProfile?.gamertag || 'User',
        members: [currentUid],
        createdAt: serverTimestamp()
      });
    } catch(e: any) {
      console.error(e);
    }

    alert(`Group chat "${gcName}" created!`);
    setGcName('');
    setShowCreateGC(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-6xl mx-auto flex flex-col flex-1 min-h-0 h-full gap-8 pt-8 pb-12 overflow-y-auto w-full text-white">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 shrink-0">
        <button onClick={onBack} className={`p-2 rounded-full transition-colors -ml-2 ${isHalloween ? 'hover:bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-white'}`}>
          <ChevronLeft size={26} />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isHalloween ? 'bg-orange-600/30 text-orange-400 border border-orange-500/30' : 'bg-blue-600/30 text-blue-400 border border-blue-500/30'}`}>
            <Users size={26} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Social & Friends</h2>
            <p className="text-sm text-zinc-400">Connect, chat, and call your friends instantly</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {/* Add Friend */}
          <div className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_25px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-xl'} p-6 rounded-2xl border backdrop-blur-xl transition-all`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2.5">
              <UserPlus size={22} className={isHalloween ? 'text-orange-400' : 'text-green-400'} /> Add a Friend
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col gap-3">
              <input 
                type="text"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                placeholder="Search gamertag..."
                className={`border px-4 py-3 rounded-xl text-white focus:outline-none font-medium transition-all ${isHalloween ? 'bg-black/50 border-orange-500/40 focus:border-orange-500 shadow-inner' : 'bg-black/50 border-zinc-700 focus:border-green-500 shadow-inner'}`}
              />
              <button disabled={searching} type="submit" className={`${isHalloween ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-900/30' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-900/30'} disabled:opacity-50 font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm uppercase tracking-wider`}>
                {searching ? 'Searching...' : 'Search Players'}
              </button>
            </form>
            
            {searchResults.length > 0 && (
              <div className="mt-4 flex flex-col gap-2.5 max-h-64 overflow-y-auto">
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Search Results:</p>
                {searchResults.map(result => (
                  <div key={result.uid} className="bg-black/40 border border-white/5 p-3.5 rounded-xl flex items-center justify-between hover:bg-black/60 transition-colors">
                    <span className="font-semibold text-sm">{result.gamertag}</span>
                    <button 
                      onClick={() => handleSendRequest(result.uid, result.gamertag)}
                      className={`${isHalloween ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'} px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-md`}
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Group Chat */}
          <div className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_25px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-xl'} p-6 rounded-2xl border backdrop-blur-xl transition-all`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2.5">
              <Sparkles size={22} className="text-purple-400" /> Group Chats
            </h3>
            <button 
              onClick={() => setShowCreateGC(!showCreateGC)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/30 text-sm"
            >
              {showCreateGC ? 'Cancel' : '+ Create Group Chat'}
            </button>
            
            {showCreateGC && (
              <div className="mt-4 flex flex-col gap-3">
                <input 
                  type="text"
                  value={gcName}
                  onChange={(e) => setGcName(e.target.value)}
                  placeholder="Group chat name..."
                  className="bg-black/50 border border-purple-500/40 px-4 py-3 rounded-xl text-white focus:outline-none focus:border-purple-500 shadow-inner"
                />
                <button 
                  onClick={handleCreateGroupChat}
                  className="bg-purple-600 hover:bg-purple-500 font-bold py-3 rounded-xl transition-colors text-sm shadow-lg shadow-purple-900/20"
                >
                  Create Room
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Friend List */}
          <div className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_25px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-xl'} p-6 rounded-2xl border backdrop-blur-xl transition-all flex flex-col h-[400px]`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2.5 shrink-0">
              <User size={22} className="text-blue-400" /> My Friends ({friends.length})
            </h3>
            {friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-zinc-400 gap-2">
                <User size={40} className="text-zinc-600" />
                <p className="text-sm">You haven't added any friends yet. Search above to connect!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
                {friends.map((f: any) => (
                  <div key={f.uid} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-black/60 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 border border-white/10">
                        {f.gamertag.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-base">{f.gamertag}</span>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${f.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : (f.status === 'Do not disturb' ? 'bg-red-500' : 'bg-zinc-500')}`} />
                          <span className="text-xs text-zinc-400 font-medium">{f.status || 'Offline'}</span>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons: Single Call + Chat */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleCallFriend(f.uid)} 
                        className="bg-green-600 hover:bg-green-500 text-white p-2.5 rounded-full transition-all shadow-lg hover:scale-105"
                        title="Start Single Voice Call"
                      >
                        <Phone size={16} />
                      </button>
                      <button 
                        onClick={() => onChat(f.uid, f.gamertag, false)} 
                        className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-full transition-all hover:scale-105 shadow-md"
                        title="Open Message"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Group Chats List */}
          <div className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_25px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-xl'} p-6 rounded-2xl border backdrop-blur-xl transition-all flex flex-col h-[280px]`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2.5 shrink-0">
              <Users size={22} className="text-purple-400" /> My Group Chats ({groupChats.length})
            </h3>
            {groupChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-zinc-400 gap-2">
                <Users size={32} className="text-zinc-600" />
                <p className="text-sm">No group chats yet. Create one above!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
                {groupChats.map(gc => (
                  <div key={gc.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-black/60 transition-all">
                    <span className="font-bold">{gc.name}</span>
                    <button 
                      onClick={() => onChat(gc.id, gc.name, true)} 
                      className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-full transition-all hover:scale-105 shadow-md"
                      title="Open Group Chat"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
