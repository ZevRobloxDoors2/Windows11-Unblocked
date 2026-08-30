import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, UserPlus, User, MessageSquare, Users } from 'lucide-react';
import { UserProfile, FriendRequest } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, or, serverTimestamp } from 'firebase/firestore';

interface FriendsProps {
  key?: string;
  userProfile: UserProfile;
  onBack: () => void;
  onChat: (id: string, name: string, isGroup?: boolean) => void;
}

// Fuzzy search helper
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

export function Friends({ userProfile, onBack, onChat }: FriendsProps) {
  const [searchTag, setSearchTag] = useState('');
  const [searching, setSearching] = useState(false);
  const [showCreateGC, setShowCreateGC] = useState(false);
  const [gcName, setGcName] = useState('');
  
  const [friends, setFriends] = useState<{uid: string, gamertag: string}[]>([]);
  const [searchResults, setSearchResults] = useState<{uid: string, gamertag: string}[]>([]);
  const [groupChats, setGroupChats] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'friendRequests'),
      or(
        where('fromUid', '==', auth.currentUser.uid),
        where('toUid', '==', auth.currentUser.uid)
      )
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest));
      
      // Compute friends
      const accepted = data.filter(r => r.status === 'accepted');
      const friendList: {uid: string, gamertag: string, status?: string, score?: number}[] = [];
      
      for (const r of accepted) {
        if (r.fromUid === auth.currentUser!.uid) {
          // Fetch to user's gamertag
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', r.toUid)));
          if (!userDoc.empty) {
            const uData = userDoc.docs[0].data() as UserProfile;
            friendList.push({ uid: r.toUid, gamertag: uData.gamertag, status: uData.status, score: uData.score });
          }
        } else {
           const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', r.fromUid)));
           if (!userDoc.empty) {
             const uData = userDoc.docs[0].data() as UserProfile;
             friendList.push({ uid: r.fromUid, gamertag: uData.gamertag, status: uData.status, score: uData.score });
           } else {
             friendList.push({ uid: r.fromUid, gamertag: r.fromGamertag });
           }
        }
      }
      setFriends(friendList.filter((v,i,a)=>a.findIndex(t=>(t.uid === v.uid))===i));
    }, (err) => console.error(err));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'groupChats'), where('members', 'array-contains', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setGroupChats(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
    });
    return () => unsub();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTag.trim()) return;
    setSearching(true);
    try {
      // Fuzzy search - get users and filter with fuzzy match
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      
      const matches = snap.docs
        .map(d => ({ uid: d.id, ...(d.data() as UserProfile) }))
        .filter(u => 
          fuzzyMatch(searchTag.trim(), u.gamertag) && 
          u.uid !== userProfile.uid
        )
        .sort((a, b) => {
          // Sort by how close the match is (shorter distance = better match)
          const aLen = a.gamertag.length;
          const bLen = b.gamertag.length;
          return aLen - bLen;
        })
        .slice(0, 10); // Limit to top 10 results

      if (matches.length === 0) {
        alert("Player not found.");
        setSearchResults([]);
      } else {
        setSearchResults(matches.map(u => ({ uid: u.uid, gamertag: u.gamertag })));
      }
    } catch(e: any) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (targetUid: string, targetGamertag: string) => {
    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromUid: userProfile.uid,
        fromGamertag: userProfile.gamertag,
        toUid: targetUid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert(`Friend request sent to ${targetGamertag}!`);
      setSearchTag('');
      setSearchResults([]);
    } catch(e: any) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  const handleCreateGroupChat = async () => {
    if (!gcName.trim()) {
      alert("Please enter a group chat name");
      return;
    }
    try {
      await addDoc(collection(db, 'groupChats'), {
        name: gcName,
        createdBy: userProfile.uid,
        createdByGamertag: userProfile.gamertag,
        members: [userProfile.uid],
        createdAt: serverTimestamp()
      });
      alert(`Group chat "${gcName}" created!`);
      setGcName('');
      setShowCreateGC(false);
    } catch(e: any) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-5xl mx-auto flex flex-col flex-1 min-h-0 h-full gap-8 pt-8 pb-12 overflow-y-auto w-full">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold">Social & Friends</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {/* Add Friend */}
          <div className="bg-zinc-800/80 p-6 rounded-lg border border-transparent hover:border-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-green-400" /> Add a Friend
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col gap-3">
              <input 
                type="text"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                placeholder="Search gamertag (fuzzy match)..."
                className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-md text-white focus:outline-none focus:border-green-500 font-medium"
              />
              <button disabled={searching} type="submit" className="bg-green-600 hover:bg-green-500 disabled:opacity-50 font-bold py-3 rounded-md transition-colors text-sm uppercase tracking-wide">
                {searching ? 'Searching...' : 'Search Players'}
              </button>
            </form>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 max-h-64 overflow-y-auto">
                <p className="text-xs text-zinc-400 font-semibold">Search Results:</p>
                {searchResults.map(result => (
                  <div key={result.uid} className="bg-zinc-900 p-3 rounded-md flex items-center justify-between">
                    <span className="font-semibold text-sm">{result.gamertag}</span>
                    <button 
                      onClick={() => handleSendRequest(result.uid, result.gamertag)}
                      className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-md text-xs font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Group Chat */}
          <div className="bg-zinc-800/80 p-6 rounded-lg border border-transparent hover:border-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-400" /> Group Chats
            </h3>
            <button 
              onClick={() => setShowCreateGC(!showCreateGC)}
              className="w-full bg-purple-600 hover:bg-purple-500 font-bold py-2 rounded-md transition-colors text-sm"
            >
              {showCreateGC ? 'Cancel' : 'Create Group Chat'}
            </button>
            
            {showCreateGC && (
              <div className="mt-4 flex flex-col gap-3">
                <input 
                  type="text"
                  value={gcName}
                  onChange={(e) => setGcName(e.target.value)}
                  placeholder="Group chat name..."
                  className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-md text-white focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={handleCreateGroupChat}
                  className="bg-purple-600 hover:bg-purple-500 font-bold py-2 rounded-md transition-colors text-sm"
                >
                  Create
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Friend List */}
        <div className="bg-zinc-800/80 p-6 rounded-lg border border-transparent hover:border-white/10 transition-colors">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-400" /> My Friends ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <p className="text-zinc-400 text-sm">You haven't added any friends yet. Search for friends using the search above!</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {friends.map((f: any) => (
                <div key={f.uid} className="bg-zinc-900 p-4 rounded-md flex items-center justify-between group hover:bg-zinc-800 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold">{f.gamertag}</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${f.status === 'Online' ? 'bg-green-500' : (f.status === 'Do not disturb' ? 'bg-red-500' : 'bg-zinc-500')}`} />
                      <span className="text-xs text-zinc-400">{f.status || 'Appear offline'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onChat(f.uid, f.gamertag, false)} 
                    className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Message"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Group Chats List */}
        <div className="bg-zinc-800/80 p-6 rounded-lg border border-transparent hover:border-white/10 transition-colors">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-purple-400" /> My Group Chats ({groupChats.length})
          </h3>
          {groupChats.length === 0 ? (
            <p className="text-zinc-400 text-sm">You aren't in any group chats yet. Create one above!</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {groupChats.map(gc => (
                <div key={gc.id} className="bg-zinc-900 p-4 rounded-md flex items-center justify-between group hover:bg-zinc-800 transition-colors">
                  <span className="font-semibold">{gc.name}</span>
                  <button 
                    onClick={() => onChat(gc.id, gc.name, true)} 
                    className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Message"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}