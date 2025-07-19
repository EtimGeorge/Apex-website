# Admin Mobile Menu Implementation Guide

This guide details how to add a responsive mobile hamburger menu to your admin pages, mirroring the functionality found on the user-facing dashboard.

## Objective

To implement a mobile-friendly navigation system for the admin panel, including a hamburger menu icon, a slide-out sidebar, and an overlay, ensuring a consistent user experience across devices.

## Step 1: HTML Modifications

You need to add the mobile sidebar toggle button to the header and the sidebar close button inside the sidebar for all admin HTML files. You also need a `sidebar-overlay` element.

**Affected Files:**
*   `admin/dashboard.html`
*   `admin/plans.html`
*   `admin/users.html`
*   `admin/kyc.html`
*   `admin/deposits.html`
*   `admin/withdrawals.html`

### 1.1: Add Mobile Sidebar Toggle Button

**Location:** Inside the `<header class="main-header">` section, typically as the first child element.

**Code to Add:**

```html
<!-- Mobile Sidebar Toggle -->
<button class="mobile-sidebar-toggle" id="mobile-sidebar-toggle">
    <span></span> <!-- Top bar of the hamburger icon -->
    <span></span> <!-- Middle bar of the hamburger icon -->
    <span></span> <!-- Bottom bar of the hamburger icon -->
</button>
```

### 1.2: Add Sidebar Close Button

**Location:** Inside the `<aside class="sidebar admin-sidebar">` section, specifically within the `<div class="sidebar-header">`. This button will be visible only on mobile.

**Code to Add:**

```html
<!-- NEW: Mobile-only close button inside the sidebar -->
<button class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Close sidebar">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line> <!-- First line of the 'X' icon -->
        <line x1="6" y1="6" x2="18" y2="18"></line> <!-- Second line of the 'X' icon -->
    </svg>
</button>
```

### 1.3: Add Sidebar Overlay

**Location:** Just before the closing `</body>` tag. This element will create a semi-transparent overlay when the mobile sidebar is open.

**Code to Add:**

```html
<!-- Sidebar Overlay (for mobile) -->
<div class="sidebar-overlay"></div>
```

---

## Step 2: CSS Modifications

You need to copy the responsive mobile menu styles from `css/styles.css` to `admin/admin.css`. This ensures that the admin pages have the correct mobile menu appearance and behavior.

**Affected File:** `admin/admin.css`

**Location:** Add these rules at the end of the file.

**Code to Add:**

