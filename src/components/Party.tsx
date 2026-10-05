import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Users, Mic, MicOff, PhoneOff, Headphones, Volume2, VolumeX, Camera, CameraOff, Monitor, Bell, Upload, Music } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, setDoc, deleteDoc, collection, serverTimestamp, addDoc, getDoc, query, or, where } from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

const RINGTONE_PRESETS = [
  { id: 'classic', name: 'Classic Discord' },
  { id: 'marimba', name: 'Marimba Chime' },
  { id: 'retro', name: 'Retro Arcade' },
  { id: 'chime', name: 'Crystal Chime' },
  { id: 'digital', name: 'Digital Beep' },
];

export const Party: React.FC<{ profile: any, onBack: () => void, initialPartyId?: string }> = ({ profile, onBack, initialPartyId }) => {
  const [partyId] = useState(initialPartyId || Math.random().toString(36).substring(2, 9));
  const [partyMembers, setPartyMembers] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [peerMutes, setPeerMutes] = useState<Record<string, boolean>>({});
  const [inParty, setInParty] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRingtoneModal, setShowRingtoneModal] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [micError, setMicError] = useState('');
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});

  // Discord Call Video & Screen Share states
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Ringtone states
  const [selectedRingtone, setSelectedRingtone] = useState(() => localStorage.getItem('selected_ringtone') || 'classic');
  const [customRingtoneUrl, setCustomRingtoneUrl] = useState<string | null>(() => localStorage.getItem('custom_ringtone_url'));

  const playRingtoneSample = (type: string, customUrl?: string | null) => {
    if (customUrl) {
      const audio = new Audio(customUrl);
      audio.play().catch(() => {});
      return;
    }
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      let notes = [523.25, 659.25, 783.99, 1046.5];
      if (type === 'marimba') notes = [440, 880, 659.25, 523.25];
      if (type === 'retro') notes = [300, 450, 600, 900];
      if (type === 'chime') notes = [880, 987.77, 1046.5, 1318.51];
      if (type === 'digital') notes = [700, 700, 900, 900];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type === 'retro' ? 'square' : (type === 'digital' ? 'sawtooth' : 'sine');
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.2, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.25);
      });
    } catch(e) {}
  };

  const handleMp3Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomRingtoneUrl(url);
      localStorage.setItem('custom_ringtone_url', url);
      setSelectedRingtone('custom');
      const audio = new Audio(url);
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    partyMembers.forEach(m => {
      if (m.id !== profile.uid) {
        const audio = document.getElementById(`audio-${m.id}`) as HTMLAudioElement;
        if (audio) {
          audio.muted = isDeafened || !!peerMutes[m.id];
        }
      }
    });
  }, [peerMutes, isDeafened, partyMembers]);

  const audioContexts = useRef<Record<string, AudioContext>>({});
  const analyzers = useRef<Record<string, AnalyserNode>>({});
  const localStream = useRef<MediaStream | null>(null);
  const peers = useRef<Record<string, RTCPeerConnection>>({});

  useEffect(() => {
    let animationFrameId: number;
    const updateSpeakingStates = () => {
      const dataArray = new Uint8Array(256);
      const newSpeakingPeers: Record<string, boolean> = {};
      
      Object.entries(analyzers.current).forEach(([peerId, analyzer]) => {
        (analyzer as AnalyserNode).getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        newSpeakingPeers[peerId] = average > 10; 
      });
      
      setSpeakingPeers(prev => {
        let changed = false;
        for (const key in newSpeakingPeers) {
          if (prev[key] !== newSpeakingPeers[key]) changed = true;
        }
        for (const key in prev) {
          if (prev[key] !== newSpeakingPeers[key]) changed = true;
        }
        return changed ? newSpeakingPeers : prev;
      });
      animationFrameId = requestAnimationFrame(updateSpeakingStates);
    };
    updateSpeakingStates();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    if (!profile || profile.uid === 'guest') return;
    const membersQuery = collection(db, 'parties', partyId, 'members');
    const unsub = onSnapshot(membersQuery, (snap) => {
      const members: any[] = [];
      snap.forEach(d => members.push({ id: d.id, ...d.data() }));
      setPartyMembers(members);
      if (inParty) {
        members.forEach(m => {
          if (m.id !== profile.uid && !peers.current[m.id] && m.id > profile.uid) {
             connectToPeer(m.id);
          }
        });
      }
    });
    return () => unsub();
  }, [inParty, profile.uid]);

  const connectToPeer = async (peerId: string) => {
    const pc = new RTCPeerConnection(servers);
    peers.current[peerId] = pc;
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current!));
    }
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      let audio = document.getElementById(`audio-${peerId}`) as HTMLAudioElement;
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = `audio-${peerId}`;
        audio.autoplay = true;
        document.body.appendChild(audio);
      }
      audio.srcObject = remoteStream;
      audio.muted = isDeafened || !!peerMutes[peerId];
    };
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(collection(db, 'parties', partyId, 'signals'), {
          from: profile.uid,
          to: peerId,
          candidate: event.candidate.toJSON()
        });
      }
    };
    if (profile.uid < peerId) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await addDoc(collection(db, 'parties', partyId, 'signals'), {
        from: profile.uid,
        to: peerId,
        offer: { type: offer.type, sdp: offer.sdp }
      });
    }
  };

  const joinParty = async () => {
    setMicError('');
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(localStream.current);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      src.connect(analyzer);
      
      audioContexts.current[profile.uid] = ctx;
      analyzers.current[profile.uid] = analyzer;

      setInParty(true);
      const memberRef = doc(db, 'parties', partyId, 'members', profile.uid);
      await setDoc(memberRef, {
        uid: profile.uid,
        gamertag: profile.gamertag,
        avatar: profile.avatar || '',
        isMuted: isMuted,
        joinedAt: serverTimestamp()
      });
    } catch(e: any) {
      console.error(e);
      setMicError("Microphone access is required to join the voice call.");
    }
  };

  const toggleMute = async () => {
    const next = !isMuted;
    setIsMuted(next);
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(t => t.enabled = !next);
    }
    if (profile && profile.uid !== 'guest') {
      try {
        await updateDoc(doc(db, 'parties', partyId, 'members', profile.uid), { isMuted: next });
      } catch(e) {}
    }
  };

  const toggleDeafen = () => {
    const next = !isDeafened;
    setIsDeafened(next);
    if (!next && isMuted) toggleMute();
  };

  const toggleVideo = async () => {
    if (!isVideoOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setIsVideoOn(true);
        setIsScreenSharing(false);
      } catch(e) {
        alert("Unable to access camera.");
      }
    } else {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
        videoStreamRef.current = null;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setIsVideoOn(false);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
        videoStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setIsScreenSharing(true);
        setIsVideoOn(false);
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current) localVideoRef.current.srcObject = null;
        };
      } catch(e) {
        console.error(e);
      }
    } else {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
        videoStreamRef.current = null;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setIsScreenSharing(false);
    }
  };

  useEffect(() => {
    if (!profile || profile.uid === 'guest') return;
    const q = query(collection(db, 'friendRequests'), or(where('fromUid', '==', profile.uid), where('toUid', '==', profile.uid)));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const accepted = data.filter(r => (r as any).status === 'accepted');
      const list: any[] = [];
      for (const r of accepted as any[]) {
        if (r.fromUid === profile.uid) {
          const userDoc = await getDoc(doc(db, 'users', r.toUid));
          if (userDoc.exists()) list.push({ uid: r.toUid, gamertag: userDoc.data().gamertag, avatar: userDoc.data().avatar });
        } else {
          list.push({ uid: r.fromUid, gamertag: r.fromGamertag });
        }
      }
      setFriendsList(list.filter((v,i,a)=>a.findIndex(t=>(t.uid === v.uid))===i));
    }, () => {});
    return () => unsub();
  }, [showInviteModal, profile.uid]);

  const sendInvite = async (fUid: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        toUid: fUid,
        fromUid: profile.uid,
        fromGamertag: profile.gamertag,
        type: 'party_invite',
        partyId: partyId,
        read: false,
        createdAt: serverTimestamp()
      });
      alert('Invite sent!');
    } catch(e) {
      console.error(e);
    }
  };

  const isHalloween = localStorage.getItem('halloween_theme') === 'true';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`flex flex-col h-full w-full overflow-hidden ${isHalloween ? 'bg-[#1a0b03]' : 'bg-[#1e1f22]'} text-white select-none`}>
      {/* Discord Call Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#111214]/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isHalloween ? 'hover:bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-white'}`} title="Go Back">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg ${isHalloween ? 'bg-orange-600/30 text-orange-400 border border-orange-500/30' : 'bg-[#5865F2]/30 text-[#5865F2] border border-[#5865F2]/30'}`}>
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Discord Voice & Video Call</h2>
              <span className="text-xs text-zinc-400 font-medium">{partyMembers.length} Active Participants</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowRingtoneModal(true)} 
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors shadow-md"
            title="Ringtone Settings"
          >
            <Music size={16} className={isHalloween ? 'text-orange-400' : 'text-indigo-400'} />
            <span>Ringtones</span>
          </button>
          {inParty && (
            <button onClick={() => setShowInviteModal(true)} className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-md ${isHalloween ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'}`}>
              Invite Friends
            </button>
          )}
        </div>
      </div>
      
      {micError && !inParty && <p className="text-red-500 mt-2 font-semibold text-center text-sm">{micError}</p>}

      {/* Main Discord Call Grid / Video Area */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center relative">
        {inParty ? (
          <div className="w-full max-w-5xl h-full flex flex-col gap-6">
            {/* Video / Screen Share Grid if active */}
            {(isVideoOn || isScreenSharing) && (
              <div className="w-full h-72 bg-black/80 border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl shrink-0 flex items-center justify-center">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold text-white border border-white/10">
                  {isScreenSharing ? '🖥️ Your Screen' : '📷 Your Camera'}
                </div>
              </div>
            )}

            {/* Participants Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
              {partyMembers.map((member) => (
                <div key={member.id} className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30' : 'bg-[#2b2d31]/90 border-white/5'} border rounded-3xl p-6 flex flex-col items-center justify-center gap-3 relative shadow-xl backdrop-blur-xl group`}>
                  <div className="relative">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.gamertag} className={`w-20 h-20 rounded-full object-cover border-4 ${!member.isMuted && speakingPeers[member.id] ? (isHalloween ? 'border-orange-500 shadow-[0_0_25px_rgba(255,107,0,0.8)] animate-pulse' : 'border-[#23a55a] shadow-[0_0_25px_rgba(35,165,90,0.8)] animate-pulse') : 'border-transparent'}`} />
                    ) : (
                      <div className={`w-20 h-20 rounded-full bg-zinc-800 border-4 ${!member.isMuted && speakingPeers[member.id] ? (isHalloween ? 'border-orange-500 shadow-[0_0_25px_rgba(255,107,0,0.8)] animate-pulse' : 'border-[#23a55a] shadow-[0_0_25px_rgba(35,165,90,0.8)] animate-pulse') : 'border-transparent'} flex items-center justify-center text-zinc-300 text-2xl font-bold`}>
                        {member.gamertag?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {member.isMuted && (
                      <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg border-2 border-[#2b2d31]">
                        <MicOff size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-base text-white truncate max-w-[140px]">{member.gamertag}</span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {member.id === profile.uid ? 'You' : (member.isMuted ? 'Muted' : (speakingPeers[member.id] ? 'Speaking...' : 'Listening'))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl ${isHalloween ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30' : 'bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30'}`}>
              <Users size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Join Call?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Connect your microphone to enter the 1-on-1 voice & video room.</p>
            </div>
            <button onClick={joinParty} className={`px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-xl hover:scale-105 ${isHalloween ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-900/40 text-white' : 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[#5865F2]/35'}`}>
              Connect to Call
            </button>
          </div>
        )}
      </div>

      {/* Discord Floating Bottom Controls Bar */}
      {inParty && (
        <div className="flex items-center justify-center gap-4 py-4 px-8 bg-[#111214]/80 backdrop-blur-xl border-t border-white/10 shrink-0">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full flex items-center justify-center transition-all shadow-lg ${isMuted ? 'bg-red-600 text-white' : 'bg-[#2b2d31] hover:bg-[#35373c] text-white'}`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <button 
            onClick={toggleDeafen}
            className={`p-4 rounded-full flex items-center justify-center transition-all shadow-lg ${isDeafened ? 'bg-red-600 text-white' : 'bg-[#2b2d31] hover:bg-[#35373c] text-white'}`}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            <Headphones size={22} />
          </button>

          <button 
            onClick={toggleVideo}
            className={`p-4 rounded-full flex items-center justify-center transition-all shadow-lg ${isVideoOn ? 'bg-green-600 text-white' : 'bg-[#2b2d31] hover:bg-[#35373c] text-white'}`}
            title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isVideoOn ? <Camera size={22} /> : <CameraOff size={22} />}
          </button>

          <button 
            onClick={toggleScreenShare}
            className={`p-4 rounded-full flex items-center justify-center transition-all shadow-lg ${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-[#2b2d31] hover:bg-[#35373c] text-white'}`}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <Monitor size={22} />
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <button 
            onClick={() => setInParty(false)}
            className="px-6 py-3.5 bg-red-600 hover:bg-red-700 rounded-2xl flex items-center gap-2 font-bold text-white transition-all shadow-lg shadow-red-900/40 hover:scale-105"
            title="Disconnect"
          >
            <PhoneOff size={20} />
            <span>Disconnect</span>
          </button>
        </div>
      )}

      {/* Ringtone Settings Modal */}
      {showRingtoneModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${isHalloween ? 'bg-[#1c0c03] border-orange-500/40 shadow-[0_0_40px_rgba(255,107,0,0.3)]' : 'bg-[#2b2d31] border-white/15 shadow-2xl'} border rounded-3xl p-8 w-full max-w-md text-white`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2.5">
                <Music size={24} className={isHalloween ? 'text-orange-400' : 'text-indigo-400'} /> Ringtone Settings
              </h3>
              <button onClick={() => setShowRingtoneModal(false)} className="text-zinc-400 hover:text-white p-1">✕</button>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">Choose from 5 preset ringtones (click any to preview) or upload your own custom MP3 file!</p>

            <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-2 custom-scroll mb-6">
              {RINGTONE_PRESETS.map(preset => (
                <div 
                  key={preset.id} 
                  onClick={() => {
                    setSelectedRingtone(preset.id);
                    localStorage.setItem('selected_ringtone', preset.id);
                    playRingtoneSample(preset.id);
                  }}
                  className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${selectedRingtone === preset.id ? (isHalloween ? 'bg-orange-600/30 border-orange-500 text-white' : 'bg-[#5865F2]/30 border-[#5865F2] text-white') : 'bg-black/40 border-white/5 hover:bg-black/60 text-zinc-300'}`}
                >
                  <span className="font-bold text-sm">{preset.name}</span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Preview 🎵</span>
                </div>
              ))}
            </div>

            {/* Custom MP3 Upload */}
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Or Upload Custom MP3 Ringtone</label>
              <label className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-black/50 border border-dashed border-zinc-600 hover:border-zinc-400 cursor-pointer transition-colors text-sm font-semibold text-zinc-300">
                <Upload size={18} />
                <span>{customRingtoneUrl ? 'Custom MP3 Loaded ✓' : 'Choose MP3 File...'}</span>
                <input type="file" accept="audio/mp3,audio/*" onChange={handleMp3Upload} className="hidden" />
              </label>
            </div>

            <button onClick={() => setShowRingtoneModal(false)} className={`w-full py-3.5 rounded-2xl font-bold transition-all shadow-lg text-sm ${isHalloween ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'}`}>
              Save & Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${isHalloween ? 'bg-[#1c0c03] border-orange-500/40 shadow-[0_0_40px_rgba(255,107,0,0.3)]' : 'bg-[#2b2d31] border-white/15 shadow-2xl'} border rounded-3xl p-8 w-full max-w-md text-white`}>
            <h3 className="text-2xl font-bold mb-4">Invite Friends to Call</h3>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 custom-scroll mb-6">
              {friendsList.length === 0 ? (
                <p className="text-zinc-500 text-center py-6">You have no friends to invite right now.</p>
              ) : (
                friendsList.map(f => (
                  <div key={f.uid} className="flex items-center justify-between bg-black/40 border border-white/5 p-3.5 rounded-xl">
                    <span className="font-semibold text-white">{f.gamertag}</span>
                    <button 
                      onClick={() => sendInvite(f.uid)}
                      className={`${isHalloween ? 'bg-orange-600 hover:bg-orange-500' : 'bg-[#5865F2] hover:bg-[#4752C4]'} text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-md`}
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowInviteModal(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg">
              Close
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
