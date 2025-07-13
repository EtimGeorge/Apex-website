// Project Apex - public.js (Corrected & Verified)

// Wait for DOM
window.addEventListener('load', () => {
  // ✅ Hide Preloader
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    preloader.style.pointerEvents = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  /// Theme Switcher
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


   // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      mobileToggle.classList.toggle('open');
    });
  }

  // Splide Testimonials Slider
  if (typeof Splide !== 'undefined' && document.querySelector('#testimonials-slider')) {
    new Splide('#testimonials-slider', {
      type: 'loop',
      perPage: 1,
      autoplay: true,
      interval: 5000,
      pagination: true,
      arrows: false,
    }).mount();
  }

  // Scroll to Top
  const scrollBtn = document.getElementById('scroll-to-top-btn');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('show', window.scrollY > 400);
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Newsletter Form Submissions
  const pageForm = document.getElementById('page-newsletter-form');
  if (pageForm) {
    pageForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]').value;
      console.log('Page Subscribe:', email);
      e.target.reset();
      alert('Thank you for subscribing!');
    });
  }

  const footerForm = document.getElementById('newsletter-form');
  if (footerForm) {
    footerForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]').value;
      console.log('Footer Subscribe:', email);
      e.target.reset();
      alert('Subscription successful!');
    });
  }
});
