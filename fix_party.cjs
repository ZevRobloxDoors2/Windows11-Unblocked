const fs = require('fs');
let code = fs.readFileSync('src/components/Party.tsx', 'utf8');

const missingAudioEffect = `
  useEffect(() => {
    partyMembers.forEach(m => {
      if (m.id !== profile.uid) {
        const audio = document.getElementById(\`audio-\${m.id}\`) as HTMLAudioElement;
        if (audio) {
          audio.muted = isDeafened || !!peerMutes[m.id];
        }
      }
    });
  }, [peerMutes, isDeafened, partyMembers]);
`;

code = code.replace(
  "const audioContexts = useRef<Record<string, AudioContext>>({});",
  missingAudioEffect + "\n  const audioContexts = useRef<Record<string, AudioContext>>({});"
);

fs.writeFileSync('src/components/Party.tsx', code);
