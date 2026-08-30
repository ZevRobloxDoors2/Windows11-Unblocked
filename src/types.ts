export interface UserProfile {
  uid: string;
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
