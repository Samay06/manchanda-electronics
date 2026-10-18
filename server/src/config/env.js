import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/manchanda_electricals'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  // Enquiry email (all optional: if SMTP_HOST is empty, emails are logged instead of sent)
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  MAIL_FROM: z.string().default('Manchanda Electricals <no-reply@manchandaelectricals.com>'),
  ADMIN_EMAIL: z.string().default('admin@manchandaelectricals.com'),
  SEND_CUSTOMER_CONFIRMATION: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
});

export const env = schema.parse(process.env);
