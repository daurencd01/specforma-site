import { supabase } from "./supabaseClient.js";

const isAdminPage = location.pathname.includes("admin");

if (isAdminPage) {
  console.log("[Global] Admin page detected — skipping public auth");
} else {
  initPublicAuth();
}

function initPublicAuth() {
  window.supabase = supabase;

  // Debug: log current session state on every page load
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log("[AUTH STEP]", {
      step: "script.js initPublicAuth",
      pathname: location.pathname,
      session: session,
      email: session?.user?.email,
      time: new Date().toISOString()
    });
  });
}


document.addEventListener('DOMContentLoaded', () => {
  if (isAdminPage) return;

  const WA_NUMBER = '77472828918';
  const PHONE_DISPLAY = '+7 747 28 28 918';

  /* --- Brand colour for mobile browser chrome --- */
  if (!document.querySelector('meta[name="theme-color"]')) {
    const themeMeta = document.createElement('meta');
    themeMeta.name = 'theme-color';
    themeMeta.content = '#0b1322';
    document.head.appendChild(themeMeta);
  }

  /* --- Fix broken lucide "instagram" icon (renamed in newer lucide) --- */
  const IG_SVG = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07zm0 1.62c-3.15 0-3.52.01-4.76.07-.95.04-1.47.2-1.81.34-.46.18-.78.39-1.12.73-.34.34-.55.66-.73 1.12-.13.34-.3.86-.34 1.81-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.95.2 1.47.34 1.81.18.46.39.78.73 1.12.34.34.66.55 1.12.73.34.13.86.3 1.81.34 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.95-.04 1.47-.2 1.81-.34.46-.18.78-.39 1.12-.73.34-.34.55-.66.73-1.12.13-.34.3-.86.34-1.81.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.95-.2-1.47-.34-1.81a3.02 3.02 0 0 0-.73-1.12 3.02 3.02 0 0 0-1.12-.73c-.34-.13-.86-.3-1.81-.34-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92zm0 1.62a3.84 3.84 0 1 0 0 7.68 3.84 3.84 0 0 0 0-7.68zm5.65-2.91a1.28 1.28 0 1 1 0 2.56 1.28 1.28 0 0 1 0-2.56z"/></svg>`;
  document.querySelectorAll('[data-lucide="instagram"]').forEach(el => {
    el.removeAttribute('data-lucide');
    el.innerHTML = IG_SVG;
    el.style.display = 'inline-flex';
  });

  /* --- Desktop header phone button --- */
  const headerActions = document.querySelector('.header .header-actions');
  if (headerActions && !headerActions.querySelector('.header-phone')) {
    const phoneBtn = document.createElement('a');
    phoneBtn.href = `tel:+${WA_NUMBER}`;
    phoneBtn.className = 'header-phone';
    phoneBtn.innerHTML =
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>` +
      `<span>${PHONE_DISPLAY}</span>`;
    headerActions.appendChild(phoneBtn);
  }

  /* --- Floating WhatsApp button (mobile-friendly) --- */
  if (!document.querySelector('.float-whatsapp')) {
    const fab = document.createElement('a');
    fab.href = `https://wa.me/${WA_NUMBER}`;
    fab.className = 'float-whatsapp';
    fab.target = '_blank';
    fab.rel = 'noopener noreferrer';
    fab.setAttribute('aria-label', 'Написать в WhatsApp');
    fab.innerHTML =
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>`;
    document.body.appendChild(fab);
  }

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
        .eq('hidden', false)
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

  // Auto-start on catalog page — но только если catalogCategories.js НЕ управляет страницей
  // catalogCategories.js наличие определяется по #categories-container
  const hasDynamicCatalog = !!document.getElementById('categories-container');
  if (document.getElementById('products-container') && !hasDynamicCatalog) {
    loadProducts();
  } else if (!hasDynamicCatalog) {
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
