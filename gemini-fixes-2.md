# Gemini's Fixes (Round 2)

Here are the code modifications to fix the theme switcher's double-click issue and the invisible hamburger menu.

## 1. Fix the Theme Switcher (Single Click)

The theme switcher currently requires two clicks. The following change to `js/public.js` will make it work on a single click.

### A. Update `js/public.js`

Replace the existing `themeSwitcher` function with this updated version:

**Find this code:**

```javascript
  //Theme Switcher
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
      const target = e.target.closest('a[data-theme]');
      if (target) {
        e.preventDefault();
        const theme = target.dataset.theme;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
      }
    });

    // Set initial theme on page load
    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);
  };

  themeSwitcher();
```

## 2. Fix the Hamburger Menu Visibility

The hamburger menu is not visible because it was commented out in the HTML.

### A. Update `index.html`

Uncomment the hamburger menu button in `index.html`.

**Find this code:**

```html
<!-- <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Open menu">
  <span></span><span></span><span></span>
</button> -->
```

**And replace it with this:**

```html
<button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Open menu">
  <span></span><span></span><span></span>
</button>
```

### B. Update `css/public.css`

Add the following CSS to `css/public.css` to ensure the hamburger menu is styled correctly. You can add this at the end of the `@media (max-width: 768px)` block.

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