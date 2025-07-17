// Project Apex - public.js (Fixed & Re-Ordered)

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

// ------------------------------------------------------------------
// 1️⃣  GLOBAL UTILITIES
// ------------------------------------------------------------------
const animatedSections = () => {
  const sections = document.querySelectorAll('.fade-in-section');
  if (!sections.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -100px 0px' });
  sections.forEach(s => io.observe(s));
};

const initMobileToggle = () => {
  const toggle = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('mobile-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.classList.toggle('open');
  });
};

const initScrollTop = () => {
  const btn = document.getElementById('scroll-to-top-btn');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

const initNewsletter = () => {
  ['page-newsletter-form', 'footer-newsletter-form'].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if (!email) return;
      alert('Thank you for subscribing!');
      form.reset();
    });
  });
};

const initSplideSlider = () => {
  if (typeof Splide === 'undefined') return;
  const slider = document.querySelector('#testimonials-slider');
  if (!slider) return;
  new Splide(slider, {
    type: 'loop',
    perPage: 1,
    focus: 'center',
    autoplay: true,
    interval: 5000,
    pagination: true,
    arrows: false,
    padding: '5rem',
    breakpoints: { 640: { padding: '2rem' } },
  }).mount();
};

const initThemeSwitcher = () => {
  const menu = document.querySelector('.theme-menu');
  if (!menu) return;
  const applyTheme = theme => {
    document.body.classList.remove('light-theme', 'dark-theme');
    if (theme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.add(dark ? 'dark-theme' : 'light-theme');
    } else {
      document.body.classList.add(`${theme}-theme`);
    }
  };
  menu.addEventListener('click', e => {
    const link = e.target.closest('a[data-theme]');
    if (!link) return;
    e.preventDefault();
    const theme = link.dataset.theme;
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  });
  applyTheme(localStorage.getItem('theme') || 'system');
};

