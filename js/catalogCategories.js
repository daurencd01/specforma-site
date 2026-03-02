// js/catalogCategories.js
// Динамически загружает категории и товары из Supabase для catalog.html.
// Не трогает auth, admin guard, supabaseClient.js.
// ✅ Поддерживает realtime | ✅ Безопасный fallback | ✅ Фильтрация без reload

import { supabase } from "./supabaseClient.js";

// ── State ─────────────────────────────────────────────────────
let activeCategory = "all"; // 'all' или название категории из БД
let catalogChannel = null;

// ── Helpers ───────────────────────────────────────────────────

function parseImages(raw) {
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw || "[]"); } catch { return []; }
}

// ── Load Categories ───────────────────────────────────────────

async function loadCategories() {
    console.log("[Catalog] Loading categories from Supabase...");
    try {
        const { data, error } = await supabase
            .from("products")
            .select("category")
            .eq("hidden", false);

        if (error) {
            console.warn("[Catalog] Categories error:", error.message);
            renderCategoryButtons([]);
            return;
        }

        if (!data || !data.length) {
            renderCategoryButtons([]);
            return;
        }

        // Дедупликация + сортировка
        const unique = [
            ...new Set(
                data
                    .map(p => p.category?.trim())
                    .filter(Boolean)
            ),
        ].sort((a, b) => a.localeCompare(b, "ru"));

        console.log("[Catalog] Unique categories:", unique);
        renderCategoryButtons(unique);
    } catch (err) {
        console.warn("[Catalog] Unexpected categories error:", err);
        renderCategoryButtons([]);
    }
}

// ── Render Category Buttons ───────────────────────────────────

function renderCategoryButtons(categories) {
    const container = document.getElementById("categories-container");
    if (!container) return;

    container.innerHTML = "";

    // Кнопка "Все товары" — всегда первая
    const allBtn = document.createElement("button");
    allBtn.className = "filter-btn" + (activeCategory === "all" ? " active" : "");
    allBtn.setAttribute("data-category", "all");
    allBtn.textContent = "Все товары";
    allBtn.addEventListener("click", () => onCategoryClick("all", allBtn));
    container.appendChild(allBtn);

    // Кнопки из БД
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "filter-btn" + (activeCategory === cat ? " active" : "");
        btn.setAttribute("data-category", cat);
        btn.textContent = cat;
        btn.addEventListener("click", () => onCategoryClick(cat, btn));
        container.appendChild(btn);
    });

    // После рендера категорий — применить текущий URL-параметр (если есть)
    applyUrlCategory();
}

// ── Category Click Handler ────────────────────────────────────

function onCategoryClick(category, clickedBtn) {
    activeCategory = category;

    // Обновить active-класс
    document.querySelectorAll("#categories-container .filter-btn").forEach(b => {
        b.classList.remove("active");
    });
    clickedBtn.classList.add("active");

    loadProducts(category);
}

// ── Apply URL ?cat= param ─────────────────────────────────────

function applyUrlCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get("cat");
    if (!cat) return;

    const btn = document.querySelector(
        `#categories-container .filter-btn[data-category="${CSS.escape(cat)}"]`
    );
    if (btn) {
        btn.click();
    } else {
        // Категория пришла из URL, но кнопки ещё нет — просто загружаем
        activeCategory = cat;
        loadProducts(cat);
    }
}

// ── Load Products ─────────────────────────────────────────────

async function loadProducts(category = "all") {
    const container = document.getElementById("products-container");
    if (!container) return;

    // Показываем скелетон
    container.innerHTML = `
        <div class="product-card skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="product-info">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-desc"></div>
                <div class="skeleton skeleton-price"></div>
            </div>
        </div>
        <div class="product-card skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="product-info">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-desc"></div>
                <div class="skeleton skeleton-price"></div>
            </div>
        </div>
        <div class="product-card skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="product-info">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-desc"></div>
                <div class="skeleton skeleton-price"></div>
            </div>
        </div>`;

    console.log(`[Catalog] Loading products, category="${category}"...`);

    try {
        let query = supabase
            .from("products")
            .select("*")
            .eq("hidden", false)
            .order("created_at", { ascending: false });

        if (category !== "all") {
            query = query.eq("category", category);
        }

        const { data, error } = await query;

        if (error) {
            console.warn("[Catalog] Products error:", error.message);
            showFallback(container);
            return;
        }

        console.log(`[Catalog] Products loaded: ${data?.length ?? 0}`);
        renderProducts(container, data);

    } catch (err) {
        console.warn("[Catalog] Unexpected products error:", err);
        showFallback(container);
    }
}

// ── Show static fallback ──────────────────────────────────────

function showFallback(container) {
    if (!container) return;
    const staticEl = document.getElementById("static-products");
    container.style.display = "none";
    if (staticEl) staticEl.style.display = "grid";
}

// ── Render Products ───────────────────────────────────────────

