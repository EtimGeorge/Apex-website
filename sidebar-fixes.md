# Sidebar Fixes

## Hide Scrollbar on Mobile Sidebar

To hide the scrollbar on the mobile sidebar, add the following CSS to `css/styles.css`:

```css
@media (max-width: 992px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1001; /* Higher than overlay */
    transform: translateX(-100%);
    visibility: hidden;
    /* Hide scrollbar */
    overflow-y: auto;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  /* Hide scrollbar for Chrome, Safari and Opera */
  .sidebar::-webkit-scrollbar {
      display: none;
  }

  .sidebar.sidebar-visible {
    transform: translateX(0);
    visibility: visible;
  }
}
```

## Close Sidebar on Click Outside

To close the sidebar when clicking outside of it, add the following JavaScript to `js/app.js`:

```javascript
  function handleMobileSidebar() {
    const toggleButton = document.getElementById('mobile-sidebar-toggle');
    const closeButton = document.getElementById('sidebar-close-btn');
    const dashboardLayout = document.querySelector('.dashboard-layout');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    // If the main layout container doesn't exist, we can't do anything.
    if (!dashboardLayout) {
      return;
    }

    // Function to open the sidebar
    const openSidebar = () => {
      dashboardLayout.classList.add('sidebar-mobile-open');
      if (toggleButton) toggleButton.classList.add('open');
    };

    // Function to close the sidebar
    const closeSidebar = () => {
      dashboardLayout.classList.remove('sidebar-mobile-open');
      if (toggleButton) toggleButton.classList.remove('open');
    };

    // The hamburger button should TOGGLE the sidebar's state.
    if (toggleButton) {
      toggleButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents the click from immediately closing the sidebar
        if (dashboardLayout.classList.contains('sidebar-mobile-open')) closeSidebar();
        else openSidebar();
      });
    }
    // The dedicated close button inside the sidebar always closes it.
    if (closeButton) closeButton.addEventListener('click', closeSidebar);
    // Clicking the overlay (outside the sidebar) also closes it.
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
  }
```