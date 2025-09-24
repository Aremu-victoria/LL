const Material = require('../models/Material');
const Discussion = require('../models/Discussion'); 
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');



// Create material
exports.createMaterial = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      fileUrl,
      publicId, // <-- added this
      type,
      size,
      createdBy,
      courseId,
      classLevel,
    } = req.body;

    const material = new Material({
      title,
      description,
      subject,
      fileUrl,
      publicId, // <-- save it
      type,
      size,
      createdBy,
      courseId,
      classLevel,
    });

    await material.save();
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


exports.listMaterials = async (req, res) => {
  try {
    const { courseId, createdBy, classLevel } = req.query || {};
    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (createdBy) filter.createdBy = createdBy;
    if (classLevel) filter.classLevel = classLevel;

    const materials = await Material.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName email')
      .exec();

    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


exports.downloadMaterial = async (req, res) => {
  try {
    const { publicId } = req.params;
    const material = await Material.findOne({ publicId });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    return res.redirect(material.fileUrl);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


// Create discussion
exports.createDiscussion = async (req, res) => {
  try {
    const { classLevel, studentId, message } = req.body;

    const discussion = new Discussion({
      classLevel,
      studentId,
      message,
    });

    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


exports.listDiscussions = async (req, res) => {
  try {
    const { classLevel } = req.query || {};
    const filter = {};
    if (classLevel) filter.classLevel = classLevel;

    const discussions = await Discussion.find(filter)
      .sort({ createdAt: -1 })
      .populate('studentId', 'firstName lastName email')
      .exec();

    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};



exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      token,
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        classLevel: student.classLevel,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
