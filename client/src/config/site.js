// Single place for business details and feature flags.
export const site = {
  name: 'Manchanda Electricals',
  tagline: 'Powering Everyday',
  since: 1983,
  address: 'G-21, 1767/68, Electric Market, Bhagirath Palace, Chandni Chowk, Delhi 110006',
  // Fill these in once the client confirms them.
  phone: import.meta.env.VITE_PHONE || '',
  whatsapp: import.meta.env.VITE_WHATSAPP || '', // digits only, with country code e.g. 919999999999
  email: import.meta.env.VITE_EMAIL || '',

  // Diwali offer ribbon: flip `enabled` (or set VITE_DIWALI_OFFER=false) to hide it site-wide.
  diwaliOffer: {
    enabled: import.meta.env.VITE_DIWALI_OFFER !== 'false',
    text: 'Diwali special offers on bulk orders — enquire for details',
  },

  brands: ['Havells', 'Orient Electric'],
};

export const yearsInBusiness = new Date().getFullYear() - site.since;

export const whatsappLink = (text = 'Hello Manchanda Electricals, I would like to enquire about fans.') =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : null;
