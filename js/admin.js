// =================================================================================
// PROJECT APEX: ADMIN.JS - FINAL ARCHITECTURE
// =================================================================================

import { auth, db, storage } from './firebase-config.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  where,
  runTransaction, // <<<--- ADDED
  updateDoc, // <<<--- ADDED
  addDoc,
  serverTimestamp, // <-- Add this
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  ref,
  getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// --- ADMIN AUTHENTICATION & ROUTE PROTECTION ---
const adminProtectedPages = [
  'dashboard.html',
  'users.html',
  'kyc.html',
  'deposits.html',
  'withdrawals.html',
  'plans.html',
];
const adminLoginPage = 'index.html';
const currentPage = window.location.pathname.split('/').pop();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is logged in, check if they are an admin
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().isAdmin === true) {
        // USER IS A VERIFIED ADMIN
        if (currentPage === adminLoginPage) {
          window.location.href = 'dashboard.html';
        }
        const adminNameDisplay = document.getElementById('admin-name-display');
        if (adminNameDisplay)
          adminNameDisplay.textContent = userDocSnap.data().fullName;
      } else {
        // User is not an admin, force logout
        signOut(auth);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
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
      signInWithEmailAndPassword(auth, email, password).catch((error) =>
        alert('Login failed: ' + error.message)
      );
    });
  }

  // --- Logout Button ---
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      });
    });
  }

  // --- Manage Users Page Logic ---
  if (currentPage === 'users.html') {
    const tableBody = document.getElementById('users-table-body');
    if (tableBody) {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      getDocs(usersQuery)
        .then((querySnapshot) => {
          let tableRowsHTML = '';
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const regDate = userData.createdAt.toDate().toLocaleDateString();
            tableRowsHTML += `<tr><td>${userData.fullName}</td><td>${userData.email
              }</td><td><span class="status status-${userData.kycStatus}">${userData.kycStatus
              }</span></td><td>$${(userData.accountBalance || 0).toFixed(
                2
              )}</td><td>${regDate}</td></tr>`;
          });
          tableBody.innerHTML = querySnapshot.empty
            ? '<tr><td colspan="5">No users found.</td></tr>'
            : tableRowsHTML;
        })
        .catch((error) => console.error('Error fetching users:', error));
    }
  }

  // =============================================================================
  // --- Admin Dashboard Page Logic (WITH CARDS & ACTIONS) ---
  // =============================================================================
  if (currentPage === 'dashboard.html') {
    // --- Function to fetch and display stats for the cards ---
    const populateDashboardStats = async () => {
      try {
        // 1. Get total users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        document.getElementById('admin-total-users').textContent =
          usersSnapshot.size;

        // 2. Get total amount invested
        const investmentsSnapshot = await getDocs(
          collection(db, 'investments')
        );
        let totalInvested = 0;
        investmentsSnapshot.forEach((doc) => {
          totalInvested += doc.data().investedAmount || 0;
        });
        document.getElementById('admin-total-invested').textContent =
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(totalInvested);

        // 3. Get pending KYC count
        const kycQuery = query(
          collection(db, 'users'),
          where('kycStatus', '==', 'pending')
        );
        const kycSnapshot = await getDocs(kycQuery);
        document.getElementById('admin-pending-kyc').textContent =
          kycSnapshot.size;

        // 4. Get pending deposits count
        const depositsQuery = query(
          collection(db, 'transactions'),
          where('type', '==', 'deposit'),
          where('status', '==', 'pending')
        );
        const depositsSnapshot = await getDocs(depositsQuery);
        document.getElementById('admin-pending-deposits').textContent =
          depositsSnapshot.size;
      } catch (error) {
        console.error('Error populating admin dashboard stats:', error);
        alert('Could not load dashboard statistics.');
      }
    };

    // --- Logic for the "Process Investments" Button (This is your existing, working code) ---
    const processButton = document.getElementById('process-investments-btn');

    if (processButton) {
      processButton.addEventListener('click', async () => {
        processButton.disabled = true;
        processButton.textContent = 'Processing... Please Wait';

        try {
          console.log('Starting investment processing job...');
          const investmentsRef = collection(db, 'investments');
          const plansRef = collection(db, 'plans');

          // 1. Get all active investments and all plans
          const activeInvestmentsQuery = query(
            investmentsRef,
            where('status', '==', 'active')
          );
          const [investmentsSnapshot, plansSnapshot] = await Promise.all([
            getDocs(activeInvestmentsQuery),
            getDocs(plansRef),
          ]);

          if (investmentsSnapshot.empty) {
            alert('No active investments found to process.');
            processButton.disabled = false;
            processButton.textContent = 'Run Daily Profit Calculation';
            return;
          }

          // Convert plans to a quick-lookup map for efficiency
          const plansMap = new Map();
          plansSnapshot.forEach((doc) =>
            plansMap.set(doc.data().planName, doc.data())
          );

          let processedCount = 0;
          const now = new Date();

          // 2. Loop through each investment and process it
          for (const investmentDoc of investmentsSnapshot.docs) {
            const investment = investmentDoc.data();
            const plan = plansMap.get(investment.planName);

            if (!plan) {
              console.warn(
                `Plan '${investment.planName}' not found for investment ID: ${investmentDoc.id}. Skipping.`
              );
              continue;
            }

            const userRef = doc(db, 'users', investment.userId);
            const investmentRef = doc(db, 'investments', investmentDoc.id);

            // 3. Run a transaction for each investment to ensure safety
            await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists()) return;

              const userData = userDoc.data();
              const dailyProfit =
                (investment.investedAmount * plan.roiPercent) / 100;

              // Check if investment is completed
              const startDate = investment.startDate.toDate();
              const endDate = new Date(startDate.getTime());
              endDate.setDate(startDate.getDate() + plan.durationDays);
              const isCompleted = now >= endDate;

              let newBalance = (userData.accountBalance || 0) + dailyProfit;
              let newTotalProfits = (userData.totalProfits || 0) + dailyProfit;

              // If completed, return capital and update status
              if (isCompleted) {
                newBalance += investment.investedAmount;
                transaction.update(investmentRef, { status: 'completed' });
              }

              // Update user's balances
              transaction.update(userRef, {
                accountBalance: newBalance,
                totalProfits: newTotalProfits,
              });
            });
            processedCount++;
          }

          alert(
            `Job finished. Processed ${processedCount} investments successfully.`
          );
        } catch (error) {
          console.error('Error processing investments:', error);
          alert('An error occurred during processing. Check the console.');
        } finally {
          processButton.disabled = false;
          processButton.textContent = 'Run Daily Profit Calculation';
        }
      });
    }

    // --- NEW: Handle Blog Post Creation ---
    const newPostForm = document.getElementById('new-post-form');
    if (newPostForm) {
      // Initialize TinyMCE on the content textarea
      tinymce.init({
        selector: '#post-content',
        plugins: 'lists link image table code help wordcount',
        toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code',
        height: 400,
        skin: (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide'),
        content_css: (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default')
      });

      newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = newPostForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Creating...';

        // This is the alternative to using a Cloud Function.
        // We will write directly to Firestore from the client.
        try {
          const newPostData = {
            title: document.getElementById('post-title').value,
            snippet: document.getElementById('post-snippet').value,
            content: tinymce.get('post-content').getContent(), // Get content from TinyMCE
            status: document.getElementById('post-status').value,
            imageUrl: document.getElementById('post-image-url').value || null,
            likeCount: 0,
            authorId: auth.currentUser.uid, // Set the author ID
            createdAt: serverTimestamp(), // Use the server's timestamp
          };

          const docRef = await addDoc(collection(db, "blogPosts"), newPostData);

          alert(`Blog post created successfully with ID: ${docRef.id}`);
          newPostForm.reset();

        } catch (error) {
          console.error('Error creating blog post:', error);
          alert(`Failed to create post: ${error.message}`);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Create Post';
        }
      });
    }

    // --- Initial Page Load ---
    populateDashboardStats();
  } // End of dashboard.html block

  // =============================================================================
  // --- Manage KYC Page Logic (Complete with Actions) ---
  // =============================================================================
  if (currentPage === 'kyc.html') {
    const tableBody = document.getElementById('kyc-table-body');

    // This function fetches and displays pending requests
    const loadKycRequests = () => {
      if (!tableBody) return;
      tableBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
      const kycQuery = query(
        collection(db, 'users'),
        where('kycStatus', '==', 'pending')
      );

      getDocs(kycQuery).then((snapshot) => {
        if (snapshot.empty) {
          tableBody.innerHTML =
            '<tr><td colspan="5">No pending KYC requests.</td></tr>';
          return;
        }
        let rowsHTML = '';
        snapshot.forEach((doc) => {
          const userData = doc.data();
          rowsHTML += `
                    <tr data-userid="${doc.id}">
                        <td>${userData.fullName}</td>
                        <td>${userData.email}</td>
                        <td>${userData.createdAt
              .toDate()
              .toLocaleDateString()}</td>
                        <td><span class="status status-pending">${userData.kycStatus
            }</span></td>
                        <td class="actions-cell">
                            <button class="btn-action view-docs">View Docs</button>
                            <button class="btn-action approve-kyc">Approve</button>
                            <button class="btn-action reject-kyc">Reject</button>
                        </td>
                    </tr>
                `;
        });
        tableBody.innerHTML = rowsHTML;
      });
    };

    // This function handles all button clicks in the table
    const handleKycActions = () => {
      if (!tableBody) return;
      tableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;

        const userId = row.dataset.userid;
        const userDocRef = doc(db, 'users', userId);

        // --- VIEW DOCS LOGIC ---
        if (target.classList.contains('view-docs')) {
          alert('Opening documents... (See console for links)');
          try {
            // Create references to the files in Firebase Storage
            const selfieRef = ref(
              storage,
              `kyc-documents/${userId}/selfie.jpg`
            );
            const idFrontRef = ref(
              storage,
              `kyc-documents/${userId}/id-front.jpg`
            );

            // Get the public download URL for each file
            const selfieUrl = await getDownloadURL(selfieRef);
            const idFrontUrl = await getDownloadURL(idFrontRef);

            console.log('Selfie URL:', selfieUrl);
            console.log('ID Front URL:', idFrontUrl);

            // Open the URLs in new tabs for the admin to view
            window.open(selfieUrl, '_blank');
            window.open(idFrontUrl, '_blank');
          } catch (error) {
            console.error('Error getting document URLs:', error);
            alert(
              'Could not retrieve documents. They may not have been uploaded correctly.'
            );
          }
        }

        // --- APPROVE LOGIC ---
        if (target.classList.contains('approve-kyc')) {
          if (confirm(`Are you sure you want to approve user ${userId}?`)) {
            target.disabled = true;
            try {
              await updateDoc(userDocRef, { kycStatus: 'verified' });
              alert('User KYC has been approved.');
              row.remove();
            } catch (error) {
              alert('Failed to approve KYC.');
              target.disabled = false;
            }
          }
        }

        // --- REJECT LOGIC ---
        if (target.classList.contains('reject-kyc')) {
          if (confirm(`Are you sure you want to reject user ${userId}?`)) {
            target.disabled = true;
            try {
              // In a real app, you might set it back to 'unverified' or a new 'rejected' status
              await updateDoc(userDocRef, { kycStatus: 'unverified' });
              alert('User KYC has been rejected.');
              row.remove();
            } catch (error) {
              alert('Failed to reject KYC.');
              target.disabled = false;
            }
          }
        }
      });
    };

    // Initialize the page
    loadKycRequests();
    handleKycActions();
  }

  // =============================================================================
  // --- Manage Deposits Page Logic (CORRECTED AND FINAL VERSION) ---
  // This entire block replaces the previous version for deposits.html
  // =============================================================================
  if (currentPage === 'deposits.html') {
    const tableBody = document.getElementById('deposits-table-body');

    // This is the function that fetches and displays the pending deposits
    const loadPendingDeposits = () => {
      if (tableBody) {
        tableBody.innerHTML =
          '<tr><td colspan="6">Loading pending requests...</td></tr>';

        const depositsQuery = query(
          collection(db, 'transactions'),
          where('type', '==', 'deposit'),
          where('status', '==', 'pending')
        );

        getDocs(depositsQuery)
          .then((snapshot) => {
            if (snapshot.empty) {
              tableBody.innerHTML =
                '<tr><td colspan="6">No pending deposit requests.</td></tr>';
              return;
            }

            // Create a list of promises to fetch user data for each transaction
            const promises = snapshot.docs.map((txDoc) => {
              const tx = txDoc.data();
              // THE FIX IS HERE: Create a correct DocumentReference
              const userDocRef = doc(db, 'users', tx.userId);

              return getDoc(userDocRef).then((userDoc) => {
                const userName = userDoc.exists()
                  ? userDoc.data().fullName
                  : 'Unknown User';
                // Return a new object combining transaction and user data
                return {
                  id: txDoc.id,
                  userName: userName,
                  ...tx, // Spread operator to include all original transaction fields
                };
              });
            });

            // Wait for all user data fetches to complete
            return Promise.all(promises);
          })
          .then((transactionsWithUsernames) => {
            if (!transactionsWithUsernames) return; // Guard against empty snapshot result
            // Now we have a complete array and can build the table
            let rowsHTML = '';
            transactionsWithUsernames.forEach((tx) => {
              rowsHTML += `
                            <tr data-txid="${tx.id}" data-userid="${tx.userId
                }" data-amount="${tx.amount}">
                                <td>${tx.userName}</td>
                                <td>$${tx.amount.toFixed(2)}</td>
                                <td>${tx.method.toUpperCase()}</td>
                                <td>${tx.date
                  .toDate()
                  .toLocaleDateString()}</td>
                                <td><span class="status status-pending">${tx.status
                }</span></td>
                                <td class="actions-cell">
                                    <button class="btn-action approve-deposit">Approve</button>
                                    <button class="btn-action reject-deposit">Reject</button>
                                </td>
                            </tr>
                        `;
            });
            tableBody.innerHTML = rowsHTML;
          })
          .catch((error) => {
            console.error('Error loading pending deposits:', error);
            tableBody.innerHTML =
              '<tr><td colspan="6">An error occurred while loading requests.</td></tr>';
          });
      }
    };

    // =============================================================================
    // --- This function handles the clicks on the 'Approve' and 'Reject' buttons (WITH NOTIFICATION FLAGS) ---
    // =============================================================================
    const handleDepositActions = () => {
      if (!tableBody) return;

      tableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row || !row.dataset.txid) return;

        const transactionId = row.dataset.txid;
        const userId = row.dataset.userid;
        const amount = parseFloat(row.dataset.amount);

        // --- APPROVE LOGIC ---
        if (target.classList.contains('approve-deposit')) {
          row
            .querySelectorAll('.btn-action')
            .forEach((btn) => (btn.disabled = true));
          target.textContent = 'Approving...';

          try {
            await runTransaction(db, async (transaction) => {
              const userDocRef = doc(db, 'users', userId);
              const txDocRef = doc(db, 'transactions', transactionId);

              const userDoc = await transaction.get(userDocRef);
              if (!userDoc.exists()) {
                throw 'User document could not be found. Cannot approve deposit.';
              }

              const newBalance = (userDoc.data().accountBalance || 0) + amount;
              const newTotalDeposited =
                (userDoc.data().totalDeposited || 0) + amount;

              transaction.update(userDocRef, {
                accountBalance: newBalance,
                totalDeposited: newTotalDeposited,
              });

              // THE CHANGE IS HERE: We also set isRead to false
              transaction.update(txDocRef, {
                status: 'completed',
                isRead: false,
              });
            });

            alert('Deposit approved and user balance updated!');
            row.remove();
          } catch (error) {
            console.error('Error approving deposit:', error);
            alert('Failed to approve deposit. See console for details.');
            row
              .querySelectorAll('.btn-action')
              .forEach((btn) => (btn.disabled = false));
            target.textContent = 'Approve';
          }
        }

        // --- REJECT LOGIC ---
        if (target.classList.contains('reject-deposit')) {
          row
            .querySelectorAll('.btn-action')
            .forEach((btn) => (btn.disabled = true));
          target.textContent = 'Rejecting...';

          if (
            !confirm(
              'Are you sure you want to reject this deposit? This action cannot be undone.'
            )
          ) {
            row
              .querySelectorAll('.btn-action')
              .forEach((btn) => (btn.disabled = false));
            target.textContent = 'Reject';
            return;
          }

          try {
            const txDocRef = doc(db, 'transactions', transactionId);
            // THE CHANGE IS HERE: We also set isRead to false
            await updateDoc(txDocRef, {
              status: 'failed',
              isRead: false,
            });

            alert('Deposit has been rejected.');
            row.remove();
          } catch (error) {
            console.error('Error rejecting deposit:', error);
            alert('Failed to reject deposit.');
            row
              .querySelectorAll('.btn-action')
              .forEach((btn) => (btn.disabled = false));
            target.textContent = 'Reject';
          }
        }
      });
    };

    // --- INITIALIZE THE PAGE ---
    loadPendingDeposits();
    handleDepositActions();
  }
  // End of deposits.html block

  // =============================================================================
  // --- Manage Withdrawals Page Logic (NEW BLOCK) ---
  // =============================================================================
  if (currentPage === 'withdrawals.html') {
    const tableBody = document.getElementById('withdrawals-table-body');

    const loadPendingWithdrawals = () => {
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
        const withdrawalsQuery = query(
          collection(db, 'transactions'),
          where('type', '==', 'withdrawal'),
          where('status', '==', 'pending')
        );

        getDocs(withdrawalsQuery)
          .then((snapshot) => {
            if (snapshot.empty) {
              tableBody.innerHTML =
                '<tr><td colspan="7">No pending withdrawal requests.</td></tr>';
              return;
            }
            // Using Promise.all just like we did for deposits
            const promises = snapshot.docs.map((txDoc) => {
              const tx = txDoc.data();
              const userDocRef = doc(db, 'users', tx.userId);
              return getDoc(userDocRef).then((userDoc) => {
                const userName = userDoc.exists()
                  ? userDoc.data().fullName
                  : 'Unknown User';
                return { id: txDoc.id, userName: userName, ...tx };
              });
            });
            return Promise.all(promises);
          })
          .then((transactions) => {
            if (!transactions) return; // Guard against empty snapshot result
            let rowsHTML = '';
            transactions.forEach((tx) => {
              // Truncate wallet address for display
              const shortAddress = tx.walletAddress
                ? `${tx.walletAddress.substring(
                  0,
                  8
                )}...${tx.walletAddress.substring(
                  tx.walletAddress.length - 6
                )}`
                : 'N/A';
              rowsHTML += `
                                <tr data-txid="${tx.id}" data-userid="${tx.userId
                }" data-amount="${tx.amount}">
                                    <td>${tx.userName}</td>
                                    <td>$${tx.amount.toFixed(2)}</td>
                                    <td>${tx.method.toUpperCase()}</td>
                                    <td title="${tx.walletAddress
                }">${shortAddress}</td>
                                    <td>${tx.date
                  .toDate()
                  .toLocaleDateString()}</td>
                                    <td><span class="status status-pending">${tx.status
                }</span></td>
                                    <td class="actions-cell">
                                        <button class="btn-action approve-withdrawal">Approve</button>
                                        <button class="btn-action reject-withdrawal">Reject</button>
                                    </td>
                                </tr>
                            `;
            });
            tableBody.innerHTML = rowsHTML;
          })
          .catch((error) => {
            console.error('Error loading pending withdrawals:', error);
            tableBody.innerHTML =
              '<tr><td colspan="7">An error occurred while loading requests.</td></tr>';
          });
      }
    };

    // =============================================================================
    // --- This function handles withdrawal actions (DEFINITIVE FIX) ---
    // =============================================================================
    const handleWithdrawalActions = () => {
      if (!tableBody) return;

      tableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row || !row.dataset.txid) return;

        const transactionId = row.dataset.txid;
        const userId = row.dataset.userid;
        const amount = parseFloat(row.dataset.amount);
        const txDocRef = doc(db, 'transactions', transactionId);

        // --- APPROVE LOGIC ---
        if (target.classList.contains('approve-withdrawal')) {
          row
            .querySelectorAll('.btn-action')
            .forEach((btn) => (btn.disabled = true));
          target.textContent = 'Approving...';

          try {
            // Use a transaction to ensure we update both documents safely.
            await runTransaction(db, async (transaction) => {
              const userDocRef = doc(db, 'users', userId);

              // Re-read the user's document inside the transaction for fresh data
              const userDoc = await transaction.get(userDocRef);
              if (!userDoc.exists()) {
                throw 'User document not found. Cannot process withdrawal.';
              }

              // THIS IS THE CRITICAL FIX:
              // The user's balance was ALREADY debited on request.
              // We ONLY need to update the totalWithdrawn amount here.
              const newTotalWithdrawn =
                (userDoc.data().totalWithdrawn || 0) + amount;

              // 1. Update the user's totalWithdrawn field
              transaction.update(userDocRef, {
                totalWithdrawn: newTotalWithdrawn,
              });

              // 2. Update the transaction's status and add the notification flag
              transaction.update(txDocRef, {
                status: 'completed',
                isRead: false,
              });
            });

            alert('Withdrawal approved successfully!');
            row.remove();
          } catch (error) {
            console.error('Error approving withdrawal:', error);
            alert('Failed to approve withdrawal. See console for details.');
            row
              .querySelectorAll('.btn-action')
              .forEach((btn) => (btn.disabled = false));
            target.textContent = 'Approve';
          }
        }

        // --- REJECT LOGIC (This logic is correct and remains) ---
        if (target.classList.contains('reject-withdrawal')) {
          row
            .querySelectorAll('.btn-action')
            .forEach((btn) => (btn.disabled = true));
          target.textContent = 'Rejecting...';

          if (
            !confirm(
              "Are you sure you want to reject this withdrawal? This will refund the amount to the user's balance."
            )
          ) {
            row
              .querySelectorAll('.btn-action')
              .forEach((btn) => (btn.disabled = false));
            target.textContent = 'Reject';
            return;
          }

          try {
            // Use a transaction to refund the user and update the transaction status
            await runTransaction(db, async (transaction) => {
              const userDocRef = doc(db, 'users', userId);
              const userDoc = await transaction.get(userDocRef);
              if (!userDoc.exists()) throw 'User document not found.';

              // 1. Calculate the refunded balance and new withdrawn total
              const newBalance = (userDoc.data().accountBalance || 0) + amount;
              const newTotalWithdrawn =
                (userDoc.data().totalWithdrawn || 0) - amount;

              // 2. Update the user's document to give the money back
              transaction.update(userDocRef, {
                accountBalance: newBalance,
                totalWithdrawn: newTotalWithdrawn < 0 ? 0 : newTotalWithdrawn, // Ensure it doesn't go below zero
              });

              // 3. Update the transaction status to 'failed'
              transaction.update(txDocRef, {
                status: 'failed',
                isRead: false, // Add notification flag for the user
              });
            });

            alert(
              'Withdrawal has been rejected and funds have been returned to the user.'
            );
            row.remove();
          } catch (error) {
            console.error('Error rejecting withdrawal:', error);
            alert('Failed to reject withdrawal.');
            row
              .querySelectorAll('.btn-action')
              .forEach((btn) => (btn.disabled = false));
            target.textContent = 'Reject';
          }
        }
      });
    };
    // --- INITIALIZE THE PAGE ---
    loadPendingWithdrawals();
    handleWithdrawalActions();
  }
  // End of admin user check

  // =============================================================================
  // --- Manage Plans Page Logic (NEW BLOCK) ---
  // =============================================================================
  if (currentPage === 'plans.html') {
    const tableBody = document.getElementById('plans-table-body');
    const createPlanForm = document.getElementById('create-plan-form');

    // --- Function to fetch and display existing plans ---
    const loadPlans = () => {
      if (!tableBody) return;
      tableBody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
      const plansQuery = query(collection(db, 'plans'), orderBy('minAmount')); // Order by min amount

      getDocs(plansQuery).then((snapshot) => {
        if (snapshot.empty) {
          tableBody.innerHTML =
            '<tr><td colspan="4">No investment plans have been created.</td></tr>';
          return;
        }
        let rowsHTML = '';
        snapshot.forEach((doc) => {
          const plan = doc.data();
          rowsHTML += `
                        <tr>
                            <td>${plan.planName}</td>
                            <td>$${plan.minAmount} - $${plan.maxAmount}</td>
                            <td>${plan.roiPercent}% Daily</td>
                            <td>${plan.durationDays} Days</td>
                        </tr>
                    `;
        });
        tableBody.innerHTML = rowsHTML;
      });
    };

    // --- Form submission logic for creating a new plan ---
    if (createPlanForm) {
      createPlanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = createPlanForm.querySelector(
          'button[type="submit"]'
        );
        submitButton.disabled = true;
        submitButton.textContent = 'Creating...';

        try {
          const newPlanData = {
            planName: document.getElementById('plan-name').value,
            minAmount: parseFloat(document.getElementById('min-amount').value),
            maxAmount: parseFloat(document.getElementById('max-amount').value),
            roiPercent: parseFloat(
              document.getElementById('roi-percent').value
            ),
            durationDays: parseInt(
              document.getElementById('duration-days').value
            ),
            isActive: true, // All new plans are active by default
            createdAt: new Date(),
          };

          await addDoc(collection(db, 'plans'), newPlanData);

          alert(`Plan "${newPlanData.planName}" created successfully!`);
          createPlanForm.reset(); // Clear the form
          loadPlans(); // Refresh the table to show the new plan
        } catch (error) {
          console.error('Error creating plan:', error);
          alert('Failed to create plan. Please check the data and try again.');
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Create Plan';
        }
      });
    }

    // --- Initial page load ---
    loadPlans();
  }

  // End of admin user check
});