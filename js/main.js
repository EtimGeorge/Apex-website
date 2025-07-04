document.addEventListener('DOMContentLoaded', () => {

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
    quickAmountButtons.forEach(button => {
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
            navigator.clipboard.writeText(referralInput.value).then(() => {
                copyButton.textContent = 'Copied!';
                copyButton.style.backgroundColor = '#28a745';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.style.backgroundColor = '';
                }, 2000);
            }).catch(err => console.error("Failed to copy text: ", err));
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
            if (!themeMenu.contains(event.target) && !themeToggleButton.contains(event.target)) {
                themeMenu.classList.add('hidden');
            }
        });

        // 3. Set theme based on menu item click
        themeMenu.querySelectorAll('li').forEach(item => {
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