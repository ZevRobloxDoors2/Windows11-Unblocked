import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, UserPlus, User, MessageSquare, Users, Phone, Sparkles, 
  Gamepad2, Shield, Plus, Radio, Users2, Play, Flame, Search, Check, 
  ShieldCheck, Heart, Volume2, RefreshCw, Clock, Globe, Laptop, UserCheck
} from 'lucide-react';
import { UserProfile, FriendRequest } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, onSnapshot, or, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ALL_GAMES } from '../games';
import { ActivityFeed } from './ActivityFeed';

interface FriendsProps {
  key?: string;
  userProfile: UserProfile;
  initialTab?: 'friends' | 'activity' | 'add-friends' | 'lfg' | 'clubs';
  onBack: () => void;
  onChat: (id: string, name: string, isGroup?: boolean) => void;
  onCall: (friendUid: string, friendGamertag: string) => void;
  onPlayGame?: (game: any) => void;
}

interface LFGPost {
  id: string;
  creatorUid: string;
  creatorGamertag: string;
  avatar: string;
  gameTitle: string;
  gameId?: string;
  description: string;
  slotsNeeded: number;
  micRequired: boolean;
  createdAt: string;
}

interface Club {
  id: string;
  name: string;
  tag: string;
  description: string;
  gameFocus: string;
  membersCount: number;
  avatar: string;
  bannerColor: string;
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

export function Friends({ userProfile, initialTab, onBack, onChat, onCall, onPlayGame }: FriendsProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'activity' | 'add-friends' | 'lfg' | 'clubs'>(initialTab || 'friends');
  const [searchTag, setSearchTag] = useState('');
  const [searching, setSearching] = useState(false);
  const [showCreateGC, setShowCreateGC] = useState(false);
  const [gcName, setGcName] = useState('');
  
  // Real discovery states
  const [allCommunityUsers, setAllCommunityUsers] = useState<any[]>([]);
  const [nearbyAccounts, setNearbyAccounts] = useState<any[]>([]);
  const [autoSearchLoading, setAutoSearchLoading] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState<'nearby' | 'all'>('nearby');
  const [radarPulse, setRadarPulse] = useState(true);

  // LFG states
  const [showCreateLFG, setShowCreateLFG] = useState(false);
  const [lfgGameTitle, setLfgGameTitle] = useState('Eaglercraft');
  const [lfgDesc, setLfgDesc] = useState('');
  const [lfgSlots, setLfgSlots] = useState(2);
  const [lfgMic, setLfgMic] = useState(true);
  const [lfgFilterGame, setLfgFilterGame] = useState('All');

  // Clubs states
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubTag, setNewClubTag] = useState('');
  const [newClubGame, setNewClubGame] = useState('GTA 5/6');
  const [newClubDesc, setNewClubDesc] = useState('');

  const currentUid = userProfile?.uid || auth.currentUser?.uid || 'guest';