```css
/* ==========================================================
   Mobile Dashboard Navigation (Copied from styles.css)
   ========================================================== */

/* Styles for the hamburger icon bars */
.mobile-sidebar-toggle span {
    display: block; /* Each span is a block to create separate bars */
    width: 25px; /* Width of the hamburger bar */
    height: 3px; /* Thickness of the hamburger bar */
    background-color: var(--color-text-primary); /* Color of the bars */
    margin: 5px auto; /* Vertical spacing between bars */
    transition: all 0.3s ease-in-out; /* Smooth transition for animation */
}

/* Dark theme adjustment for hamburger bars */
.dark-theme .mobile-sidebar-toggle span {
    background-color: var(--color-text-sidebar-active);
}

/* Animation for the top bar when menu is open (rotates and moves) */
.mobile-sidebar-toggle.open span:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
}

/* Animation for the middle bar when menu is open (fades out) */
.mobile-sidebar-toggle.open span:nth-child(2) {
    opacity: 0;
}

/* Animation for the bottom bar when menu is open (rotates and moves) */
.mobile-sidebar-toggle.open span:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
}

/* Styles for the semi-transparent overlay */
.sidebar-overlay {
    display: none; /* Hidden by default */
    position: fixed; /* Fixed position relative to viewport */
    inset: 0; /* Covers the entire viewport */
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
    z-index: 1040; /* Below sidebar, above content */
    transition: opacity 0.3s ease; /* Smooth fade-in/out */
}

/* Responsive Breakpoint for Dashboard (adjusts layout for mobile) */
@media (max-width: 992px) {
    .dashboard-layout {
        /* Switch to a single column layout, removing the fixed sidebar column */
        grid-template-columns: 1fr;
    }

    .dashboard-layout.sidebar-expanded {
        /* Disable the hover-to-expand effect on mobile */
        grid-template-columns: 1fr;
    }

    .sidebar {
        /* Take sidebar out of the grid flow and hide it off-screen */
        position: fixed; /* Fixed position for slide-out effect */
        top: 0; /* Align to top */
        left: 0; /* Align to left */
        height: 100%; /* Full height */
        width: 280px; /* A good fixed width for mobile sidebar */
        transform: translateX(-100%); /* Initially hidden off-screen to the left */
        transition: transform 0.3s ease-in-out; /* Smooth slide-in/out transition */
        z-index: 1050; /* Highest z-index to be on top of other content */
        overflow-y: auto; /* Allow scrolling within the sidebar if content overflows */
        box-shadow: 0 0 20px rgba(0,0,0,0.2); /* Subtle shadow for depth */
    }

    /* New logic for sticky mobile sidebar header */
    .sidebar {
        padding: 0; /* Remove padding from the main sidebar container */
    }
    .sidebar-header  {
        position: sticky; /* Makes the header sticky within the scrolling sidebar */
        top: 0; /* Sticks to the top of the sidebar */
        z-index: 10; /* Ensures it stays above scrolling content */
        background-color: var(--color-bg-sidebar); /* Background color */
        padding: 1.5rem; /* Re-apply padding here for the header content */
        border-bottom: 1px solid #4a5568; /* Subtle separator line */
        display: flex; /* Use flexbox for alignment */
        justify-content: space-between; /* Space out logo and close button */
        align-items: center; /* Vertically align items */
    }
    .sidebar-nav {
        padding: 0 1.5rem; /* Add horizontal padding to the navigation links */
    }
    .sidebar-footer {
        padding: 1.5rem; /* Re-apply padding to the sidebar footer */
    }
    /* End of new logic */

    /* When sidebar is open, slide it into view */
    .dashboard-layout.sidebar-mobile-open .sidebar {
        transform: translateX(0);
    }

    /* When sidebar is open, show the overlay */
    .dashboard-layout.sidebar-mobile-open .sidebar-overlay {
        display: block;
    }

    .main-content {
        /* On mobile, the main content takes up the full width */
        grid-column: 1 / -1;
    }
    .main-content-wrapper {
        /* Remove padding on small screens for a cleaner look */
        padding: 1rem;
    }

    /* Show the hamburger button on mobile */
    .mobile-sidebar-toggle {
        display: block;
    }

    /* On mobile, space out the hamburger and the user actions in the header */
    .main-header {
        justify-content: space-between;
    }

    /* On mobile, sidebar text should always be visible (no hover-to-expand) */
    .sidebar .logo,
    .sidebar .nav-section-title,
    .sidebar .nav-text {
        opacity: 1;
    }

    /* When the mobile sidebar is open, prevent the main page from scrolling */
    .dashboard-layout.sidebar-mobile-open {
        overflow: hidden;
    }

    /* Show the close button inside the sidebar on mobile */
    .sidebar-close-btn {
        display: block;
    }

    /* Styling for the close button */
    .sidebar-close-btn {
        background: none; /* No background */
        border: none; /* No border */
        color: var(--color-text-primary); /* Color of the 'X' icon */
        cursor: pointer; /* Indicate clickable */
        padding: 0.5rem; /* Make the click target slightly larger */
        opacity: 0.8; /* Slightly transparent by default */
        transition: opacity 0.2s ease; /* Smooth transition on hover */
    }
    .sidebar-close-btn:hover {
        opacity: 1; /* Fully opaque on hover */
    }
}
```

---

## Step 3: JavaScript Modifications

You need to add the `handleMobileSidebar` function to `js/admin.js` and ensure it's called when the page loads.

**Affected File:** `js/admin.js`

**Location:**
1.  Add the `handleMobileSidebar` function within the `DOMContentLoaded` event listener, preferably with other page-specific handlers.
2.  Call `handleMobileSidebar()` at the end of the `DOMContentLoaded` listener.

**Code to Add/Modify:**

```javascript
// Inside the document.addEventListener('DOMContentLoaded', () => { ... }); block

// --- Function to handle mobile sidebar (Copied from app.js) ---
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
        if (toggleButton) toggleButton.classList.add('open'); // Add 'open' class to hamburger icon for animation
    };

    // Function to close the sidebar
    const closeSidebar = () => {
        dashboardLayout.classList.remove('sidebar-mobile-open');
        if (toggleButton) toggleButton.classList.remove('open'); // Remove 'open' class from hamburger icon
    };

    // The hamburger button should TOGGLE the sidebar's state.
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            if (dashboardLayout.classList.contains('sidebar-mobile-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }
    // The dedicated close button inside the sidebar always closes it.
    if (closeButton) closeButton.addEventListener('click', closeSidebar);
    // Clicking the overlay (outside the sidebar) also closes it.
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);
}

// ... (rest of your existing page-specific logic, e.g., if (currentPage === 'dashboard.html') { ... }) ...

// --- Call handleMobileSidebar() on page load ---
// Ensure this is called after all other page-specific logic is set up.
handleMobileSidebar(); // ADD THIS LINE
```

---