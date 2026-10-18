import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { apiLimiter, errorHandler, notFound } from './middleware/index.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, '../../data/images');

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.CLIENT_ORIGIN.split(',') }));
  app.use(compression());
  app.use(express.json({ limit: '50kb' }));
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

  // Product images exported by scripts/extract (long cache: filenames are slug-based)
  app.use('/images', express.static(IMAGES_DIR, { maxAge: '30d', immutable: true }));
  app.use('/api', apiLimiter, routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await connectDb();
  createApp().listen(env.PORT, () => console.log(`API listening on http://localhost:${env.PORT}`));
}
