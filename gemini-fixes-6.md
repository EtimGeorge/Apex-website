# Gemini's Fixes (Round 6)

This document outlines the HTML and CSS changes to fix the navigation menu, where mobile elements were appearing on desktop views.

## 1. Update HTML Structure in `index.html`

To ensure the correct navigation components are displayed on desktop and mobile, I will add `desktop-only` and `mobile-only` classes to the header elements.

**Find this code:**

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
        <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </nav>
    </div>
    <div class="mobile-nav" id="mobile-nav">
```

**And replace it with this:**

```html
        <div class="header-actions desktop-only">
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
        <button class="mobile-menu-toggle mobile-only" id="mobile-menu-toggle" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </nav>
    </div>
    <div class="mobile-nav mobile-only" id="mobile-nav">
```

## 2. Add CSS for Visibility Control

Next, I will add the corresponding CSS to `css/public.css` to control the visibility of the `desktop-only` and `mobile-only` classes based on screen size.

**Add this code to the `@media (max-width: 768px)` block:**

```css
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block; /* Or flex, etc., depending on the element */
  }
```

**Add this code outside of any media query (for desktop styles):**

```css
.mobile-only {
  display: none;
}
```