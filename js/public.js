window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.classList.add('hidden');
  }
});

// js/public.js - At the top
import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu ---
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
    });
  }

  // --- Logic to Fetch and Display Investment Plans ---
  const publicPlansGrid = document.getElementById('public-plans-grid');
  if (publicPlansGrid) {
    const plansQuery = query(
      collection(db, 'plans'),
      where('isActive', '==', true),
      orderBy('minAmount')
    );

    getDocs(plansQuery)
      .then((snapshot) => {
        let plansHTML = '';
        if (snapshot.empty) {
          plansHTML = '<p>No investment plans are currently available.</p>';
        } else {
          snapshot.forEach((doc) => {
            const plan = doc.data();
            const isFeatured = plan.planName.toLowerCase().includes('premium');
            plansHTML += `
                            <div class="plan-card ${isFeatured ? 'featured' : ''
              }">
                                ${isFeatured
                ? '<div class="plan-badge">Most Popular</div>'
                : ''
              }
                                <div class="plan-header">
                                    <h3 class="plan-name">${plan.planName}</h3>
                                    <div class="plan-price">$${plan.minAmount
              } - $${plan.maxAmount}</div>
                                </div>
                                <ul class="plan-features">
                                    <li>Return <strong>${plan.roiPercent
              }% Daily</strong></li>
                                    <li>Duration <strong>For ${plan.durationDays
              } Days</strong></li>
                                    <li>Referral Bonus <strong>5%</strong></li>
                                </ul>
                                <a href="register.html" class="btn btn-primary plan-btn">Get Started</a>
                            </div>
                        `;
          });
        }
        publicPlansGrid.innerHTML = plansHTML;
      })
      .catch((error) => {
        console.error('Error fetching public plans:', error);
        publicPlansGrid.innerHTML =
          '<p>Could not load investment plans at this time.</p>';
      });
  }

  // =============================================================================
  // --- Scroll-to-Reveal Animation Logic ---
  // =============================================================================
  const sectionsToAnimate = document.querySelectorAll('.fade-in-section');

  if (sectionsToAnimate.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If the element is in the viewport
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Optional: stop observing the element once it's visible
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the element is visible
    });

    // Tell the observer to watch each of our sections
    sectionsToAnimate.forEach(section => {
      observer.observe(section);
    });
  }


  

  // =============================================================================
  // --- Scroll to Top Button Logic ---
  // =============================================================================
  const scrollTopBtn = document.getElementById('scroll-to-top-btn');

  if (scrollTopBtn) {
    // Show button when user scrolls down
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    // Scroll to top when button is clicked
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // =============================================================================
  // --- Testimonials Carousel Logic ---
  // =============================================================================
  const testimonialsSlider = document.getElementById('testimonials-slider');

  if (testimonialsSlider) {
    new Splide('#testimonials-slider', {
      type: 'loop', // Creates an infinite loop
      perPage: 2,      // Show 2 slides on desktop
      perMove: 1,
      gap: '2rem', // Space between slides
      pagination: true,  // Show dot indicators
      arrows: false, // Hide default arrows, we can make custom ones later if needed
      breakpoints: {
        992: {
          perPage: 1, // Show 1 slide on tablets and mobile
        },
      },
    }).mount();
  }

  // =============================================================================
  // --- Newsletter Form Submission Logic ---
  // =============================================================================
  const newsletterForm = document.getElementById('page-newsletter-form');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('page-newsletter-email');
      const submitButton = newsletterForm.querySelector('button[type="submit"]');
      const email = emailInput.value;

      if (!email) {
        alert('Please enter a valid email address.');
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';

      try {
        // We will use the email address itself as the document ID
        // to automatically prevent duplicate signups.
        const subscriberRef = doc(db, "newsletter-subscribers", email);

        await setDoc(subscriberRef, {
          email: email,
          subscribedAt: new Date()
        });

        alert('Thank you for subscribing!');
        newsletterForm.reset(); // Clear the form

      } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        alert("An error occurred. Please try again later.");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Subscribe Now';
      }
    });
  }

});
