import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://hdkdxtotusteqqbvhloi.supabase.co";
const supabaseKey = "sb_publishable_9pKEOQ3uBNK-XK4dxk8SlA_1RQrROSj";

window.supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
  /* --- Header Scroll Effect --- */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Check initial state
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    }
  }

  /* --- Mobile Menu --- */
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.overlay');

  if (mobileMenuBtn && mobileMenu && overlay) {
    const openMenu = () => {
      mobileMenu.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    mobileMenuBtn.addEventListener('click', openMenu);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
  }

  /* --- Scroll Animations (Intersection Observer) --- */
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  /* --- Catalog Filtering (if present) --- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  if (filterBtns.length > 0 && productCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        productCards.forEach(card => {
          if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
            card.style.display = 'flex';
            // Slight delay for smooth reappearance
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });

    // Quick URL-based filter
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    if (cat) {
      const btn = document.querySelector(`.filter-btn[data-filter="${cat}"]`);
      if (btn) btn.click();
    }
  }

  // Set current year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Product Image Slider
  const sliders = document.querySelectorAll('.product-slider');
  sliders.forEach(slider => {
    const slides = slider.querySelectorAll('.slides img');
    const prevBtn = slider.querySelector('.slide-btn.prev');
    const nextBtn = slider.querySelector('.slide-btn.next');
    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    let currentIndex = 0;

    const showSlide = (index) => {
      slides.forEach(s => s.classList.remove('active'));
      if (index >= slides.length) currentIndex = 0;
      else if (index < 0) currentIndex = slides.length - 1;
      else currentIndex = index;
      slides[currentIndex].classList.add('active');
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex--;
        showSlide(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex++;
        showSlide(currentIndex);
      });
    }

    // Touch Swipe Logic
    let startX = 0;
    let endX = 0;

    slider.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const threshold = 40; // minimum swipe distance
      if (startX - endX > threshold) {
        // Swipe left -> Next image
        currentIndex++;
        showSlide(currentIndex);
      } else if (endX - startX > threshold) {
        // Swipe right -> Prev image
        currentIndex--;
        showSlide(currentIndex);
      }
    };
  });

  // Initialize icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    // Fallback if not loaded yet
    window.addEventListener('load', () => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }
});
