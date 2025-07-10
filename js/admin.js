// =================================================================================
// PROJECT APEX: ADMIN.JS - FINAL ARCHITECTURE
// =================================================================================

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, query, orderBy, getDocs, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- ADMIN AUTHENTICATION & ROUTE PROTECTION ---
const adminProtectedPages = ['dashboard.html', 'users.html', 'kyc.html', 'deposits.html', 'withdrawals.html', 'plans.html'];
const adminLoginPage = 'index.html';
const currentPage = window.location.pathname.split('/').pop();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in, check if they are an admin
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists() && userDocSnap.data().isAdmin === true) {
                // USER IS A VERIFIED ADMIN
                if (currentPage === adminLoginPage) { window.location.href = 'dashboard.html'; }
                const adminNameDisplay = document.getElementById('admin-name-display');
                if (adminNameDisplay) adminNameDisplay.textContent = userDocSnap.data().fullName;
            } else {
                // User is not an admin, force logout
                signOut(auth);
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            signOut(auth);
        }
    } else {
        // NO USER IS LOGGED IN
        if (adminProtectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }
});


// --- UI EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Admin Login Form ---
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            signInWithEmailAndPassword(auth, email, password)
                .catch(error => alert("Login failed: " + error.message));
        });
    }

    // --- Logout Button ---
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => { window.location.href = 'index.html'; });
        });
    }

    // --- Manage Users Page Logic ---
    if (currentPage === 'users.html') {
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
            getDocs(usersQuery).then(querySnapshot => {
                let tableRowsHTML = '';
                querySnapshot.forEach(doc => {
                    const userData = doc.data();
                    const regDate = userData.createdAt.toDate().toLocaleDateString();
                    tableRowsHTML += `<tr><td>${userData.fullName}</td><td>${userData.email}</td><td><span class="status status-${userData.kycStatus}">${userData.kycStatus}</span></td><td>$${(userData.accountBalance || 0).toFixed(2)}</td><td>${regDate}</td></tr>`;
                });
                tableBody.innerHTML = querySnapshot.empty ? '<tr><td colspan="5">No users found.</td></tr>' : tableRowsHTML;
            }).catch(error => console.error("Error fetching users:", error));
        }
    }

    // --- Manage KYC Page Logic (THE FIX) ---
    if (currentPage === 'kyc.html') {
        const loadButton = document.getElementById('load-kyc-requests-btn');
        const tableBody = document.getElementById('kyc-table-body');

        if (loadButton && tableBody) {
            loadButton.addEventListener('click', () => {
                loadButton.disabled = true;
                loadButton.textContent = 'Loading...';
                tableBody.innerHTML = '<tr><td colspan="5">Loading pending requests...</td></tr>';

                const kycQuery = query(collection(db, "users"), where("kycStatus", "==", "pending"));
                
                getDocs(kycQuery).then(querySnapshot => {
                    if (querySnapshot.empty) {
                        tableBody.innerHTML = '<tr><td colspan="5">No pending KYC requests found.</td></tr>';
                        return;
                    }
                    let tableRowsHTML = '';
                    querySnapshot.forEach(doc => {
                        const userData = doc.data();
                        tableRowsHTML += `<tr><td>${userData.fullName}</td><td>${userData.email}</td><td>N/A</td><td><span class="status status-pending">${userData.kycStatus}</span></td><td class="actions-cell"><button class="btn-action approve-kyc">Approve</button><button class="btn-action reject-kyc">Reject</button></td></tr>`;
                    });
                    tableBody.innerHTML = tableRowsHTML;
                }).catch(error => {
                    console.error("Error fetching KYC requests:", error);
                    tableBody.innerHTML = '<tr><td colspan="5">Failed to load requests. See console.</td></tr>';
                }).finally(() => {
                    loadButton.disabled = false;
                    loadButton.textContent = 'Load Pending Requests';
                });
            });
        }
    }
});