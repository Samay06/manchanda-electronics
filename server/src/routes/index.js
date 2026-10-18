import { Router } from 'express';
import {
  getBrands,
  getCategories,
  getProductBySlug,
  getProducts,
  postEnquiry,
  productQuerySchema,
} from '../controllers/index.js';
import { enquiryLimiter, validate } from '../middleware/index.js';
import { enquirySchema } from '../services/enquiry.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/products', validate(productQuerySchema, 'query'), getProducts);
router.get('/products/:slug', getProductBySlug);
router.post('/enquiries', enquiryLimiter, validate(enquirySchema), postEnquiry);

export default router;
