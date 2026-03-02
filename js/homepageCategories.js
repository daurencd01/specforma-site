// js/homepageCategories.js
// Динамически загружает уникальные категории из таблицы products
// и рендерит их на главной странице вместо статических карточек.
// Не касается auth логики, admin.html, redirect.

import { supabase } from "./supabaseClient.js";
import { getCategoryLabel, getCategoryImage, CATEGORY_FALLBACK_IMG } from "./categoryMap.js";

// ── Render ────────────────────────────────────────────────────

function renderCategories(slugs) {
    const container = document.getElementById("homepage-categories");
    if (!container) return;

    if (!slugs || slugs.length === 0) {
        // Keep section hidden — no categories yet
        container.innerHTML = "";
        const section = container.closest("section");
        if (section) section.style.display = "none";
        return;
    }

    const section = container.closest("section");
    if (section) section.style.display = "";

    container.innerHTML = "";

    slugs.forEach((slug, i) => {
        const label = getCategoryLabel(slug);
        const img = getCategoryImage(slug);

        const a = document.createElement("a");
        a.href = `catalog.html?cat=${encodeURIComponent(slug)}`;
        a.className = "category-card animate-on-scroll";
        if (i % 2 !== 0) a.style.transitionDelay = "100ms";

        a.innerHTML = `
      <img src="${img}" alt="${label}" class="category-img"
           loading="lazy" onerror="this.src='${CATEGORY_FALLBACK_IMG}'">
      <div class="category-overlay"></div>
      <div class="category-content">
        <h3 class="category-title">${label}</h3>
        <div class="category-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>`;

        container.appendChild(a);
    });

    // Re-init lucide icons for freshly rendered elements
    if (typeof lucide !== "undefined") lucide.createIcons();

    // Kick off IntersectionObserver for animate-on-scroll cards
    document.querySelectorAll("#homepage-categories .animate-on-scroll").forEach(el => {
        observer.observe(el);
    });
}

// ── Scroll animation observer (mirrors script.js) ─────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

// ── Fetch ─────────────────────────────────────────────────────

async function loadHomepageCategories() {
    console.log("[Categories] Loading from Supabase...");
    try {
        const { data, error } = await supabase
            .from("products")
            .select("category")
            .eq("hidden", false);

        if (error) {
            console.warn("[Categories] Supabase error:", error.message);
            return;
        }

        // Deduplicate, filter empty values
        const uniqueSlugs = [
            ...new Set(
                (data ?? [])
                    .map(p => p.category?.trim())
                    .filter(Boolean)
            ),
        ];

        console.log("[Categories] Unique categories found:", uniqueSlugs);
        renderCategories(uniqueSlugs);
    } catch (err) {
        // Fail silently — static fallback HTML stays visible
        console.warn("[Categories] Unexpected error:", err);
    }
}

// ── Realtime Subscription ──────────────────────────────────────

let categoriesChannel = null;

function subscribeToCategories() {
    try {
        if (categoriesChannel) {
            supabase.removeChannel(categoriesChannel);
            categoriesChannel = null;
        }

        categoriesChannel = supabase
            .channel("products-category-watch")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "products" },
                () => {
                    console.log("[Realtime] Categories update triggered");
                    loadHomepageCategories();
                }
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    console.log("[Realtime] Categories channel connected ✅");
                } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
                    console.warn("[Realtime] Categories channel error:", status, "— retry in 5s");
                    setTimeout(subscribeToCategories, 5000);
                }
            });
    } catch (err) {
        console.warn("[Realtime] Failed to subscribe categories:", err);
    }
}

// ── Init ──────────────────────────────────────────────────────

loadHomepageCategories();
subscribeToCategories();
