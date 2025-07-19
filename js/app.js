// =================================================================================
// PROJECT APEX: APP.JS  –  FINAL, DEBUGGED & NETWORK-ENABLED
// =================================================================================
// 1. Pre-loader (unchanged)
window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    preloader.style.pointerEvents = 'none';
  }
});

// ------------------------------------------------------------------
// 2. IMPORTS
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// 3. ROUTE PROTECTION
// ------------------------------------------------------------------
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
    if (publicPages.includes(currentPage)) {
      window.location.href = 'dashboard.html';
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        runAllPageLogic(userDocSnap.data(), user.uid);
      } else {
        console.error('User authenticated but no Firestore doc.');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  } else {
    if (protectedPages.includes(currentPage)) {
      window.location.href = 'login.html';
    }
  }
});

// ------------------------------------------------------------------
// 4. MASTER LOGIC
// ------------------------------------------------------------------
function runAllPageLogic(userData, uid) {
  updateHeaderUI(userData, uid);
  attachStaticEventListeners();
  handleThemeSwitcher();
  handleMobileSidebar();

  if (currentPage === 'dashboard.html') handleDashboardPage(userData, uid);
  if (currentPage === 'plans.html') handlePlansPage(userData, uid);
  if (currentPage === 'deposit-log.html') handleDepositLogPage(uid);
  if (currentPage === 'my-account.html') handleMyAccountPage(userData);
  if (currentPage === 'fund-account.html') handleFundAccountPage(uid, userData);
  if (currentPage === 'withdraw.html') handleWithdrawPage(uid, userData);
  if (currentPage === 'my-plans.html') handleMyPlansPage(uid);
  if (currentPage === 'withdrawal-log.html') handleWithdrawalLogPage(uid);
  if (currentPage === 'verify.html') handleVerifyPage(uid, userData);
}

// ------------------------------------------------------------------
// 5. COMPANY WALLET DATA (NETWORK-SUPPORTED)
// ------------------------------------------------------------------
const companyWallets = {
  btc: {
    name: 'Bitcoin (BTC)',
    symbol: 'BTC',
    networks: [
      {name: 'Bitcion', value:'bitcoin', address: 'bc1qtuhgz4ays8w5l3z3ynj7lk7e5qumn5hv5ga6n5'}
      { name: 'BRC20', value: 'brc20', address: '1N6hXVAkAhouaFv6eLvvdSg6pDfH8YAfBk' },
      { name: 'BNB Smart Chain', value: 'bnb smart chain', address: '0x73aB257AbD916beCd67a062eD973211335635cb1 ' },
    ],
  },
  eth: {
    name: 'Ethereum (ETH)',
    symbol: 'ETH',
    networks: [
      { name: 'ERC20', value: 'erc20', address: '0xAbc123Def456Ghi789Jkl012Mno345Pqr678Stu901' },
    ],
  },
  usdt: {
    name: 'Tether (USDT)',
    symbol: 'USDT',
    networks: [
      { name: 'ERC20', value: 'erc20', address: '0x306381B58Ea94dA4D515E93b3663dE66355Ec943' },
      { name: 'TRC20', value: 'trc20', address: 'TLWojaboTmaP2m42X7BU7czC6x8bsBwNFR' },
      { name: 'BEP20 (BSC)', value: 'bep20', address: '0x73aB257AbD916beCd67a062eD973211335635cb1' },
    ],
  },
  bnb: {
    name: 'Binance Coin (BNB)',
    symbol: 'BNB',
    networks: [
      { name: 'BEP20 (BSC)', value: 'bep20', address: '0x306381B58Ea94dA4D515E93b3663dE66355Ec943' },
    ],
  },
  sol: {
    name: 'Solana (SOL)',
    symbol: 'SOL',
    networks: [
      { name: 'Solana', value: 'solana', address: 'ANSqJCWayckF6bEod2Y74w9WnKj6Nszz6yqFW3Brz4zC' },
    ],
  },
  ada: {
    name: 'Cardano (ADA)',
    symbol: 'ADA',
    networks: [
      { name: 'Cardano', value: 'cardano', address: 'addr1q99qj445fhv70rlxj6eaw6ld4e74hea92m8v3dapa88znp9wf3hlenhktwe5yflhum9dy47n0hldm078s45pcxxptzpsh0tntm' },
    ],
  },
  xrp: {
    name: 'Ripple (XRP)',
    symbol: 'XRP',
    networks: [
      {
        name: 'XRP',
        value: 'xrp',
        address: 'rHcFoo6a9qT5NHiVn1THQRhsEGcxtYCV4d',
        destinationTagRequired: true,
        tag: '340798187',
      },
    ],
  },
  pi: {
    name: 'Pi Network (PI)',
    symbol: 'PI',
    networks: [
      { name: 'PI Network', value: 'pi', address: 'MBC6NRTTQLRCABQHIR5J4R4YDJWFWRAO4ZRQIM2SVI5GSIZ2HZ42QAAAAAABIUBK5PH24' },
    ],
  },
  ice: {
    name: 'Ice Network (ICE)',
    symbol: 'ICE',
    networks: [
      { name: 'BNB Smart Chain', value: 'bnb smart chain', address: '0x73aB257AbD916beCd67a062eD973211335635cb1' },
    ],
  },
};

