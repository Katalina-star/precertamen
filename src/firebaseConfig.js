// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiPrK0PtCmOJFw-GriknH9TLa4HDwpHKM",
  authDomain: "reactfb-cd850.firebaseapp.com",
  projectId: "reactfb-cd850",
  storageBucket: "reactfb-cd850.firebasestorage.app",
  messagingSenderId: "166020699354",
  appId: "1:166020699354:web:5a4e67f6afe7ca0faa01e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);