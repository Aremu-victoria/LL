const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.Mixed }, // Accepts ObjectId or string (name)
  comment: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String },
  fileUrl: { type: String },
  publicId: { type: String }, // Cloudinary public_id for reliable access/filenames
  type: { type: String },
  size: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  // Class level the material is intended for (e.g., JSS1, JSS2, JSS3, SS1, SS2, SS3)
  classLevel: { type: String, uppercase: true, trim: true },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  reviews: [reviewSchema],
});

mongoose.model('Material', materialSchema);
