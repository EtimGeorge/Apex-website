// Import the necessary functions from our Firebase config and the SDK
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// List of pages that require the user to be logged in
const protectedPages = [
    'dashboard.html',
    'plans.html',
    'fund-account.html',
    'withdraw.html',
    'my-account.html',
    'deposit-log.html',
    'my-plans.html',
    'verify.html',
    'withdrawal-log.html'
];

// List of pages for logged-out users
const publicPages = ['login.html', 'register.html'];

// Get the current page's filename
const currentPage = window.location.pathname.split('/').pop();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // --- USER IS LOGGED IN ---
        console.log("Auth state changed: User is logged in.", user.uid);
        
        // If they are on a public page (login/register), redirect to dashboard
        if (publicPages.includes(currentPage)) {
            console.log("User is logged in but on a public page. Redirecting to dashboard.");
            window.location.href = 'dashboard.html';
            return; // Stop further execution
        }
        
        // Fetch and display user data on the page
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Update the UI with user's name (and later, balance etc.)
                const userNameElements = document.querySelectorAll('.user-info span');
                userNameElements.forEach(el => el.textContent = userData.fullName);
                // We can add more UI updates here, e.g., for account balance
            } else {
                console.log("No such user document!");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }

    } else {
        // --- USER IS LOGGED OUT ---
        console.log("Auth state changed: User is logged out.");
        
        // If they are on a protected page, redirect to login
        if (protectedPages.includes(currentPage)) {
            console.log("User is logged out but on a protected page. Redirecting to login.");
            window.location.href = 'login.html';
        }
    }
});