// Seeds MongoDB from data/products.json (output of scripts/extract/extract.py).
// Run:  cd server && npm run seed        (safe to re-run: collections are rebuilt)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDb, mongoose } from '../server/src/config/db.js';
import { Category } from '../server/src/models/Category.js';
import { Product } from '../server/src/models/Product.js';
import { Series } from '../server/src/models/Series.js';
import { slugify } from '../server/src/services/utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/products.json'), 'utf-8'));

const CATEGORY_ORDER = [
  'ceiling-fans',
  'table-fans',
  'pedestal-fans',
  'wall-fans',
  'exhaust-fans',
  'personal-fans',
  'industrial-fans',
];

await connectDb();

const products = raw.products.map((p) => ({
  ...p,
  vertical: 'fans',
  subCategorySlug: slugify(p.subCategory),
  seriesSlug: `${slugify(p.brand)}-${slugify(p.series)}`,
  images: p.images.map((i) => ({ ...i, path: `/${i.path}` })), // served from /images/...
}));

await Promise.all([Product.deleteMany({}), Category.deleteMany({}), Series.deleteMany({})]);
await Product.insertMany(products);

// Categories with their sub-categories
const catDocs = CATEGORY_ORDER.map((slug, order) => {
  const inCat = products.filter((p) => p.category === slug);
  const subs = [...new Map(inCat.map((p) => [p.subCategorySlug, p.subCategory])).entries()].map(([s, n]) => ({
    slug: s,
    name: n,
  }));
  return {
    slug,
    name: raw.categories[slug],
    vertical: 'fans',
    order,
    subCategories: subs,
    productCount: inCat.length,
  };
});
await Category.insertMany(catDocs);

// Series
const seriesMap = new Map();
for (const p of products) {
  const s =
    seriesMap.get(p.seriesSlug) ||
    { slug: p.seriesSlug, name: p.series, brand: p.brand, categories: [], productCount: 0, coverImage: undefined };
  if (!s.categories.includes(p.category)) s.categories.push(p.category);
  s.productCount += 1;
  s.coverImage ||= p.images[0]?.path;
  seriesMap.set(p.seriesSlug, s);
}
await Series.insertMany([...seriesMap.values()]);

console.log(
  `Seeded ${products.length} products, ${catDocs.length} categories, ${seriesMap.size} series into "${mongoose.connection.name}".`,
);
await mongoose.disconnect();
