import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Gamepad2, Users, UserCheck, Sparkles, Clock, Play, 
  MessageSquare, Filter, RefreshCw, Radio, Lock, Shield, 
  CheckCircle2, Flame, Heart, Share2, Eye
} from 'lucide-react';
import { UserProfile, ActivityItem } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, query, where, getDocs, onSnapshot, or, 
  orderBy, limit, doc, getDoc 
} from 'firebase/firestore';
import { ALL_GAMES } from '../games';

interface ActivityFeedProps {
  profile?: UserProfile;
  userProfile?: UserProfile;
  onPlayGame?: (game: any) => void;
  onChat?: (friendUid: string, gamertag: string) => void;
  initialFilter?: 'all' | 'friends' | 'playing' | 'trophies';
}

interface EnhancedActivity extends ActivityItem {
  isMutualFriend: boolean;
  isCurrentUser: boolean;
  userSharedActivity?: boolean;
}

export function ActivityFeed({ profile, userProfile, onPlayGame, onChat, initialFilter = 'all' }: ActivityFeedProps) {
  const activeProfile = profile || userProfile;
  const currentUid = activeProfile?.uid || auth.currentUser?.uid || 'guest';

  const [activeFilter, setActiveFilter] = useState<'all' | 'friends' | 'playing' | 'trophies'>(initialFilter);
  const [mutualFriendUids, setMutualFriendUids] = useState<Set<string>>(new Set());
  const [mutualFriendsData, setMutualFriendsData] = useState<Map<string, UserProfile>>(new Map());
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPrivacyCache, setUserPrivacyCache] = useState<Map<string, boolean>>(new Map());
  const [likedActivities, setLikedActivities] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`ebox_liked_activities_${currentUid}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // 1. Listen for confirmed mutual friends in real time
  useEffect(() => {
    if (!currentUid || currentUid === 'guest') {
      setLoading(false);
      return;
    }

    const qMutual = query(
      collection(db, 'friendRequests'),
      or(
        where('fromUid', '==', currentUid),
        where('toUid', '==', currentUid)
      )
    );

    const unsubRequests = onSnapshot(qMutual, async (snapshot) => {
      const confirmedUids = new Set<string>();
      const friendsDataMap = new Map<string, UserProfile>();

      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.status === 'accepted') {
          const friendId = data.fromUid === currentUid ? data.toUid : data.fromUid;
          if (friendId && friendId !== currentUid) {
            confirmedUids.add(friendId);
          }
        }
      });

      setMutualFriendUids(confirmedUids);

      // Fetch / listen to friend profiles
      for (const friendUid of confirmedUids) {
        try {
          const userSnap = await getDoc(doc(db, 'users', friendUid));
          if (userSnap.exists()) {
            friendsDataMap.set(friendUid, userSnap.data() as UserProfile);
          }
        } catch (e) {
          console.warn("Could not load friend profile", friendUid, e);
        }
      }
      setMutualFriendsData(friendsDataMap);
    }, (err) => console.warn("Mutual friends snapshot error:", err));

    return () => unsubRequests();
  }, [currentUid]);

  // 2. Real-time listener for activities feed from Firebase
  useEffect(() => {
    if (!currentUid) return;

    let unsubActivities: () => void = () => {};

    try {
      const actQuery = query(
        collection(db, 'activities'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      unsubActivities = onSnapshot(actQuery, async (snapshot) => {
        const rawActivities: any[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        const privacyMap = new Map(userPrivacyCache);
        const processed: EnhancedActivity[] = [];

        for (const item of rawActivities) {
          const isCurrentUser = item.uid === currentUid;
          const isMutual = mutualFriendUids.has(item.uid);

          // If current user or confirmed mutual friend, always include!
          if (isCurrentUser || isMutual) {
            processed.push({
              ...item,
              isCurrentUser,
              isMutualFriend: isMutual,
              userSharedActivity: true
            });
            continue;
          }

          // For other users: check if they have enabled activity sharing in settings
          let shared = privacyMap.get(item.uid);
          if (shared === undefined) {
            try {
              const uDoc = await getDoc(doc(db, 'users', item.uid));
              if (uDoc.exists()) {
                const uData = uDoc.data();
                // Default is true unless explicitly set to false
                shared = uData.shareActivity !== false;
                privacyMap.set(item.uid, shared);
              } else {
                shared = true;
                privacyMap.set(item.uid, true);
              }
            } catch {
              shared = true;
            }
          }

          // Only show for others if they have it enabled in settings
          if (shared) {
            processed.push({
              ...item,
              isCurrentUser: false,
              isMutualFriend: false,
              userSharedActivity: true
            });
          }
        }

        setUserPrivacyCache(privacyMap);
        setActivities(processed);
        setLoading(false);
      }, (err) => {
        console.warn("Activities snapshot error:", err);
        setLoading(false);
      });
    } catch (e) {
      console.warn("Activities query exception:", e);
      setLoading(false);
    }

    return () => unsubActivities();
  }, [currentUid, mutualFriendUids]);

  const handleToggleLike = (activityId: string) => {
    const next = new Set(likedActivities);
    if (next.has(activityId)) {
      next.delete(activityId);
    } else {
      next.add(activityId);
    }
    setLikedActivities(next);
    try {
      localStorage.setItem(`ebox_liked_activities_${currentUid}`, JSON.stringify(Array.from(next)));
    } catch {}
  };

  const formatActivityTime = (createdAt: any) => {
    if (!createdAt) return 'Recently';
    try {
      let date: Date;
      if (createdAt.toDate && typeof createdAt.toDate === 'function') {
        date = createdAt.toDate();
      } else if (typeof createdAt === 'string' || typeof createdAt === 'number') {
        date = new Date(createdAt);
      } else {
        return 'Recently';
      }
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Filter items
  const filteredActivities = activities.filter((act) => {
    if (activeFilter === 'friends') {
      return act.isMutualFriend || act.isCurrentUser;
    }
    if (activeFilter === 'playing') {
      return act.type === 'game' || act.type === 'online';
    }
    if (activeFilter === 'trophies') {
      return act.type === 'trophy' || act.type === 'achievement';
    }
    return true;
  });

  // Active playing mutual friends
  const onlineMutualFriends = (Array.from(mutualFriendsData.values()) as UserProfile[]).filter(
    (f: UserProfile) => f.status === 'Online' || !!f.currentGame
  );

  return (
    <div className="flex flex-col gap-6 w-full text-white">
      {/* Top Presence Highlight Bar for Confirmed Mutual Friends */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-purple-950/40 border border-blue-500/30 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck size={18} className="text-blue-400" />
              Live Mutual Friends ({onlineMutualFriends.length} Active)
            </h3>
          </div>
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 w-fit">
            <Radio size={12} className="animate-pulse text-emerald-400" /> Firebase Real-Time Cloud Sync
          </span>
        </div>

        {onlineMutualFriends.length === 0 ? (
          <div className="flex items-center gap-3 bg-black/30 border border-white/5 rounded-xl p-3.5 text-xs text-zinc-400">
            <Clock size={16} className="text-zinc-500 shrink-0" />
            <span>None of your confirmed mutual friends are currently in-game. When they launch a game or earn trophies, their activity updates here in real time.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {onlineMutualFriends.map((f) => (
              <div 
                key={f.uid} 
                className="bg-black/40 border border-white/10 hover:border-blue-500/40 transition-all rounded-xl p-3 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={f.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.uid}`} 
                      alt={f.gamertag} 
                      className="w-10 h-10 rounded-xl bg-zinc-800 object-cover border border-white/10" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate flex items-center gap-1">
                      {f.gamertag}
                      <CheckCircle2 size={12} className="text-blue-400 shrink-0" />
                    </div>
                    <div className="text-[11px] text-zinc-300 truncate flex items-center gap-1">
                      <Gamepad2 size={12} className="text-emerald-400 shrink-0" />
                      {f.currentGame?.title || 'Online in E-Box'}
                    </div>
                  </div>
                </div>

                {f.currentGame && onPlayGame && (
                  <button 
                    onClick={() => {
                      const match = ALL_GAMES.find(g => g.title.toLowerCase() === f.currentGame?.title.toLowerCase() || g.id === f.currentGame?.gameId);
                      if (match) onPlayGame(match);
                      else alert(`Joining ${f.gamertag}'s session for ${f.currentGame?.title}!`);
                    }}
                    className="p-2 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition-all text-xs font-semibold shrink-0"
                    title={`Play ${f.currentGame.title}`}
                  >
                    <Play size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'all' 
                ? 'bg-[#00A4EF] text-white shadow-md' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles size={13} /> All Activity ({activities.length})
          </button>
          <button 
            onClick={() => setActiveFilter('friends')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'friends' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck size={13} /> Mutual Friends Only
          </button>
          <button 
            onClick={() => setActiveFilter('playing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'playing' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 size={13} /> Games ({activities.filter(a => a.type === 'game' || a.type === 'online').length})
          </button>
          <button 
            onClick={() => setActiveFilter('trophies')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeFilter === 'trophies' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy size={13} /> Trophies ({activities.filter(a => a.type === 'trophy' || a.type === 'achievement').length})
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-zinc-400">
          <Eye size={13} className="text-blue-400" />
          <span>Filtered by privacy settings</span>
        </div>
      </div>

      {/* Main Feed Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-zinc-400 gap-3">
          <RefreshCw size={24} className="animate-spin text-blue-400" />
          <span className="text-sm">Connecting to Firebase Activity Feed...</span>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 border border-white/10">
            <Trophy size={28} />
          </div>
          <h4 className="text-base font-bold text-white">No activity found for this filter</h4>
          <p className="text-xs text-zinc-400 max-w-md">
            {activeFilter === 'friends' 
              ? 'None of your mutual friends have logged activity yet. Add more friends or ask them to play games!'
              : 'When players start games, earn trophies, or go online with activity sharing enabled, their moments appear here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          <AnimatePresence>
            {filteredActivities.map((act) => {
              const isTrophy = act.type === 'trophy' || act.type === 'achievement';
              const isGame = act.type === 'game';
              const isOnline = act.type === 'online';
              const isLiked = likedActivities.has(act.id);

              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`p-4 rounded-2xl border transition-all backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isTrophy 
                      ? 'bg-gradient-to-r from-amber-950/30 via-zinc-900/90 to-black/60 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]' 
                      : isGame 
                        ? 'bg-gradient-to-r from-blue-950/30 via-zinc-900/90 to-black/60 border-blue-500/25' 
                        : 'bg-zinc-900/80 border-white/10'
                  }`}
                >
                  {/* Left Column: Avatar & Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img 
                        src={act.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${act.uid}`} 
                        alt={act.gamertag} 
                        className="w-11 h-11 rounded-xl bg-zinc-800 object-cover border border-white/10 shadow-md" 
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm border border-black ${
                        isTrophy 
                          ? 'bg-amber-500 text-black font-black' 
                          : isGame 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-emerald-500 text-black'
                      }`}>
                        {isTrophy ? '🏆' : isGame ? '🎮' : '⚡'}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white hover:underline cursor-pointer">
                          {act.gamertag}
                        </span>
                        {act.isCurrentUser && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-semibold">
                            You
                          </span>
                        )}
                        {act.isMutualFriend && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                            <UserCheck size={10} /> Mutual Friend
                          </span>
                        )}
                        {!act.isMutualFriend && !act.isCurrentUser && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-semibold">
                            Community Player
                          </span>
                        )}
                        <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                          <Clock size={11} /> {formatActivityTime(act.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-200 mt-1 font-medium flex items-center gap-1.5">
                        {act.details || (isTrophy ? 'Unlocked an achievement' : isGame ? `Started playing ${act.gameTitle || 'a game'}` : 'Online in E-Box')}
                        {isTrophy && (
                          <span className="text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded text-[10px] border border-amber-400/20">
                            +{act.points || 10} 🏆
                          </span>
                        )}
                      </p>

                      {act.gameTitle && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                          <Gamepad2 size={12} /> {act.gameTitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Interactive Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggleLike(act.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isLiked 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm' 
                          : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5'
                      }`}
                    >
                      <Heart size={13} className={isLiked ? 'fill-rose-500 text-rose-500' : ''} />
                      {isLiked ? 'GG! 🎉' : 'Cheer'}
                    </button>

                    {act.gameTitle && onPlayGame && (
                      <button
                        onClick={() => {
                          const matching = ALL_GAMES.find(g => g.title.toLowerCase() === act.gameTitle?.toLowerCase() || g.id === act.gameId);
                          if (matching) onPlayGame(matching);
                          else alert(`Launching ${act.gameTitle}...`);
                        }}
                        className="px-3.5 py-1.5 bg-[#00A4EF] hover:bg-[#0078D4] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                      >
                        <Play size={12} className="fill-white" /> Play Game
                      </button>
                    )}

                    {onChat && !act.isCurrentUser && (
                      <button
                        onClick={() => onChat(act.uid, act.gamertag)}
                        className="p-1.5 bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white rounded-xl border border-white/10 transition-colors"
                        title={`Message ${act.gamertag}`}
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
export default ActivityFeed;
