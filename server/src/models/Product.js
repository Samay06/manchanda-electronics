import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  { path: String, caption: String, width: Number, height: Number },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tagline: String,
    brand: { type: String, required: true, index: true },
    vertical: { type: String, default: 'fans', index: true },
    category: { type: String, required: true, index: true }, // category slug
    categoryName: String,
    subCategory: { type: String, index: true },
    subCategorySlug: { type: String, index: true },
    series: { type: String, index: true }, // series display name
    seriesSlug: { type: String, index: true },
    description: String,
    descriptionSource: String, // 'catalogue' | 'features'
    features: [String],
    warranty: { type: String, default: null }, // null => "Enquire for warranty"
    warrantyNote: String,
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },
    images: [imageSchema],
    sourcePdf: String,
    sourcePage: Number,
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

productSchema.index({ name: 'text', series: 'text', description: 'text', brand: 'text' });

export const Product = mongoose.model('Product', productSchema);
