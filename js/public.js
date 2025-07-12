window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('hidden');
    }
});



document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
        });
    }
});