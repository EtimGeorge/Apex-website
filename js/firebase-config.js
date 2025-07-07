// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// Add signOut to this import line
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; 
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA9--4T1zDjnal3B1rK2uQ5B3iWRG5Ojiw",
    authDomain: "project-apex-invest.firebaseapp.com",
    projectId: "project-apex-invest",
    storageBucket: "project-apex-invest.firebasestorage.app",
    messagingSenderId: "840795207959",
    appId: "1:840795207959:web:8b0e61987702c0d0bcdf52"
  };


// Initialize Firebase ONCE
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export specific functions we'll use elsewhere
export { doc, setDoc, signOut }; // Add signOut to this export list