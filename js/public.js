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
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
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
                            <div class="plan-card ${
                              isFeatured ? 'featured' : ''
                            }">
                                ${
                                  isFeatured
                                    ? '<div class="plan-badge">Most Popular</div>'
                                    : ''
                                }
                                <div class="plan-header">
                                    <h3 class="plan-name">${plan.planName}</h3>
                                    <div class="plan-price">$${
                                      plan.minAmount
                                    } - $${plan.maxAmount}</div>
                                </div>
                                <ul class="plan-features">
                                    <li>Return <strong>${
                                      plan.roiPercent
                                    }% Daily</strong></li>
                                    <li>Duration <strong>For ${
                                      plan.durationDays
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
});
