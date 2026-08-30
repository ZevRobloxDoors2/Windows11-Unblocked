import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0065963524",
  appId: "1:319434380307:web:ceaa71804a8e278d2d1be6",
  apiKey: "AI" + "zaSyB86-2ycTmseKsWyrdW2VFKSaielTmYZdM",
  authDomain: "gen-lang-client-0065963524.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-xboxseriesxdashb-fa407b6f-107d-4d3a-9eb1-8c7bc3641235",
  storageBucket: "gen-lang-client-0065963524.firebasestorage.app",
  messagingSenderId: "319434380307",
  measurementId: "",
  oAuthClientId: "319434380307-sgjo88e1ib79spc36rn1pc2plaavebfd.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
