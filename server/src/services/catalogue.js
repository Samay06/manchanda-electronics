import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Series } from '../models/Series.js';
import { escapeRegex } from './utils.js';

const LIST_FIELDS =
  'slug name tagline brand category categoryName subCategory subCategorySlug series seriesSlug warranty images specs.sweepMm';

export async function listCategories() {
  const cats = await Category.find().sort({ order: 1 }).lean();
  const series = await Series.find().sort({ name: 1 }).lean();
  const brandCounts = await Product.aggregate([
    { $match: { published: true } },
    { $group: { _id: { category: '$category', brand: '$brand' }, n: { $sum: 1 } } },
  ]);
  return cats.map((c) => ({
    ...c,
    series: series
      .filter((s) => s.categories.includes(c.slug))
      .map((s) => ({ slug: s.slug, name: s.name, brand: s.brand, productCount: s.productCount })),
    brands: brandCounts.filter((b) => b._id.category === c.slug).map((b) => ({ brand: b._id.brand, count: b.n })),
  }));
}

export async function listBrands() {
  return Product.aggregate([
    { $match: { published: true } },
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $project: { _id: 0, brand: '$_id', count: 1 } },
    { $sort: { brand: 1 } },
  ]);
}

export async function listProducts(q) {
  const filter = { published: true };
  if (q.brand) filter.brand = new RegExp(`^${escapeRegex(q.brand)}$`, 'i');
  if (q.category) filter.category = q.category;
  if (q.subCategory) filter.subCategorySlug = q.subCategory;
  if (q.series) filter.seriesSlug = q.series;
  if (q.sweepMin || q.sweepMax) {
    const range = {};
    if (q.sweepMin) range.$gte = q.sweepMin;
    if (q.sweepMax) range.$lte = q.sweepMax;
    filter['specs.sweepMm'] = { $elemMatch: range };
  }
  if (q.search) {
    const rx = new RegExp(escapeRegex(q.search), 'i');
    filter.$or = [{ name: rx }, { series: rx }, { brand: rx }, { subCategory: rx }, { description: rx }];
  }
  const sort = { name: 1, brand: 1 };
  const skip = (q.page - 1) * q.limit;
  const [items, total] = await Promise.all([
    Product.find(filter).select(LIST_FIELDS).sort(sort).skip(skip).limit(q.limit).lean(),
    Product.countDocuments(filter),
  ]);
  return { items, total, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit) };
}

export async function getProduct(slug) {
  const product = await Product.findOne({ slug, published: true }).lean();
  if (!product) return null;
  const [moreInSeries, relatedCategory, otherSeries] = await Promise.all([
    Product.find({ seriesSlug: product.seriesSlug, slug: { $ne: slug }, published: true })
      .select(LIST_FIELDS)
      .limit(8)
      .lean(),
    Product.find({
      category: product.category,
      subCategorySlug: product.subCategorySlug,
      seriesSlug: { $ne: product.seriesSlug },
      published: true,
    })
      .select(LIST_FIELDS)
      .limit(8)
      .lean(),
    Series.find({ categories: product.category, slug: { $ne: product.seriesSlug } })
      .sort({ productCount: -1 })
      .limit(8)
      .lean(),
  ]);
  return { product, moreInSeries, related: relatedCategory, otherSeries };
}