// ------------------------------------------------------------------
// 6. PAGE HANDLERS
// ------------------------------------------------------------------

function handleFundAccountPage(uid) {
  const fundForm = document.getElementById('deposit-form');
  const paymentMethodDropdown = document.getElementById('payment-method');
  const fundNetworkDropdown = document.getElementById('fund-network');
  const fundNetworkGroup = document.getElementById('fund-network-group');
  const walletDisplayCard = document.getElementById('wallet-display-card');

  const updateWalletDisplay = (selectedCoin, selectedNetworkValue = null) => {
    const walletData = companyWallets[selectedCoin];
    if (!walletData) {
      walletDisplayCard.classList.add('hidden');
      fundNetworkGroup.classList.add('hidden');
      return;
    }

    // Populate network dropdown
    fundNetworkDropdown.innerHTML = '';
    walletData.networks.forEach((net) => {
      const opt = document.createElement('option');
      opt.value = net.value;
      opt.textContent = net.name;
      fundNetworkDropdown.appendChild(opt);
    });

    let network = walletData.networks.find((n) => n.value === selectedNetworkValue);
    if (!network) network = walletData.networks.find((n) => n.default) || walletData.networks[0];
    fundNetworkDropdown.value = network.value;

    // Update fields
    document.getElementById('wallet-coin-name').textContent = walletData.name;
    document.getElementById('wallet-coin-symbol').textContent = walletData.symbol;
    document.getElementById('wallet-address-display').value = network.address;
    document.getElementById('wallet-network-display').value = network.name;

    const xrpTagGroup = document.getElementById('xrp-tag-group');
    const xrpTagDisplay = document.getElementById('xrp-tag-display');
    if (network.destinationTagRequired) {
      xrpTagDisplay.value = network.tag;
      xrpTagGroup.classList.remove('hidden');
    } else {
      xrpTagGroup.classList.add('hidden');
    }

    // QR Code
    const qrContainer = document.getElementById('wallet-qr-code');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: network.address + (network.destinationTagRequired && network.tag ? `?dt=${network.tag}` : ''),
      width: 150,
      height: 150,
    });

    walletDisplayCard.classList.remove('hidden');
    fundNetworkGroup.classList.remove('hidden');
  };

  paymentMethodDropdown.addEventListener('change', (e) => updateWalletDisplay(e.target.value));
  fundNetworkDropdown.addEventListener('change', (e) => updateWalletDisplay(paymentMethodDropdown.value, e.target.value));

  document.getElementById('wallet-copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('wallet-address-display').value);
    alert('Address copied!');
  });

  walletDisplayCard.classList.add('hidden');
  fundNetworkGroup.classList.add('hidden');
  updateWalletDisplay(paymentMethodDropdown.value);

  // Quick-amount buttons
  document.querySelectorAll('.btn-quick-amount').forEach((btn) =>
    btn.addEventListener('click', () => {
      document.getElementById('amount').value = btn.textContent.replace('$', '');
    })
  );

  // Deposit submission
  fundForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = fundForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    const amount = parseFloat(document.getElementById('amount').value);
    const method = paymentMethodDropdown.value;
    const network = fundNetworkDropdown.value;

    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid amount.');
      btn.disabled = false;
      btn.textContent = 'Proceed to Payment';
      return;
    }

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: uid,
        type: 'deposit',
        amount,
        method,
        network,
        status: 'pending',
        date: new Date(),
      });
      alert('Request submitted! It will appear in your balance once approved.');
      window.location.href = 'deposit-log.html';
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Proceed to Payment';
    }
  });
}

