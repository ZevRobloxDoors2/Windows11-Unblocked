import React, { useState, useEffect } from 'react';
import { Plus, UserX, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

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
  const [view, setView] = useState<'lockscreen' | 'login' | 'loading' | 'add_method' | 'manual_signin' | 'manual_signup' | 'tester_login'>('lockscreen');
  const [selectedAccount, setSelectedAccount] = useState<LocalAccount | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testerUser, setTesterUser] = useState('');
  const [testerPass, setTesterPass] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  const [bgImage, setBgImage] = useState(() => localStorage.getItem('win11_lock_bg') || 'https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&w=2000&q=80');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
    setAccounts(saved);
    const autoAccount = saved.find((a: LocalAccount) => a.autoSignIn);
    if (autoAccount && view === 'lockscreen') {
      setSelectedAccount(autoAccount);
    } else if (saved.length > 0 && !selectedAccount) {
      setSelectedAccount(saved[0]);
    }
  }, []);

  const checkAndCreateProfile = async (user: any, role: string = 'user') => {
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
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
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
  };

  const authenticate = async (acc: LocalAccount) => {
    setView('loading');
    // For local pin-based accounts we simulate authentication if they already have a saved session
    // But since this is a real app, we need the real firebase auth state. 
    // Usually Firebase auto-restores session. If not, they must re-auth.
    // For now we just call onConfirm since App.tsx listens to onAuthStateChanged.
    onConfirm();
  };

  const handleGoogleSignIn = async () => {
    setView('loading');
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setView('add_method');
    }
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setView('loading');
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
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
      setError(e.message);
      setView('manual_signup');
    }
  };

  const handleTesterSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setView('loading');
    setError('');
    
    // Check credentials
    let emailToUse = '';
    let role = 'tester';
    if (testerUser === 'jascen67' && testerPass === 'matandmat') {
      emailToUse = 'jascen67@ebox.tester';
    } else if (testerUser === 'Sebastianthegoat61' && testerPass === 'Masonisabum61!') {
      emailToUse = 'sebastianthegoat61@ebox.tester';
    } else if (testerUser === 'ownertest' && testerPass === 'nohorse') {
      emailToUse = 'ownertest@ebox.owner';
      role = 'owner';
    } else {
      setError('Invalid Tester credentials.');
      setView('tester_login');
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, emailToUse, testerPass);
      await checkAndCreateProfile(result.user, role);
      onConfirm();
    } catch (e: any) {
      // If doesn't exist, create it
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        try {
          const result = await createUserWithEmailAndPassword(auth, emailToUse, testerPass);
          await checkAndCreateProfile(result.user, role);
          onConfirm();
        } catch (err: any) {
          setError(err.message);
          setView('tester_login');
        }
      } else {
        setError(e.message);
        setView('tester_login');
      }
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAccount && selectedAccount.pin === pinInput) {
      authenticate(selectedAccount);
    } else {
      setError('Incorrect PIN');
      setPinInput('');
    }
  };

  const handleGuestPlay = () => {
    sessionStorage.setItem('ebox_guest_mode', 'true');
    window.location.reload();
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-zinc-800 border-t-[#00A4EF] rounded-full animate-spin" />
        <p className="mt-4 text-zinc-400 font-medium">Just a moment...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start relative overflow-hidden bg-cover bg-center transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`absolute inset-0 bg-black transition-opacity duration-700 ${view === 'lockscreen' ? 'opacity-20' : 'opacity-60 backdrop-blur-xl'}`} />

      <AnimatePresence mode="wait">
        {view === 'lockscreen' && (
          <motion.div 
            key="lockscreen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4 }}
            className="z-10 absolute inset-0 pt-32 flex flex-col items-center text-white drop-shadow-lg cursor-pointer"
            onClick={() => setView('login')}
          >
            <div className="text-[6rem] font-medium leading-none tracking-tight">
              {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="text-xl font-medium mt-2">
              {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="absolute bottom-12 flex flex-col items-center animate-bounce opacity-70">
              <div className="w-6 h-6 border-t-2 border-l-2 border-white transform rotate-45 mb-2 mt-2" />
              <span className="text-sm">Click or swipe up to unlock</span>
            </div>
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="z-10 absolute inset-0 flex flex-col items-center justify-center"
          >
            {accounts.length > 0 && selectedAccount ? (
              <div className="flex flex-col items-center">
                <img src={selectedAccount.avatar} className="w-32 h-32 rounded-full mb-6 shadow-2xl border-2 border-white/10" />
                <h2 className="text-3xl font-semibold text-white mb-6 drop-shadow-md">{selectedAccount.gamertag}</h2>
                
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
                
                <button onClick={() => setView('add_method')} className="mt-8 text-white/70 hover:text-white text-sm transition-colors">
                  Sign-in options
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full mb-6 shadow-2xl border-2 border-white/10 bg-zinc-800/80 flex items-center justify-center backdrop-blur-md">
                  <User size={64} className="text-zinc-400" />
                </div>
                <h2 className="text-3xl font-semibold text-white mb-8 drop-shadow-md">Welcome</h2>
                
                <div className="flex flex-col gap-3 w-72">
                  <button onClick={handleGoogleSignIn} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-md border border-white/10 transition-colors shadow-lg">
                    Use Google API
                  </button>
                  <button onClick={() => setView('manual_signin')} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-md border border-white/10 transition-colors shadow-lg">
                    Sign in & Sign up
                  </button>
                  <button onClick={() => setView('tester_login')} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-md border border-white/10 transition-colors shadow-lg flex items-center justify-center gap-2">
                    <ShieldAlert size={16} />
                    Tester & Owner Sign in
                  </button>
                  <button onClick={handleGuestPlay} className="w-full py-2 mt-4 bg-transparent hover:bg-white/5 text-white/60 hover:text-white text-sm font-medium rounded-lg transition-colors">
                    Skip sign in
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Left Accounts List */}
            {accounts.length > 0 && (
              <div className="absolute bottom-8 left-8 flex flex-col gap-2">
                {accounts.map(acc => (
                  <button 
                    key={acc.uid} 
                    onClick={() => { setSelectedAccount(acc); setPinInput(''); setError(''); }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${selectedAccount?.uid === acc.uid ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  >
                    <img src={acc.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-white leading-tight">{acc.gamertag}</span>
                      <span className="text-xs text-white/60 leading-tight">{acc.email}</span>
                    </div>
                  </button>
                ))}
                
                <button onClick={() => setView('add_method')} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors mt-2">
                  <div className="w-10 h-10 rounded-full border border-white/20 bg-black/40 flex items-center justify-center">
                    <Plus size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">Add new account</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {(view === 'add_method' || view === 'manual_signin' || view === 'manual_signup' || view === 'tester_login') && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-20 bg-[#202020]/95 backdrop-blur-2xl border border-white/10 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-[400px]"
          >
            {view === 'add_method' && (
              <>
                <h2 className="text-xl font-semibold text-white mb-4 text-center">How would you like to sign in?</h2>
                <button onClick={handleGoogleSignIn} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/10 transition-colors">
                  Use Google API
                </button>
                <button onClick={() => setView('manual_signin')} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/10 transition-colors">
                  Manual Sign In
                </button>
                <button onClick={() => setView('tester_login')} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/10 transition-colors">
                  Tester & Owner Sign in
                </button>
                <button onClick={() => setView('login')} className="mt-4 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
              </>
            )}

            {(view === 'manual_signin' || view === 'manual_signup') && (
              <>
                <h2 className="text-xl font-semibold text-white mb-2">{view === 'manual_signin' ? 'Sign In' : 'Sign Up'}</h2>
                {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
                <form onSubmit={view === 'manual_signin' ? handleManualSignIn : handleManualSignUp} className="flex flex-col gap-4 mt-2">
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded bg-black/50 text-white border border-white/10 focus:border-[#00A4EF] outline-none" required />
                  <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded bg-black/50 text-white border border-white/10 focus:border-[#00A4EF] outline-none" required minLength={6} />
                  <button type="submit" className="w-full py-2.5 bg-[#00A4EF] text-white font-semibold rounded hover:bg-[#0078D4] transition-colors mt-2">{view === 'manual_signin' ? 'Sign In' : 'Sign Up'}</button>
                </form>
                <button onClick={() => setView(view === 'manual_signin' ? 'manual_signup' : 'manual_signin')} className="mt-4 text-sm text-[#00A4EF] hover:text-[#50E6FF] transition-colors">
                  {view === 'manual_signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
                <button onClick={() => setView('add_method')} className="mt-2 text-sm text-white/50 hover:text-white transition-colors">Back</button>
              </>
            )}

            {view === 'tester_login' && (
              <>
                <h2 className="text-xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
                  <ShieldAlert size={20} className="text-purple-400" />
                  Tester & Owner Sign in
                </h2>
                {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}
                <form onSubmit={handleTesterSignIn} className="flex flex-col gap-4 mt-4">
                  <input type="text" placeholder="Username" value={testerUser} onChange={e => setTesterUser(e.target.value)} className="w-full px-4 py-2.5 rounded bg-black/50 text-white border border-white/10 focus:border-purple-500 outline-none" required />
                  <input type="password" placeholder="Password" value={testerPass} onChange={e => setTesterPass(e.target.value)} className="w-full px-4 py-2.5 rounded bg-black/50 text-white border border-white/10 focus:border-purple-500 outline-none" required />
                  <button type="submit" className="w-full py-2.5 bg-purple-600 text-white font-semibold rounded hover:bg-purple-500 transition-colors mt-2">Access Portal</button>
                </form>
                <button onClick={() => setView('login')} className="mt-4 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
