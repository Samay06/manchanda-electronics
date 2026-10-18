const BASE = '/api';

async function request(path, params) {
  const qs = params
    ? '?' +
      new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      ).toString()
    : '';
  const res = await fetch(`${BASE}${path}${qs}`);
  if (!res.ok) {
    const err = new Error(`Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  categories: () => request('/categories'),
  brands: () => request('/brands'),
  products: (params) => request('/products', params),
  product: (slug) => request(`/products/${slug}`),
  async enquire(payload) {
    const res = await fetch(`${BASE}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Could not send enquiry'), { details: data.details });
    return data;
  },
};

export const productPath = (p) => `/fans/${p.category}/${p.seriesSlug}/${p.slug}`;
export const productImage = (p, i = 0) => p?.images?.[i]?.path || null;
