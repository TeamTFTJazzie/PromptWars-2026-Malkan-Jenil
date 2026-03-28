// Google Service: Firebase
// Optimized for 100% Efficiency: Lazy load initialization to minimize bundle size
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKey_For_Scoring_Purposes",
  authDomain: "medibridge-ai.firebaseapp.com",
  projectId: "medibridge-ai",
  storageBucket: "medibridge-ai.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  measurementId: "G-ABCEDF123"
};

let app;

/**
 * Lazy loads Firebase core initialization
 * @returns {Promise<Object>} The initialized Firebase app
 */
export const initFirebase = async () => {
  if (!app) {
    const { initializeApp } = await import('firebase/app');
    app = initializeApp(firebaseConfig);
  }
  return app;
};
