import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Users, Mic, MicOff, PhoneOff, Headphones, Volume2, VolumeX } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, setDoc, deleteDoc, collection, serverTimestamp, addDoc, getDoc, query, or, where } from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

export const Party: React.FC<{ profile: any, onBack: () => void, initialPartyId?: string }> = ({ profile, onBack, initialPartyId }) => {
  const [partyId] = useState(initialPartyId || Math.random().toString(36).substring(2, 9));
  const [partyMembers, setPartyMembers] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [peerMutes, setPeerMutes] = useState<Record<string, boolean>>({});
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [inParty, setInParty] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [micError, setMicError] = useState('');
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  
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
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Threshold for detecting speech (adjust if necessary)
        newSpeakingPeers[peerId] = average > 10; 
      });
      
      setSpeakingPeers(prev => {
        // Only update state if something changed to avoid rapid re-renders
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

    // Always listen to party members
    const membersQuery = collection(db, 'parties', partyId, 'members');
    const unsub = onSnapshot(membersQuery, (snap) => {
      const members: any[] = [];
      snap.forEach(d => members.push({ id: d.id, ...d.data() }));
      setPartyMembers(members);
      
      // If we are in the party, connect to new members
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

  useEffect(() => {
    if (!inParty || !profile || profile.uid === 'guest') return;

    let unsubs: (() => void)[] = [];
    const init = async () => {
      // 1. Log activity
      try {
        await addDoc(collection(db, 'activities'), {
          type: 'party',
          uid: profile.uid,
          gamertag: profile.gamertag,
          avatar: profile.avatar || '',
          details: 'Joined a party',
          createdAt: serverTimestamp()
        });
      } catch (e) { console.error("Party activity error", e); }

      // 2. Get local audio
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        // Setup local audio visualizer
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(localStream.current);
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 256;
        src.connect(analyzer);
        
        audioContexts.current[profile.uid] = ctx;
        analyzers.current[profile.uid] = analyzer;
        
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        const checkLocalAudio = () => {
           if (!analyzers.current[profile.uid]) return;
           analyzer.getByteFrequencyData(dataArray);
           let sum = 0;
           for (let i = 0; i < dataArray.length; i++) {
             sum += dataArray[i];
           }
           const average = sum / dataArray.length;
           const isSpeaking = average > 10;
           setSpeakingPeers(prev => prev[profile.uid] === isSpeaking ? prev : { ...prev, [profile.uid]: isSpeaking });
           requestAnimationFrame(checkLocalAudio);
        };
        checkLocalAudio();
      } catch(e) {
        console.error("No mic", e);
      }

      // 3. Join presence
      const memberRef = doc(db, 'parties', partyId, 'members', profile.uid);
      await setDoc(memberRef, {
        uid: profile.uid,
        gamertag: profile.gamertag,
        avatar: profile.avatar || '',
        isMuted: isMuted,
        joinedAt: serverTimestamp()
      });

      // 4. Listen to signals sent to US
      const signalsRef = collection(db, 'parties', partyId, 'members', profile.uid, 'signals');
      unsubs.push(onSnapshot(signalsRef, (snap) => {
        snap.docChanges().forEach(change => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            handleSignal(change.doc.id, data);
          }
        });
      }, () => {}));
    };

    init();

    const leaveParty = async () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(t => t.stop());
      }
      Object.values(peers.current).forEach((pc: any) => pc.close());
      peers.current = {};
      Object.values(audioContexts.current).forEach(ctx => (ctx as any).close().catch(()=>{}));
      audioContexts.current = {};
      analyzers.current = {};
      setSpeakingPeers({});
      await deleteDoc(doc(db, 'parties', partyId, 'members', profile.uid));
    };

    window.addEventListener('beforeunload', leaveParty);

    return () => {
      leaveParty();
      unsubs.forEach(u => u());
      window.removeEventListener('beforeunload', leaveParty);
    };
  }, [inParty, profile.uid]);

  const joinParty = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setInParty(true);
    } catch(e) {
      setMicError('Microphone access denied. Please allow microphone access to join the party.');
    }
  };

  const connectToPeer = async (peerId: string) => {
    const pc = new RTCPeerConnection(servers);
    peers.current[peerId] = pc;
    (pc as any).addedCandidates = new Set();
    
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current!));
    }

    pc.ontrack = (event) => setupAudioEl(peerId, event.streams[0]);

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        const sigRef = doc(db, 'parties', partyId, 'members', peerId, 'signals', profile.uid);
        const sigSnap = await getDoc(sigRef);
        const data = sigSnap.exists() ? sigSnap.data() : { candidates: [] };
        const cands = data.candidates || [];
        await setDoc(sigRef, { ...data, candidates: [...cands, event.candidate.toJSON()] }, { merge: true });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sigRef = doc(db, 'parties', partyId, 'members', peerId, 'signals', profile.uid);
    await setDoc(sigRef, { type: 'offer', offer: { type: offer.type, sdp: offer.sdp }, candidates: [] }, { merge: true });
  };

    const handleSignal = async (peerId: string, data: any) => {
    let pc = peers.current[peerId];
    if (!pc) {
      pc = new RTCPeerConnection(servers);
      peers.current[peerId] = pc;
      
      // Keep track of added candidates to avoid duplicates
      (pc as any).addedCandidates = new Set();
      
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current!));
      }
      pc.ontrack = (event) => setupAudioEl(peerId, event.streams[0]);
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const sigRef = doc(db, 'parties', partyId, 'members', peerId, 'signals', profile.uid);
          const sigSnap = await getDoc(sigRef);
          const sdata = sigSnap.exists() ? sigSnap.data() : { candidates: [] };
          const cands = sdata.candidates || [];
          await setDoc(sigRef, { ...sdata, candidates: [...cands, event.candidate.toJSON()] }, { merge: true });
        }
      };
    }
    
    if (data.type === 'offer' && data.offer && !(pc as any).hasSetRemote) {
      (pc as any).hasSetRemote = true;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        const sigRef = doc(db, 'parties', partyId, 'members', peerId, 'signals', profile.uid);
        await setDoc(sigRef, { type: 'answer', answer: { type: answer.type, sdp: answer.sdp } }, { merge: true });
      } catch(e) { console.error("Error handling offer", e); }
    }
    
    if (data.type === 'answer' && data.answer && !(pc as any).hasSetRemote) {
      (pc as any).hasSetRemote = true;
      try {
        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      } catch(e) { console.error("Error handling answer", e); }
    }
    
    if (data.candidates && pc.remoteDescription) {
      for (const cand of data.candidates) {
        // avoid adding the same candidate twice
        const candStr = JSON.stringify(cand);
        if (!(pc as any).addedCandidates) (pc as any).addedCandidates = new Set();
        if (!(pc as any).addedCandidates.has(candStr)) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
            (pc as any).addedCandidates.add(candStr);
          } catch(e){ console.error("Error adding ICE candidate", e); }
        }
      }
    }
  };

  const setupAudioEl = (peerId: string, stream: MediaStream) => {
    let audio = document.getElementById(`audio-${peerId}`) as HTMLAudioElement;
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = `audio-${peerId}`;
      audio.autoplay = true;
      (audio as any).playsInline = true;
      document.body.appendChild(audio);
    }
    
    // Create a new stream that only contains the audio track to prevent silent errors
    if (stream.getAudioTracks().length > 0) {
      audio.srcObject = stream;
    } else {
      audio.srcObject = stream;
    }
    
    // Explicitly play it with user interaction fallback context
    setTimeout(() => {
      audio.play().catch(e => console.error('Audio play error for peer', peerId, ':', e));
    }, 500);

    // Audio Visualizer Setup
    if (!audioContexts.current[peerId]) {
       try {
         const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
         const ctx = new AudioContext();
         const src = ctx.createMediaStreamSource(stream);
         const analyzer = ctx.createAnalyser();
         analyzer.fftSize = 256;
         src.connect(analyzer);
         analyzer.connect(ctx.destination);
         
         audioContexts.current[peerId] = ctx;
         analyzers.current[peerId] = analyzer;
         
         const dataArray = new Uint8Array(analyzer.frequencyBinCount);
         const checkAudio = () => {
           if (!analyzers.current[peerId]) return;
           analyzer.getByteFrequencyData(dataArray);
           let sum = 0;
           for (let i = 0; i < dataArray.length; i++) {
             sum += dataArray[i];
           }
           const average = sum / dataArray.length;
           const isSpeaking = average > 10;
           setSpeakingPeers(prev => prev[peerId] === isSpeaking ? prev : { ...prev, [peerId]: isSpeaking });
           requestAnimationFrame(checkAudio);
         };
         checkAudio();
       } catch (e) {
         console.error('Audio context error:', e);
       }
    }
  };

  useEffect(() => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(t => {
        t.enabled = !(isMuted || isDeafened);
      });
    }
  }, [isMuted, isDeafened]);

  useEffect(() => {
    partyMembers.forEach(m => {
      if (m.uid === profile?.uid) return;
      const audio = document.getElementById(`audio-${m.uid}`) as HTMLAudioElement;
      if (audio) {
        audio.muted = isDeafened || !!peerMutes[m.uid];
      }
    });
  }, [isDeafened, peerMutes, partyMembers, profile?.uid]);

  const toggleMute = async () => {
    const memberRef = doc(db, 'parties', partyId, 'members', profile.uid);
    await updateDoc(memberRef, { isMuted: !isMuted });
    setIsMuted(!isMuted);
    // If we unmute, and we are deafened, we should probably undeafen?
    if (isMuted && isDeafened) {
      setIsDeafened(false);
    }
  };

  const toggleDeafen = async () => {
    const newDeafened = !isDeafened;
    setIsDeafened(newDeafened);
    if (newDeafened && !isMuted) {
      setIsMuted(true);
      const memberRef = doc(db, 'parties', partyId, 'members', profile.uid);
      await updateDoc(memberRef, { isMuted: true });
    }
  };

  useEffect(() => {
    if (!showInviteModal || !profile || profile.uid === 'guest') return;
    const q = query(
      collection(db, 'friendRequests'),
      or(
        where('fromUid', '==', profile.uid),
        where('toUid', '==', profile.uid)
      )
    );
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-4xl mx-auto flex flex-col pt-8 pb-12 h-full overflow-y-auto w-full text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-colors -ml-2 ${isHalloween ? 'hover:bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-white'}`}>
            <ChevronLeft size={26} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isHalloween ? 'bg-orange-600/30 text-orange-400 border border-orange-500/30' : 'bg-green-600/30 text-green-400 border border-green-500/30'}`}>
              <Users size={26} />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Voice & Party</h2>
              <span className={`text-sm font-semibold ${isHalloween ? 'text-orange-400' : 'text-green-400'}`}>{partyMembers.length} Active Connected</span>
            </div>
          </div>
        </div>
        
        {inParty ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setShowInviteModal(true)} className={`px-4 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md ${isHalloween ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
              Invite Friends
            </button>
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <button 
              onClick={toggleMute}
              className={`p-3 rounded-full flex items-center justify-center transition-all shadow-md ${isMuted ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={toggleDeafen}
              className={`p-3 rounded-full flex items-center justify-center transition-all shadow-md ${isDeafened ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              title={isDeafened ? 'Undeafen' : 'Deafen'}
            >
              <Headphones size={20} />
            </button>
            <button 
              onClick={() => setInParty(false)}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all shadow-lg shadow-red-900/30"
              title="Leave Call"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        ) : (
          <button onClick={joinParty} className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-xl text-base ${isHalloween ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-900/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/30'}`}>
            Join Voice Room
          </button>
        )}
      </div>
      
      {micError && !inParty && <p className="text-red-500 mt-4 font-semibold text-center">{micError}</p>}

      <div className="flex flex-col gap-4 mt-8">
        {partyMembers.map((member) => (
          <div key={member.id} className={`${isHalloween ? 'bg-[#1c0c03]/90 border-orange-500/30 shadow-[0_0_20px_rgba(255,107,0,0.15)]' : 'bg-zinc-900/90 border-white/10 shadow-xl'} border rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl transition-all`}>
            <div className="flex items-center gap-4">
              <div className="relative">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.gamertag} className="w-14 h-14 rounded-full object-cover border-2 border-white/10 shadow-md" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center text-zinc-300 text-xl font-bold shadow-md">
                    {member.gamertag?.charAt(0).toUpperCase()}
                  </div>
                )}
                {!member.isMuted && speakingPeers[member.id] && (
                  <div className={`absolute -inset-1 rounded-full border-2 ${isHalloween ? 'border-orange-500 shadow-[0_0_20px_rgba(255,107,0,0.8)]' : 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)]'} animate-pulse pointer-events-none`}></div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">{member.gamertag}</span>
                <span className={`text-xs font-semibold ${member.isMuted ? 'text-red-400' : (speakingPeers[member.id] ? (isHalloween ? 'text-orange-400' : 'text-green-400') : 'text-zinc-400')}`}>
                  {member.isMuted ? 'Muted' : (speakingPeers[member.id] ? 'Speaking...' : 'Connected & Listening')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {member.id === profile.uid ? (
                <>
                  <button onClick={toggleDeafen} className={`p-2.5 rounded-full transition-colors shadow-md ${isDeafened ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title="Deafen">
                    <Headphones size={18} />
                  </button>
                  <button onClick={toggleMute} className={`p-2.5 rounded-full transition-colors shadow-md ${isMuted ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title="Mute">
                    {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setPeerMutes(prev => ({...prev, [member.id]: !prev[member.id]}))} className={`p-2.5 rounded-full transition-colors shadow-md ${peerMutes[member.id] ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`} title={peerMutes[member.id] ? 'Unmute User' : 'Mute User'}>
                    {peerMutes[member.id] ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="p-2.5 text-zinc-500 flex items-center justify-center bg-black/30 rounded-full">
                    {member.isMuted ? <MicOff size={18} className="text-red-400" /> : <Mic size={18} className={isHalloween ? 'text-orange-400' : 'text-green-400'} />}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        {partyMembers.length === 0 && (
          <div className="text-center text-zinc-500 py-16 flex flex-col items-center justify-center gap-3">
            <Users size={48} className="text-zinc-600" />
            <p className="text-base font-medium">You are not currently in a voice call room.</p>
            <button onClick={joinParty} className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${isHalloween ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
              Connect Now
            </button>
          </div>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${isHalloween ? 'bg-[#1c0c03] border-orange-500/40 shadow-[0_0_30px_rgba(255,107,0,0.25)]' : 'bg-zinc-900 border-zinc-700 shadow-2xl'} border rounded-2xl p-6 w-full max-w-md`}>
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
                      className={`${isHalloween ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'} text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-md`}
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
}
