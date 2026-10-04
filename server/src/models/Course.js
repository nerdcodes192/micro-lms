import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