function renderProducts(container, products) {
    if (!container) return;

    container.style.display = "";
    const staticEl = document.getElementById("static-products");
    if (staticEl) staticEl.style.display = "none";

    if (!products || products.length === 0) {
        container.innerHTML = `
            <p style="grid-column:1/-1; text-align:center; padding:60px 0;
                       color:var(--text-muted, #64748b); font-size:1rem;">
                В этой категории пока нет товаров.<br>
                Свяжитесь с нами в WhatsApp для уточнения наличия.
            </p>`;
        return;
    }

    container.innerHTML = "";

    products.forEach((product, i) => {
        const category = product.category || "";
        const name = product.name || "Товар";
        const price = product.price
            ? `${Number(product.price).toLocaleString("ru")} ₸`
            : "По запросу";
        const description = product.description || "";
        const waText = encodeURIComponent(`Здравствуйте, интересует ${name}`);
        const badge = product.badge
            ? `<span class="product-badge">${product.badge}</span>`
            : "";

        const images = parseImages(product.images);
        const fallback =
            "https://images.unsplash.com/photo-1541888086225-ee89dd5da9ad?auto=format&fit=crop&q=80&w=600";

        const imgTags =
            images.length > 0
                ? images
                    .map(
                        (src, idx) =>
                            `<img src="${src}" class="${idx === 0 ? "active" : ""}"
                                  alt="${name} вид ${idx + 1}" loading="lazy"
                                  onerror="this.src='${fallback}'">`
                    )
                    .join("")
                : `<img src="${fallback}" class="active" alt="${name}" loading="lazy">`;

        const arrowBtns =
            images.length > 1
                ? `<button class="slide-btn prev"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
                       <polyline points="15 18 9 12 15 6"/></svg></button>
                   <button class="slide-btn next"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                       stroke-linecap="round" stroke-linejoin="round">
                       <polyline points="9 18 15 12 9 6"/></svg></button>`
                : "";

        const card = document.createElement("div");
        card.className = "product-card animate-on-scroll";
        card.setAttribute("data-category", category);
        if (i > 0) card.style.transitionDelay = `${(i % 3) * 100}ms`;

        card.innerHTML = `
            <div class="product-img-wrap product-slider">
                ${badge}
                <div class="slides">${imgTags}</div>
                ${arrowBtns}
            </div>
            <div class="product-info">
                <h3 class="product-title">${name}</h3>
                ${description ? `<p class="product-desc">${description}</p>` : ""}
                <div class="product-footer">
                    <span class="product-price">${price}</span>
                    <a href="https://wa.me/77472828918?text=${waText}"
                       class="btn-whatsapp-sm" target="_blank" rel="noopener">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7
                                     8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1
                                     -.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5
                                     a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        Заказать
                    </a>
                </div>
            </div>`;

        container.appendChild(card);

        // Init image slider
        const sliderEl = card.querySelector(".product-slider");
        if (sliderEl) initSlider(sliderEl);

        // Scroll animation
        scrollObserver.observe(card);
    });

    if (typeof lucide !== "undefined") lucide.createIcons();
}

// ── Slider Logic ──────────────────────────────────────────────

function initSlider(slider) {
    const slides = slider.querySelectorAll(".slides img");
    const prevBtn = slider.querySelector(".slide-btn.prev");
    const nextBtn = slider.querySelector(".slide-btn.next");

    if (slides.length <= 1) {
        if (prevBtn) prevBtn.style.display = "none";
        if (nextBtn) nextBtn.style.display = "none";
        return;
    }

    let current = 0;
    const show = idx => {
        slides.forEach(s => s.classList.remove("active"));
        if (idx >= slides.length) current = 0;
        else if (idx < 0) current = slides.length - 1;
        else current = idx;
        slides[current].classList.add("active");
    };

    if (prevBtn) prevBtn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); show(--current); });
    if (nextBtn) nextBtn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); show(++current); });

    let startX = 0;
    slider.addEventListener("touchstart", e => { startX = e.changedTouches[0].screenX; }, { passive: true });
    slider.addEventListener("touchend", e => {
        const diff = startX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 40) diff > 0 ? show(++current) : show(--current);
    }, { passive: true });
}

// ── Scroll Animation Observer ─────────────────────────────────

const scrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// ── Realtime Subscription ─────────────────────────────────────

function subscribeRealtime() {
    try {
        if (catalogChannel) {
            supabase.removeChannel(catalogChannel);
            catalogChannel = null;
        }

        catalogChannel = supabase
            .channel("catalog-products-watch")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "products" },
                () => {
                    console.log("[Realtime] Catalog update triggered");
                    loadCategories();
                    loadProducts(activeCategory);
                }
            )
            .subscribe(status => {
                if (status === "SUBSCRIBED") {
                    console.log("[Realtime] Catalog channel connected ✅");
                } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    console.warn("[Realtime] Catalog channel error:", status, "— retry in 5s");
                    setTimeout(subscribeRealtime, 5000);
                }
            });
    } catch (err) {
        console.warn("[Realtime] Failed to subscribe catalog:", err);
    }
}

// ── Init ──────────────────────────────────────────────────────

(async function init() {
    // Проверяем, что мы на catalog.html (есть #categories-container)
    if (!document.getElementById("categories-container")) return;

    await loadCategories();
    // loadProducts() вызывается из applyUrlCategory() или рендером кнопок
    // Если URL не содержит ?cat= — загружаем всё
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get("cat")) {
        loadProducts("all");
    }

    subscribeRealtime();
})();
