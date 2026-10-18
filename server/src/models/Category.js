import mongoose from 'mongoose';

// `vertical` keeps the model open to future product lines (lighting, switches, appliances).
const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    vertical: { type: String, default: 'fans', index: true },
    subCategories: [{ slug: String, name: String }],
    order: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Category = mongoose.model('Category', categorySchema);
