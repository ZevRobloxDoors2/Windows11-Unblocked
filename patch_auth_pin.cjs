const fs = require('fs');
let content = fs.readFileSync('src/components/AuthFlow.tsx', 'utf8');

const oldCheck = `  const checkAndCreateProfile = async (user: any, role: string = 'user') => {
    const profileRef = doc(db, 'users', user.uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) {
      let generatedGamertag = user.email ? user.email.split('@')[0] : 'Player' + Math.floor(Math.random() * 10000);
      if (generatedGamertag.length > 30) {
        generatedGamertag = generatedGamertag.substring(0, 30);
      }
      await setDoc(profileRef, {
        uid: user.uid,
        gamertag: generatedGamertag,
        gamertagLower: generatedGamertag.toLowerCase(),
        bio: "I'm new here!",
        avatar: user.photoURL || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user.uid}\`,
        createdAt: serverTimestamp(),
        friends: [],
        status: 'Online',
        score: 0,
        lastTrophyAt: serverTimestamp(),
        recentGames: [],
        role: role
      });
    } else if (role !== 'user') {
      // Update role if they are logging in as tester
      await setDoc(profileRef, { role: role }, { merge: true });
    }
  };`;

const newCheck = `  const checkAndCreateProfile = async (user: any, role: string = 'user') => {
    const profileRef = doc(db, 'users', user.uid);
    const snap = await getDoc(profileRef);
    let userPin = undefined;
    let gt = '';
    let av = '';

    if (!snap.exists()) {
      let generatedGamertag = user.email ? user.email.split('@')[0] : 'Player' + Math.floor(Math.random() * 10000);
      if (generatedGamertag.length > 30) {
        generatedGamertag = generatedGamertag.substring(0, 30);
      }
      gt = generatedGamertag;
      av = user.photoURL || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user.uid}\`;
      await setDoc(profileRef, {
        uid: user.uid,
        gamertag: generatedGamertag,
        gamertagLower: generatedGamertag.toLowerCase(),
        bio: "I'm new here!",
        avatar: av,
        createdAt: serverTimestamp(),
        friends: [],
        status: 'Online',
        score: 0,
        lastTrophyAt: serverTimestamp(),
        recentGames: [],
        role: role
      });
    } else {
      gt = snap.data().gamertag;
      av = snap.data().avatar;
      userPin = snap.data().pin;
      if (role !== 'user') {
        await setDoc(profileRef, { role: role }, { merge: true });
      }
    }

    // Save to ebox_accounts
    const accountsList = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
    const accIndex = accountsList.findIndex((a: any) => a.uid === user.uid);
    if (accIndex === -1) {
      accountsList.push({
        uid: user.uid,
        email: user.email,
        gamertag: gt,
        avatar: av,
        pin: userPin,
        autoSignIn: !!userPin
      });
    } else {
      accountsList[accIndex].pin = userPin;
      accountsList[accIndex].autoSignIn = !!userPin;
      accountsList[accIndex].gamertag = gt;
      accountsList[accIndex].avatar = av;
    }
    localStorage.setItem('ebox_accounts', JSON.stringify(accountsList));
  };`;

content = content.replace(oldCheck, newCheck);

// Also need to handle UI rendering for no pin
const oldLoginUI = `                <form onSubmit={handlePinSubmit} className="relative w-72">
                  <input 
                    type="password" 
                    placeholder="PIN" 
                    value={pinInput}
                    onChange={e => { setPinInput(e.target.value); setError(''); }}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-black/40 text-white border border-white/20 focus:border-white/50 focus:bg-black/60 outline-none backdrop-blur-md transition-all text-center tracking-widest placeholder:tracking-normal placeholder:text-center" 
                    autoFocus
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <ArrowRight size={20} />
                  </button>
                </form>
                {error && <p className="text-red-400 mt-4 text-sm font-medium bg-black/40 px-3 py-1 rounded">{error}</p>}`;

const newLoginUI = `                {!selectedAccount.pin ? (
                  <button onClick={() => authenticate(selectedAccount)} className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg">
                    <ArrowRight size={32} />
                  </button>
                ) : (
                  <>
                    <form onSubmit={handlePinSubmit} className="relative w-72">
                      <input 
                        type="password" 
                        placeholder="PIN" 
                        value={pinInput}
                        onChange={e => { setPinInput(e.target.value); setError(''); }}
                        className="w-full px-4 py-3 pr-12 rounded-lg bg-black/40 text-white border border-white/20 focus:border-white/50 focus:bg-black/60 outline-none backdrop-blur-md transition-all text-center tracking-widest placeholder:tracking-normal placeholder:text-center" 
                        autoFocus
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                        <ArrowRight size={20} />
                      </button>
                    </form>
                    {error && <p className="text-red-400 mt-4 text-sm font-medium bg-black/40 px-3 py-1 rounded">{error}</p>}
                  </>
                )}`;

content = content.replace(oldLoginUI, newLoginUI);

fs.writeFileSync('src/components/AuthFlow.tsx', content);
