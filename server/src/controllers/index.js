import { z } from 'zod';
import { createEnquiry } from '../services/enquiry.js';
import { getProduct, listBrands, listCategories, listProducts } from '../services/catalogue.js';

export const productQuerySchema = z.object({
  brand: z.string().max(40).optional(),
  category: z.string().max(60).optional(),
  subCategory: z.string().max(60).optional(),
  series: z.string().max(80).optional(),
  search: z.string().trim().max(80).optional(),
  sweepMin: z.coerce.number().min(0).max(5000).optional(),
  sweepMax: z.coerce.number().min(0).max(5000).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});

export const getCategories = async (req, res, next) => {
  try {
    res.json(await listCategories());
  } catch (e) {
    next(e);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    res.json(await listBrands());
  } catch (e) {
    next(e);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    res.json(await listProducts(req.validQuery));
  } catch (e) {
    next(e);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const result = await getProduct(req.params.slug);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    res.json(result);
  } catch (e) {
    next(e);
  }
};

export const postEnquiry = async (req, res, next) => {
  try {
    if (req.body.website) return res.status(201).json({ ok: true }); // honeypot tripped: pretend success
    const enquiry = await createEnquiry(req.body, req.ip);
    res.status(201).json({ ok: true, id: enquiry._id, emailSent: enquiry.emailSent });
  } catch (e) {
    next(e);
  }
};
