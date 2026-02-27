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
  function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length === 0) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterValue = btn.getAttribute('data-filter');

        const productCards = document.querySelectorAll('#products-container .product-card, #static-products .product-card');
        productCards.forEach(card => {
          if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => { card.style.display = 'none'; }, 300);
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

  /* --- Supabase: Load Products --- */
  function initSliderForElement(slider) {
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
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); currentIndex--; showSlide(currentIndex); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); currentIndex++; showSlide(currentIndex); });
    let startX = 0;
    slider.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) { diff > 0 ? currentIndex++ : currentIndex--; showSlide(currentIndex); }
    }, { passive: true });
  }

  function renderProducts(products) {
    const container = document.getElementById('products-container');
    const staticEl = document.getElementById('static-products');
    if (!container) return;

    if (!products || products.length === 0) {
      // Fallback to static products
      container.style.display = 'none';
      if (staticEl) staticEl.style.display = 'grid';
      initFilters();
      return;
    }

    container.innerHTML = '';
    products.forEach((product, i) => {
      const category = product.category || 'clothes';
      const name = product.name || 'Товар';
      const price = product.price ? `${Number(product.price).toLocaleString('ru')} ₸` : 'По запросу';
      const description = product.description || '';
      const waText = encodeURIComponent(`Здравствуйте, интересует ${name}`);
      const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';

      // Images: product.images is expected to be a JSON array of URLs
      let images = [];
      try {
        images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
      } catch { images = []; }

      const fallback = 'https://images.unsplash.com/photo-1541888086225-ee89dd5da9ad?auto=format&fit=crop&q=80&w=600';
      const imgTags = images.length > 0
        ? images.map((src, idx) => `<img src="${src}" class="${idx === 0 ? 'active' : ''}" alt="${name} вид ${idx + 1}" loading="lazy">`).join('')
        : `<img src="${fallback}" class="active" alt="${name}" loading="lazy">`;

      const arrowBtns = images.length > 1
        ? `<button class="slide-btn prev"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
           <button class="slide-btn next"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>`
        : '';

      const card = document.createElement('div');
      card.className = 'product-card animate-on-scroll';
      card.setAttribute('data-category', category);
      if (i > 0) card.style.transitionDelay = `${(i % 3) * 100}ms`;

      card.innerHTML = `
        <div class="product-img-wrap product-slider">
          ${badge}
          <div class="slides">${imgTags}</div>
          ${arrowBtns}
        </div>
        <div class="product-info">
          <h3 class="product-title">${name}</h3>
          ${description ? `<p class="product-desc">${description}</p>` : ''}
          <div class="product-footer">
            <span class="product-price">${price}</span>
            <a href="https://wa.me/77472828918?text=${waText}" class="btn-whatsapp-sm" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Заказать
            </a>
          </div>
        </div>`;

      container.appendChild(card);

      // Init slider for this card
      const sliderEl = card.querySelector('.product-slider');
      if (sliderEl) initSliderForElement(sliderEl);

      // Observe for animation
      observer.observe(card);
    });

    initFilters();
    // Re-init icons if lucide available
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return; // Not on catalog page

    try {
      const { data, error } = await window.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        renderProducts(null); // Show static fallback
        return;
      }

      renderProducts(data);
    } catch (err) {
      console.error('Load error:', err);
      renderProducts(null); // Show static fallback
    }
  }

  // Auto-start on catalog page
  if (document.getElementById('products-container')) {
    loadProducts();
  } else {
    initFilters(); // For pages without dynamic products
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
