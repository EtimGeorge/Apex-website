// =================================================================================
// PROJECT APEX: APP.JS - (Restored to working state before My Account attempt)
// =================================================================================

import {
  auth,
  db,
  signOut,
  doc,
  getDoc,
  runTransaction,
  collection,
  addDoc,
  updateDoc,
  updatePassword
} from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// --- GLOBAL STATE & ROUTE PROTECTION ---
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

let currentUserData = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (publicPages.includes(currentPage)) {
      window.location.href = 'dashboard.html';
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        currentUserData = userData; // Store data globally

        // --- Update Header & Dashboard UI (Known Good) ---
        const formatCurrency = (number) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(number || 0);
        document.getElementById('user-name-display').textContent =
          userData.fullName;
        document.getElementById('user-profile-pic').src =
          userData.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData.fullName
          )}&background=0D8ABC&color=fff&rounded=true`;
        if (currentPage === 'dashboard.html') {
          document.getElementById('balance-display').textContent =
            formatCurrency(userData.accountBalance);
          document.getElementById('deposits-display').textContent =
            formatCurrency(userData.totalDeposited);
          document.getElementById('withdrawn-display').textContent =
            formatCurrency(userData.totalWithdrawn);
          document.getElementById(
            'referral-link-display'
          ).value = `https://projectapex.com/register.html?ref=${user.uid}`;
        }
      } else {
        console.error(
          'Data integrity error: User authenticated but no document exists.'
        );
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  } else {
    if (protectedPages.includes(currentPage)) {
      window.location.href = 'login.html';
    }
  }
});

