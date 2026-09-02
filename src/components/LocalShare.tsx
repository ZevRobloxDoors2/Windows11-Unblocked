import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, onSnapshot, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Share2, File as FileIcon, Download, X, User } from 'lucide-react';

const servers = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }
  ]
};

export function LocalShare({ profile }: { profile: any }) {
  const [peersOnline, setPeersOnline] = useState<any[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [transfers, setTransfers] = useState<any[]>([]);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const receiveBuffer = useRef<any[]>([]);
  const receiveMeta = useRef<any>(null);
  const receivedSize = useRef(0);

  useEffect(() => {
    if (!profile || profile.uid === 'guest') return;
    
    // Register online presence for LocalShare
    const presenceRef = doc(db, 'localshare_presence', profile.uid);
    setDoc(presenceRef, {
      uid: profile.uid,
      gamertag: profile.gamertag,
      avatar: profile.avatar || '',
      lastSeen: serverTimestamp()
    });

    const unsubPresence = onSnapshot(collection(db, 'localshare_presence'), (snap) => {
      const p: any[] = [];
      snap.forEach(d => {
        if (d.id !== profile.uid) p.push(d.data());
      });
      setPeersOnline(p);
    });

    // Listen for incoming WebRTC signals
    const signalsRef = collection(db, 'localshare_signals', profile.uid, 'incoming');
    const unsubSignals = onSnapshot(signalsRef, (snap) => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added' || change.type === 'modified') {
          handleSignal(change.doc.id, change.doc.data());
        }
      });
    });

    return () => {
      unsubPresence();
      unsubSignals();
      deleteDoc(presenceRef).catch(()=>{});
      if (pcRef.current) pcRef.current.close();
    };
  }, [profile]);

  const setupDataChannel = (dc: RTCDataChannel, peerId: string) => {
    dc.onopen = () => setConnectionStatus('Connected to ' + peerId);
    dc.onclose = () => setConnectionStatus('Disconnected');
    dc.onmessage = (e) => {
      if (typeof e.data === 'string') {
        const meta = JSON.parse(e.data);
        receiveMeta.current = meta;
        receiveBuffer.current = [];
        receivedSize.current = 0;
      } else {
        receiveBuffer.current.push(e.data);
        receivedSize.current += e.data.byteLength;
        if (receivedSize.current >= receiveMeta.current.size) {
          const blob = new Blob(receiveBuffer.current, { type: receiveMeta.current.type });
          const url = URL.createObjectURL(blob);
          setTransfers(prev => [...prev, {
            name: receiveMeta.current.name,
            url,
            direction: 'in',
            time: new Date().toLocaleTimeString()
          }]);
        }
      }
    };
    dcRef.current = dc;
  };

  const handleSignal = async (peerId: string, data: any) => {
    if (!pcRef.current) {
      const pc = new RTCPeerConnection(servers);
      pcRef.current = pc;
      
      pc.ondatachannel = (e) => setupDataChannel(e.channel, peerId);
      
      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          const sigRef = doc(db, 'localshare_signals', peerId, 'incoming', profile.uid);
          const snap = await getDoc(sigRef);
          const sdata = snap.exists() ? snap.data() : { candidates: [] };
          await setDoc(sigRef, { ...sdata, candidates: [...(sdata.candidates||[]), e.candidate.toJSON()] }, { merge: true });
        }
      };
    }

    const pc = pcRef.current;
    if (data.type === 'offer' && data.offer && !(pc as any).hasSetRemote) {
      (pc as any).hasSetRemote = true;
      setSelectedPeer(peerId);
      setConnectionStatus('Connecting...');
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await setDoc(doc(db, 'localshare_signals', peerId, 'incoming', profile.uid), {
        type: 'answer',
        answer: { type: answer.type, sdp: answer.sdp }
      }, { merge: true });
    }
    
    if (data.type === 'answer' && data.answer && !(pc as any).hasSetRemote) {
      (pc as any).hasSetRemote = true;
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }

    if (data.candidates && pc.remoteDescription) {
      for (const cand of data.candidates) {
        const candStr = JSON.stringify(cand);
        if (!(pc as any).addedCandidates) (pc as any).addedCandidates = new Set();
        if (!(pc as any).addedCandidates.has(candStr)) {
          await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{});
          (pc as any).addedCandidates.add(candStr);
        }
      }
    }
  };

  const connectToPeer = async (peerId: string) => {
    setSelectedPeer(peerId);
    setConnectionStatus('Initiating...');
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    const dc = pc.createDataChannel('sendChannel');
    setupDataChannel(dc, peerId);

    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        const sigRef = doc(db, 'localshare_signals', peerId, 'incoming', profile.uid);
        const snap = await getDoc(sigRef);
        const sdata = snap.exists() ? snap.data() : { candidates: [] };
        await setDoc(sigRef, { ...sdata, candidates: [...(sdata.candidates||[]), e.candidate.toJSON()] }, { merge: true });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await setDoc(doc(db, 'localshare_signals', peerId, 'incoming', profile.uid), {
      type: 'offer',
      offer: { type: offer.type, sdp: offer.sdp },
      candidates: []
    }, { merge: true });
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dcRef.current || dcRef.current.readyState !== 'open') return alert("Not connected to a peer.");
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    dcRef.current.send(JSON.stringify({ name: file.name, size: file.size, type: file.type }));
    
    const chunkSize = 16384;
    const reader = new FileReader();
    let offset = 0;

    reader.onload = (e) => {
      if (dcRef.current?.readyState === 'open') {
        dcRef.current.send(e.target!.result as ArrayBuffer);
        offset += (e.target!.result as ArrayBuffer).byteLength;
        if (offset < file.size) {
          readSlice(offset);
        } else {
          setTransfers(prev => [...prev, { name: file.name, direction: 'out', time: new Date().toLocaleTimeString() }]);
        }
      }
    };
    const readSlice = (o: number) => {
      const slice = file.slice(offset, o + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    readSlice(0);
  };

  return (
    <div className="h-full bg-zinc-900 text-white flex">
      {/* Sidebar - Peers */}
      <div className="w-1/3 border-r border-white/10 p-4 flex flex-col">
        <div className="flex items-center gap-2 font-semibold text-lg mb-6 text-[#00A4EF]">
          <Share2 size={24} />
          Local Share
        </div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Nearby Devices</h3>
        <div className="flex-1 overflow-y-auto space-y-2">
          {peersOnline.length === 0 && <p className="text-zinc-600 text-sm">No one is nearby.</p>}
          {peersOnline.map(p => (
            <button 
              key={p.uid} 
              onClick={() => connectToPeer(p.uid)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${selectedPeer === p.uid ? 'bg-[#00A4EF]/20 border border-[#00A4EF]' : 'bg-zinc-800 hover:bg-zinc-700 border border-transparent'}`}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                {p.avatar ? <img src={p.avatar} className="w-full h-full rounded-full object-cover"/> : <User size={20}/>}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold truncate">{p.gamertag}</div>
                <div className="text-xs text-zinc-400">Available to share</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Area - Dropzone */}
      <div className="w-2/3 flex flex-col p-8">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold mb-1">{selectedPeer ? 'Connected' : 'Select a device'}</h2>
          <p className="text-zinc-400 text-sm">{connectionStatus || 'Choose someone from the list to start sharing.'}</p>
        </div>
        
        <div 
          onDragOver={e => e.preventDefault()}
          onDrop={handleFileDrop}
          className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-colors ${selectedPeer && connectionStatus.includes('Connected') ? 'border-[#00A4EF] bg-[#00A4EF]/5' : 'border-zinc-700 bg-zinc-800/50 opacity-50 pointer-events-none'}`}
        >
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Download size={40} />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">Drop files here</h3>
            <p className="text-zinc-500 text-sm">Transfer is completely peer-to-peer</p>
          </div>
        </div>

        {/* Transfer History */}
        {transfers.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Recent Transfers</h3>
            <div className="space-y-2">
              {transfers.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileIcon size={18} className="text-[#00A4EF]" />
                    <span className="text-sm">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">{t.time}</span>
                    {t.direction === 'in' ? (
                      <a href={t.url} download={t.name} className="px-3 py-1 bg-[#00A4EF] hover:bg-[#00A4EF]/80 text-white text-xs font-bold rounded">Save</a>
                    ) : (
                      <span className="text-xs text-green-500 font-bold uppercase">Sent</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
