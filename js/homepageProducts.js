// js/homepageProducts.js
// Loads and realtime-syncs the latest 4 products on index.html.
// Does NOT redirect, does NOT touch auth logic.

import { supabase } from "./supabaseClient.js";

const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1541888086225-ee89dd5da9ad?auto=format&fit=crop&q=80&w=600";

const CAT_LABELS = {
    clothes: "Спецодежда",
    siz: "Зимняя",
    shoes: "Спецобувь",
    accessories: "Аксессуары",
};

// ── Helpers ──────────────────────────────────────────────────

function parseImages(raw) {
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw || "[]"); } catch { return []; }
}

// ── Render ───────────────────────────────────────────────────

function renderHomepageProducts(products) {
    const container = document.getElementById("homepage-products");
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
      <p style="color:var(--text-muted);grid-column:1/-1;
                text-align:center;padding:40px 0">
        Товары ещё не добавлены. Следите за обновлениями!
      </p>`;
        return;
    }

    container.innerHTML = "";

    products.forEach((p, i) => {
        const images = parseImages(p.images);
        const thumb = images[0] || FALLBACK_IMG;
        const price = p.price
            ? `${Number(p.price).toLocaleString("ru")} ₸`
            : "По запросу";
        const cat = CAT_LABELS[p.category] || p.category || "";
        const name = p.name || "Товар";
        const waText = encodeURIComponent(`Здравствуйте, интересует ${name}`);

        const card = document.createElement("div");
        card.className = "product-card animate-on-scroll";
        card.style.transitionDelay = `${(i % 4) * 80}ms`;

        card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${thumb}" alt="${name}" loading="lazy"
             onerror="this.src='${FALLBACK_IMG}'">
      </div>
      <div class="product-info">
        <h3 class="product-title">${name}</h3>
        ${cat
                ? `<p class="product-desc"
               style="font-size:.75rem;color:var(--text-muted);margin:0 0 6px">
               ${cat}
             </p>`
                : ""}
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
    });

    if (typeof lucide !== "undefined") lucide.createIcons();
}

// ── Fetch ────────────────────────────────────────────────────

async function loadHomepageProducts() {
    console.log("[Homepage] Loading products from Supabase...");
    try {
        const { data, error } = await supabase
            .from("products")
            .select("id, name, category, price, images, created_at")
            .order("created_at", { ascending: false })
            .limit(4);

        if (error) {
            console.warn("[Homepage] Supabase error:", error.message);
            renderHomepageProducts(null);
            return;
        }

        console.log("[Homepage] Loaded:", data?.length ?? 0, "products");
        renderHomepageProducts(data);
    } catch (err) {
        // Never crash the page — show empty state
        console.warn("[Homepage] Unexpected error:", err);
        renderHomepageProducts(null);
    }
}

// ── Realtime Subscription ────────────────────────────────────

let productsChannel = null;

function subscribeToProducts() {
    try {
        // Prevent duplicate listeners
        if (productsChannel) {
            supabase.removeChannel(productsChannel);
            productsChannel = null;
        }

        productsChannel = supabase
            .channel("products-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "products" },
                async () => {
                    console.log("[Realtime] Update Triggered — reloading products...");
                    await loadHomepageProducts();
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    console.log("[Realtime] Connected ✅");
                } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    console.warn("[Realtime] Channel error:", status, "— retry in 5s");
                    setTimeout(subscribeToProducts, 5000);
                }
            });
    } catch (err) {
        // Fail silently — static page still works without realtime
        console.warn("[Realtime] Failed to subscribe:", err);
    }
}

// ── Init ─────────────────────────────────────────────────────

loadHomepageProducts();
subscribeToProducts();
