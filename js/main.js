document.addEventListener('DOMContentLoaded', () => {
  // --- Account Page Tab Logic (Confirmed & Final) ---
  const accountTabsContainer = document.querySelector('.account-tabs');

  if (accountTabsContainer) {
    const tabButtons =
      accountTabsContainer.querySelectorAll('.account-tab-btn');
    const tabPanels = document.querySelectorAll('.account-panel');

    tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        // Deactivate all buttons and panels first for a clean state
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        tabPanels.forEach((panel) => panel.classList.remove('active'));

        // Get the ID of the target panel from the button's 'data-tab' attribute
        const targetPanelId = button.dataset.tab;
        const targetPanel = document.getElementById(targetPanelId);

        // Activate the clicked button and its corresponding panel
        button.classList.add('active');
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  // ... (rest of the JS file) ...

  // --- KYC Page File Upload Logic ---
  const kycUploadBoxes = document.querySelectorAll('.kyc-upload-box');
  if (kycUploadBoxes.length > 0) {
    kycUploadBoxes.forEach((box) => {
      const input = box.querySelector('.file-input');
      const dropArea = box.querySelector('.file-drop-area');
      const fileNameDisplay = box.querySelector('.file-name-display');

      input.addEventListener('change', () => {
        if (input.files.length > 0) {
          fileNameDisplay.textContent = input.files[0].name;
        }
      });

      // Highlight on drag over
      dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('is-active');
      });
      dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('is-active');
      });
      dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('is-active');
        input.files = e.dataTransfer.files;
        // Manually trigger the 'change' event to update the file name display
        input.dispatchEvent(new Event('change'));
      });
    });
  }

  // ... (rest of the JS file) ...

  // ... (rest of the JS file) ...

  // --- Collapsible Sidebar Logic ---
  const dashboardLayout = document.querySelector('.dashboard-layout');

  if (dashboardLayout) {
    const sidebar = dashboardLayout.querySelector('.sidebar');

    sidebar.addEventListener('mouseenter', () => {
      dashboardLayout.classList.add('sidebar-expanded');
    });

    sidebar.addEventListener('mouseleave', () => {
      dashboardLayout.classList.remove('sidebar-expanded');
    });
  }

  // ... (rest of the JS file) ...
  // });

  // --- Fund Account Page Logic ---
  const amountInput = document.getElementById('amount');
  const quickAmountButtons = document.querySelectorAll('.btn-quick-amount');

  if (amountInput && quickAmountButtons.length > 0) {
    quickAmountButtons.forEach((button) => {
      button.addEventListener('click', () => {
        // Get the text content (e.g., "$100") and remove the "$"
        const amountValue = button.textContent.replace('$', '');
        amountInput.value = amountValue;
      });
    });
  }

  // ... (rest of the JS file) ...

  // --- Copy Button Logic ---
  const copyButton = document.getElementById('copy-btn');
  const referralInput = document.getElementById('referral-link');
  if (copyButton && referralInput) {
    copyButton.addEventListener('click', () => {
      navigator.clipboard
        .writeText(referralInput.value)
        .then(() => {
          copyButton.textContent = 'Copied!';
          copyButton.style.backgroundColor = '#28a745';
          setTimeout(() => {
            copyButton.textContent = 'Copy';
            copyButton.style.backgroundColor = '';
          }, 2000);
        })
        .catch((err) => console.error('Failed to copy text: ', err));
    });
  }

  // --- New Theme Switcher Logic ---
  const themeToggleButton = document.getElementById('theme-toggle-btn');
  const themeMenu = document.getElementById('theme-menu');

  if (themeToggleButton && themeMenu) {
    // 1. Toggle dropdown visibility
    themeToggleButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevents the click from immediately closing the menu
      themeMenu.classList.toggle('hidden');
    });

    // 2. Close dropdown if clicked outside
    document.addEventListener('click', (event) => {
      if (
        !themeMenu.contains(event.target) &&
        !themeToggleButton.contains(event.target)
      ) {
        themeMenu.classList.add('hidden');
      }
    });

    // 3. Set theme based on menu item click
    themeMenu.querySelectorAll('li').forEach((item) => {
      item.addEventListener('click', () => {
        const newTheme = item.getAttribute('data-theme');
        localStorage.setItem('theme', newTheme); // Save choice to localStorage

        // IMPORTANT: We still reload, but now it will work correctly
        // because the theme is saved in localStorage. The script in the <head>
        // will apply the theme before the page even renders.
        location.reload();
      });
    });
  }
});
