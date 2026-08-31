const fs = require('fs');
let content = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const oldSetPin = `            accounts[thisAccIndex].autoSignIn = true;
            accounts[thisAccIndex].pin = pinInput;
            localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
            setIsAutoSignIn(true);
          }
          setShowPinModal(false);`;

const newSetPin = `            accounts[thisAccIndex].autoSignIn = true;
            accounts[thisAccIndex].pin = pinInput;
            localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
            setIsAutoSignIn(true);
            import('firebase/firestore').then(({ updateDoc, doc }) => {
              updateDoc(doc(db, 'users', profile.uid), { pin: pinInput }).catch(()=> {});
            });
          }
          setShowPinModal(false);`;

const oldClearPin = `        accounts[thisAccIndex].autoSignIn = false;
        accounts[thisAccIndex].pin = null;
        localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
      }
      setIsAutoSignIn(false);`;

const newClearPin = `        accounts[thisAccIndex].autoSignIn = false;
        accounts[thisAccIndex].pin = null;
        localStorage.setItem('ebox_accounts', JSON.stringify(accounts));
        import('firebase/firestore').then(({ updateDoc, doc, deleteField }) => {
          updateDoc(doc(db, 'users', profile.uid), { pin: deleteField() }).catch(()=> {});
        });
      }
      setIsAutoSignIn(false);`;

content = content.replace(oldSetPin, newSetPin);
content = content.replace(oldClearPin, newClearPin);

fs.writeFileSync('src/components/Settings.tsx', content);
