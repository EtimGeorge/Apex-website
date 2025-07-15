// Project Apex - public.js (Corrected & Verified)

import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

  // Animate on scroll using Intersection Observer
  const animatedSections = document.querySelectorAll('.fade-in-section');
  if (animatedSections.length > 0) {
      const observer = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('is-visible');
                  observer.unobserve(entry.target); // Stop observing once animated
              }
          });
      }, {
          rootMargin: '0px 0px -100px 0px' // Start animation when element is 100px from the bottom of the viewport
      });

      animatedSections.forEach(section => {
          observer.observe(section);
      });
  }


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
      type: 'loop', // Loop the slides
      perPage: 1, // Show one slide at a time
      focus: 'center', // Center the active slide
      autoplay: true, // Automatically advance slides
      interval: 5000, // Time between slides
      pagination: true, // Show pagination dots
      arrows: false, // Hide arrows
      padding: '5rem', // Show a peek of the next/prev slides on desktop
      breakpoints: {
        // Responsive settings
        640: {
          padding: '2rem', // Less padding on smaller screens
        },
      },
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

  // --- Load Investment Plans on Homepage ---
  const publicPlansGrid = document.getElementById('public-plans-grid');

  if (publicPlansGrid) {
    const loadPublicPlans = async () => {
      try {
        const plansQuery = query(
          collection(db, 'plans'),
          where('isActive', '==', true),
          orderBy('minAmount')
        );
        const snapshot = await getDocs(plansQuery);

        if (snapshot.empty) {
          publicPlansGrid.innerHTML = '<p>No investment plans are available at this time.</p>';
          return;
        }

        let plansHTML = '';
        snapshot.forEach(doc => {
          const plan = doc.data();
          // Check for a boolean 'isFeatured' field in the plan document
          const isFeatured = plan.isFeatured === true;

          plansHTML += `
            <div class="plan-card ${isFeatured ? 'featured' : ''}">
              ${isFeatured ? '<div class="plan-badge">Most Popular</div>' : ''}
              <h3 class="plan-title">${plan.planName}</h3>
              <div class="plan-details">
                <p>Return: <strong>${plan.roiPercent}% Daily</strong> for <strong>${plan.durationDays} Days</strong></p>
              </div>
              <div class="plan-amount">$${plan.minAmount} - $${plan.maxAmount}</div>
              <a href="register.html" class="btn btn-primary plan-btn">Invest Now</a>
            </div>
          `;
        });
        publicPlansGrid.innerHTML = plansHTML;
      } catch (error) {
        console.error("Error fetching public plans:", error);
        publicPlansGrid.innerHTML = '<p>Could not load investment plans. Please try again later.</p>';
      }
    };

    loadPublicPlans();
  }

  // --- Load Blog Posts on Homepage ---
  const loadBlogPreview = async () => {
    const grid = document.getElementById('blog-preview-grid');
    if (!grid) return;

    try {
      // Query for the 3 most recent, published blog posts
      const postsQuery = query(
        collection(db, 'blogPosts'),
        where('status', '==', 'published'), // Assuming a status field
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const snapshot = await getDocs(postsQuery);

      if (snapshot.empty) {
        grid.innerHTML = '<p>No recent articles found. Check back soon!</p>';
        return;
      }

      let postsHTML = '';
      snapshot.forEach(doc => {
        const post = doc.data();
        const postUrl = `post.html?id=${doc.id}`;
        const postDate = post.createdAt.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        postsHTML += `
          <div class="blog-post-card">
            <img src="${post.imageUrl || 'images/blog-placeholder.jpg'}" alt="${post.title}" class="blog-card-image">
            <div class="blog-card-content">
              <p class="blog-card-meta">
                <span>${postDate}</span>
                <span class="meta-separator">•</span>
                <span>${post.likeCount || 0} Likes</span>
              </p>
              <h3 class="blog-card-title"><a href="${postUrl}">${post.title}</a></h3>
              <p class="blog-card-snippet">${post.snippet || ''}</p>
              <a href="${postUrl}" class="blog-card-read-more">Read More &rarr;</a>
            </div>
          </div>
        `;
      });
      grid.innerHTML = postsHTML;
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      grid.innerHTML = '<p>Could not load articles at this time. Please try again later.</p>';
    }
  };

  loadBlogPreview();

  // --- Load All Blog Posts on Blog Page ---
  const loadAllBlogPosts = async () => {
    const grid = document.getElementById("all-posts-grid");
    const paginationContainer = document.getElementById("blog-pagination");
    if (!grid || !paginationContainer) return;

    const postsPerPage = 6; // You can change this number
    const params = new URLSearchParams(window.location.search);
    let currentPage = parseInt(params.get("page")) || 1;

    try {
      grid.innerHTML = "<p>Loading all articles...</p>";
      paginationContainer.innerHTML = "";

      // Query for all published blog posts, ordered by date
      // Note: For very large blogs, fetching all docs for a count can be inefficient.
      // A more scalable solution involves a separate 'postCount' document in Firestore.
      const postsQuery = query(
        collection(db, "blogPosts"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(postsQuery);
      const allPosts = snapshot.docs;

      if (allPosts.length === 0) {
        grid.innerHTML = "<p>No articles have been published yet. Check back soon!</p>";
        return;
      }

      const totalPages = Math.ceil(allPosts.length / postsPerPage);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const startIndex = (currentPage - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const postsForPage = allPosts.slice(startIndex, endIndex);

      let postsHTML = "";
      postsForPage.forEach((doc) => {
        const post = doc.data();
        const postUrl = `post.html?id=${doc.id}`;
        const postDate = post.createdAt.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        postsHTML += `
          <div class="blog-post-card">
            <img src="${post.imageUrl || "images/blog-placeholder.jpg"}" alt="${post.title}" class="blog-card-image">
            <div class="blog-card-content">
              <p class="blog-card-meta">
                <span>${postDate}</span>
                <span class="meta-separator">•</span>
                <span>${post.likeCount || 0} Likes</span>
              </p>
              <h3 class="blog-card-title"><a href="${postUrl}">${post.title}</a></h3>
              <p class="blog-card-snippet">${post.snippet || ""}</p>
              <a href="${postUrl}" class="blog-card-read-more">Read More &rarr;</a>
            </div>
          </div>
        `;
      });
      grid.innerHTML = postsHTML;

      // Render Pagination Controls
      if (totalPages > 1) {
        let paginationHTML = `<a href="?page=${currentPage - 1}" class="page-number ${currentPage === 1 ? "disabled" : ""}">&larr; Prev</a>`;
        for (let i = 1; i <= totalPages; i++) {
          paginationHTML += `<a href="?page=${i}" class="page-number ${i === currentPage ? "active" : ""}">${i}</a>`;
        }
        paginationHTML += `<a href="?page=${currentPage + 1}" class="page-number ${currentPage === totalPages ? "disabled" : ""}">Next &rarr;</a>`;
        paginationContainer.innerHTML = paginationHTML;
      }
    } catch (error) {
      console.error("Error fetching all blog posts:", error);
      grid.innerHTML = "<p>Could not load articles at this time. Please try again later.</p>";
    }
  };

  loadAllBlogPosts();

  // --- Load Single Blog Post on post.html ---
  const loadSinglePost = async () => {
    const postContainer = document.getElementById('post-content-area');
    const interactionsContainer = document.getElementById('post-interactions');
    const commentsContainer = document.getElementById('comments-section');
    if (!postContainer) return;

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
      postContainer.innerHTML = '<h1>Error: Post ID not found.</h1><p>Please return to the <a href="blog.html">blog page</a> and select an article.</p>';
      return;
    }

    try {
      const postRef = doc(db, 'blogPosts', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const post = postSnap.data();
        document.title = `${post.title} - Project Apex`; // Update the page title

        const postDate = post.createdAt.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const postHTML = `
          <h1 class="post-title">${post.title}</h1>
          <div class="post-meta">
            <span>Published on ${postDate}</span>
          </div>
          <img src="${post.imageUrl || 'images/blog-placeholder.jpg'}" alt="${post.title}" class="post-featured-image">
          <div class="post-body">
            ${post.content}
          </div>
        `;
        postContainer.innerHTML = postHTML;

        // Now that the post is loaded, show and populate interactions
        if (interactionsContainer && commentsContainer) {
            interactionsContainer.style.display = 'block';
            commentsContainer.style.display = 'block';
            handleLikes(postId, post);
            setupCommentForm(postId);
            loadComments(postId);
        }
      } else {
        postContainer.innerHTML = '<h1>Post Not Found</h1><p>The article you are looking for does not exist or has been moved. Please return to the <a href="blog.html">blog page</a>.</p>';
      }
    } catch (error) {
      console.error("Error fetching single post:", error);
      postContainer.innerHTML = '<h1>Error</h1><p>Could not load the article due to a technical issue. Please try again later.</p>';
    }
  };

  loadSinglePost();

  // --- Load Related Blog Posts on post.html ---
  const loadRelatedPosts = async () => {
    const relatedGrid = document.getElementById('related-posts-grid');
    if (!relatedGrid) return;

    try {
      // For now, just get the 3 latest posts.
      // In a real app, you'd filter by category or tags.
      const postsQuery = query(
        collection(db, 'blogPosts'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(postsQuery);
      if (snapshot.empty) {
        relatedGrid.innerHTML = '<p>No related articles found.</p>';
        return;
      }

      let postsHTML = '';
      snapshot.forEach(doc => {
        const post = doc.data();
        const postUrl = `post.html?id=${doc.id}`;
        const postDate = post.createdAt.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        postsHTML += `
          <div class="blog-post-card">
            <img src="${post.imageUrl || 'images/blog-placeholder.jpg'}" alt="${post.title}" class="blog-card-image">
            <div class="blog-card-content">
              <p class="blog-card-meta"><span>${postDate}</span></p>
              <h3 class="blog-card-title"><a href="${postUrl}">${post.title}</a></h3>
              <p class="blog-card-snippet">${post.snippet || ''}</p>
              <a href="${postUrl}" class="blog-card-read-more">Read More &rarr;</a>
            </div>
          </div>
        `;
      });
      relatedGrid.innerHTML = postsHTML;
    } catch (error) {
      console.error("Error fetching related posts:", error);
      relatedGrid.innerHTML = '<p>Could not load related articles. Please try again later.</p>';
    }
  };

  // Call the function when the page loads
  loadRelatedPosts();

  // --- Handle Post Likes ---
  const handleLikes = (postId, postData) => {
    const interactionsContainer = document.getElementById('post-interactions');
    if (!interactionsContainer) return;

    const likeCount = postData.likeCount || 0;
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
    const isLiked = likedPosts.includes(postId);

    const likeButtonHTML = `
      <button class="like-btn" id="like-btn" ${isLiked ? 'disabled' : ''}>
        <svg class="like-icon" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span id="like-count">${likeCount}</span> Likes
      </button>
    `;
    interactionsContainer.innerHTML = likeButtonHTML;

    const likeBtn = document.getElementById('like-btn');
    if (isLiked) {
        likeBtn.classList.add('liked');
    }

    likeBtn.addEventListener('click', async () => {
      likeBtn.disabled = true;
      likeBtn.classList.add('liked');

      try {
        const postRef = doc(db, 'blogPosts', postId);
        await updateDoc(postRef, {
          likeCount: increment(1)
        });

        // Update UI
        const currentLikes = parseInt(document.getElementById('like-count').textContent);
        document.getElementById('like-count').textContent = currentLikes + 1;

        // Save to local storage to prevent multiple likes
        const updatedLikedPosts = [...likedPosts, postId];
        localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts));

      } catch (error) {
        console.error("Error liking post:", error);
        likeBtn.disabled = false; // Re-enable if there was an error
        likeBtn.classList.remove('liked');
      }
    });
  };

  // --- Handle Comment Form Submission ---
  const setupCommentForm = (postId) => {
    const commentForm = document.getElementById('comment-form');
    if (!commentForm) return;

    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = commentForm.querySelector('button[type="submit"]');
      const nameInput = document.getElementById('comment-name');
      const textInput = document.getElementById('comment-text');

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) {
        alert('Please fill in both your name and comment.');
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = 'Posting...';

      try {
        const commentsCollectionRef = collection(db, 'blogPosts', postId, 'comments');
        await addDoc(commentsCollectionRef, {
          name: name,
          text: text,
          createdAt: serverTimestamp(), // Use server time for consistency
        });

        // Clear the form and reload comments
        commentForm.reset();
        loadComments(postId); // Refresh the comments list

      } catch (error) {
        console.error("Error posting comment:", error);
        alert('Sorry, there was an error posting your comment. Please try again.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Post Comment';
      }
    });
  };

  // --- Load and Display Comments ---
  const loadComments = async (postId) => {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    commentsList.innerHTML = '<p>Loading comments...</p>';

    try {
      const commentsQuery = query(collection(db, 'blogPosts', postId, 'comments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(commentsQuery);

      if (snapshot.empty) {
        commentsList.innerHTML = '<p>Be the first to comment!</p>';
        return;
      }

      let commentsHTML = '';
      snapshot.forEach(doc => {
        const comment = doc.data();
        const commentDate = comment.createdAt ? comment.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';

        commentsHTML += `
          <div class="comment-item">
            <p class="comment-text">${comment.text}</p>
            <div class="comment-meta">
              <strong class="comment-author">${comment.name}</strong>
              <span class="comment-date">${commentDate}</span>
            </div>
          </div>
        `;
      });
      commentsList.innerHTML = commentsHTML;

    } catch (error) {
      console.error("Error loading comments:", error);
      commentsList.innerHTML = '<p>Could not load comments at this time.</p>';
    }
  };
});
