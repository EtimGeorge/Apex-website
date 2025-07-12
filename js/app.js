// alert('app.js SCRIPT IS RUNNING!');
// =================================================================================
// PROJECT APEX: APP.JS - FINAL CONSOLIDATED SCRIPT (ALL FEATURES RESTORED)
// =================================================================================

// --- 1. IMPORTS (Direct, Simple, and Correct) ---
import { auth, db, storage } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import {
  ref,
  uploadBytes,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// --- 2. GLOBAL VARIABLES & ROUTE PROTECTION ---
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

// =================================================================================
// --- 3. MASTER AUTHENTICATION & DATA CONTROLLER ---
// =================================================================================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // --- A. USER IS LOGGED IN ---
    if (publicPages.includes(currentPage)) {
      window.location.href = 'dashboard.html';
      return;
    }

    // --- B. FETCH USER'S DATA ---
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        // --- C. RUN ALL UI AND EVENT LISTENER LOGIC ---
        runAllPageLogic(userData, user.uid);
      } else {
        console.error(
          'CRITICAL ERROR: User is authenticated but has no Firestore document.'
        );
      }
    } catch (error) {
      console.error('CRITICAL ERROR fetching user data:', error);
    }
  } else {
    // --- D. USER IS LOGGED OUT ---
    if (protectedPages.includes(currentPage)) {
      window.location.href = 'login.html';
    }
  }
});

