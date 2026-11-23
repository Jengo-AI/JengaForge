import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