function handleWithdrawPage(uid, userData) {
  const withdrawForm = document.getElementById('withdraw-form');
  const withdrawMethodDropdown = document.getElementById('withdraw-method');
  const withdrawNetworkDropdown = document.getElementById('withdraw-network');
  const networkGroup = document.getElementById('network-group');
  const destinationTagGroup = document.getElementById('destination-tag-group');
  const destinationTagInput = document.getElementById('destination-tag');

  document.getElementById('withdraw-available-balance').textContent = `$${userData.accountBalance.toFixed(2)}`;

  const populateNetworks = (selectedMethod) => {
    const coinData = companyWallets[selectedMethod];
    withdrawNetworkDropdown.innerHTML = '';
    if (coinData?.networks) {
      networkGroup.classList.remove('hidden');
      coinData.networks.forEach((net) => {
        const opt = document.createElement('option');
        opt.value = net.value;
        opt.textContent = net.name;
        withdrawNetworkDropdown.appendChild(opt);
      });
    } else {
      networkGroup.classList.add('hidden');
    }

    destinationTagGroup.classList.toggle('hidden', selectedMethod !== 'xrp');
    destinationTagInput.value = '';
  };

  withdrawMethodDropdown.addEventListener('change', (e) => populateNetworks(e.target.value));
  populateNetworks(withdrawMethodDropdown.value);

  withdrawForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = withdrawForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const method = withdrawMethodDropdown.value;
    const network = withdrawNetworkDropdown.value;
    const walletAddress = document.getElementById('wallet-address').value;
    const destinationTag = destinationTagInput.value;

    if (
      isNaN(amount) ||
      amount <= 0 ||
      amount > userData.accountBalance ||
      walletAddress.trim() === '' ||
      (method === 'xrp' && destinationTag.trim() === '')
    ) {
      alert('Check inputs and balance.');
      btn.disabled = false;
      btn.textContent = 'Submit Request';
      return;
    }

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: uid,
        type: 'withdrawal',
        amount,
        method,
        network,
        walletAddress,
        destinationTag: method === 'xrp' ? destinationTag : null,
        status: 'pending',
        date: new Date(),
      });
      alert('Withdrawal request submitted!');
      window.location.href = 'withdrawal-log.html';
    } catch (err) {
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Request';
    }
  });
}

// ------------------------------------------------------------------
// 7. OTHER PAGE HANDLERS (unchanged except minor fixes)
// ------------------------------------------------------------------
function handleDashboardPage(userData, uid) {
  const fmt = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  document.getElementById('balance-display').textContent = fmt(userData.accountBalance);
  document.getElementById('deposits-display').textContent = fmt(userData.totalDeposited);
  document.getElementById('profits-display').textContent = fmt(userData.totalProfits);
  document.getElementById('withdrawn-display').textContent = fmt(userData.totalWithdrawn);
  document.getElementById('referral-link-display').value = `https://projectapex.com/register.html?ref=${uid}`;

  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(document.getElementById('referral-link-display').value);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
    };
  }

  const notificationArea = document.getElementById('notification-area');
  if (notificationArea) {
    const q = query(collection(db, 'transactions'), where('userId', '==', uid), where('isRead', '==', false));
    getDocs(q).then((snap) => {
      if (snap.empty) return (notificationArea.style.display = 'none');
      notificationArea.innerHTML = '';
      snap.forEach((d) => {
        const tx = d.data();
        let msg = '';
        let type = '';
        if (tx.type === 'deposit' && tx.status === 'completed') {
          msg = `Deposit $${tx.amount.toFixed(2)} approved.`;
          type = 'success';
        } else if (tx.type === 'deposit' && tx.status === 'failed') {
          msg = `Deposit $${tx.amount.toFixed(2)} failed.`;
          type = 'failed';
        } else if (tx.type === 'withdrawal' && tx.status === 'completed') {
          msg = `Withdrawal $${tx.amount.toFixed(2)} processed.`;
          type = 'success';
        } else if (tx.type === 'withdrawal' && tx.status === 'failed') {
          msg = `Withdrawal $${tx.amount.toFixed(2)} rejected.`;
          type = 'failed';
        }
        if (!msg) return;
        const el = document.createElement('div');
        el.className = `notification-item notification-${type}`;
        el.innerHTML = `<p>${msg}</p><button class="dismiss-btn" data-txid="${d.id}">×</button>`;
        notificationArea.appendChild(el);
      });
      notificationArea.style.display = 'flex';
    });
    notificationArea.addEventListener('click', async (e) => {
      if (!e.target.classList.contains('dismiss-btn')) return;
      const id = e.target.dataset.txid;
      try {
        await updateDoc(doc(db, 'transactions', id), { isRead: true });
        e.target.closest('.notification-item').remove();
      } catch (err) {
        console.error(err);
      }
    });
  }
}

