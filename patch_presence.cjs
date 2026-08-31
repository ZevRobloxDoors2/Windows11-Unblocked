const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const presenceEffect = `
  useEffect(() => {
    if (!profile || !userAuth) return;
    
    const setStatus = (status) => {
      import('firebase/firestore').then(({ updateDoc, doc }) => {
        updateDoc(doc(db, 'users', userAuth.uid), { status }).catch(() => {});
      });
    };

    setStatus('Online');

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setStatus('Offline');
      } else {
        setStatus('Online');
      }
    };

    const handleUnload = () => {
      setStatus('Offline');
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [profile?.uid, userAuth?.uid]);
`;

content = content.replace("  useEffect(() => {\n    const handleOnline", presenceEffect + "\n  useEffect(() => {\n    const handleOnline");
fs.writeFileSync('src/App.tsx', content);
