import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC84g8xYXS0Yp7SLuOA83HLvQmAWYzyiSA",
  authDomain: "pureloop-e4574.firebaseapp.com",
  projectId: "pureloop-e4574",
  storageBucket: "pureloop-e4574.firebasestorage.app",
  messagingSenderId: "817535712192",
  appId: "1:817535712192:web:7887dc88be78513d5c2625",
  measurementId: "G-SDFEEMNTR2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
