// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiBBLx5FsDw8phpzYYItuMdGYHao-O1nY",
  authDomain: "resumeproject-fcef1.firebaseapp.com",
  projectId: "resumeproject-fcef1",
  storageBucket: "resumeproject-fcef1.firebasestorage.app",
  messagingSenderId: "45272973390",
  appId: "1:45272973390:web:b9d40eb9d02ac4f010831f",
  measurementId: "G-RVJQ79X8CG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    await signInAnonymously(auth);
  }
});

export { auth };