function handleDepositLogPage(uid) {
  const tbody = document.querySelector('.data-table tbody, .transaction-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';
  const q = query(collection(db, 'transactions'), where('userId', '==', uid), where('type', '==', 'deposit'), orderBy('date', 'desc'));
  getDocs(q).then((snap) => {
    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="5">No deposits.</td></tr>';
      return;
    }
    let html = '';
    snap.forEach((d) => {
      const t = d.data();
      html += `<tr><td>${d.id.slice(0, 10)}…</td><td>$${t.amount.toFixed(2)}</td><td>${t.method.toUpperCase()}</td><td><span class="status status-${t.status}">${t.status}</span></td><td>${t.date.toDate().toLocaleString()}</td></tr>`;
    });
    tbody.innerHTML = html;
  });
}

function handleWithdrawalLogPage(uid) {
  const tbody = document.querySelector('.transaction-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4">Loading…</td></tr>';
  const q = query(collection(db, 'transactions'), where('userId', '==', uid), where('type', '==', 'withdrawal'), orderBy('date', 'desc'));
  getDocs(q).then((snap) => {
    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="4">No withdrawals.</td></tr>';
      return;
    }
    let html = '';
    snap.forEach((d) => {
      const t = d.data();
      const short = `${t.walletAddress.slice(0, 6)}…${t.walletAddress.slice(-4)}`;
      html += `<tr><td>${t.date.toDate().toLocaleDateString()}</td><td>$${t.amount.toFixed(2)}</td><td>${short}</td><td><span class="status-badge status-${t.status}">${t.status}</span></td></tr>`;
    });
    tbody.innerHTML = html;
  });
}

function handleMyPlansPage(uid) {
  const tbody = document.querySelector('.transaction-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';
  const q = query(collection(db, 'investments'), where('userId', '==', uid), orderBy('startDate', 'desc'));
  getDocs(q).then((snap) => {
    if (snap.empty) {
      tbody.innerHTML = '<tr><td colspan="5">No investments.</td></tr>';
      return;
    }
    let html = '';
    snap.forEach((d) => {
      const inv = d.data();
      html += `<tr>
        <td>${inv.planName}</td>
        <td>$${inv.investedAmount.toFixed(2)}</td>
        <td>${inv.startDate.toDate().toLocaleDateString()}</td>
        <td>${inv.endDate ? inv.endDate.toDate().toLocaleDateString() : 'Processing…'}</td>
        <td><span class="status status-${inv.status}">${inv.status}</span></td>
      </tr>`;
    });
    tbody.innerHTML = html;
  });
}

function handleVerifyPage(uid, userData) {
  const kycForm = document.getElementById('kyc-form');
  const statusBanner = document.querySelector('.status-banner');

  if (statusBanner && userData.kycStatus) {
    statusBanner.className = `status-banner status-${userData.kycStatus}`;
    statusBanner.innerHTML = `<strong>Status:</strong> ${userData.kycStatus}`;
  }
  if (['pending', 'verified'].includes(userData.kycStatus)) {
    kycForm?.querySelectorAll('input, button').forEach((el) => (el.disabled = true));
    kycForm?.querySelectorAll('.file-drop-area').forEach((a) => (a.style.cursor = 'not-allowed'));
  }

  kycForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = kycForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Uploading…';
    const selfie = document.getElementById('selfie-upload').files[0];
    const idFront = document.getElementById('id-front-upload').files[0];
    if (!selfie || !idFront) {
      alert('Selfie & ID front required.');
      btn.disabled = false;
      btn.textContent = 'Submit for Verification';
      return;
    }
    try {
      await uploadBytes(ref(storage, `kyc-documents/${uid}/selfie.jpg`), selfie);
      await uploadBytes(ref(storage, `kyc-documents/${uid}/id-front.jpg`), idFront);
      await updateDoc(doc(db, 'users', uid), { kycStatus: 'pending' });
      alert('Uploaded! Verification pending.');
      window.location.reload();
    } catch (err) {
      alert('Upload failed.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit for Verification';
    }
  });
}

