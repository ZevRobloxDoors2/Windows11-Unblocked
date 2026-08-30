import React, { useState, useEffect } from 'react';
import { Plus, UserX } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface LocalAccount {
  uid: string;
  email: string;
  gamertag: string;
  avatar: string;
  autoSignIn: boolean;
  pin: string | null;
}

export function AuthFlow({ onConfirm }: { onConfirm: () => void }) {
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [view, setView] = useState<'picker' | 'pin' | 'loading' | 'add_method' | 'manual_signin' | 'manual_signup'>('loading');
  const [selectedAccount, setSelectedAccount] = useState<LocalAccount | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
    setAccounts(saved);

    const autoAccount = saved.find((a: LocalAccount) => a.autoSignIn);
    if (autoAccount) {
      setSelectedAccount(autoAccount);
      if (autoAccount.pin) {
        setView('pin');
      } else {
        authenticate(autoAccount);
      }
    } else {
      setView('picker');
    }
  }, []);

  useEffect(() => {
    if (view === 'pin') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (/\d/.test(e.key) && pinInput.length < 4) {
          setPinInput(p => p + e.key);
        } else if (e.key === 'Backspace') {
          setPinInput(p => p.slice(0, -1));
        } else if (e.key === 'Escape') {
          setView('picker');
          setPinInput('');
          setError('');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [view, pinInput]);

  useEffect(() => {
    if (pinInput.length === 4 && selectedAccount) {
      if (pinInput === selectedAccount.pin) {
        authenticate(selectedAccount);
      } else {
        setError('Incorrect PIN');
        setTimeout(() => {
          setPinInput('');
          setError('');
        }, 1000);
      }
    }
  }, [pinInput, selectedAccount]);

  const checkAndCreateProfile = async (user: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    let gamertag = '';
    let avatar = user.photoURL || 'https://picsum.photos/seed/avatar1/200/200';
    
    if (!userSnap.exists()) {
      gamertag = user.displayName ? user.displayName.substring(0, 30) : 'Player' + Math.floor(Math.random() * 10000);
      await setDoc(userRef, {
        uid: user.uid,
        gamertag,
        gamertagLower: gamertag.toLowerCase(),
        avatar,
        status: 'Online',
        score: 0,
        lastTrophyAt: serverTimestamp()
      });
    } else {
      gamertag = userSnap.data().gamertag;
      avatar = userSnap.data().avatar;
    }

    const currentAccounts = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
    const existing = currentAccounts.find((a: any) => a.uid === user.uid);
    if (existing) {
      existing.gamertag = gamertag;
      existing.avatar = avatar;
      existing.email = user.email;
    } else {
      currentAccounts.push({
        uid: user.uid,
        email: user.email,
        gamertag,
        avatar,
        autoSignIn: false,
        pin: null
      });
    }
    localStorage.setItem('ebox_accounts', JSON.stringify(currentAccounts));
    setAccounts(currentAccounts);
  };

  const authenticate = async (account: LocalAccount) => {
    setView('loading');
    setError('');
    try {
      if (auth.currentUser?.uid === account.uid) {
        await checkAndCreateProfile(auth.currentUser);
        onConfirm();
      } else {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ login_hint: account.email, prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        if (result.user.uid !== account.uid) {
          setError('Signed into a different account than selected.');
          setView('picker');
          await checkAndCreateProfile(result.user);
          const updated = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
          setAccounts(updated);
        } else {
          await checkAndCreateProfile(result.user);
          onConfirm();
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setView('picker');
    }
  };

  const handleAddNew = () => {
    setView('add_method');
  };
  
  const handleGoogleSignIn = async () => {
    setView('loading');
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setView('picker');
    }
  };
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setView('loading');
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setView('manual_signin');
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setView('loading');
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setView('manual_signup');
    }
  };

  const handleOwnerTestSignIn = async () => {
    setView('loading');
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, 'ownertest@gmail.com', 'nohorse19');
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
      console.error(e);
      setError('Owner account not found or invalid.');
      setView('manual_signin');
    }
  };

  const handleAccountClick = (acc: LocalAccount) => {
    if (acc.pin) {
      setSelectedAccount(acc);
      setPinInput('');
      setView('pin');
    } else {
      authenticate(acc);
    }
  };

  const handleGuestPlay = () => {
    sessionStorage.setItem('ebox_guest_mode', 'true');
    window.location.reload();
  };

  if (view === 'loading') {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="w-8 h-8 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div></div>;
  }

  
  if (view === 'add_method') {
    return (
      <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-600/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="z-10 bg-zinc-900 border border-zinc-700 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-[400px]">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Sign In Method</h2>
          <button onClick={handleGoogleSignIn} className="w-full py-3 bg-white text-black font-bold rounded-md hover:bg-zinc-200 transition-colors">Use Google API</button>
          <button onClick={() => setView('manual_signin')} className="w-full py-3 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700 transition-colors">Use Manual Sign In</button>
          <button onClick={() => setView('picker')} className="mt-4 text-zinc-400 hover:text-white transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  if (view === 'manual_signin' || view === 'manual_signup') {
    const isSignIn = view === 'manual_signin';
    return (
      <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-600/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="z-10 bg-zinc-900 border border-zinc-700 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-[400px]">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">{isSignIn ? 'Manual Sign In' : 'Manual Sign Up'}</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <form onSubmit={isSignIn ? handleManualSignIn : handleManualSignUp} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 outline-none" required minLength={6} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition-colors mt-2">{isSignIn ? 'Sign In' : 'Sign Up'}</button>
          </form>
          
          <button onClick={() => setView(isSignIn ? 'manual_signup' : 'manual_signin')} className="mt-2 text-sm text-green-400 hover:text-green-300 transition-colors">
            {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>

          <div className="w-full h-[1px] bg-zinc-800 my-2" />

          <button onClick={handleOwnerTestSignIn} className="w-full py-3 bg-purple-600/80 text-white font-bold rounded hover:bg-purple-500 transition-colors">
            Owner Test Sign In (Early Access)
          </button>

          <button onClick={() => setView('add_method')} className="mt-4 text-zinc-400 hover:text-white transition-colors">Back</button>
        </div>
      </div>
    );
  }

if (view === 'pin' && selectedAccount) {
    return (
      <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-600/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-green-400/10 blur-[80px] rounded-[100%] pointer-events-none transform rotate-45" />

        <div className="z-10 flex flex-col items-center">
           <img src={selectedAccount.avatar} className="w-24 h-24 rounded-full mb-4 shadow-xl border-2 border-white/20" />
           <h2 className="text-3xl font-semibold text-white mb-8">Enter PIN for {selectedAccount.gamertag}</h2>
           
           <div className="flex gap-4 mb-8">
             {[0,1,2,3].map(i => (
               <div key={i} className={`w-4 h-4 rounded-full transition-colors ${pinInput.length > i ? 'bg-white' : 'bg-zinc-700'}`} />
             ))}
           </div>
           
           {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
           
           <div className="grid grid-cols-3 gap-4">
             {[1,2,3,4,5,6,7,8,9].map(num => (
               <button key={num} onClick={() => setPinInput(p => p.length < 4 ? p + num : p)} className="w-16 h-16 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white text-2xl font-bold flex items-center justify-center transition-colors shadow-lg">
                 {num}
               </button>
             ))}
             <button onClick={() => { setView('picker'); setPinInput(''); setError(''); }} className="w-16 h-16 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors shadow-lg">Back</button>
             <button onClick={() => setPinInput(p => p.length < 4 ? p + '0' : p)} className="w-16 h-16 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white text-2xl font-bold flex items-center justify-center transition-colors shadow-lg">0</button>
             <button onClick={() => setPinInput(p => p.slice(0, -1))} className="w-16 h-16 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors shadow-lg">Del</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-green-400/10 blur-[80px] rounded-[100%] pointer-events-none transform rotate-45" />

      <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-16 z-10 drop-shadow-md">Who's playing today?</h1>

      <div className="flex flex-wrap justify-center gap-8 z-10 px-4 max-w-5xl">
        {accounts.map(acc => (
          <div key={acc.uid} onClick={() => handleAccountClick(acc)} className="flex flex-col items-center gap-4 cursor-pointer group focus:outline-none" tabIndex={0}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-[4px] border-transparent group-hover:border-green-500 group-focus:border-green-500 transition-all shadow-xl bg-zinc-800">
              <img src={acc.avatar} className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-medium text-zinc-300 group-hover:text-white transition-colors">{acc.gamertag}</span>
          </div>
        ))}

        <div onClick={handleAddNew} className="flex flex-col items-center gap-4 cursor-pointer group focus:outline-none" tabIndex={0}>
          <div className="w-32 h-32 rounded-full border-[4px] border-transparent group-hover:border-green-500 group-focus:border-green-500 transition-all shadow-xl bg-zinc-800/80 flex items-center justify-center backdrop-blur-md">
            <Plus size={48} className="text-zinc-300 group-hover:text-white transition-colors" />
          </div>
          <span className="text-lg font-medium text-zinc-300 group-hover:text-white transition-colors">Add new</span>
        </div>

        <div onClick={handleGuestPlay} className="flex flex-col items-center gap-4 cursor-pointer group focus:outline-none" tabIndex={0}>
          <div className="w-32 h-32 rounded-full border-[4px] border-transparent group-hover:border-white group-focus:border-white transition-all shadow-xl bg-zinc-800/60 flex items-center justify-center backdrop-blur-md">
            <UserX size={48} className="text-zinc-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-lg font-medium text-zinc-400 group-hover:text-white transition-colors">Skip sign in</span>
        </div>
      </div>
    </div>
  );
}
