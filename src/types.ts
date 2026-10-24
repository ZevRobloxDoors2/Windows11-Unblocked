export interface UserProfile {
  uid: string;
  email?: string;
  role?: string;
  gamertag: string;
  gamertagLower: string;
  avatar: string;
  status: 'Online' | 'Appear offline' | 'Do not disturb';
  score: number;
  lastTrophyAt: string; // ISO string
  recentGames?: { gameId: string, lastPlayed: string }[];
  vibrationEnabled?: boolean;
  homeTheme?: string;
  quickResumeEnabled?: boolean;
  shareActivity?: boolean;
  currentGame?: {
    gameId?: string;
    title: string;
    startedAt?: string;
    details?: string;
  } | null;
}

export interface ActivityItem {
  id: string;
  uid: string;
  gamertag: string;
  avatar: string;
  type: 'online' | 'game' | 'trophy' | 'achievement';
  gameTitle?: string;
  gameId?: string;
  trophyName?: string;
  points?: number;
  details: string;
  createdAt: any;
}

export interface FriendRequest {
  id: string;
  fromUid: string;
  fromGamertag: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  imageUrl?: string;
  readBy?: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  imageUrl?: string;
  readBy?: string[];
}