function handlePlansPage(userData, uid) {
  const plansGrid = document.querySelector('.plans-grid');
  const modalOverlay = document.getElementById('investment-modal');
  const investmentForm = document.getElementById('investment-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const openModal = (planCard) => {
    if (!planCard) return;
    document.getElementById('modal-plan-name').textContent = `Invest in ${planCard.querySelector('.plan-name').textContent}`;
    document.getElementById('modal-plan-details').textContent = `Range: ${planCard.querySelector('.plan-price').textContent}`;
    document.getElementById('modal-user-balance').textContent = `$${userData.accountBalance.toFixed(2)}`;
    modalOverlay?.classList.remove('hidden');
  };
  const closeModal = () => {
    investmentForm?.reset();
    modalOverlay?.classList.add('hidden');
  };

  const attachListeners = () =>
    document.querySelectorAll('.plan-btn').forEach((btn) =>
      btn.addEventListener('click', (e) => openModal(e.target.closest('.plan-card')))
    );

  if (plansGrid) {
    plansGrid.innerHTML = '<p>Loading plans…</p>';
    const q = query(collection(db, 'plans'), where('isActive', '==', true), orderBy('minAmount'));
    getDocs(q).then((snap) => {
      let html = '';
      if (snap.empty) html = '<p>No plans available.</p>';
      else {
        snap.forEach((d) => {
          const p = d.data();
          html += `
            <div class="plan-card ${p.isFeatured ? 'featured' : ''}">
              ${p.isFeatured ? '<div class="plan-badge">Most Popular</div>' : ''}
              <div class="plan-header">
                <h3 class="plan-name">${p.planName}</h3>
                <div class="plan-price">$${p.minAmount} - $${p.maxAmount}</div>
                <p class="plan-description">${p.description || ''}</p>
              </div>
              <ul class="plan-features">
                <li>Return <strong>${p.roiPercent}% Daily</strong></li>
                <li>Duration <strong>${p.durationDays} Days</strong></li>
                <li>Referral Bonus <strong>5%</strong></li>
              </ul>
              <button class="btn btn-primary plan-btn">Invest Now</button>
            </div>`;
        });
      }
      plansGrid.innerHTML = html;
      attachListeners();
    });
  }

  modalCloseBtn?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => e.target === modalOverlay && closeModal());
  investmentForm?.addEventListener('submit', (e) => handleInvestmentSubmission(e, userData));
}

