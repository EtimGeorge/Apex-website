// Import the necessary functions from our Firebase config and the SDK
import { auth, db, doc, setDoc } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- REGISTRATION LOGIC ---
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the form from submitting the traditional way

        // Get user inputs
        const fullName = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            // 1. Create the user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("User registered successfully:", user.uid);

            // 2. Create a document for the user in the Firestore database
            // This is where we'll store their specific data like name, balance, etc.
            await setDoc(doc(db, "users", user.uid), {
                fullName: fullName,
                email: email,
                uid: user.uid,
                accountBalance: 0,
                totalDeposited: 0,
                totalWithdrawn: 0,
                kycStatus: 'unverified',
                createdAt: new Date() // Store the registration date
            });
            
            console.log("User data created in Firestore");

            // 3. Redirect to the dashboard after successful registration
            // alert("Registration successful! Welcome to Project Apex.");
            // window.location.href = 'dashboard.html';
            console.log("Redirect will be handled by auth state listener.");

        } catch (error) {
            // Handle errors (e.g., email already in use, weak password)
            console.error("Registration Error:", error.message);
            alert("Registration failed: " + error.message);
        }
    });
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get user inputs
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            // 1. Sign in the user with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("User logged in successfully:", user.uid);

            // 2. Redirect to the dashboard after successful login
            // window.location.href = 'dashboard.html';
            console.log("Redirect will be handled by auth state listener.");

        } catch (error) {
            // Handle errors (e.g., wrong password, user not found)
            console.error("Login Error:", error.message);
            alert("Login failed: " + error.message);
        }
    });
}