// =================================================================================
// PROJECT APEX: APP.JS - FINAL CORRECTED VERSION
// =================================================================================

// --- IMPORTS ---
import { auth, db, signOut } from './firebase-config.js'; // Assuming signOut is exported from firebase-config
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
  // --- TradingView Widget Loader ---
  // This is the single, correct way to load the widgets.
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
});