// ------------------------------------------------------------------
// 2️⃣  FIRESTORE DATA LOADERS
// ------------------------------------------------------------------
const loadPublicPlans = async () => {
  const grid = document.getElementById('public-plans-grid');
  if (!grid) return;
  try {
    const q = query(collection(db, 'plans'), where('isActive', '==', true), orderBy('minAmount'));
    const snap = await getDocs(q);
    if (snap.empty) {
      grid.innerHTML = '<p>No investment plans are available at this time.</p>';
      return;
    }
    grid.innerHTML = snap.docs.map(doc => {
      const p = doc.data();
      const isFeatured = p.isFeatured === true;
      return `
        <div class="plan-card ${isFeatured ? 'featured' : ''}">
          ${isFeatured ? '<div class="plan-badge">Most Popular</div>' : ''}
          <h3 class="plan-title">${p.planName}</h3>
          <div class="plan-details">
            <p>Return: <strong>${p.roiPercent}% Daily</strong> for <strong>${p.durationDays} Days</strong></p>
          </div>
          <div class="plan-amount">${p.minAmount} - ${p.maxAmount}</div>
          <a href="register.html" class="btn btn-primary plan-btn">Invest Now</a>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('loadPublicPlans:', err);
    grid.innerHTML = '<p>Could not load investment plans. Please try again later.</p>';
  }
};

const loadBlogPreview = async () => {
  const grid = document.getElementById('blog-preview-grid');
  if (!grid) return;
  try {
    const q = query(collection(db, 'blogPosts'), where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(3));
    const snap = await getDocs(q);
    if (snap.empty) {
      grid.innerHTML = '<p>No recent articles found. Check back soon!</p>';
      return;
    }
    grid.innerHTML = snap.docs.map(doc => {
      const p = doc.data();
      const url = `post.html?id=${doc.id}`;
      const date = p.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      return `
        <div class="blog-post-card">
          <img src="${p.imageUrl || 'images/blog-placeholder.jpg'}" alt="${p.title}" class="blog-card-image">
          <div class="blog-card-content">
            <p class="blog-card-meta">
              <span>${date}</span> • <span>${p.likeCount || 0} Likes</span>
            </p>
            <h3 class="blog-card-title"><a href="${url}">${p.title}</a></h3>
            <p class="blog-card-snippet">${p.snippet || ''}</p>
            <a href="${url}" class="blog-card-read-more">Read More →</a>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('loadBlogPreview:', err);
    grid.innerHTML = '<p>Could not load articles at this time. Please try again later.</p>';
  }
};

const loadAllBlogPosts = async () => {
  const grid = document.getElementById('all-posts-grid');
  const pag = document.getElementById('blog-pagination');
  if (!grid || !pag) return;
  const postsPerPage = 6;
  const params = new URLSearchParams(location.search);
  let page = parseInt(params.get('page')) || 1;
  try {
    grid.innerHTML = '<p>Loading all articles...</p>';
    pag.innerHTML = '';
    const q = query(collection(db, 'blogPosts'), where('status', '==', 'published'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const docs = snap.docs;
    if (!docs.length) {
      grid.innerHTML = '<p>No articles have been published yet. Check back soon!</p>';
      return;
    }
    const total = Math.ceil(docs.length / postsPerPage);
    if (page > total) page = total;
    if (page < 1) page = 1;
    const start = (page - 1) * postsPerPage;
    const slice = docs.slice(start, start + postsPerPage);
    grid.innerHTML = slice.map(doc => {
      const p = doc.data();
      const url = `post.html?id=${doc.id}`;
      const date = p.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      return `
        <div class="blog-post-card">
          <img src="${p.imageUrl || 'images/blog-placeholder.jpg'}" alt="${p.title}" class="blog-card-image">
          <div class="blog-card-content">
            <p class="blog-card-meta">${date} • ${p.likeCount || 0} Likes</p>
            <h3><a href="${url}">${p.title}</a></h3>
            <p>${p.snippet || ''}</p>
            <a href="${url}">Read More →</a>
          </div>
        </div>`;
    }).join('');
    if (total > 1) {
      let html = `<a href="?page=${page - 1}" class="${page === 1 ? 'disabled' : ''}">← Prev</a>`;
      for (let i = 1; i <= total; i++) html += `<a href="?page=${i}" class="${i === page ? 'active' : ''}">${i}</a>`;
      html += `<a href="?page=${page + 1}" class="${page === total ? 'disabled' : ''}">Next →</a>`;
      pag.innerHTML = html;
    }
  } catch (err) {
    console.error('loadAllBlogPosts:', err);
    grid.innerHTML = '<p>Could not load articles at this time. Please try again later.</p>';
  }
};

const loadSinglePost = async () => {
  const container = document.getElementById('post-content-area');
  const interactions = document.getElementById('post-interactions');
  const comments = document.getElementById('comments-section');
  if (!container) return;
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    container.innerHTML = '<h1>Error: Post ID not found.</h1>';
    return;
  }
  try {
    const snap = await getDoc(doc(db, 'blogPosts', id));
    if (!snap.exists()) {
      container.innerHTML = '<h1>Post Not Found</h1>';
      return;
    }
    const p = snap.data();
    document.title = `${p.title} - Project Apex`;
    const date = p.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    container.innerHTML = `
      <h1 class="post-title">${p.title}</h1>
      <div class="post-meta">Published on ${date}</div>
      <img src="${p.imageUrl || 'images/blog-placeholder.jpg'}" alt="${p.title}" class="post-featured-image">
      <div class="post-body">${p.content}</div>`;
    if (interactions && comments) {
      interactions.style.display = 'block';
      comments.style.display = 'block';
      handleLikes(id, p);
      setupCommentForm(id);
      loadComments(id);
    }
  } catch (err) {
    console.error('loadSinglePost:', err);
    container.innerHTML = '<h1>Error loading post.</h1>';
  }
};

const loadRelatedPosts = async () => {
  const grid = document.getElementById('related-posts-grid');
  if (!grid) return;
  try {
    const q = query(collection(db, 'blogPosts'), where('status', '==', 'published'), orderBy('createdAt', 'desc'), limit(3));
    const snap = await getDocs(q);
    if (snap.empty) {
      grid.innerHTML = '<p>No related articles found.</p>';
      return;
    }
    grid.innerHTML = snap.docs.map(doc => {
      const p = doc.data();
      const url = `post.html?id=${doc.id}`;
      const date = p.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      return `
        <div class="blog-post-card">
          <img src="${p.imageUrl || 'images/blog-placeholder.jpg'}" alt="${p.title}" class="blog-card-image">
          <div class="blog-card-content">
            <p class="blog-card-meta">${date}</p>
            <h3><a href="${url}">${p.title}</a></h3>
            <p>${p.snippet || ''}</p>
            <a href="${url}">Read More →</a>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('loadRelatedPosts:', err);
    grid.innerHTML = '<p>Could not load related articles.</p>';
  }
};

// ------------------------------------------------------------------
// 3️⃣  POST INTERACTIONS
// ------------------------------------------------------------------
const handleLikes = async (postId, postData) => {
  const container = document.getElementById('post-interactions');
  if (!container) return;
  const count = postData.likeCount || 0;
  const liked = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  const already = liked.includes(postId);
  container.innerHTML = `
    <button class="like-btn ${already ? 'liked' : ''}" id="like-btn" ${already ? 'disabled' : ''}>
      <svg class="like-icon" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <span id="like-count">${count}</span> Likes
    </button>`;
  const btn = document.getElementById('like-btn');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.classList.add('liked');
    try {
      await updateDoc(doc(db, 'blogPosts', postId), { likeCount: increment(1) });
      document.getElementById('like-count').textContent = count + 1;
      localStorage.setItem('likedPosts', JSON.stringify([...liked, postId]));
    } catch {
      btn.disabled = false;
      btn.classList.remove('liked');
    }
  });
};

const setupCommentForm = postId => {
  const form = document.getElementById('comment-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    if (!name || !text) return alert('Please fill in both fields.');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Posting...';
    try {
      await addDoc(collection(db, 'blogPosts', postId, 'comments'), { name, text, createdAt: serverTimestamp() });
      form.reset();
      loadComments(postId);
    } catch {
      alert('Error posting comment.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Post Comment';
    }
  });
};

const loadComments = async postId => {
  const list = document.getElementById('comments-list');
  if (!list) return;
  list.innerHTML = '<p>Loading comments...</p>';
  try {
    const q = query(collection(db, 'blogPosts', postId, 'comments'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      list.innerHTML = '<p>Be the first to comment!</p>';
      return;
    }
    list.innerHTML = snap.docs.map(doc => {
      const c = doc.data();
      const date = c.createdAt?.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'Just now';
      return `
        <div class="comment-item">
          <p class="comment-text">${c.text}</p>
          <div class="comment-meta">
            <strong class="comment-author">${c.name}</strong>
            <span class="comment-date">${date}</span>
          </div>
        </div>`;
    }).join('');
  } catch {
    list.innerHTML = '<p>Could not load comments at this time.</p>';
  }
};

// ------------------------------------------------------------------
// 4️⃣  PRELOADER
// ------------------------------------------------------------------
window.addEventListener('load', () => {
  const pre = document.querySelector('.preloader');
  if (pre) {
    pre.style.opacity = '0';
    pre.style.visibility = 'hidden';
    pre.style.pointerEvents = 'none';
  }
});

// ------------------------------------------------------------------
// 5️⃣  DOM READY – INITIALISE EVERYTHING
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  animatedSections();
  initMobileToggle();
  initScrollTop();
  initNewsletter();
  initSplideSlider();

  const page = location.pathname.split('/').pop();
  if (page === 'index.html' || !page) {
    loadPublicPlans();
    loadBlogPreview();
  } else if (page === 'blog.html') {
    loadAllBlogPosts();
  } else if (page === 'post.html') {
    loadSinglePost();
    loadRelatedPosts();
  }
});