// js/categoryMap.js
// Единый маппинг slug → человекочитаемое название категории.
// Используется в: catalogCategories.js, homepageCategories.js, admin.html
// Значения в БД (slug) остаются неизменными.

export const categoryLabels = {
    clothes: "Спецодежда",
    shoes: "Спецобувь",
    siz: "Зимняя спецодежда",
    accessories: "Аксессуары",
    welding: "Сварочная форма",
};

// Изображения для карточек категорий (homepage + catalog)
export const categoryImages = {
    clothes: "https://images.unsplash.com/photo-1541888086225-ee89dd5da9ad?auto=format&fit=crop&q=80&w=800",
    shoes: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=800",
    siz: "https://images.unsplash.com/photo-1565516087856-787bc12d28f8?auto=format&fit=crop&q=80&w=800",
    accessories: "https://images.unsplash.com/photo-1588693892040-af46f2fc27f0?auto=format&fit=crop&q=80&w=800",
    welding: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
};

// Fallback-фото для неизвестных категорий
export const CATEGORY_FALLBACK_IMG =
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800";

/**
 * Возвращает человекочитаемое название категории по slug.
 * Если slug неизвестен — возвращает сам slug (graceful fallback).
 * @param {string} slug — значение из БД (clothes, shoes, siz, accessories, welding, ...)
 * @returns {string}
 */
export function getCategoryLabel(slug) {
    return categoryLabels[slug] ?? slug;
}

/**
 * Возвращает URL обложки для категории.
 * @param {string} slug
 * @returns {string}
 */
export function getCategoryImage(slug) {
    return categoryImages[slug] ?? CATEGORY_FALLBACK_IMG;
}
