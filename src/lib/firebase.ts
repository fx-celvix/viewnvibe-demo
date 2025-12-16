
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, Timestamp, runTransaction } from 'firebase/firestore';

// IMPORTANT: Replace this with your actual Firebase configuration
// You can get this from the Firebase console for your web app.
// 1. Go to Project settings (gear icon)
// 2. In the "Your apps" card, select your web app.
// 3. Under "Firebase SDK snippet", choose the "Config" option.
// 4. Copy the firebaseConfig object and paste it here.
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


// Function to generate a readable order ID like #DDMMSS
export const generateReadableOrderId = async () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yyyymmdd = `${date.getFullYear()}${month}${day}`;

    const counterRef = doc(db, 'counters', yyyymmdd);

    let nextOrderNumber;

    try {
        await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);

            if (!counterDoc.exists()) {
                nextOrderNumber = 1;
                transaction.set(counterRef, { count: nextOrderNumber });
            } else {
                const newCount = counterDoc.data().count + 1;
                nextOrderNumber = newCount;
                transaction.update(counterRef, { count: newCount });
            }
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        // Fallback to a random number if transaction fails to prevent order failure
        const randomFallback = Math.floor(Math.random() * 1000);
        return `${day}${month}${String(randomFallback).padStart(2, '0')}`;
    }

    const sequence = String(nextOrderNumber).padStart(2, '0');
    return `${day}${month}${sequence}`;
};


export { app, auth, db, googleProvider, signInWithPopup };
