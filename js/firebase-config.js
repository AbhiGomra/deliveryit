// Firebase Configuration for Deliveryit
// Replace these values with your Firebase project credentials

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// ============================================
// Firebase Configuration
// ============================================
// Replace these values with your Firebase project configuration
// You can find these in Firebase Console > Project Settings

const firebaseConfig = {
  apiKey: "AIzaSyBub2gaR-TJHtkc44Kluj3NTt7qwpnPXjY",
  authDomain: "deliveryit-d9d5a.firebaseapp.com",
  projectId: "deliveryit-d9d5a",
  storageBucket: "deliveryit-d9d5a.firebasestorage.app",
  messagingSenderId: "710494089738",
  appId: "1:710494089738:web:a3164c8a32701a5550e5f3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export app for debugging
export { app };