// ------------------------------------------------------------------
// 8. GENERIC HELPERS
// ------------------------------------------------------------------
function updateHeaderUI(userData, uid) {
  document.getElementById('user-name-display') && (document.getElementById('user-name-display').textContent = userData.fullName);
  const pic = document.getElementById('user-profile-pic');
  if (pic)
    pic.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData.fullName
    )}&background=0D8ABC&color=fff&rounded=true`;
}

function handleMyAccountPage(userData) {
  ['full-name', 'email', 'phone', 'country'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = userData[id.replace('-', '')] || '';
  });
  const pForm = document.getElementById('profile-form');
  const sForm = document.getElementById('security-form');
  pForm?.addEventListener('submit', handleProfileUpdate);
  sForm?.addEventListener('submit', handlePasswordUpdate);

  document.querySelectorAll('.account-tab-btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.account-tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.account-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
    })
  );
}

function attachStaticEventListeners() {
  if (window.matchMedia('(min-width: 993px)').matches) {
    const layout = document.querySelector('.dashboard-layout');
    const sidebar = layout?.querySelector('.sidebar');
    sidebar?.addEventListener('mouseenter', () => layout.classList.add('sidebar-expanded'));
    sidebar?.addEventListener('mouseleave', () => layout.classList.remove('sidebar-expanded'));
  }

  const scrollTopBtn = document.getElementById('scroll-to-top-btn');
  const scrollContainer = document.querySelector('.main-content-wrapper');
  if (scrollTopBtn && scrollContainer) {
    scrollContainer.addEventListener('scroll', () =>
      scrollTopBtn.classList.toggle('visible', scrollContainer.scrollTop > 300)
    );
    scrollTopBtn.addEventListener('click', () => scrollContainer.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  document.getElementById('logout-btn')?.addEventListener('click', () => signOut(auth));
}

function handleThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const menu = document.getElementById('theme-menu');
  if (!toggleBtn || !menu) return;
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) menu.classList.add('hidden');
  });
  menu.querySelectorAll('li').forEach((li) =>
    li.addEventListener('click', () => {
      localStorage.setItem('theme', li.dataset.theme);
      location.reload();
    })
  );
}

function handleMobileSidebar() {
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const layout = document.querySelector('.dashboard-layout');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!layout) return;

  const open = () => layout.classList.add('sidebar-mobile-open');
  const close = () => layout.classList.remove('sidebar-mobile-open');

  toggleBtn?.addEventListener('click', () => (layout.classList.contains('sidebar-mobile-open') ? close() : open()));
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
}

// ------------------------------------------------------------------
// 9. FORM SUBMIT HANDLERS
// ------------------------------------------------------------------
async function handleProfileUpdate(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      fullName: document.getElementById('full-name').value,
      phone: document.getElementById('phone').value,
      country: document.getElementById('country').value,
    });
    alert('Profile updated.');
  } catch (err) {
    alert('Update failed.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}

async function handlePasswordUpdate(e) {
  e.preventDefault();
  const pwd = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;
  if (pwd.length < 6) return alert('≥6 chars.');
  if (pwd !== confirm) return alert('Mismatch.');
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Updating…';
  try {
    await updatePassword(auth.currentUser, pwd);
    alert('Password updated. Please log in again.');
    signOut(auth);
  } catch {
    alert('Failed. Try re-logging.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Update Password';
  }
}

async function handleInvestmentSubmission(e, currentUserData) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Processing…';

  const amount = parseFloat(document.getElementById('investment-amount').value);
  const user = auth.currentUser;
  const planName = document.getElementById('modal-plan-name').textContent.replace('Invest in ', '');

  if (!user || isNaN(amount) || amount <= 0) {
    alert('Invalid amount.');
    btn.disabled = false;
    btn.textContent = 'Confirm Investment';
    return;
  }
  if (amount > currentUserData.accountBalance) {
    alert('Insufficient balance.');
    btn.disabled = false;
    btn.textContent = 'Confirm Investment';
    return;
  }

  try {
    const planSnap = await getDocs(query(collection(db, 'plans'), where('planName', '==', planName)));
    if (planSnap.empty) throw 'Plan not found.';
    const plan = planSnap.docs[0].data();

    await runTransaction(db, async (tx) => {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await tx.get(userRef);
      if (!docSnap.exists()) throw 'User not found.';
      const balance = docSnap.data().accountBalance;
      if (amount > balance) throw 'Balance too low.';
      tx.update(userRef, { accountBalance: balance - amount });

      const newInvRef = doc(collection(db, 'investments'));
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + plan.durationDays);
      tx.set(newInvRef, {
        userId: user.uid,
        planName: plan.planName,
        investedAmount: amount,
        status: 'active',
        startDate: start,
        endDate: end,
        roiPercent: plan.roiPercent,
        durationDays: plan.durationDays,
      });
    });
    alert('Investment successful!');
    window.location.href = 'my-plans.html';
  } catch (err) {
    alert(err.message || 'Investment failed.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirm Investment';
  }
}