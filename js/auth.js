// =================================================================================
// PROJECT APEX: AUTH.JS - FINAL CORRECTED VERSION
// =================================================================================

import { auth, db, doc, setDoc } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- REGISTRATION LOGIC ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        // 1. Create the user in Firebase Auth
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // This block runs ONLY if the user was created successfully in Auth
                const user = userCredential.user;
                console.log('Step 1/2 SUCCESS: User created in Auth system. UID:', user.uid);
                
                // 2. Create the user's document in Firestore
                const userDocRef = doc(db, "users", user.uid);
                return setDoc(userDocRef, {
                    fullName: fullName,
                    email: email,
                    uid: user.uid,
                    accountBalance: 0,
                    totalDeposited: 0,
                    totalWithdrawn: 0,
                    kycStatus: 'unverified',
                    createdAt: new Date()
                });
            })
            .then(() => {
                // This block runs ONLY if setDoc() was SUCCESSFUL
                console.log('Step 2/2 SUCCESS: Firestore document created.');
                alert('Registration Successful! Welcome to Project Apex.');
                // 3. NOW it is safe to redirect
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                // This will catch errors from EITHER createUser or setDoc
                console.error('REGISTRATION FAILED:', error);
                alert('Registration Failed: ' + error.message);
            });
    });
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                // It is safe to redirect on login because we are not creating data.
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                alert('Login Failed: ' + error.message);
            });
    });
}