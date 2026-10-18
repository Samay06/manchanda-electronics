import { staticApi } from './staticCatalog.js';

const BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, params) {
  const qs = params
    ? '?' +
      new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      ).toString()
    : '';

  try {
    const res = await fetch(`${BASE}${path}${qs}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline / not deployed on Vercel: fallback to static catalog below
  }

  // Fallback to embedded static catalog
  if (path === '/categories') {
    return staticApi.categories();
  }
  if (path === '/brands') {
    return staticApi.brands();
  }
  if (path === '/products') {
    return staticApi.products(params);
  }
  if (path.startsWith('/products/')) {
    const slug = path.replace('/products/', '');
    const data = await staticApi.product(slug);
    if (!data) {
      const err = new Error('Product not found');
      err.status = 404;
      throw err;
    }
    return data;
  }

  throw new Error(`Endpoint ${path} not available`);
}

export const api = {
  categories: () => request('/categories'),
  brands: () => request('/brands'),
  products: (params) => request('/products', params),
  product: (slug) => request(`/products/${slug}`),
  async enquire(payload) {
    try {
      const res = await fetch(`${BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Backend offline / not deployed on Vercel
    }
    return staticApi.enquire(payload);
  },
};

export const productPath = (p) => `/fans/${p.category}/${p.seriesSlug}/${p.slug}`;
export const productImage = (p, i = 0) => p?.images?.[i]?.path || null;
