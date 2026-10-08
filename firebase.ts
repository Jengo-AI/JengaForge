import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)" 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Optional App Check abuse protection
let appCheck: AppCheck | null = null;
if (typeof window !== 'undefined') {
  const recaptchaKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
  if (recaptchaKey) {
    try {
      if ((import.meta as any).env?.DEV) {
        // @ts-expect-error self.FIREBASE_APPCHECK_DEBUG_TOKEN is read by the App Check SDK in dev
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn('[firebase] Optional App Check initialization failed:', err);
    }
  }
}
export { appCheck };

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection successful.");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error(`
🔥 Firebase Connection Failed: "The client is offline"

This error means the app cannot reach your Firestore database. Please check the following:
1. Database Exists: Go to the Firebase Console (console.firebase.google.com) -> Build -> Firestore Database and ensure you have clicked "Create database".
2. Adblockers: Disable Brave Shields, uBlock Origin, or other adblockers for this site, as they sometimes block Firebase connections.
3. Network: Ensure your network or VPN isn't blocking Google Cloud/Firebase domains.

Original error: ${error.message}
      `);
    } else {
      // Log other errors (like permission denied) so we can see them if needed
      console.warn("Firebase connection test returned an error (this might just be security rules working):", error);
    }
  }
}
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  testConnection();
}
