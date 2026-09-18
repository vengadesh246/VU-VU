// src/firebase.jsx
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 🔴 Your Firebase config — replace the values with the ones from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSy....................",
  authDomain: "srm-rice-mill.firebaseapp.com",
  projectId: "srm-rice-mill",
  storageBucket: "srm-rice-mill.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;