const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  classLevel: { type: String }, // Optional: to filter by class
});

mongoose.model('Suggestion', suggestionSchema);
