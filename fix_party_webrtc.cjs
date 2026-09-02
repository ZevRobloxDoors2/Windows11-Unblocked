const fs = require('fs');
let code = fs.readFileSync('src/components/Party.tsx', 'utf8');

const newHandleSignal = `  const handleSignal = async (peerId: string, data: any) => {
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
  };`;

code = code.replace(/const handleSignal = async \(peerId: string, data: any\) => \{[\s\S]*?\}\n    \}\n  \};/m, newHandleSignal);

// Let's also fix connectToPeer to set addedCandidates
code = code.replace("peers.current[peerId] = pc;", "peers.current[peerId] = pc;\n    (pc as any).addedCandidates = new Set();");

fs.writeFileSync('src/components/Party.tsx', code);
