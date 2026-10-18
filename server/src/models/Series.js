import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // e.g. havells-stealth
    name: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    categories: [{ type: String }], // category slugs this series appears in
    productCount: { type: Number, default: 0 },
    coverImage: String,
  },
  { timestamps: true },
);

export const Series = mongoose.model('Series', seriesSchema);
