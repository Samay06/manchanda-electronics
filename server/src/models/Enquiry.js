import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    slug: String,
    name: String,
    brand: String,
    quantity: { type: Number, min: 1, max: 10000, default: 1 },
  },
  { _id: false },
);

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    company: String,
    city: { type: String, required: true },
    message: String,
    preferredContactTime: String,
    items: [itemSchema],
    source: { type: String, enum: ['basket', 'single', 'contact'], default: 'basket' },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true },
    emailSent: { type: Boolean, default: false },
    ip: String,
  },
  { timestamps: true },
);

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
