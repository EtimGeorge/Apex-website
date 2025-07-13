# Gemini's Fixes (Round 9): Responsive Button and Form Fixes

This document provides CSS adjustments for the hero section, newsletter section, and footer newsletter form to ensure they look great on mobile devices.

## 1. Add to `css/public.css`

Add the following CSS rules to your `css/public.css` file. It is recommended to place these inside the `@media (max-width: 768px)` media query to target mobile devices specifically.

### Hero Section Buttons

To make the hero section buttons stack vertically and have a more appropriate size on mobile, add the following CSS:

```css
/* Responsive Hero Section CTA */
.hero-cta {
  display: flex;
  flex-direction: column; /* Stack buttons vertically on mobile */
  gap: 15px; /* Add space between the stacked buttons */
  align-items: center; /* Center the buttons */
}

.hero-cta .btn {
  padding: 12px 24px; /* Adjust padding for mobile */
  font-size: 1rem; /* Adjust font size for mobile */
  width: 80%; /* Make buttons wider for a better touch target */
  text-align: center;
}
```

### Page Newsletter Form

To improve the layout of the main newsletter form on mobile, use the following styles:

```css
/* Responsive Page Newsletter Form */
#page-newsletter-form {
  display: flex;
  flex-direction: column; /* Stack input and button */
  align-items: center;
  width: 100%;
  max-width: 400px; /* Constrain max width */
  margin: 0 auto;
}

#page-newsletter-form input[type="email"] {
  width: 100%;
  margin-bottom: 10px; /* Add space below the email input */
  text-align: center;
}

#page-newsletter-form button {
  width: 100%;
}
```

### Footer Newsletter Form

For a better mobile experience in the footer, apply these styles:

```css
/* Responsive Footer Newsletter Form */
.footer-newsletter form {
  display: flex;
  flex-direction: column; /* Stack input and button */
  align-items: flex-start;
}

.footer-newsletter input[type="email"] {
  width: 100%;
  margin-bottom: 10px; /* Add space below the email input */
}

.footer-newsletter button {
  width: 100%; /* Make button full-width */
}
```
