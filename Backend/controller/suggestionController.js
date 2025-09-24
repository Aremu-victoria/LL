const mongoose = require('mongoose');
const Suggestion = mongoose.model('Suggestion');

exports.createSuggestion = async (req, res) => {
  try {

  let { student, text, classLevel, name, suggestion: suggestionText } = req.body;
  
  if (!student && name) student = name;
  if (!text && suggestionText) text = suggestionText;
  if (!student || !text) return res.status(400).json({ error: 'Student and text are required.' });
  const suggestion = new Suggestion({ student, text, classLevel });
    await suggestion.save();
    res.status(201).json(suggestion);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.listSuggestions = async (req, res) => {
  try {
    const { classLevel } = req.query;
    const filter = classLevel ? { classLevel } : {};
    const suggestions = await Suggestion.find(filter).populate('student', 'firstName lastName email');
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
