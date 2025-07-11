import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYnoT4FH6LKh_vUTD25PxFcltokTqGhrY",
  authDomain: "bias-b124b.firebaseapp.com",
  projectId: "bias-b124b",
  storageBucket: "bias-b124b.firebasestorage.app",
  messagingSenderId: "137028026459",
  appId: "1:137028026459:web:260fab2e02901e7b01ff7e",
  measurementId: "G-BPWMHV1VEL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