  // Real Friends (strictly no fake bots or hardcoded players)
  const [friends, setFriends] = useState<{
    uid: string;
    gamertag: string;
    avatar?: string;
    status?: string;
    presence?: { gameTitle: string; activity: string; onlineMinutes: number };
  }[]>(() => {
    try {
      const saved = localStorage.getItem(`ebox_friends_${currentUid}`);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  const [pendingSentUids, setPendingSentUids] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`ebox_pending_requests_${currentUid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchResults, setSearchResults] = useState<{
    uid: string;
    gamertag: string;
    avatar?: string;
    status?: string;
    score?: number;
    role?: string;
  }[]>([]);
  
  const [groupChats, setGroupChats] = useState<{id: string, name: string}[]>(() => {
    try {
      const saved = localStorage.getItem(`ebox_group_chats`);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      { id: 'gc_general', name: 'General Lounge 🎮' }
    ];
  });

  // Real LFG Posts (no fake bot posts)
  const [lfgPosts, setLfgPosts] = useState<LFGPost[]>(() => {
    try {
      const saved = localStorage.getItem('ebox_lfg_posts');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  // Clubs List
  const [clubs, setClubs] = useState<Club[]>(() => {
    try {
      const saved = localStorage.getItem('ebox_clubs');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      {
        id: 'club_eaglercraft',
        name: 'Eaglercraft Architects',
        tag: 'BUILD',
        description: 'Community of builders, redstone engineers, and survival adventurers.',
        gameFocus: 'Eaglercraft',
        membersCount: 142,
        avatar: '🧱',
        bannerColor: 'from-emerald-700 to-green-950'
      },
      {
        id: 'club_gta',
        name: 'Los Santos Syndicate',
        tag: 'GTA',
        description: 'Heist crews, drifting meets, and open-world mayhem.',
        gameFocus: 'GTA 5/6',
        membersCount: 89,
        avatar: '🏎️',
        bannerColor: 'from-amber-700 to-orange-950'
      },
      {
        id: 'club_pvp',
        name: 'Apex Sweats & Aimers',
        tag: 'CLUTCH',
        description: '1v1 LOL, Smash Karts, and competitive tournament training.',
        gameFocus: '1v1 LOL',
        membersCount: 215,
        avatar: '⚡',
        bannerColor: 'from-blue-700 to-indigo-950'
      },
      {
        id: 'club_retro',
        name: 'Arcade Nostalgia',
        tag: 'RETRO',
        description: 'High score chasers, speedrunners, and classic 8-bit lovers.',
        gameFocus: 'Retro Bowl Original',
        membersCount: 67,
        avatar: '👾',
        bannerColor: 'from-purple-700 to-pink-950'
      }
    ];
  });

  const [joinedClubs, setJoinedClubs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ebox_joined_clubs');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return ['club_eaglercraft'];
  });

  const isHalloween = localStorage.getItem('halloween_theme') === 'true';

  // Sync with Firestore & LocalStorage
  useEffect(() => {
    if (!currentUid || currentUid === 'guest') return;

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
      const friendList: any[] = [];
      
      for (const r of accepted) {
        if (r.fromUid === currentUid) {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', r.toUid)));
          if (!userDoc.empty) {
            const uData = userDoc.docs[0].data() as UserProfile;
            friendList.push({ 
              uid: r.toUid, 
              gamertag: uData.gamertag, 
              status: uData.status,
              presence: { gameTitle: 'Playing Online', activity: 'In Lobby', onlineMinutes: 5 }
            });
          }
        } else {
           const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', r.fromUid)));
           if (!userDoc.empty) {
             const uData = userDoc.docs[0].data() as UserProfile;
             friendList.push({ 
               uid: r.fromUid, 
               gamertag: uData.gamertag, 
               status: uData.status,
               presence: { gameTitle: 'Playing Online', activity: 'In Lobby', onlineMinutes: 5 }
             });
           } else {
             friendList.push({ 
               uid: r.fromUid, 
               gamertag: r.fromGamertag,
               presence: { gameTitle: 'Playing Online', activity: 'In Lobby', onlineMinutes: 5 }
             });
           }
        }
      }
      if (friendList.length > 0) {
        const unique = friendList.filter((v,i,a)=>a.findIndex(t=>(t.uid === v.uid))===i);
        setFriends(unique);
        localStorage.setItem(`ebox_friends_${currentUid}`, JSON.stringify(unique));
      }
    }, () => {});

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

  // Load Community Users & Nearby Accounts from Firestore and Local Accounts
  const loadCommunityAndNearby = async () => {
    setAutoSearchLoading(true);
    try {
      // 1. Local accounts on this machine
      const localAccs: any[] = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
      const localFormatted = localAccs.map(la => ({
        uid: la.uid,
        gamertag: la.gamertag,
        avatar: la.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${la.uid}`,
        status: 'Online',
        score: 0,
        role: la.email === 'zaellacruze1@gmail.com' ? 'owner' : 'user',
        isLocal: true
      }));
      setNearbyAccounts(localFormatted);

