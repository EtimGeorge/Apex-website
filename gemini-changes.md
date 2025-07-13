
# Gemini's Suggested Changes

Here are the code modifications to fix the mobile navigation and implement the theme dropdown.

## 1. Fix Mobile Navigation in `index.html`

In `index.html`, find the following line:

```html
<div class="mobile-nav open" id="mobile-nav">
```

And change it to:

```html
<div class="mobile-nav" id="mobile-nav">
```

## 2. Implement Theme Dropdown

### A. Update `index.html`

Replace the existing theme toggle button with the new dropdown structure.

**Find this code:**

```html
<div class="header-actions">
  <button id="theme-toggle" title="Toggle Theme">🌓</button>
  <a href="login.html" class="btn btn-secondary">Login</a>
  <a href="register.html" class="btn btn-primary">Get Started</a>
</div>
```

**And replace it with this:**

```html
<div class="header-actions">
  <div class="theme-switcher">
    <button id="theme-toggle" title="Toggle Theme">
      <span class="theme-icon sun">☀️</span>
      <span class="theme-icon moon">🌙</span>
    </button>
    <div class="theme-menu">
      <a href="#" data-theme="light">
        <span class="theme-icon sun">☀️</span> Light Theme
      </a>
      <a href="#" data-theme="dark">
        <span class="theme-icon moon">🌙</span> Dark Theme
      </a>
      <a href="#" data-theme="system">
        <span class="theme-icon">⚙️</span> System Theme
      </a>
    </div>
  </div>
  <a href="login.html" class="btn btn-secondary">Login</a>
  <a href="register.html" class="btn btn-primary">Get Started</a>
</div>
```

### B. Update `css/public.css`

Add the following CSS to `css/public.css` to style the new theme switcher dropdown. You can add this at the end of the file or in a relevant section.

```css
/* ========== THEME SWITCHER ========== */
.theme-switcher {
  position: relative;
  display: inline-block;
}

#theme-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-color);
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: var(--transition);
}

#theme-toggle:hover {
  background: var(--bg-light);
}

.theme-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--white);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 160px;
  padding: 0.5rem 0;
}

.theme-switcher:hover .theme-menu {
  display: block;
}

.theme-menu a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-color);
  transition: var(--transition);
}

.theme-menu a:hover {
  background: var(--bg-light);
}

.theme-icon {
  font-size: 1rem;
}

/* Hide one of the icons based on the theme */
.dark-theme .sun {
  display: none;
}

.light-theme .moon {
  display: none;
}
```

### C. Update `js/public.js`

Replace the existing "Theme Toggle" section in `js/public.js` with the new logic to handle the dropdown menu.

**Find this code:**

```javascript
  // Theme Toggle
  let themeToggle = document.getElementById('theme-toggle');

  // If not present in DOM, create and inject the button into header-actions
  if (!themeToggle) {
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      themeToggle = document.createElement('button');
      themeToggle.id = 'theme-toggle';
      themeToggle.title = 'Toggle Theme';
      themeToggle.textContent = '🌓';
      themeToggle.style.fontSize = '1.2rem';
      themeToggle.style.marginLeft = '1rem';
      themeToggle.style.cursor = 'pointer';
      themeToggle.style.background = 'none';
      themeToggle.style.border = 'none';
      headerActions.appendChild(themeToggle);
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      document.body.classList.toggle('light-theme');
      const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${savedTheme}-theme`);
    }
  }
```

**And replace it with this:**

```javascript
  // Theme Switcher
  const themeSwitcher = () => {
    const themeMenu = document.querySelector('.theme-menu');
    if (!themeMenu) return;

    const applyTheme = (theme) => {
      document.body.classList.remove('light-theme', 'dark-theme');
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.add(systemPrefersDark ? 'dark-theme' : 'light-theme');
      } else {
        document.body.classList.add(`${theme}-theme`);
      }
    };

    themeMenu.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.closest('a[data-theme]');
      if (target) {
        const theme = target.dataset.theme;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
      }
    });

    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);
  };

  themeSwitcher();
```
