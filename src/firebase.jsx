// src/firebase.jsx
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 🔴 Your Firebase config — replace the values with the ones from your Firebase Console
const firebaseConfig = {
 apiKey: "AIzaSyAw8rgjLNmgvJGbPCOLI8dAtGcX14jhYY8",
  authDomain: "vu-vu-srm.firebaseapp.com",
  projectId: "vu-vu-srm",
  storageBucket: "vu-vu-srm.firebasestorage.app",
  messagingSenderId: "545632218833",
  appId: "1:545632218833:web:88fc5deb2f90c3be54dff0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;