import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCRysIhPcqL2rXwHUvScogOWbCd_k-wmwI",
  authDomain: "depo-paketleme.firebaseapp.com",
  projectId: "depo-paketleme",
  storageBucket: "depo-paketleme.firebasestorage.app",
  messagingSenderId: "242943188992",
  appId: "1:242943188992:web:38f62ac67d5ea544e8f8e5",
  measurementId: "G-79Y74VNJ43",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
