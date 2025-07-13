# Gemini's Fixes (Round 7): Correcting Mobile Theme Switcher Visibility

This document outlines the HTML change required to make the theme switcher visible on mobile devices while keeping the other desktop-only buttons hidden.

This fix assumes you have already applied the CSS changes from `gemini-fixes-6.md`.

## 1. Update HTML Structure in `index.html`

The previous change incorrectly hid the entire header actions block, including the theme switcher. To fix this, I will adjust the HTML to wrap only the login and registration buttons in the `desktop-only` class, leaving the theme switcher visible on all screen sizes.

**Find this code in `index.html`:**

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
          <div class="desktop-only">
            <a href="login.html" class="btn btn-secondary">Login</a>
            <a href="register.html" class="btn btn-primary">Get Started</a>
          </div>
        </div>
        <button class="mobile-menu-toggle mobile-only" id="mobile-menu-toggle" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
```

## 2. CSS Changes

No CSS changes are needed. The existing styles in `css/public.css` for `.desktop-only` and `.mobile-only` will work correctly with this updated HTML structure.
