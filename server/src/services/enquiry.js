import { z } from 'zod';
import { Enquiry } from '../models/Enquiry.js';
import { Product } from '../models/Product.js';
import { sendEnquiryEmails } from './mailer.js';

const phoneRx = /^[+()\-\s\d]{8,18}$/;

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(phoneRx, 'Enter a valid phone number'),
  email: z.union([z.literal(''), z.string().trim().email().max(120)]).default(''),
  company: z.string().trim().max(120).optional().default(''),
  city: z.string().trim().min(2).max(80),
  message: z.string().trim().max(1500).optional().default(''),
  preferredContactTime: z.string().trim().max(60).optional().default(''),
  source: z.enum(['basket', 'single', 'contact']).default('basket'),
  items: z
    .array(z.object({ slug: z.string().min(1).max(160), quantity: z.coerce.number().int().min(1).max(10000) }))
    .max(50)
    .default([]),
  website: z.string().max(200).optional(), // honeypot: real users leave it empty; controller discards filled ones
});

export async function createEnquiry(data, ip) {
  const slugs = data.items.map((i) => i.slug);
  const products = await Product.find({ slug: { $in: slugs } }).select('slug name brand').lean();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = data.items
    .filter((i) => bySlug.has(i.slug))
    .map((i) => {
      const p = bySlug.get(i.slug);
      return { product: p._id, slug: p.slug, name: p.name, brand: p.brand, quantity: i.quantity };
    });
  const { website, ...rest } = data; // eslint-disable-line no-unused-vars
  const enquiry = await Enquiry.create({ ...rest, items, ip });
  try {
    await sendEnquiryEmails(enquiry);
    enquiry.emailSent = true;
    await enquiry.save();
  } catch (err) {
    // The enquiry is already saved; never lose a lead because the mail server failed.
    console.error('Enquiry email failed:', err.message);
  }
  return enquiry;
}