// --- UI INITIALIZATION & EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  // --- Investment Modal Logic (Known Good) ---
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
      const openModal = (planCard) => {
        const planName = planCard.querySelector('.plan-name').textContent;
        const planPrice = planCard.querySelector('.plan-price').textContent;
        document.getElementById(
          'modal-plan-name'
        ).textContent = `Invest in ${planName}`;
        document.getElementById(
          'modal-plan-details'
        ).textContent = `Range: ${planPrice}`;
        if (currentUserData) {
          document.getElementById(
            'modal-user-balance'
          ).textContent = `$${currentUserData.accountBalance.toFixed(2)}`;
        }
        modalOverlay.classList.remove('hidden');
      };
      const closeModal = () => {
        investmentForm.reset();
        modalOverlay.classList.add('hidden');
      };
      investButtons.forEach((button) =>
        button.addEventListener('click', (e) =>
          openModal(e.target.closest('.plan-card'))
        )
      );
      modalCloseBtn.addEventListener('click', closeModal);
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
      investmentForm.addEventListener('submit', async (e) => {
        // ... all the working investment submission logic ...
        e.preventDefault();
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        const amount = parseFloat(
          document.getElementById('investment-amount').value
        );
        const user = auth.currentUser;

        if (
          !user ||
          isNaN(amount) ||
          amount <= 0 ||
          amount > currentUserData.accountBalance
        ) {
          alert(
            'Please enter a valid amount. Ensure you have sufficient balance.'
          );
          submitButton.disabled = false;
          submitButton.textContent = 'Confirm Investment';
          return;
        }

        try {
          await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
              throw 'Document does not exist!';
            }

            const currentBalance = userDoc.data().accountBalance;
            if (amount > currentBalance) {
              throw 'Insufficient balance for this transaction.';
            }

            const newBalance = currentBalance - amount;
            transaction.update(userDocRef, { accountBalance: newBalance });

            const newInvestmentRef = doc(collection(db, 'investments'));
            transaction.set(newInvestmentRef, {
              userId: user.uid,
              planName: document
                .getElementById('modal-plan-name')
                .textContent.replace('Invest in ', ''),
              investedAmount: amount,
              status: 'active',
              startDate: new Date(),
            });
          });
          alert('Investment successful! Your plan is now active.');
          window.location.href = 'my-plans.html';
        } catch (error) {
          console.error('Investment transaction failed: ', error);
          alert('An error occurred. Reason: ' + error.message);
          submitButton.disabled = false;
          submitButton.textContent = 'Confirm Investment';
        }
      });
    }
  }

  // --- All Other Working UI Logic ---
  // (Sidebar, Theme, Copy Button, Account Tabs from your confirmed working file...)

  if (currentPage === 'dashboard.html' && typeof TradingView !== 'undefined') {
    const theme = document.documentElement.classList.contains('dark-theme')
      ? 'dark'
      : 'light';

    // Ticker Tape Widget
    new TradingView.widget({
      container_id: 'tradingview-ticker-tape',
      symbols: [
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'FOREXCOM:NSXUSD', title: 'US 100' },
        { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
        { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
      ],
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'en',
    });

    // Advanced Chart Widget
    new TradingView.widget({
      container_id: 'tradingview-advanced-chart',
      height: 500,
      symbol: 'FX:EURUSD',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
    });
  }

  // --- Logout Button Logic ---
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      // Correct way to call signOut
      signOut(auth)
        .then(() => {
          console.log('User signed out successfully.');
          // Redirect will be handled by onAuthStateChanged
        })
        .catch((error) => {
          console.error('Sign out error', error);
        });
    });
  }
  // --- All Other UI Logic ---
  // (Sidebar, Theme, Copy Button, Tabs, etc. are all placed here)

  // Collapsible Sidebar
  const dashboardLayout = document.querySelector('.dashboard-layout');
  if (dashboardLayout) {
    const sidebar = dashboardLayout.querySelector('.sidebar');
    sidebar.addEventListener('mouseenter', () =>
      dashboardLayout.classList.add('sidebar-expanded')
    );
    sidebar.addEventListener('mouseleave', () =>
      dashboardLayout.classList.remove('sidebar-expanded')
    );
  }

  // Theme Switcher
  const themeToggleButton = document.getElementById('theme-toggle-btn');
  const themeMenu = document.getElementById('theme-menu');
  if (themeToggleButton && themeMenu) {
    themeToggleButton.addEventListener('click', (event) => {
      event.stopPropagation();
      themeMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (event) => {
      if (
        !themeMenu.contains(event.target) &&
        !themeToggleButton.contains(event.target)
      ) {
        themeMenu.classList.add('hidden');
      }
    });
    themeMenu.querySelectorAll('li').forEach((item) => {
      item.addEventListener('click', () => {
        localStorage.setItem('theme', item.getAttribute('data-theme'));
        location.reload();
      });
    });
  }

  // --- Dashboard Page: Copy Button Logic (Corrected) ---
  const copyButton = document.getElementById('copy-btn');
  // Note the corrected ID for the input field
  const referralInput = document.getElementById('referral-link-display');

  if (copyButton && referralInput) {
    copyButton.addEventListener('click', () => {
      navigator.clipboard
        .writeText(referralInput.value)
        .then(() => {
          // --- SUCCESS FEEDBACK ---
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Copied!';
          copyButton.style.backgroundColor = 'var(--color-accent-success)'; // Use our CSS variable for green
          copyButton.style.borderColor = 'var(--color-accent-success)';

          // Revert back after 2 seconds
          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.backgroundColor = ''; // Reverts to the class style
            copyButton.style.borderColor = '';
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          alert('Could not copy text to clipboard.');
        });
    });
  }

  // --- Fund Account Page: Quick Amount Logic ---
  const amountInput = document.getElementById('amount');
  if (amountInput) {
    const quickAmountButtons = document.querySelectorAll('.btn-quick-amount');
    quickAmountButtons.forEach((button) => {
      button.addEventListener('click', () => {
        amountInput.value = button.textContent.replace('$', '');
      });
    });
  }

  /// --- My Account Page: Tab Logic ---
  const accountTabsContainer = document.querySelector('.account-tabs');
  if (accountTabsContainer) {
    const tabButtons =
      accountTabsContainer.querySelectorAll('.account-tab-btn');
    const tabPanels = document.querySelectorAll('.account-panel');
    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetPanelId = button.dataset.tab;
        const targetPanel = document.getElementById(targetPanelId);
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        tabPanels.forEach((panel) => panel.classList.remove('active'));
        button.classList.add('active');
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }
  // --- Verify Page: KYC File Upload Logic ---
  // Note: The original code had some undefined variables. This is a corrected version.
  const kycForm = document.getElementById('kyc-form');
  if (kycForm) {
    const fileInputs = kycForm.querySelectorAll('.file-input');
    fileInputs.forEach((input) => {
      const label = kycForm.querySelector(`label[for='${input.id}']`);
      if (label) {
        input.addEventListener('change', () => {
          label.textContent =
            input.files.length > 0 ? input.files[0].name : 'Choose File';
        });
      }
    });
  }

  // =================================================================================
  // --- My Account Page Logic (NEW ROBUST VERSION) ---
  // =================================================================================
  if (currentPage === 'my-account.html') {
    // This function waits for currentUserData and fills the forms.
    // This part is working and remains the same.
    const waitForDataAndFillForms = () => {
      if (currentUserData) {
        populateAccountForms(currentUserData);
        return;
      }
      let interval = setInterval(() => {
        if (currentUserData) {
          clearInterval(interval);
          populateAccountForms(currentUserData);
        }
      }, 100);
    };
    const populateAccountForms = (userData) => {
      document.getElementById('full-name').value = userData.fullName || '';
      document.getElementById('email').value = userData.email || '';
      document.getElementById('phone').value = userData.phone || '';
      document.getElementById('country').value = userData.country || '';
    };
    waitForDataAndFillForms();

    // Tab Logic - this is working and remains the same.
    const tabButtons = document.querySelectorAll('.account-tab-btn');
    const tabPanels = document.querySelectorAll('.account-panel');
    tabButtons.forEach((button) => {
      /* ... your working tab logic ... */
    });

    // --- Profile Form Submission (NEW LOGIC) ---
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = profileForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          try {
            // Collect the updated data from the form
            const updatedData = {
              fullName: document.getElementById('full-name').value,
              phone: document.getElementById('phone').value,
              country: document.getElementById('country').value,
            };

            // Use updateDoc to merge the new data into the existing document
            await updateDoc(userDocRef, updatedData);

            alert('Profile updated successfully!');
          } catch (error) {
            console.error('Error updating profile: ', error);
            alert('Failed to update profile. Please try again.');
          } finally {
            // Re-enable the button whether it succeeded or failed
            submitButton.disabled = false;
            submitButton.textContent = 'Save Changes';
          }
        }
      });
    }

    // --- Security (Password) Form Submission (NEW LOGIC) ---
    const securityForm = document.getElementById('security-form');
    if (securityForm) {
      securityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = securityForm.querySelector(
          'button[type="submit"]'
        );
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword =
          document.getElementById('confirm-password').value;

        if (newPassword.length < 6) {
          alert('Password must be at least 6 characters long.');
          return;
        }

        if (newPassword !== confirmPassword) {
          alert('New passwords do not match.');
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Updating...';

        try {
          const user = auth.currentUser;
          // This requires the user to re-authenticate for security.
          // We are using a simplified approach for now. A full implementation
          // would use reauthenticateWithCredential() first.
          await updatePassword(user, newPassword);
          alert(
            'Password updated successfully! Please log in again for security.'
          );
          // Sign the user out to force a fresh login with the new password
          signOut(auth).then(() => {
            window.location.href = 'login.html';
          });
        } catch (error) {
          console.error('Error updating password: ', error);
          // Provide a more helpful message for a common error
          if (error.code === 'auth/requires-recent-login') {
            alert(
              'This is a sensitive operation and requires you to log in again before changing your password.'
            );
            signOut(auth); // Sign them out
          } else {
            alert('Failed to update password. Please try again.');
          }
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Update Password';
        }
      });
    }
  }
});
