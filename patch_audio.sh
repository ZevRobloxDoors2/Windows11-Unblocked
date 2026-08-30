sed -i "s/audio.srcObject = stream;/audio.srcObject = stream;\n    audio.play().catch(e => console.error('Audio play error:', e));/" src/components/Party.tsx
