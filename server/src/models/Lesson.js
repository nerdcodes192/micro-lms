import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    contentType: { type: String, enum: ['text', 'video'], required: true },
    body: { type: String, required: true }, // text content, or a video URL
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: 'durationMinutes must be an integer' },
    },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, order: 1 });

export const Lesson = mongoose.model('Lesson', lessonSchema);
