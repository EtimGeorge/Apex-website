// =================================================================================
// PROJECT APEX: APP.JS - FINAL CORRECTED VERSION
// =================================================================================

// --- IMPORTS (Corrected to include all necessary functions) ---
import { 
    auth, 
    db, 
    signOut,
    doc, 
    getDoc,
    runTransaction,
    collection,
    addDoc
} from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';


// --- GLOBAL STATE VARIABLE ---
let currentUserData = null; 

// --- 1. AUTHENTICATION & ROUTE PROTECTION ---
const protectedPages = [
  'dashboard.html',
  'plans.html',
  'fund-account.html',
  'withdraw.html',
  'my-account.html',
  'deposit-log.html',
  'my-plans.html',
  'verify.html',
  'withdrawal-log.html',
];
const publicPages = ['login.html', 'register.html'];
const currentPage = window.location.pathname.split('/').pop();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is logged in.

    // **REMOVED THE CONFLICTING REDIRECT LOGIC FROM HERE**
    // The only redirect this script handles now is protecting public pages
    // AFTER the user is already logged in and navigating around.
    if (publicPages.includes(currentPage)) {
      window.location.href = 'dashboard.html';
      return;
    }

    // Fetch and display user data
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
    const userData = userDocSnap.data();
    

        // --- Define a helper function for formatting currency ---
        const formatCurrency = (number) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(number);
        };

        // --- Update Header UI ---
        const userNameDisplay = document.getElementById('user-name-display');
        if (userNameDisplay) userNameDisplay.textContent = userData.fullName;

        const userProfilePic = document.getElementById('user-profile-pic');
        if (userProfilePic) {
          if (userData.photoURL) {
            userProfilePic.src = userData.photoURL;
          } else {
            const encodedName = encodeURIComponent(userData.fullName);
            userProfilePic.src = `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&rounded=true`;
          }
        }

        // --- Update Dashboard Cards (only on dashboard.html) ---
        if (currentPage === 'dashboard.html') {
          const balanceDisplay = document.getElementById('balance-display');
          if (balanceDisplay) {
            balanceDisplay.textContent = formatCurrency(
              userData.accountBalance || 0
            );
          }

          const depositsDisplay = document.getElementById('deposits-display');
          if (depositsDisplay) {
            depositsDisplay.textContent = formatCurrency(
              userData.totalDeposited || 0
            );
          }

          const withdrawnDisplay = document.getElementById('withdrawn-display');
          if (withdrawnDisplay) {
            withdrawnDisplay.textContent = formatCurrency(
              userData.totalWithdrawn || 0
            );
          }

          // --- Update Referral Link ---
          const referralLinkDisplay = document.getElementById(
            'referral-link-display'
          );
          if (referralLinkDisplay) {
            // The referral link will be the registration page URL + the user's UID as a parameter
            referralLinkDisplay.value = `https://projectapex.com/register.html?ref=${user.uid}`;
          }
        }
      }

      // If the user is authenticated but no document exists, log an error.
      // This is a data integrity issue that should be resolved.
      else {
        console.error(
          'Data integrity error: User is authenticated but no document exists in Firestore. UID:',
          user.uid
        );
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  } else {
    // User is logged out.
    if (protectedPages.includes(currentPage)) {
      window.location.href = 'login.html';
    }
  }
});

// =================================================================================
//  2. UI INITIALIZATION & EVENT LISTENERS (Runs after DOM is loaded)
// =================================================================================
// --- 2. UI INITIALIZATION & EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  
  // --- Investment Modal Logic (on plans.html) ---
  if (currentPage === 'plans.html') {
    const investButtons = document.querySelectorAll('.plan-btn');
    const modalOverlay = document.getElementById('investment-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const investmentForm = document.getElementById('investment-form');

    if (
      investButtons.length > 0 &&
      modalOverlay &&
      modalCloseBtn &&
      investmentForm
    ) {
      let currentUserBalance = 0; // Variable to hold the user's balance

      // Fetch user's current balance to display in the modal
      // This assumes the user is logged in, which is handled by onAuthStateChanged
      const fetchUserBalance = async () => {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            currentUserBalance = userDocSnap.data().accountBalance || 0;
            document.getElementById(
              'modal-user-balance'
            ).textContent = `$${currentUserBalance.toFixed(2)}`;
          }
        }
      };

      const openModal = (planCard) => {
        // Populate modal with plan data
        const planName = planCard.querySelector('.plan-name').textContent;
        const planPrice = planCard.querySelector('.plan-price').textContent;
        document.getElementById(
          'modal-plan-name'
        ).textContent = `Invest in ${planName}`;
        document.getElementById(
          'modal-plan-details'
        ).textContent = `Range: ${planPrice}`;

        // Fetch and display the user's current balance
        fetchUserBalance();

        modalOverlay.classList.remove('hidden');
      };

      const closeModal = () => {
        investmentForm.reset(); // Reset the form when closing
        modalOverlay.classList.add('hidden');
      };

      // Event listeners for opening and closing modal
      investButtons.forEach((button) => {
        button.addEventListener('click', (e) =>
          openModal(e.target.closest('.plan-card'))
        );
      });
      modalCloseBtn.addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });

      // --- Investment Form Submission Logic ---
      investmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        const amount = parseFloat(
          document.getElementById('investment-amount').value
        );
        const user = auth.currentUser;

        if (!user) {
          alert('You must be logged in to invest.');
          submitButton.disabled = false;
          submitButton.textContent = 'Confirm Investment';
          return;
        }

        // Basic validation
        if (isNaN(amount) || amount <= 0) {
          alert('Please enter a valid investment amount.');
          submitButton.disabled = false;
          submitButton.textContent = 'Confirm Investment';
          return;
        }
        if (amount > currentUserBalance) {
          alert('Insufficient balance for this investment.');
          submitButton.disabled = false;
          submitButton.textContent = 'Confirm Investment';
          return;
        }

        try {
          // Use a Firestore transaction to ensure data consistency
          await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, 'users', user.uid);

            // 1. Create a new investment document
            const newInvestment = {
              userId: user.uid,
              planName: document
                .getElementById('modal-plan-name')
                .textContent.replace('Invest in ', ''),
              investedAmount: amount,
              status: 'active',
              startDate: new Date(),
              // End date logic can be added here based on plan duration
            };
            // Note: We are using addDoc which auto-generates an ID
            await addDoc(collection(db, 'investments'), newInvestment);

            // 2. Update the user's balance
            const newBalance = currentUserBalance - amount;
            transaction.update(userDocRef, { accountBalance: newBalance });
          });

          alert('Investment successful! Your plan is now active.');
          window.location.href = 'my-plans.html'; // Redirect to see active plans
        } catch (error) {
          console.error('Investment transaction failed: ', error);
          alert('An error occurred during the investment. Please try again.');
          submitButton.disabled = false;
          submitButton.textContent = 'Confirm Investment';
        }
      });
    }
  }