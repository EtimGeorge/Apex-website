# Development Plan: Project Apex V2 - Modern Investment Website

This document outlines the detailed, step-by-step plan for building the public-facing, multi-page website for Project Apex. The goal is to create a modern, professional, and feature-rich platform to attract and convert visitors into registered users.

The plan is divided into four distinct phases, starting with the foundational pages and progressively adding advanced features.

---

## Phase 1: Building the Core Public Pages

This phase focuses on creating the essential marketing and informational pages that form the backbone of the public site. A consistent header and footer will be built and reused across all pages.

### Step 1.1: Create the Main Header & Footer

- **Objective:** Design the primary navigation header and a comprehensive site footer to be used on all public pages.
- **Implementation:** Modify `index.html` to contain the master HTML for these two reusable components. The header will include navigation links: Home, About, Investment Plans, Blog, and Contact. The footer will contain quick links, legal information, and a newsletter signup form.

### Step 1.2: Build the Homepage (`index.html`)

- **Objective:** Create a visually stunning and compelling homepage to establish trust and drive user registration.
- **Page Sections:**
  1.  **Hero Section:** A full-screen introductory section with an animated headline (e.g., "Secure Your Financial Future"), a clear tagline, and a primary "View Our Plans" call-to-action button.
  2.  **Key Benefits Section:** A clean grid of 3-4 feature cards highlighting top benefits like "Advanced Security," "Multiple Plans," and "24/7 Support," complete with small, animated icons.
  3.  **Live Market Ticker:** Integration of the TradingView scrolling ticker widget to show live market data and create a sense of a dynamic financial environment.
  4.  **Testimonial Snippet:** A preview of 1-2 powerful customer testimonials to build social proof.
  5.  **Final Call to Action (CTA):** A prominent section at the bottom of the page that strongly encourages visitors to "Get Started" or "Register Now".

### Step 1.3: Build the "About Us" Page (`about.html`)

- **Objective:** Build trust and credibility by telling the company's story and introducing its team.
- **Page Sections:**
  1.  **Our Mission:** A well-defined statement about the company's goals and commitment to its clients.
  2.  **Our Team:** A grid layout to feature key team members with placeholder photos, names, and titles.
  3.  **Company Values:** A section detailing the core principles that guide the business (e.g., Integrity, Transparency, Innovation).

### Step 1.4: Build the "Investment Plans" Page (`plans.html` - Public Version)

- **Objective:** A dedicated page that clearly and attractively lays out all available investment options for potential customers.
- **Implementation:**
  - Create a new public-facing `plans.html`.
  - Write JavaScript logic to dynamically fetch plan data from the `plans` collection in Firestore.
  - Display the plans using the same `plan-card` component style for brand consistency.

### Step 1.5: Build the "Contact Us" Page (`contact.html`)

- **Objective:** Provide clear and multiple ways for prospective and current users to get help.
- **Page Sections:**
  1.  **Contact Form:** A comprehensive form for submitting inquiries, which will save messages to a `support-tickets` collection in Firestore.
  2.  **Company Information:** A section displaying a physical address (placeholder), support email, and business phone number.
  3.  **FAQ Section:** An interactive accordion-style list of frequently asked questions that users can expand to read answers.

---

## Phase 2: Implementing Site-Wide Advanced UI/UX

This phase focuses on adding premium features that enhance the user experience across the entire site (both public pages and the logged-in dashboard).

### Step 2.1: Implement the Page Preloader

- **Objective:** Add a professional loading animation that appears while page content is being prepared.
- **Implementation:** Add a `div` element for the preloader to the top of the `<body>` in all HTML files. Use CSS to style a spinning logo animation and JavaScript to control its fade-out transition once the window's `load` event has fired.

### Step 2.2: Implement the Custom Chat Assistant

- **Objective:** Provide an accessible, site-wide support entry point.
- **Implementation (V1):**
  - Add a floating chat icon to the bottom-right corner of all pages.
  - On click, the icon will open a modal containing the same simple contact form from the "Contact Us" page.
  - This provides immediate access to support without being intrusive.
- **Future-Proofing:** The chat icon can be easily re-wired later to open a third-party chat service like Intercom or a Dialogflow chatbot.

### Step 2.3: Implement the "Scroll to Top" Button

- **Objective:** Improve navigation on long pages.
- **Implementation:** Add a floating button that is hidden by default (`opacity: 0`). Use JavaScript to detect page scroll. After the user scrolls down a certain distance (e.g., 400px), the button will fade in. Clicking it will trigger a smooth JavaScript-powered scroll back to the top of the page.

---

## Phase 3: Building Content & Engagement Features

This phase focuses on adding features that drive user engagement and provide value beyond the core investment tools.

### Step 3.1: Build the Blog (`blog.html` & `post.html`)

- **Objective:** Create a content marketing platform to establish authority, improve SEO, and attract new users.
- **Implementation:**
  1.  Create `blog.html` to display a grid or list of blog post summaries (image, title, author, date, snippet).
  2.  Create `post.html`, a template page designed to display the full content of a single blog post.
  3.  Write JavaScript to fetch and display data from a new `blogPosts` collection in Firestore.

### Step 3.2: Implement the Newsletter Signup

- **Objective:** Build a marketing list by capturing visitor emails.
- **Implementation:** A simple form will be placed in the site footer. On submission, JavaScript will save the email to a `newsletter-subscribers` collection in Firestore and provide a "Thank You" message.

---

## Phase 4: Advanced Features & Admin Enhancements

This phase prepares the application for future growth and completes the admin toolset.

### Step 4.1: Language Selector (Front-End Foundation)

- **Objective:** Add the UI for a language switcher.
- **Implementation:**
  - Add a language dropdown to the header UI.
  - Modify key text elements in the HTML to use `data-key` attributes (e.g., `<h1 data-key="hero_title">...</h1>`).
  - Write a JavaScript function that can switch the `textContent` of these elements based on a selected language from a simple JavaScript object, creating a proof-of-concept for future integration with a full translation library like `i18next`.

### Step 4.2: Admin Panel Enhancements

- **Objective:** Give administrators full control over the site's dynamic content.
- **Implementation:**
  1.  **Manage Blog:** Create a new page in the admin panel with a form that allows admins to create, edit, and publish articles to the `blogPosts` collection.
  2.  **Manage Plans:** Enhance the existing "Manage Plans" page by adding "Edit" and "Deactivate" buttons to the plans table, allowing an admin to modify plan details or temporarily hide them from users.