// =================================================================================
// --- 4. MASTER LOGIC FUNCTION (Called After User Data is Fetched) ---
// =================================================================================
function runAllPageLogic(userData, uid) {
  console.log(`Running page logic for: ${currentPage}`);

  // --- A. LOGIC THAT RUNS ON EVERY PAGE ---
  updateHeaderUI(userData, uid);
  attachStaticEventListeners();
  handleThemeSwitcher();

  // --- B. PAGE-SPECIFIC LOGIC ---
  if (currentPage === 'dashboard.html') {
    handleDashboardPage(userData, uid);
  }
  if (currentPage === 'plans.html') {
    handlePlansPage(userData, uid);
  }
  if (currentPage === 'deposit-log.html') {
    handleDepositLogPage(uid);
  }
  if (currentPage === 'my-account.html') {
    handleMyAccountPage(userData);
  }
  if (currentPage === 'fund-account.html') {
    handleFundAccountPage(uid);
  }

  // =============================================================================
  // --- My Plans Page Logic (NEW BLOCK) ---
  // =============================================================================
  if (currentPage === 'my-plans.html') {
    const tableBody = document.querySelector('.transaction-table tbody');

    if (tableBody) {
      // We already have the user's uid from the function parameters
      const q = query(
        collection(db, 'investments'),
        where('userId', '==', uid),
        orderBy('startDate', 'desc') // Show newest investments first
      );

      getDocs(q)
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            tableBody.innerHTML =
              '<tr><td colspan="5">You have no active or past investments.</td></tr>';
            return;
          }

          let tableRowsHTML = '';
          querySnapshot.forEach((doc) => {
            const investment = doc.data();

            // Format the date nicely
            const startDate = investment.startDate
              .toDate()
              .toLocaleDateString();
            // We will leave End Date blank since we don't calculate it yet
            const endDate = 'N/A';

            tableRowsHTML += `
                    <tr>
                        <td>${investment.planName}</td>
                        <td>${investment.investedAmount.toFixed(2)}</td>
                        <td>${startDate}</td>
                        <td>${endDate}</td>
                        <td><span class="status status-${investment.status}">${
              investment.status
            }</span></td>
                    </tr>
                `;
          });

          tableBody.innerHTML = tableRowsHTML; // Populate the table with the new rows
        })
        .catch((error) => {
          console.error('Error fetching investment plans: ', error);
          tableBody.innerHTML =
            '<tr><td colspan="5">Could not load your investment plans. Please try again.</td></tr>';
        });
    }
  }

  // =============================================================================
  // --- Withdraw Page Logic (Corrected to NOT change balance on request) ---
  // =============================================================================
  if (currentPage === 'withdraw.html') {
    const withdrawForm = document.getElementById('withdraw-form');

    // This part, which pre-fills the balance, is correct and remains.
    const availableBalanceDisplay = document.getElementById(
      'withdraw-available-balance'
    );
    if (availableBalanceDisplay) {
      availableBalanceDisplay.textContent = `$${userData.accountBalance.toFixed(
        2
      )}`;
    }

    if (withdrawForm) {
      withdrawForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = withdrawForm.querySelector(
          'button[type="submit"]'
        );
        submitButton.disabled = true;
        submitButton.textContent = 'Processing Request...';

        const amount = parseFloat(
          document.getElementById('withdraw-amount').value
        );
        const method = document.getElementById('withdraw-method').value;
        const walletAddress = document.getElementById('wallet-address').value;

        // --- Validation ---
        // The check against the balance is still important user feedback.
        if (
          isNaN(amount) ||
          amount <= 0 ||
          amount > userData.accountBalance ||
          walletAddress.trim() === ''
        ) {
          alert(
            'Invalid input. Please check the amount and wallet address, and ensure you have sufficient funds.'
          );
          submitButton.disabled = false;
          submitButton.textContent = 'Submit Request';
          return;
        }

        // --- Create a PENDING transaction record ONLY ---
        try {
          // This is now a simple 'addDoc' and not a complex transaction.
          // We are only recording the user's *request*.
          await addDoc(collection(db, 'transactions'), {
            userId: uid,
            type: 'withdrawal',
            amount: amount,
            method: method,
            walletAddress: walletAddress,
            status: 'pending', // All withdrawals start as pending
            date: new Date(),
          });

          alert(
            'Withdrawal request submitted successfully! It is now pending approval.'
          );
          window.location.href = 'withdrawal-log.html';
        } catch (error) {
          console.error('Withdrawal request submission failed: ', error);
          alert('Withdrawal request failed: ' + error);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit Request';
        }
      });
    }
  }

  // =============================================================================
  // --- Withdrawal Log Page Logic (Corrected Placement) ---
  // =============================================================================
  if (currentPage === 'withdrawal-log.html') {
    const tableBody = document.querySelector('.transaction-table tbody');

    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';

      // Query for transactions of type 'withdrawal'
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', uid),
        where('type', '==', 'withdrawal'),
        where('status', '==', 'pending'),
        orderBy('date', 'desc')
      );

      getDocs(q)
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            tableBody.innerHTML =
              '<tr><td colspan="4">No withdrawal history found.</td></tr>';
            return;
          }

          let tableRowsHTML = '';
          querySnapshot.forEach((doc) => {
            const tx = doc.data();
            const date = tx.date.toDate().toLocaleDateString();
            // Shorten the wallet address for display
            const shortAddress = `${tx.walletAddress.substring(
              0,
              6
            )}...${tx.walletAddress.substring(tx.walletAddress.length - 4)}`;

            tableRowsHTML += `
                        <tr>
                            <td data-label="Date">${date}</td>
                            <td data-label="Amount">$${tx.amount.toFixed(
                              2
                            )}</td>
                            <td data-label="Wallet Address">${shortAddress}</td>
                            <td data-label="Status">
                                <span class="status-badge status-${
                                  tx.status
                                }">${tx.status}</span>
                            </td>
                        </tr>
                    `;
          });

          tableBody.innerHTML = tableRowsHTML;
        })
        .catch((error) => {
          console.error('Error fetching withdrawal log:', error);
          tableBody.innerHTML =
            '<tr><td colspan="4">Error loading data.</td></tr>';
        });
    }
  }

  // =============================================================================
  // --- Verify Page Logic (Corrected for your HTML) ---
  // =============================================================================
  if (currentPage === 'verify.html') {
    const kycForm = document.getElementById('kyc-form');
    const statusBanner = document.querySelector('.status-banner');

    // Update the status banner based on user data
    if (statusBanner && userData.kycStatus) {
      const status = userData.kycStatus;
      statusBanner.className = `status-banner status-${status}`; // e.g., status-verified
      statusBanner.innerHTML = `<strong>Your current status:</strong> ${
        status.charAt(0).toUpperCase() + status.slice(1)
      }`;
    }

    // Disable form if already verified or pending
    if (userData.kycStatus === 'pending' || userData.kycStatus === 'verified') {
      kycForm
        .querySelectorAll('input, button')
        .forEach((el) => (el.disabled = true));
      kycForm
        .querySelectorAll('.file-drop-area')
        .forEach((area) => (area.style.cursor = 'not-allowed'));
    }

    // Logic for file input name display and drag & drop
    const kycUploadBoxes = document.querySelectorAll('.kyc-upload-box');
    kycUploadBoxes.forEach((box) => {
      const input = box.querySelector('.file-input');
      const dropArea = box.querySelector('.file-drop-area');
      const fileNameDisplay = box.querySelector('.file-name-display');

      // Handle file selection via click
      input.addEventListener('change', () => {
        fileNameDisplay.textContent =
          input.files.length > 0 ? input.files[0].name : '';
      });

      // Handle drag & drop
      dropArea.addEventListener('click', () => input.click()); // Click drop area to open file dialog
      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('is-active');
      });
      dropArea.addEventListener('dragleave', () =>
        dropArea.classList.remove('is-active')
      );
      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('is-active');
        if (e.dataTransfer.files.length > 0) {
          input.files = e.dataTransfer.files;
          input.dispatchEvent(new Event('change')); // Trigger change event to update display
        }
      });
    });

    // --- Form Submission Logic ---
    if (kycForm) {
      kycForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = kycForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Uploading...';

        // Get the files from the inputs your HTML uses
        const selfieFile = document.getElementById('selfie-upload').files[0];
        const idFrontFile = document.getElementById('id-front-upload').files[0];

        if (!selfieFile || !idFrontFile) {
          alert('A selfie and the front of your ID are required.');
          submitButton.disabled = false;
          submitButton.textContent = 'Submit for Verification';
          return;
        }

        try {
          // This upload logic is correct and remains the same
          const selfieRef = ref(storage, `kyc-documents/${uid}/selfie.jpg`);
          await uploadBytes(selfieRef, selfieFile);

          const idFrontRef = ref(storage, `kyc-documents/${uid}/id-front.jpg`);
          await uploadBytes(idFrontRef, idFrontFile);

          // Update user status in Firestore
          await updateDoc(doc(db, 'users', uid), { kycStatus: 'pending' });

          alert('Documents uploaded! Your verification is now pending review.');
          window.location.reload();
        } catch (error) {
          console.error('KYC upload failed:', error);
          alert('Upload failed. Please try again.');
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit for Verification';
        }
      });
    }
  }
  // =================================================================================
  // --- 5. HELPER FUNCTIONS & EVENT HANDLERS ---
  // =================================================================================

  // --- Universal UI Updaters ---
  function updateHeaderUI(userData, uid) {
    const userNameDisplay = document.getElementById('user-name-display');
    const userProfilePic = document.getElementById('user-profile-pic');
    if (userNameDisplay) userNameDisplay.textContent = userData.fullName;
    if (userProfilePic)
      userProfilePic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        userData.fullName
      )}&background=0D8ABC&color=fff&rounded=true`;
  }

  function attachStaticEventListeners() {
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
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
      logoutButton.addEventListener('click', () =>
        signOut(auth).catch((err) => console.error('Logout error', err))
      );
    }
  }

  function handleThemeSwitcher() {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const themeMenu = document.getElementById('theme-menu');
    if (themeToggleButton && themeMenu) {
      themeToggleButton.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (
          !themeMenu.contains(e.target) &&
          !themeToggleButton.contains(e.target)
        )
          themeMenu.classList.add('hidden');
      });
      themeMenu.querySelectorAll('li').forEach((item) => {
        item.addEventListener('click', () => {
          localStorage.setItem('theme', item.getAttribute('data-theme'));
          location.reload();
        });
      });
    }
  }

  // --- Page-Specific Handlers ---
  function handleDashboardPage(userData, uid) {
    const formatCurrency = (num) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(num || 0);
    document.getElementById('balance-display').textContent = formatCurrency(
      userData.accountBalance
    );
    document.getElementById('deposits-display').textContent = formatCurrency(
      userData.totalDeposited
    );

     // =============================================================
    // --- THIS IS THE FIX ---
    // =============================================================
    const profitsDisplay = document.getElementById('profits-display');
    if (profitsDisplay) {
        // Find and display the 'totalProfits' field from the user's document
        profitsDisplay.textContent = formatCurrency(userData.totalProfits);
    }
    document.getElementById('withdrawn-display').textContent = formatCurrency(
      userData.totalWithdrawn
    );
    document.getElementById(
      'referral-link-display'
    ).value = `https://projectapex.com/register.html?ref=${uid}`;

    const copyButton = document.getElementById('copy-btn');
    const referralInput = document.getElementById('referral-link-display');
    if (copyButton && referralInput) {
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(referralInput.value).then(() => {
          copyButton.textContent = 'Copied!';
          copyButton.style.backgroundColor = 'var(--color-accent-success)';
          setTimeout(() => {
            copyButton.textContent = 'Copy';
            copyButton.style.backgroundColor = '';
          }, 2000);
        });
      });
    }

    // =============================================================================
    // --- Dashboard Notification Logic (WITH WITHDRAWAL NOTIFICATIONS) ---
    // =============================================================================
    const notificationArea = document.getElementById('notification-area');
    if (notificationArea) {
      // This query correctly fetches ALL unread transactions for the user
      const notificationQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', uid),
        where('isRead', '==', false)
      );

      getDocs(notificationQuery).then((snapshot) => {
        if (snapshot.empty) {
          notificationArea.style.display = 'none';
          return;
        }

        notificationArea.innerHTML = ''; // Clear any existing notifications before adding new ones
        notificationArea.style.display = 'flex';

        snapshot.forEach((doc) => {
          const tx = doc.data();
          const txId = doc.id;
          let message = '';
          let type = '';

          // --- THIS IS THE MODIFIED PART ---
          // It now checks for both deposit and withdrawal types.

          // Case 1: Successful Deposit
          if (tx.type === 'deposit' && tx.status === 'completed') {
            message = `Your deposit of $${tx.amount.toFixed(
              2
            )} has been approved and added to your balance.`;
            type = 'success';
          }
          // Case 2: Failed Deposit
          else if (tx.type === 'deposit' && tx.status === 'failed') {
            message = `Your deposit of $${tx.amount.toFixed(
              2
            )} could not be processed. Please contact support.`;
            type = 'failed';
          }
          // Case 3: Successful Withdrawal
          else if (tx.type === 'withdrawal' && tx.status === 'completed') {
            message = `Your withdrawal request for $${tx.amount.toFixed(
              2
            )} has been approved and processed.`;
            type = 'success';
          }
          // Case 4: Failed/Rejected Withdrawal
          else if (tx.type === 'withdrawal' && tx.status === 'failed') {
            message = `Your withdrawal request for $${tx.amount.toFixed(
              2
            )} has been rejected, and the funds have been returned to your account balance.`;
            type = 'failed';
          }

          // If a valid message was created, build and append the notification element
          if (message) {
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification-item notification-${type}`;
            notificationEl.innerHTML = `
                    <p>${message}</p>
                    <button class="dismiss-btn" data-txid="${txId}">×</button>
                `;
            notificationArea.appendChild(notificationEl);
          }
        });
      });

      // The 'dismiss' event listener is correct and does not need to be changed.
      notificationArea.addEventListener('click', async (e) => {
        if (e.target.classList.contains('dismiss-btn')) {
          const button = e.target;
          const txId = button.dataset.txid;
          const notificationItem = button.closest('.notification-item');

          button.disabled = true;

          try {
            // Mark the notification as 'read' in Firestore
            const txDocRef = doc(db, 'transactions', txId);
            await updateDoc(txDocRef, { isRead: true });

            // Fade out and remove the notification from the UI
            notificationItem.style.transition = 'opacity 0.3s ease';
            notificationItem.style.opacity = '0';
            setTimeout(() => notificationItem.remove(), 300);
          } catch (error) {
            console.error('Error dismissing notification:', error);
            alert('Could not dismiss notification. Please try again.');
            button.disabled = false;
          }
        }
      });
    }
  }

  function handleDepositLogPage(uid) {
    const tableBody = document.querySelector(
      '.data-table tbody, .transaction-table tbody'
    );
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', uid),
        where('type', '==', 'deposit'),
        orderBy('date', 'desc')
      );
      getDocs(q).then((querySnapshot) => {
        if (querySnapshot.empty) {
          tableBody.innerHTML =
            '<tr><td colspan="5">No deposit history found.</td></tr>';
          return;
        }
        let rows = '';
        querySnapshot.forEach((doc) => {
          const tx = doc.data();
          const date = tx.date.toDate().toLocaleString();
          rows += `<tr><td>${doc.id.substring(
            0,
            10
          )}...</td><td>$${tx.amount.toFixed(
            2
          )}</td><td>${tx.method.toUpperCase()}</td><td><span class="status status-${
            tx.status
          }">${tx.status}</span></td><td>${date}</td></tr>`;
        });
        tableBody.innerHTML = rows;
      });
    }
  }

  function handleMyAccountPage(userData) {
    // Pre-populate forms
    document.getElementById('full-name').value = userData.fullName || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('country').value = userData.country || '';

    // Attach submit listeners
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', handleProfileUpdate);
    }
    const securityForm = document.getElementById('security-form');
    if (securityForm) {
      securityForm.addEventListener('submit', handlePasswordUpdate);
    }

    // Tab Logic
    const tabButtons = document.querySelectorAll('.account-tab-btn');
    const tabPanels = document.querySelectorAll('.account-panel');
    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        tabPanels.forEach((panel) => panel.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
      });
    });
  }

  // =============================================================================
  // --- This is the complete and correct function for the Plans page ---
  // =============================================================================
  function handlePlansPage(userData, uid) {
    const plansGrid = document.querySelector('.plans-grid');
    const modalOverlay = document.getElementById('investment-modal');
    const investmentForm = document.getElementById('investment-form');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- Function to open the modal (logic is correct) ---
    const openModal = (planCard) => {
      if (!planCard) return;
      document.getElementById('modal-plan-name').textContent = `Invest in ${
        planCard.querySelector('.plan-name').textContent
      }`;
      document.getElementById('modal-plan-details').textContent = `Range: ${
        planCard.querySelector('.plan-price').textContent
      }`;
      document.getElementById(
        'modal-user-balance'
      ).textContent = `$${userData.accountBalance.toFixed(2)}`;
      modalOverlay.classList.remove('hidden');
    };

    // --- Function to close the modal (logic is correct) ---
    const closeModal = () => {
      if (investmentForm) investmentForm.reset();
      if (modalOverlay) modalOverlay.classList.add('hidden');
    };

    // --- Function to attach listeners to buttons AFTER they are created ---
    const attachInvestButtonListeners = () => {
      const newInvestButtons = document.querySelectorAll('.plan-btn');
      newInvestButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          const planCard = e.target.closest('.plan-card');
          openModal(planCard);
        });
      });
    };

    // --- MAIN LOGIC: Fetch plans from Firestore ---
    if (plansGrid) {
      plansGrid.innerHTML = '<p>Loading available investment plans...</p>';
      const plansQuery = query(
        collection(db, 'plans'),
        where('isActive', '==', true),
        orderBy('minAmount')
      );

      getDocs(plansQuery)
        .then((snapshot) => {
          let plansHTML = '';
          if (snapshot.empty) {
            plansHTML =
              '<p>No investment plans are available at this time.</p>';
          } else {
            snapshot.forEach((doc) => {
              const plan = doc.data();
              const isFeatured = plan.planName
                .toLowerCase()
                .includes('premium');
              plansHTML += `
                            <div class="plan-card ${
                              isFeatured ? 'featured' : ''
                            }">
                                ${
                                  isFeatured
                                    ? '<div class="plan-badge">Most Popular</div>'
                                    : ''
                                }
                                <div class="plan-header">
                                    <h3 class="plan-name">${plan.planName}</h3>
                                    <div class="plan-price">$${
                                      plan.minAmount
                                    } - $${plan.maxAmount}</div>
                                </div>
                                <ul class="plan-features">
                                    <li>Return <strong>${
                                      plan.roiPercent
                                    }% Daily</strong></li>
                                    <li>Duration <strong>For ${
                                      plan.durationDays
                                    } Days</strong></li>
                                    <li>Referral Bonus <strong>5%</strong></li>
                                </ul>
                                <button class="btn btn-primary plan-btn">Invest Now</button>
                            </div>
                        `;
            });
          }
          // Step 1: Render the dynamic HTML
          plansGrid.innerHTML = plansHTML;
          // Step 2: NOW that the buttons exist, attach the listeners
          attachInvestButtonListeners();
        })
        .catch((error) => {
          console.error('Error fetching plans:', error);
          plansGrid.innerHTML = '<p>Could not load investment plans.</p>';
        });
    }

    // --- Attach listeners for modal elements that are always in the HTML ---
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay)
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    if (investmentForm)
      investmentForm.addEventListener('submit', (e) =>
        handleInvestmentSubmission(e, userData)
      );
  }

  function handleFundAccountPage(uid) {
    // --- DATA ---
    // In a real application, these addresses would be stored securely.
    const companyWallets = {
      btc: {
        name: 'Bitcoin (BTC)',
        symbol: 'BTC',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      },
      eth: {
        name: 'Ethereum (ETH)',
        symbol: 'ETH',
        address: '0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
      },
      usdt: {
        name: 'Tether (USDT)',
        symbol: 'USDT',
        address: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
      },
      pi: {
        name: 'Pi Network (PI)',
        symbol: 'PI',
        address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      },
      ice: {
        name: 'Ice Network (ICE)',
        symbol: 'ICE',
        address: 'ice_1234567890abcdefghijklmnopqrstuvwxyz',
      },
      // Add more coins here
    };

    // ============delet top if error should occur================

    // --- ELEMENTS ---
    const fundForm = document.getElementById('deposit-form');

    // Populate the wallet address fields
    const paymentMethodDropdown = document.getElementById('payment-method');
    const walletDisplayCard = document.getElementById('wallet-display-card');

    // --- HELPER FUNCTION to update the wallet display ---
    const updateWalletDisplay = (selectedCoin) => {
      const walletData = companyWallets[selectedCoin];
      if (!walletData) {
        walletDisplayCard.classList.add('hidden');
        return;
      }

      // Populate text elements
      document.getElementById('wallet-coin-name').textContent = walletData.name;
      document.getElementById('wallet-coin-symbol').textContent =
        walletData.symbol;
      document.getElementById('wallet-address-display').value =
        walletData.address;

      // Generate and display QR Code
      const qrCodeContainer = document.getElementById('wallet-qr-code');
      qrCodeContainer.innerHTML = ''; // Clear previous QR code
      new QRCode(qrCodeContainer, {
        text: walletData.address,
        width: 150,
        height: 150,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });

      // Make the card visible
      walletDisplayCard.classList.remove('hidden');
    };

    // --- EVENT LISTENERS ---
    // When the dropdown value changes
    paymentMethodDropdown.addEventListener('change', (e) => {
      updateWalletDisplay(e.target.value);
    });

    // Copy button for the wallet address
    const walletCopyBtn = document.getElementById('wallet-copy-btn');
    if (walletCopyBtn) {
      walletCopyBtn.addEventListener('click', () => {
        const addressInput = document.getElementById('wallet-address-display');
        navigator.clipboard.writeText(addressInput.value).then(() => {
          alert('Wallet address copied to clipboard!');
        });
      });
    }

    // --- Initialize view on page load ---
    // Hide the wallet card initially
    walletDisplayCard.classList.add('hidden');

    // The rest of your working fundForm, quick amount buttons logic remains here...
    // ...

    const amountInput = document.getElementById('amount'); // Get the amount input field
    const quickAmountButtons = document.querySelectorAll('.btn-quick-amount'); // Get all quick amount buttons

    // Attach listeners to the quick amount buttons
    if (amountInput && quickAmountButtons.length > 0) {
      quickAmountButtons.forEach((button) => {
        button.addEventListener('click', () => {
          // Get the text content (e.g., "$100") and remove the "$"
          const amountValue = button.textContent.replace('$', '');
          amountInput.value = amountValue;
        });
      });
    }

    // Attach the main form submission listener
    if (fundForm) {
      fundForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = fundForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        const amount = parseFloat(document.getElementById('amount').value);
        const paymentMethod = document.getElementById('payment-method').value;

        if (isNaN(amount) || amount <= 0) {
          alert('Please enter a valid amount.');
          submitButton.disabled = false;
          submitButton.textContent = 'Proceed to Payment';
          return;
        }

        // ... inside the fundForm.addEventListener ...

        // =================================================================
        // --- THIS IS THE REPLACEMENT BLOCK ---
        // It now ONLY creates the transaction record and does NOT update the user's document.
        // =================================================================
        try {
          // This is no longer a transaction, just a single document creation.
          await addDoc(collection(db, 'transactions'), {
            userId: uid,
            type: 'deposit',
            amount: amount,
            method: paymentMethod,
            status: 'pending', // All deposits start as pending
            date: new Date(),
          });

          alert(
            'Deposit request submitted successfully! Your request is pending approval and will reflect in your balance soon.'
          );
          window.location.href = 'deposit-log.html';
        } catch (error) {
          console.error('Error submitting deposit request: ', error);
          alert('An error occurred while submitting your deposit request.');
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Proceed to Payment';
        }

        // =================================================================
        // --- THIS IS THE REPLACEMENT BLOCK ---
        // We replace the old `try...catch` with this new one that uses a transaction.
        // =================================================================
        // try {
        // Use a Transaction to safely update one document and create another.
        // await runTransaction(db, async (transaction) => {
        //   const userDocRef = doc(db, 'users', uid);

        // Best practice: get the most recent user data inside the transaction.
        // const userDoc = await transaction.get(userDocRef);
        // if (!userDoc.exists()) {
        //   throw 'User document not found!';
        // }

        // 1. UPDATE THE USER'S totalDeposited FIELD
        // const newTotalDeposited =
        //   (userDoc.data().totalDeposited || 0) + amount;
        // transaction.update(userDocRef, {
        //   totalDeposited: newTotalDeposited,
        // });

        // 2. CREATE THE TRANSACTION RECORD
        // We use .set() with a new reference inside a transaction.
        //   const newTransactionRef = doc(collection(db, 'transactions'));
        //   transaction.set(newTransactionRef, {
        //     userId: uid,
        //     type: 'deposit',
        //     amount: amount,
        //     method: paymentMethod,
        //     status: 'pending',
        //     date: new Date(),
        //   });
        // });

        //   alert('Deposit request submitted successfully!');
        //   window.location.href = 'deposit-log.html';
        // } catch (error) {
        //   console.error('Error submitting deposit: ', error);
        //   alert('An error occurred while submitting your deposit.');
        // } finally {
        //   submitButton.disabled = false;
        //   submitButton.textContent = 'Proceed to Payment';
        // }
      });
    }
  }

  // --- Form Submission Handlers ---
  async function handleProfileUpdate(e) {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        fullName: document.getElementById('full-name').value,
        phone: document.getElementById('phone').value,
        country: document.getElementById('country').value,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Save Changes';
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== document.getElementById('confirm-password').value) {
      alert('Passwords do not match.');
      return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Updating...';
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert('Password updated successfully! Please log in again.');
      signOut(auth);
    } catch (error) {
      alert(
        'Failed to update password. You may need to log out and log back in for this operation.'
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Update Password';
    }
  }

  // =================================================================================
  // --- Investment Form Submission Handler (DEBUGGING VERSION) ---
  // =================================================================================
  async function handleInvestmentSubmission(event, currentUserData) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    const amount = parseFloat(
      document.getElementById('investment-amount').value
    );
    const user = auth.currentUser;

    // --- Validation ---
    if (!user || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid investment amount.');
      submitButton.disabled = false;
      submitButton.textContent = 'Confirm Investment';
      return;
    }

    // We use the globally fetched userData for the initial check
    if (amount > currentUserData.accountBalance) {
      alert('Insufficient balance for this investment.');
      submitButton.disabled = false;
      submitButton.textContent = 'Confirm Investment';
      return;
    }

    // --- Firestore Transaction ---
    try {
      console.log('DEBUG: Starting investment transaction...');

      await runTransaction(db, async (transaction) => {
        console.log('DEBUG: 1. Inside runTransaction callback.');
        const userDocRef = doc(db, 'users', user.uid);

        console.log(
          'DEBUG: 2. Getting fresh user document inside transaction...'
        );
        const userDoc = await transaction.get(userDocRef);

        if (!userDoc.exists()) {
          // This error will be caught by the outer catch block
          throw 'FATAL: User document could not be found inside transaction.';
        }
        console.log('DEBUG: 3. Fresh user document found.');

        const currentBalance = userDoc.data().accountBalance;
        console.log(
          `DEBUG: 4. Balance inside transaction is: $${currentBalance}`
        );

        if (amount > currentBalance) {
          throw `Your current balance ($${currentBalance}) is no longer sufficient.`;
        }

        // --- Step A: Update User's Balance ---
        const newBalance = currentBalance - amount;
        console.log(`DEBUG: 5. Updating user balance to: $${newBalance}`);
        transaction.update(userDocRef, { accountBalance: newBalance });

        // --- Step B: Create New Investment Document ---
        const newInvestmentRef = doc(collection(db, 'investments')); // Auto-generates an ID
        const newInvestmentData = {
          userId: user.uid,
          planName: document
            .getElementById('modal-plan-name')
            .textContent.replace('Invest in ', ''),
          investedAmount: amount,
          status: 'active',
          startDate: new Date(),
        };
        console.log(
          'DEBUG: 6. Creating new investment document with data:',
          newInvestmentData
        );
        transaction.set(newInvestmentRef, newInvestmentData);

        console.log('DEBUG: 7. Transaction operations queued successfully.');
      });

      console.log('DEBUG: 8. Transaction completed successfully!');
      alert('Investment successful! Your plan is now active.');
      window.location.href = 'my-plans.html';
    } catch (error) {
      console.error('--- INVESTMENT FAILED ---');
      console.error('Error message:', error);
      alert('Investment failed: ' + error);
      submitButton.disabled = false;
      submitButton.textContent = 'Confirm Investment';
    }
  }
}
