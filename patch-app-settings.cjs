const fs = require('fs');

// PATCH APP.TSX
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Add activeSessionConfirmed
appContent = appContent.replace(
  "const [startupDone, setStartupDone] = useState(() => {",
  "const [activeSessionConfirmed, setActiveSessionConfirmed] = useState(false);\n  const [startupDone, setStartupDone] = useState(() => {"
);

const oldAuthBlocks = `  if (!isGuestMode && (!authLoaded || (userAuth && !profileLoaded))) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="w-8 h-8 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div></div>;
  }

  if (!isGuestMode && (!userAuth || !profile)) {
    return (
      <>
        <AuthFlow />
        <WelcomeMessage />
        <DMCAModal />
      </>
    );
  }`;

const newAuthBlocks = `  if (!authLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="w-8 h-8 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div></div>;
  }

  if (!isGuestMode && !activeSessionConfirmed) {
    return (
      <>
        <AuthFlow onConfirm={() => setActiveSessionConfirmed(true)} />
        <WelcomeMessage />
        <DMCAModal />
      </>
    );
  }

  if (!isGuestMode && (userAuth && !profileLoaded)) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="w-8 h-8 border-4 border-zinc-800 border-t-green-500 rounded-full animate-spin"></div></div>;
  }
  
  if (!isGuestMode && (!userAuth || !profile)) {
    return null;
  }`;

appContent = appContent.replace(oldAuthBlocks, newAuthBlocks);

appContent = appContent.replace(
  "signOut(auth);",
  "signOut(auth);\n      setActiveSessionConfirmed(false);"
);

fs.writeFileSync('src/App.tsx', appContent, 'utf8');


// PATCH SETTINGS.TSX
let setContent = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const modalCode = `
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const accounts = JSON.parse(localStorage.getItem('ebox_accounts') || '[]');
  const thisAccIndex = accounts.findIndex((a: any) => a.uid === profile.uid);
  const thisAcc = accounts[thisAccIndex];
  
  const [isAutoSignIn, setIsAutoSignIn] = useState(thisAcc?.autoSignIn || false);

  const handleToggleAutoSignIn = () => {
    if (isAutoSignIn) {
      if (thisAccIndex !== -1) {
        accounts[thisAccIndex].autoSignIn = false;
        accounts[thisAccIndex].pin = null;
        localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
      }
      setIsAutoSignIn(false);
    } else {
      setPinStep('enter');
      setPinInput('');
      setFirstPin('');
      setPinError('');
      setShowPinModal(true);
    }
  };

  useEffect(() => {
    if (pinInput.length === 4 && showPinModal) {
      if (pinStep === 'enter') {
        setFirstPin(pinInput);
        setPinInput('');
        setPinStep('confirm');
      } else {
        if (pinInput === firstPin) {
          if (thisAccIndex !== -1) {
            accounts.forEach((a: any) => { a.autoSignIn = false; });
            accounts[thisAccIndex].autoSignIn = true;
            accounts[thisAccIndex].pin = pinInput;
            localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
          }
          setIsAutoSignIn(true);
          setShowPinModal(false);
        } else {
          setPinError('PINs do not match. Try again.');
          setTimeout(() => {
            setPinInput('');
            setPinStep('enter');
            setFirstPin('');
            setPinError('');
          }, 1500);
        }
      }
    }
  }, [pinInput, showPinModal, pinStep, firstPin]);

  useEffect(() => {
    if (showPinModal) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (/\\d/.test(e.key) && pinInput.length < 4) {
          setPinInput(p => p + e.key);
        } else if (e.key === 'Backspace') {
          setPinInput(p => p.slice(0, -1));
        } else if (e.key === 'Escape') {
          setShowPinModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showPinModal, pinInput]);

  const handleRemoveAccount = () => {
    if (confirm("Are you sure you want to remove this account from this device? You can sign in again later.")) {
      if (thisAccIndex !== -1) {
        accounts.splice(thisAccIndex, 1);
        localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
      }
      onLogout();
    }
  };
`;

setContent = setContent.replace(
  "const [activeTab, setActiveTab] = useState<'general' | 'cloak'>('general');",
  "const [activeTab, setActiveTab] = useState<'general' | 'cloak'>('general');" + modalCode
);

const accountSettingsCode = `
            <div>
              <h3 className="text-xl font-bold mb-4">Account</h3>
              <p className="text-zinc-400 mb-6">{isGuestMode ? 'Playing as Guest' : \`Signed in as \${profile.gamertag}\`}</p>
              
              {!isGuestMode && (
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg">
                    <div>
                      <span className="font-bold">Auto Sign-in & PIN</span>
                      <p className="text-xs text-zinc-400">Skip the 'Who's playing today?' screen</p>
                    </div>
                    <button 
                      onClick={handleToggleAutoSignIn} 
                      className={\`px-4 py-2 rounded-md text-sm font-bold transition-colors \${isAutoSignIn ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}\`}
                    >
                      {isAutoSignIn ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  
                  <button onClick={handleRemoveAccount} className="px-4 py-3 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-md text-sm font-bold transition-colors w-fit">
                    Remove Account from this Device
                  </button>
                </div>
              )}
            </div>
`;

setContent = setContent.replace(
  `            <div>
              <h3 className="text-xl font-bold mb-4">Account</h3>
              <p className="text-zinc-400">{isGuestMode ? 'Playing as Guest' : \`Signed in as \${profile.gamertag}\`}</p>
            </div>`,
  accountSettingsCode
);

// Add the PIN Modal to the return
const pinModalUI = `
      {showPinModal && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6">
            {pinStep === 'enter' ? 'Create a 4-Digit PIN' : 'Confirm your PIN'}
          </h2>
          <div className="flex gap-4 mb-8">
             {[0,1,2,3].map(i => (
               <div key={i} className={\`w-4 h-4 rounded-full transition-colors \${pinInput.length > i ? 'bg-green-500' : 'bg-zinc-700'}\`} />
             ))}
          </div>
          {pinError && <p className="text-red-500 mb-4 font-bold">{pinError}</p>}
          <div className="grid grid-cols-3 gap-4">
             {[1,2,3,4,5,6,7,8,9].map(num => (
               <button key={num} onClick={() => pinInput.length < 4 && setPinInput(p => p + num)} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-2xl font-bold flex items-center justify-center transition-colors">
                 {num}
               </button>
             ))}
             <button onClick={() => setShowPinModal(false)} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors">Cancel</button>
             <button onClick={() => pinInput.length < 4 && setPinInput(p => p + '0')} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-2xl font-bold flex items-center justify-center transition-colors">0</button>
             <button onClick={() => setPinInput(p => p.slice(0, -1))} className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold flex items-center justify-center transition-colors">Del</button>
          </div>
        </div>
      )}
`;

setContent = setContent.replace(
  "return (\n    <motion.div key=\"settings\"",
  "return (\n    <>\n" + pinModalUI + "    <motion.div key=\"settings\""
);

setContent = setContent.replace(
  "    </motion.div>\n  );\n}",
  "    </motion.div>\n    </>\n  );\n}"
);

fs.writeFileSync('src/components/Settings.tsx', setContent, 'utf8');