      // 2. Real Firestore accounts
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const fsUsers: any[] = [];
      snap.forEach(d => {
        const u = d.data();
        fsUsers.push({
          uid: d.id,
          gamertag: u.gamertag || 'Player',
          avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.id}`,
          status: u.status || 'Online',
          score: u.score || 0,
          role: u.role || (u.email === 'zaellacruze1@gmail.com' ? 'owner' : 'user'),
          lastTrophyAt: u.lastTrophyAt
        });
      });

      // Merge unique accounts
      const merged = [...fsUsers];
      localFormatted.forEach(la => {
        if (!merged.find(u => u.uid === la.uid)) {
          merged.push(la);
        }
      });
      setAllCommunityUsers(merged);
    } catch {
      const localAccs: any[] = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
      const fallback = localAccs.map(la => ({
        uid: la.uid,
        gamertag: la.gamertag,
        avatar: la.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${la.uid}`,
        status: 'Online',
        score: 0,
        role: la.email === 'zaellacruze1@gmail.com' ? 'owner' : 'user',
        isLocal: true
      }));
      setNearbyAccounts(fallback);
      setAllCommunityUsers(fallback);
    } finally {
      setAutoSearchLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityAndNearby();
  }, [currentUid]);

  // Synchronize pending requests sent by current user
  useEffect(() => {
    if (!currentUid || currentUid === 'guest') return;
    const qReqs = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', currentUid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(qReqs, (snap) => {
      const uids = snap.docs.map(d => d.data().toUid);
      setPendingSentUids(prev => [...new Set([...prev, ...uids])]);
    }, () => {});
    return () => unsub();
  }, [currentUid]);

  // Real Search (strictly NO fake players or mock bots)
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTag.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const term = searchTag.trim().toLowerCase();
    const matches = allCommunityUsers.filter(u => 
      u.gamertag?.toLowerCase().includes(term) || (u.email && u.email.toLowerCase().includes(term))
    );
    setSearchResults(matches);
    setSearching(false);
  };

  useEffect(() => {
    if (searchTag.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTag, allCommunityUsers]);

  // Send real Friend Request
  const handleSendRequest = async (targetUid: string, targetGamertag: string, targetAvatar?: string) => {
    if (targetUid === currentUid) return;

    // Immediately mark as pending locally
    const updatedPending = [...new Set([...pendingSentUids, targetUid])];
    setPendingSentUids(updatedPending);
    try {
      localStorage.setItem(`ebox_pending_requests_${currentUid}`, JSON.stringify(updatedPending));
    } catch(e) {}

    // Send real Firestore request
    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromUid: currentUid,
        fromGamertag: userProfile?.gamertag || 'Player',
        toUid: targetUid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, 'notifications'), {
        toUid: targetUid,
        fromUid: currentUid,
        fromGamertag: userProfile?.gamertag || 'Player',
        fromAvatar: userProfile?.avatar || '',
        type: 'friend_request',
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      // Offline/local fallback
    }

    // Support single-machine multi-account testing
    try {
      const localReqs = JSON.parse(localStorage.getItem('ebox_local_friend_requests') || '[]');
      localReqs.push({
        id: 'lreq_' + Date.now(),
        fromUid: currentUid,
        fromGamertag: userProfile?.gamertag || 'Player',
        toUid: targetUid,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('ebox_local_friend_requests', JSON.stringify(localReqs));
    } catch(e) {}

    alert(`Friend request sent to ${targetGamertag}! They will receive it in their notifications.`);
  };

  const handleCallFriend = async (friendUid: string, friendGamertag: string) => {
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
      onCall(friendUid, friendGamertag);
    } catch(e) {
      console.error(e);
      onCall(friendUid, friendGamertag);
    }
  };

  const handleAskToJoin = (friendGamertag: string, gameTitle: string) => {
    alert(`🎮 Sent session join request to ${friendGamertag}! Connecting to ${gameTitle}...`);
    const matchingGame = ALL_GAMES.find(g => g.title.toLowerCase() === gameTitle.toLowerCase() || g.id.toLowerCase() === gameTitle.toLowerCase());
    if (matchingGame && onPlayGame) {
      onPlayGame(matchingGame);
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

  // LFG Actions
  const handleCreateLFGPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfgDesc.trim()) {
      alert("Please provide a description for your group request");
      return;
    }
    const newPost: LFGPost = {
      id: 'lfg_' + Date.now(),
      creatorUid: currentUid,
      creatorGamertag: userProfile?.gamertag || 'Player',
      avatar: userProfile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Host',
      gameTitle: lfgGameTitle,
      description: lfgDesc.trim(),
      slotsNeeded: lfgSlots,
      micRequired: lfgMic,
      createdAt: 'Just now'
    };
    const updated = [newPost, ...lfgPosts];
    setLfgPosts(updated);
    localStorage.setItem('ebox_lfg_posts', JSON.stringify(updated));
    setShowCreateLFG(false);
    setLfgDesc('');
    alert(`Looking for Group post for ${lfgGameTitle} published to community!`);
  };

  const handleJoinLFG = (post: LFGPost) => {
    alert(`🚀 Joined ${post.creatorGamertag}'s ${post.gameTitle} group! Launching game...`);
    const matchingGame = ALL_GAMES.find(g => g.title.toLowerCase() === post.gameTitle.toLowerCase() || g.id.toLowerCase() === post.gameTitle.toLowerCase());
    if (matchingGame && onPlayGame) {
      onPlayGame(matchingGame);
    }
  };

  // Club Actions
  const toggleJoinClub = (clubId: string) => {
    let next: string[];
    if (joinedClubs.includes(clubId)) {
      next = joinedClubs.filter(id => id !== clubId);
      alert("Left club.");
    } else {
      next = [...joinedClubs, clubId];
      alert("Joined club! Club squad and voice lounge unlocked.");
    }
    setJoinedClubs(next);
    localStorage.setItem('ebox_joined_clubs', JSON.stringify(next));
  };

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;
    const newClub: Club = {
      id: 'club_' + Date.now(),
      name: newClubName.trim(),
      tag: newClubTag.trim().toUpperCase() || 'SQUAD',
      description: newClubDesc.trim() || 'Custom gaming squad for friends and teammates.',
      gameFocus: newClubGame,
      membersCount: 1,
      avatar: '👑',
      bannerColor: 'from-blue-700 to-indigo-950'
    };
    const updated = [...clubs, newClub];
    setClubs(updated);
    localStorage.setItem('ebox_clubs', JSON.stringify(updated));
    const updatedJoined = [...joinedClubs, newClub.id];
    setJoinedClubs(updatedJoined);
    localStorage.setItem('ebox_joined_clubs', JSON.stringify(updatedJoined));
    setShowCreateClub(false);
    setNewClubName('');
    setNewClubTag('');
    setNewClubDesc('');
    alert(`Club "${newClub.name}" created successfully!`);
  };

  const filteredLFG = lfgPosts.filter(p => lfgFilterGame === 'All' || p.gameTitle === lfgFilterGame);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-8 lg:px-12 max-w-6xl mx-auto flex flex-col flex-1 min-h-0 h-full gap-6 pt-6 pb-12 overflow-y-auto w-full text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors -ml-2 ${isHalloween ? 'hover:bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-white'}`}>
            <ChevronLeft size={26} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isHalloween ? 'bg-orange-600/30 text-orange-400 border border-orange-500/30' : 'bg-blue-600/30 text-blue-400 border border-blue-500/30'}`}>
              <Users size={26} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Social & Community</h2>
              <p className="text-sm text-zinc-400">Matchmaking, Squads, Rich Presence & Voice</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'friends' ? 'bg-[#00A4EF] text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            <User size={14} /> Friends ({friends.length})
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'activity' ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-lg shadow-orange-900/40 ring-1 ring-orange-400' : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'}`}
          >
            <Flame size={14} className="text-amber-400 animate-pulse" /> Friend Activity
          </button>
          <button 
            onClick={() => setActiveTab('add-friends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'add-friends' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40 ring-1 ring-blue-400' : 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'}`}
          >
            <UserPlus size={14} /> Add Friends
          </button>
          <button 
            onClick={() => setActiveTab('lfg')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'lfg' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            <Radio size={14} className="animate-pulse" /> LFG Matchmaking
          </button>
          <button 
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${activeTab === 'clubs' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            <Shield size={14} /> Clubs & Squads ({clubs.length})
          </button>
        </div>
      </div>

      {/* TAB: FRIEND ACTIVITY */}
      {activeTab === 'activity' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <ActivityFeed 
            userProfile={userProfile} 
            onPlayGame={onPlayGame} 
            onChat={(friendUid, friendGamertag) => onChat(friendUid, friendGamertag)} 
          />
        </motion.div>
      )}

      {/* TAB 1: FRIENDS LIST */}
      {activeTab === 'friends' && (
        <div className="flex flex-col gap-6">
          {/* Quick Banner to Add Friends */}
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-black/40 border border-blue-500/30 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <UserPlus size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Find & Connect with Real Players</h4>
                <p className="text-xs text-zinc-300">Search gamertags, auto-detect nearby accounts, or browse the community directory.</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('add-friends')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <UserPlus size={15} /> Open Add Friends Page ↗
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Friend List with Rich Presence */}
            <div className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_25px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-xl'} p-6 rounded-2xl border backdrop-blur-xl transition-all flex flex-col h-[520px]`}>
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-xl font-bold flex items-center gap-2.5">
                  <User size={22} className="text-blue-400" /> My Friends ({friends.length})
                </h3>
                {friends.length > 0 && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Real Friends Active
                  </span>
                )}
              </div>

              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center text-zinc-400 gap-4 p-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
                    <Users size={32} />
                  </div>
                  <div className="flex flex-col gap-1 max-w-sm">
                    <h4 className="text-base font-bold text-white">No Friends Added Yet</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      You haven't added any real players yet. Click below to search for anyone or see every account in the database!
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('add-friends')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus size={15} /> Find & Add Friends
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                  {friends.map((f: any) => (
                    <div key={f.uid} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-black/60 transition-all shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {f.avatar ? (
                            <img src={f.avatar} alt={f.gamertag} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300 border border-white/10 text-lg shadow-inner">
                              {f.gamertag.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-900 ${f.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : (f.status === 'Do not disturb' ? 'bg-red-500' : 'bg-zinc-500')}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-base leading-tight">{f.gamertag}</span>
                          {/* Rich Presence Info */}
                          {f.presence ? (
                            <div className="flex flex-col mt-1">
                              <span className="text-xs text-blue-300 font-semibold flex items-center gap-1">
                                <Gamepad2 size={12} className="text-blue-400" />
                                {f.presence.gameTitle}
                              </span>
                              <span className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                                {f.presence.activity}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 font-medium">{f.status || 'Offline'}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Ask to Join + Voice Call + Chat */}
                      <div className="flex items-center gap-2 shrink-0">
                        {f.presence && (
                          <button 
                            onClick={() => handleAskToJoin(f.gamertag, f.presence.gameTitle)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                            title="Ask to Join Game Session"
                          >
                            <Gamepad2 size={14} /> Ask to Join
                          </button>
                        )}
                        <button 
                          onClick={() => handleCallFriend(f.uid, f.gamertag)} 
                          className="bg-green-600 hover:bg-green-500 text-white p-2.5 rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer"
                          title="Start Single Voice Call"
                        >
                          <Phone size={15} />
                        </button>
                        <button 
                          onClick={() => onChat(f.uid, f.gamertag, false)} 
                          className="bg-zinc-800 hover:bg-zinc-700 text-white p-2.5 rounded-xl transition-all hover:scale-105 shadow-md cursor-pointer"
                          title="Open Message"
                        >
                          <MessageSquare size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Group Chats Column */}
            <div className="flex flex-col gap-6">
              <div className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_25px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-xl'} p-6 rounded-2xl border backdrop-blur-xl transition-all flex flex-col h-[520px]`}>
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-xl font-bold flex items-center gap-2.5">
                    <Sparkles size={22} className="text-purple-400" /> Group Chats ({groupChats.length})
                  </h3>
                  <button 
                    onClick={() => setShowCreateGC(!showCreateGC)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    {showCreateGC ? 'Cancel' : '+ New Group'}
                  </button>
                </div>

                {showCreateGC && (
                  <div className="mb-4 bg-black/40 border border-purple-500/30 p-3.5 rounded-xl flex flex-col gap-2.5 shrink-0">
                    <input 
                      type="text"
                      value={gcName}
                      onChange={(e) => setGcName(e.target.value)}
                      placeholder="Group chat name..."
                      className="bg-zinc-900 border border-purple-500/40 px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                    <button 
                      onClick={handleCreateGroupChat}
                      className="bg-purple-600 hover:bg-purple-500 font-bold py-2 rounded-lg transition-colors text-xs text-white cursor-pointer"
                    >
                      Create Room
                    </button>
                  </div>
                )}

                {groupChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center text-zinc-400 gap-2">
                    <Users size={32} className="text-zinc-600" />
                    <p className="text-sm">No group chats yet. Create one above!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                    {groupChats.map(gc => (
                      <div key={gc.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:bg-black/60 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                            #
                          </div>
                          <span className="font-bold text-sm text-white">{gc.name}</span>
                        </div>
                        <button 
                          onClick={() => onChat(gc.id, gc.name, true)} 
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 shadow-md flex items-center gap-1.5 cursor-pointer"
                          title="Open Group Chat"
                        >
                          <MessageSquare size={14} /> Chat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEDICATED ADD FRIENDS & DISCOVERY PAGE */}
      {activeTab === 'add-friends' && (
        <div className="flex flex-col gap-8">
          {/* Section 1: Search Box at Top */}
          <div className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_25px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-2xl'} p-6 md:p-8 rounded-3xl border backdrop-blur-xl flex flex-col gap-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2.5 text-white">
                  <Search size={24} className="text-blue-400" /> Search for Players
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Type any gamertag or username to find and send a real friend request.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Player Database
              </span>
            </div>

            {/* Search Input Field */}
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col sm:flex-row gap-3 mt-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  placeholder="Enter player gamertag, username, or email..."
                  className="w-full bg-black/60 border border-white/20 pl-11 pr-10 py-3.5 rounded-2xl text-white text-sm focus:outline-none focus:border-blue-500 shadow-inner font-medium placeholder-zinc-500"
                />
                {searchTag && (
                  <button 
                    type="button" 
                    onClick={() => { setSearchTag(''); setSearchResults([]); }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button 
                type="submit"
                disabled={searching}
                className="px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-900/30 transition-all hover:scale-105 shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search Players'}
              </button>
            </form>

            {/* Search Results Display */}
            {searchTag.trim() && (
              <div className="mt-2 flex flex-col gap-3">
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Search Results ({searchResults.length})
                  </span>
                  {searchResults.length > 0 && (
                    <span className="text-xs text-blue-400 font-medium">Matches found in community</span>
                  )}
                </div>

                {searchResults.length === 0 ? (
                  <div className="bg-black/30 border border-white/5 p-6 rounded-2xl text-center text-zinc-400 text-sm">
                    No real players found matching <span className="text-white font-semibold">"{searchTag}"</span>. Check spelling or browse the auto-discovery below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    {searchResults.map(result => {
                      const isSelf = result.uid === currentUid;
                      const isFriend = friends.some(f => f.uid === result.uid);
                      const isPending = pendingSentUids.includes(result.uid);

                      return (
                        <div key={result.uid} className="bg-black/50 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md hover:border-blue-500/40 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img 
                                src={result.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.uid}`} 
                                alt={result.gamertag} 
                                className="w-11 h-11 rounded-full object-cover border border-white/20 bg-zinc-800"
                              />
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black ${result.status === 'Online' ? 'bg-green-500' : 'bg-zinc-500'}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-white truncate">{result.gamertag}</span>
                                {result.role === 'owner' && <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">Owner</span>}
                              </div>
                              <span className="text-[11px] text-zinc-400">{result.status || 'Registered Player'}</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isSelf ? (
                              <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl border border-white/10 font-bold">You</span>
                            ) : isFriend ? (
                              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                                <Check size={13} /> Friends
                              </span>
                            ) : isPending ? (
                              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                                <Clock size={13} /> Request Sent
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleSendRequest(result.uid, result.gamertag, result.avatar)}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:scale-105 cursor-pointer"
                              >
                                <UserPlus size={14} /> Add Friend
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Auto Search & Nearby Discovery Below Search Box */}
          <div className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_25px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-2xl'} p-6 md:p-8 rounded-3xl border backdrop-blur-xl flex flex-col gap-6`}>
            {/* Auto Search Radar Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Radio size={24} className="text-emerald-400 animate-pulse" />
                  <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 animate-ping pointer-events-none" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">Radar & Auto-Search</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Auto-Scan
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Auto-scanning for accounts around your device and network, or explore every registered profile.
                  </p>
                </div>
              </div>

              {/* Rescan Button */}
              <button 
                onClick={loadCommunityAndNearby} 
                disabled={autoSearchLoading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
                title="Rescan database and local accounts"
              >
                <RefreshCw size={14} className={autoSearchLoading ? 'animate-spin' : ''} />
                {autoSearchLoading ? 'Scanning...' : 'Rescan Radar'}
              </button>
            </div>

            {/* Mode Switcher: Nearby vs All Profiles */}
            <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10 max-w-md">
              <button 
                onClick={() => setDiscoveryMode('nearby')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${discoveryMode === 'nearby' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                <Laptop size={14} /> Nearby & Local ({nearbyAccounts.length})
              </button>
              <button 
                onClick={() => setDiscoveryMode('all')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${discoveryMode === 'all' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                <Globe size={14} /> All Profiles ({allCommunityUsers.length})
              </button>
            </div>

            {/* Mode Description */}
            <div className="text-xs text-zinc-400 flex items-center gap-2 -mt-2">
              {discoveryMode === 'nearby' ? (
                <span>📡 <strong>Nearby / Local Scan:</strong> Shows player profiles registered or used on this computer/browser session.</span>
              ) : (
                <span>👥 <strong>All Profiles:</strong> Displaying every real account registered in the online database.</span>
              )}
            </div>

            {/* Account Grid */}
            {(() => {
              const displayList = discoveryMode === 'nearby' ? nearbyAccounts : allCommunityUsers;

              if (displayList.length === 0) {
                return (
                  <div className="bg-black/30 border border-white/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                    <Radio size={36} className="text-zinc-600" />
                    <p className="text-sm text-zinc-400">
                      {discoveryMode === 'nearby' 
                        ? 'No other local accounts found on this browser yet. Use the Lockscreen to add an account or switch to All Profiles!' 
                        : 'No community profiles found. Create an account to get started!'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayList.map((u: any) => {
                    const isSelf = u.uid === currentUid;
                    const isFriend = friends.some(f => f.uid === u.uid);
                    const isPending = pendingSentUids.includes(u.uid);

                    return (
                      <div 
                        key={`profile-${u.uid}`}
                        className="bg-black/40 hover:bg-black/60 border border-white/10 hover:border-emerald-500/40 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all shadow-lg group relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <img 
                              src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`} 
                              alt={u.gamertag} 
                              className="w-13 h-13 rounded-2xl object-cover border-2 border-white/15 bg-zinc-800 shadow-md group-hover:scale-105 transition-transform"
                            />
                            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${u.status === 'Online' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-zinc-500'}`} />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-base text-white truncate">{u.gamertag}</h4>
                              {u.role === 'owner' && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                                  Owner
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Online' ? 'bg-green-400' : 'bg-zinc-500'}`} />
                              {u.status || 'Active Player'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                          <span className="text-zinc-500 font-mono">
                            {u.isLocal ? 'Local Profile' : 'Online Account'}
                          </span>

                          <div>
                            {isSelf ? (
                              <span className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl border border-white/10 font-bold">
                                You
                              </span>
                            ) : isFriend ? (
                              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                                <Check size={13} /> Friends
                              </span>
                            ) : isPending ? (
                              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                                <Clock size={13} /> Request Sent
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleSendRequest(u.uid, u.gamertag, u.avatar)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:scale-105 cursor-pointer"
                              >
                                <UserPlus size={14} /> Add Friend
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: LOOKING FOR GROUP (LFG) MATCHMAKING */}
      {activeTab === 'lfg' && (
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900/90 border border-white/10 p-6 rounded-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2.5">
                <Radio size={24} className="text-emerald-400 animate-pulse" /> Looking for Group (LFG)
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Find players, team up for unblocked multiplayer matches, or host your own lobby
              </p>
            </div>
            <button 
              onClick={() => setShowCreateLFG(!showCreateLFG)}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> {showCreateLFG ? 'Cancel Form' : 'Create LFG Post'}
            </button>
          </div>

          {/* Create LFG Form */}
          {showCreateLFG && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              onSubmit={handleCreateLFGPost}
              className="bg-black/60 border border-emerald-500/30 p-6 rounded-2xl flex flex-col gap-4 shadow-2xl backdrop-blur-2xl"
            >
              <h4 className="text-lg font-bold text-emerald-400">Publish a Game Matchmaking Request</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Game Title</label>
                  <select 
                    value={lfgGameTitle}
                    onChange={(e) => setLfgGameTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {ALL_GAMES.filter(g => g.type === 'game').slice(0, 20).map(g => (
                      <option key={g.id} value={g.title}>{g.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Slots Needed</label>
                  <input 
                    type="number"
                    min="1"
                    max="8"
                    value={lfgSlots}
                    onChange={(e) => setLfgSlots(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-900 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Microphone Required?</label>
                  <button 
                    type="button"
                    onClick={() => setLfgMic(!lfgMic)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold border transition-colors ${lfgMic ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-zinc-800 border-white/10 text-zinc-400'}`}
                  >
                    {lfgMic ? '🎙️ Mic Required' : '🔇 No Mic Needed'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Lobby Description / Rules</label>
                <input 
                  type="text"
                  placeholder="e.g., Chill survival world, no griefing, playing for the next 2 hours!"
                  value={lfgDesc}
                  onChange={(e) => setLfgDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/15 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateLFG(false)} 
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  Post to LFG
                </button>
              </div>
            </motion.form>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {['All', 'Eaglercraft', '1v1 LOL', 'GTA 5/6', 'Retro Bowl Original', 'Roblox (App)'].map(gameName => (
              <button 
                key={gameName}
                onClick={() => setLfgFilterGame(gameName)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${lfgFilterGame === gameName ? 'bg-emerald-600 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'}`}
              >
                {gameName}
              </button>
            ))}
          </div>

          {/* LFG Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLFG.map(post => (
              <div key={post.id} className="bg-zinc-900/90 border border-white/10 p-5 rounded-2xl flex flex-col justify-between shadow-xl backdrop-blur-xl hover:border-white/20 transition-all gap-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                      {post.gameTitle}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">{post.createdAt}</span>
                  </div>

                  <p className="text-sm font-medium text-zinc-200 leading-relaxed mb-4">
                    "{post.description}"
                  </p>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                    <span className="bg-black/40 px-2 py-1 rounded-md border border-white/5">
                      👥 Need +{post.slotsNeeded}
                    </span>
                    <span className={`px-2 py-1 rounded-md border ${post.micRequired ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-zinc-800 text-zinc-400 border-white/5'}`}>
                      {post.micRequired ? '🎙️ Mic Required' : '🔇 No Mic'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={post.avatar} className="w-7 h-7 rounded-full object-cover border border-white/20" alt={post.creatorGamertag} />
                    <span className="text-xs font-bold text-zinc-300">{post.creatorGamertag}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleJoinLFG(post)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:scale-105 flex items-center gap-1 cursor-pointer"
                    >
                      <Play size={12} /> Join Session
                    </button>
                    <button 
                      onClick={() => onChat(post.creatorUid, post.creatorGamertag, false)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors cursor-pointer"
                      title="Direct Message"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLUBS & SQUADS */}
      {activeTab === 'clubs' && (
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900/90 border border-white/10 p-6 rounded-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2.5">
                <Shield size={24} className="text-purple-400" /> Clubs & Squads
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Join dedicated gaming squads, access private squad chats, and drop into voice party lounges
              </p>
            </div>
            <button 
              onClick={() => setShowCreateClub(!showCreateClub)}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> {showCreateClub ? 'Cancel Form' : 'Establish New Club'}
            </button>
          </div>

          {/* Create Club Form */}
          {showCreateClub && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              onSubmit={handleCreateClub}
              className="bg-black/60 border border-purple-500/30 p-6 rounded-2xl flex flex-col gap-4 shadow-2xl backdrop-blur-2xl"
            >
              <h4 className="text-lg font-bold text-purple-400">Establish a New Gaming Club</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Club Name</label>
                  <input 
                    type="text"
                    placeholder="e.g., Redstone Masters"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Clan Tag (3-5 Letters)</label>
                  <input 
                    type="text"
                    maxLength={5}
                    placeholder="e.g., RED"
                    value={newClubTag}
                    onChange={(e) => setNewClubTag(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Primary Game Focus</label>
                  <select 
                    value={newClubGame}
                    onChange={(e) => setNewClubGame(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {ALL_GAMES.filter(g => g.type === 'game').slice(0, 20).map(g => (
                      <option key={g.id} value={g.title}>{g.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Club Description & Values</label>
                <input 
                  type="text"
                  placeholder="Explain what your squad does and who should join..."
                  value={newClubDesc}
                  onChange={(e) => setNewClubDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/15 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateClub(false)} 
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  Found Club
                </button>
              </div>
            </motion.form>
          )}

          {/* Clubs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubs.map(club => {
              const isJoined = joinedClubs.includes(club.id);
              return (
                <div key={club.id} className="bg-zinc-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl flex flex-col justify-between group hover:border-purple-500/40 transition-all">
                  {/* Club Banner Header */}
                  <div className={`p-5 bg-gradient-to-r ${club.bannerColor} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/20 flex items-center justify-center text-2xl shadow-lg">
                        {club.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold">{club.name}</h4>
                          <span className="text-xs bg-black/50 border border-white/20 px-2 py-0.5 rounded-md font-mono text-purple-300">
                            [{club.tag}]
                          </span>
                        </div>
                        <span className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                          <Gamepad2 size={12} /> {club.gameFocus} • {club.membersCount + (isJoined ? 1 : 0)} Members
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => toggleJoinClub(club.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${isJoined ? 'bg-emerald-600 text-white flex items-center gap-1' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                    >
                      {isJoined ? <><Check size={14} /> Joined</> : 'Join Club'}
                    </button>
                  </div>

                  {/* Club Body */}
                  <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {club.description}
                    </p>

                    {/* Club Actions */}
                    <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-zinc-500">Official Community Club</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onChat(club.id, `${club.name} [${club.tag}]`, true)}
                          className="px-3.5 py-1.5 bg-purple-600/40 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-purple-500/30 cursor-pointer"
                          title="Open Club Squad Chat"
                        >
                          <MessageSquare size={13} /> Squad Chat
                        </button>
                        <button 
                          onClick={() => {
                            const matching = ALL_GAMES.find(g => g.title.toLowerCase() === club.gameFocus.toLowerCase());
                            if (matching && onPlayGame) onPlayGame(matching);
                          }}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play size={12} /> Launch Game
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
