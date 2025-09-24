const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  classLevel: { type: String, required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' }, // optional, for material-specific discussions
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  question: { type: String, required: true },
  replies: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

mongoose.model('Discussion', discussionSchema);
