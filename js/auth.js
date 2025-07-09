// alert("auth.js SCRIPT IS RUNNING!");

// =================================================================================
// PROJECT APEX: AUTH.JS - FINAL SIMPLIFIED VERSION
// =================================================================================

import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  doc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// --- REGISTRATION LOGIC ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userDocRef = doc(db, 'users', user.uid);
        return setDoc(userDocRef, {
          fullName: fullName,
          email: email,
          uid: user.uid,
          accountBalance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          kycStatus: 'unverified',
          createdAt: new Date(),
        });
      })
      .then(() => {
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
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
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        alert('Login Failed: ' + error.message);
      });
  });
}
