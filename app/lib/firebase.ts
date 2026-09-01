import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

if (import.meta.env.DEV) {
	const localIP = ['127.0.0.1', '192.168.0.102', '10.167.46.222'];
	connectFirestoreEmulator(db, localIP[1], 8080);
	connectAuthEmulator(auth, `http://${localIP[1]}:9099`);
	connectStorageEmulator(storage, localIP[1], 9199);
}

export { db, auth, storage };
