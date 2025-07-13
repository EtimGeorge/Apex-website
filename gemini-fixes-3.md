# Gemini's Fixes (Round 3)

Here are the code modifications to improve the header and mobile navigation, fix the hamburger menu's close icon, and resolve the dark theme color conflicts.

## 1. Improve Header and Mobile Navigation

### A. Update `js/public.js`

Replace the existing `Mobile Menu Toggle` section with the following code to handle the close icon toggle:

**Find this code:**

```javascript
  // Mobile Menu Toggle - Ensure elements exist or create fallbacks
  let mobileToggle = document.getElementById('mobile-menu-toggle');
  let mobileNav = document.getElementById('mobile-nav');

  if (!mobileToggle) {
    const nav = document.querySelector('nav.navbar');
    if (nav) {
      mobileToggle = document.createElement('button');
      mobileToggle.id = 'mobile-menu-toggle';
      mobileToggle.className = 'mobile-menu-toggle';
      mobileToggle.setAttribute('aria-label', 'Open menu');
      mobileToggle.innerHTML = '<span></span><span></span><span></span>';
      nav.appendChild(mobileToggle);
    }
  }

  if (!mobileNav) {
    mobileNav = document.createElement('div');
    mobileNav.id = 'mobile-nav';
    mobileNav.classList.add('mobile-nav');
    mobileNav.innerHTML = `
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About Us</a></li>
        <li><a href="plans.html">Plans</a></li>
        <li><a href="blog.html">Blog</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    `;
    document.body.appendChild(mobileNav);
  }

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        mobileNav.style.display = 'none';
      } else {
        mobileNav.classList.add('open');
        mobileNav.style.display = 'block';
      }
    });
  }
```

**And replace it with this:**

```javascript
  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      mobileToggle.classList.toggle('open');
    });
  }
```

### B. Update `css/public.css`

Replace the existing `.mobile-menu-toggle span` styles with the following to create the hamburger-to-X animation:

**Find this code:**

```css
.mobile-menu-toggle span {
  display: block;
  width: 25px;
  height: 3px;
  background-color: var(--text-color);
  margin: 5px 0;
  transition: var(--transition);
}
```

**And replace it with this:**

```css
.mobile-menu-toggle span {
  display: block;
  width: 25px;
  height: 3px;
  background-color: var(--text-color);
  margin: 5px auto;
  transition: all 0.3s ease-in-out;
}

.mobile-menu-toggle.open span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.mobile-menu-toggle.open span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.open span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}
```

Also, update the `#mobile-nav` and `#mobile-nav.open` styles:

**Find this code:**

```css
#mobile-nav {
  display: none;
  background: var(--white);
  padding: 1rem;
}
```

**And replace it with this:**

```css
#mobile-nav {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--white);
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

#mobile-nav.open {
  display: block;
}
```

## 2. Fix Dark Theme Color Conflicts

### A. Update `css/public.css`

Replace the existing `:root` and `body.dark-theme` styles with the following to create a more comprehensive set of dark theme variables and apply them.

**Find this code:**

```css
:root {
  --primary-color: #4b6cb7;
  --primary-gradient: linear-gradient(to right, #182848, #4b6cb7);
  --secondary-color: #00c6ff;
  --text-color: #222;
  --text-light: #666;
  --bg-light: #f9f9f9;
  --bg-dark: #0b0c10;
  --white: #fff;
  --transition: all 0.3s ease-in-out;
  --radius: 8px;
}

body.light-theme {
  background: var(--white);
  color: var(--text-color);
  font-family: 'Inter', sans-serif;
}

body.dark-theme {
  background: #111;
  color: #ddd;
}
```

**And replace it with this:**

```css
:root {
  --primary-color: #4b6cb7;
  --primary-gradient: linear-gradient(to right, #182848, #4b6cb7);
  --secondary-color: #00c6ff;
  --white: #fff;
  --transition: all 0.3s ease-in-out;
  --radius: 8px;

  /* Light Theme */
  --text-color-light: #222;
  --text-light-light: #666;
  --bg-light-light: #f9f9f9;
  --header-bg-light: var(--white);

  /* Dark Theme */
  --text-color-dark: #ddd;
  --text-light-dark: #aaa;
  --bg-dark-dark: #0b0c10;
  --bg-light-dark: #1a1a1a;
  --header-bg-dark: #111;
}

body {
  font-family: 'Inter', sans-serif;
  transition: var(--transition);
}

body.light-theme {
  background: var(--white);
  color: var(--text-color-light);
}

body.dark-theme {
  background: var(--bg-dark-dark);
  color: var(--text-color-dark);
}

/* Apply theme variables */
header {
  background: var(--header-bg-light);
}

.dark-theme header {
  background: var(--header-bg-dark);
}

.main-nav a, .nav-links a {
  color: var(--text-color-light);
}

.dark-theme .main-nav a, .dark-theme .nav-links a {
  color: var(--text-color-dark);
}

#theme-toggle {
  color: var(--text-color-light);
}

.dark-theme #theme-toggle {
  color: var(--text-color-dark);
}

.benefit-card, .step-card, .testimonial-card {
  background: var(--white);
}

.dark-theme .benefit-card, .dark-theme .step-card, .dark-theme .testimonial-card {
  background: var(--bg-light-dark);
}

.plans-section-public, .testimonials-section {
  background: var(--white);
}

.dark-theme .plans-section-public, .dark-theme .testimonials-section {
  background: var(--bg-dark-dark);
}

.plan-card {
  background: var(--bg-light-light);
}

.dark-theme .plan-card {
  background: var(--bg-light-dark);
}

.plan-amount {
  color: var(--text-color-light);
}

.dark-theme .plan-amount {
  color: var(--text-color-dark);
}

.mobile-menu-toggle span {
    background-color: var(--text-color-light);
}

.dark-theme .mobile-menu-toggle span {
    background-color: var(--text-color-dark);
}

#mobile-nav {
    background: var(--header-bg-light);
}

.dark-theme #mobile-nav {
    background: var(--header-bg-dark);
}

#mobile-nav a {
    color: var(--text-color-light);
}

.dark-theme #mobile-nav a {
    color: var(--text-color-dark);
}

.theme-menu {
    background: var(--header-bg-light);
}

.dark-theme .theme-menu {
    background: var(--header-bg-dark);
}

.theme-menu a {
    color: var(--text-color-light);
}

.dark-theme .theme-menu a {
    color: var(--text-color-dark);
}

.theme-menu a:hover {
    background: var(--bg-light-light);
}

.dark-theme .theme-menu a:hover {
    background: var(--bg-light-dark);
}
```