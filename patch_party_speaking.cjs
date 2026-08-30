const fs = require('fs');
let code = fs.readFileSync('src/components/Party.tsx', 'utf8');

const analyzeTarget = `  useEffect(() => {
    // Always listen to party members`;

const analyzeReplacement = `  useEffect(() => {
    let animationFrameId: number;
    const updateSpeakingStates = () => {
      const dataArray = new Uint8Array(256);
      const newSpeakingPeers: Record<string, boolean> = {};
      
      Object.entries(analyzers.current).forEach(([peerId, analyzer]) => {
        analyzer.getByteFrequencyData(dataArray);
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
    // Always listen to party members`;

code = code.replace(analyzeTarget, analyzeReplacement);
fs.writeFileSync('src/components/Party.tsx', code);
