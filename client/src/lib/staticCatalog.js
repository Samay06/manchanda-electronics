import rawData from '../data/products.json';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CATEGORY_ORDER = [
  'ceiling-fans',
  'table-fans',
  'pedestal-fans',
  'wall-fans',
  'exhaust-fans',
  'personal-fans',
  'industrial-fans',
];

// Pre-process all products
const allProducts = (rawData.products || []).map((p) => {
  const brandSlug = slugify(p.brand);
  const seriesSlug = `${brandSlug}-${slugify(p.series)}`;
  const subCategorySlug = slugify(p.subCategory);
  const categoryName = rawData.categories?.[p.category] || p.category;

  return {
    ...p,
    published: true,
    categoryName,
    subCategorySlug,
    seriesSlug,
    images: (p.images || []).map((img) => ({
      ...img,
      path: img.path.startsWith('/') ? img.path : `/${img.path}`,
    })),
  };
});

// Build categories
const allCategories = CATEGORY_ORDER.map((slug, order) => {
  const inCat = allProducts.filter((p) => p.category === slug);
  const subs = [...new Map(inCat.map((p) => [p.subCategorySlug, p.subCategory])).entries()].map(
    ([s, n]) => ({ slug: s, name: n }),
  );

  // Group series in this category
  const seriesMap = new Map();
  for (const p of inCat) {
    if (!seriesMap.has(p.seriesSlug)) {
      seriesMap.set(p.seriesSlug, {
        slug: p.seriesSlug,
        name: p.series,
        brand: p.brand,
        productCount: 0,
      });
    }
    seriesMap.get(p.seriesSlug).productCount += 1;
  }

  // Brands count in category
  const brandCountMap = {};
  for (const p of inCat) {
    brandCountMap[p.brand] = (brandCountMap[p.brand] || 0) + 1;
  }
  const brands = Object.entries(brandCountMap).map(([brand, count]) => ({ brand, count }));

  return {
    slug,
    name: rawData.categories?.[slug] || slug,
    vertical: 'fans',
    order,
    subCategories: subs,
    series: Array.from(seriesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    brands,
    productCount: inCat.length,
  };
});

// Build brands summary
const allBrands = [
  { brand: 'Havells', count: allProducts.filter((p) => p.brand === 'Havells').length },
  { brand: 'Orient', count: allProducts.filter((p) => p.brand === 'Orient').length },
];

export const staticApi = {
  async categories() {
    return allCategories;
  },

  async brands() {
    return allBrands;
  },

  async products(params = {}) {
    const {
      category,
      series,
      brand,
      subCategory,
      search,
      sweepMin,
      sweepMax,
      page = 1,
      limit = 24,
      sort,
    } = params;

    let filtered = allProducts;

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (series) {
      filtered = filtered.filter((p) => p.seriesSlug === series);
    }
    if (brand) {
      filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }
    if (subCategory) {
      filtered = filtered.filter((p) => p.subCategorySlug === subCategory);
    }
    if (sweepMin || sweepMax) {
      const min = sweepMin ? Number(sweepMin) : 0;
      const max = sweepMax ? Number(sweepMax) : 99999;
      filtered = filtered.filter((p) => {
        const sweeps = p.specs?.sweepMm || [];
        return sweeps.some((s) => s >= min && s <= max);
      });
    }
    if (search) {
      const q = String(search).toLowerCase().trim();
      filtered = filtered.filter((p) => {
        return (
          p.name?.toLowerCase().includes(q) ||
          p.series?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.subCategory?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        );
      });
    }

    if (sort === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = filtered.length;
    const start = (Number(page) - 1) * Number(limit);
    const items = filtered.slice(start, start + Number(limit));

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    };
  },

  async product(slug) {
    const found = allProducts.find((p) => p.slug === slug);
    if (!found) return null;

    const moreInSeries = allProducts
      .filter((p) => p.seriesSlug === found.seriesSlug && p.slug !== found.slug)
      .slice(0, 4);

    const related = allProducts
      .filter(
        (p) =>
          p.category === found.category &&
          p.slug !== found.slug &&
          p.seriesSlug !== found.seriesSlug,
      )
      .slice(0, 4);

    return {
      product: found,
      moreInSeries,
      related,
    };
  },

  async enquire(payload) {
    try {
      const stored = JSON.parse(localStorage.getItem('manchanda_enquiries') || '[]');
      const id = 'ENQ-' + Date.now();
      stored.unshift({ id, date: new Date().toISOString(), ...payload });
      localStorage.setItem('manchanda_enquiries', JSON.stringify(stored));
      return { ok: true, id, local: true };
    } catch {
      return { ok: true, id: 'ENQ-' + Date.now() };
    }
  },
};
