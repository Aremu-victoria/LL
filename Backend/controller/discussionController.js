const mongoose = require('mongoose');
const Discussion = mongoose.model('Discussion');

exports.createDiscussion = async (req, res) => {
  try {
    const { classLevel, material, student, question } = req.body;
    if (!classLevel || !student || !question) return res.status(400).json({ error: 'classLevel, student, and question are required.' });
    const discussion = new Discussion({ classLevel, material, student, question });
    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.listDiscussions = async (req, res) => {
  try {
    const { classLevel, material } = req.query;
    const filter = {};
    if (classLevel) filter.classLevel = classLevel;
    if (material) filter.material = material;
    const discussions = await Discussion.find(filter).populate('student', 'firstName lastName email');
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { student, text } = req.body;
    if (!student || !text) return res.status(400).json({ error: 'student and text are required.' });
    const discussion = await Discussion.findById(id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    discussion.replies.push({ student, text });
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
