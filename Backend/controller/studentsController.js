
// Single file download or view (also increments download count and logs activity)
exports.downloadMaterialFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { mode = "inline", name, userId, userName } = req.query;

    if (!publicId) {
      return res.status(400).json({ error: "No publicId provided" });
    }

    const cloudinary = require("cloudinary").v2;
    const resource = await cloudinary.api.resource(publicId, { resource_type: "auto" });

    if (!resource || !resource.secure_url) {
      return res.status(404).json({ error: "File not found" });
    }

    // File naming
    const format = (resource.format || "").toLowerCase();
    const sanitize = (s = "") =>
      String(s).replace(/[^a-z0-9\-_. ]/gi, "").replace(/\s+/g, " ").trim();
    let baseName =
      sanitize(name) ||
      sanitize(resource.original_filename) ||
      sanitize(resource.filename) ||
      "material";

    const hasExt = /\.[A-Za-z0-9]{2,5}$/.test(baseName);
    if (format && (!hasExt || baseName.split(".").pop().toLowerCase() !== format)) {
      baseName = `${baseName.replace(/\.[A-Za-z0-9]{2,5}$/, "")}.${format}`;
    }

    // MIME type map
    const mimeMap = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
    };

    const contentType = mimeMap[format] || "application/octet-stream";

    // 🔑 inline = view in browser, attachment = force download
    const disposition = mode === "attachment" ? "attachment" : "inline";

    res.setHeader("Content-Disposition", `${disposition}; filename="${baseName}"`);
    res.setHeader("Content-Type", contentType);

    // Try to increment downloads and log activity
    try {
      const Material = require('mongoose').model('Material');
      const material = await Material.findOne({ publicId });
      if (material) {
        material.downloads = (material.downloads || 0) + 1;
        const logEntry = {
          at: new Date(),
        };
        if (userId) logEntry.user = userId;
        if (userName) logEntry.userName = userName;
        material.downloadsLog = Array.isArray(material.downloadsLog) ? material.downloadsLog : [];
        material.downloadsLog.push(logEntry);
        await material.save();
      }
    } catch (logErr) {
      // Log but don't fail the download
      console.warn('[downloadMaterialFile] log failed', logErr?.message || logErr);
    }

    // Stream file from Cloudinary
    const https = require("https");
    https.get(resource.secure_url, (fileRes) => {
      fileRes.pipe(res);
    }).on("error", (err) => {
      res.status(500).json({ error: "Failed to download file", details: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// Cloudinary file upload
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadMaterialFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const streamifier = require('streamifier');
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'materials' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    const result = await streamUpload();
    res.json({ fileUrl: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({ error: 'Cloudinary upload failed', details: err.message });
  }
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendStaffCredentialsEmail } = require('../lib/email');

exports.signin = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or uniqueId
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Identifier and password are required.' });
        }

        const isEmail = identifier.includes('@');
        let user;
        if (isEmail) {
            const emailRegex = new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
            user = await mongoose.model('Student').findOne({ email: emailRegex });
        } else {
            user = await mongoose.model('Student').findOne({ uniqueId: identifier.toUpperCase() });
        }
        if (!user) return res.status(404).json({ error: 'Account not found or inactive.' });

        if (user.type !== 'superadmin' && user.isActive !== true) {
            return res.status(404).json({ error: 'Account not found or inactive.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

        const token = jwt.sign(
            { id: user._id, email: user.email, type: user.type },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '2h' }
        );
  // Add a 'name' property for frontend convenience
  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj.name = `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim();
  res.status(200).json({ message: 'Login successful!', token, user: userObj });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};
const mongoose = require('mongoose');
const { error } = require('console');
const Student = mongoose.model('Student');
const Course = mongoose.model('Course');
const Material = mongoose.model('Material');

exports.signup = async (req, res) => {
  try {
    let { firstName, lastName, email, password, type, phone, classLevel } = req.body;
    const providedUniqueId = req.body.uniqueId;

    // Normalize and trim inputs
    firstName = firstName && String(firstName).trim();
    lastName = lastName && String(lastName).trim();
    email = email && String(email).trim().toLowerCase();
    password = password && String(password);
    phone = phone && String(phone).trim();

   
    const errors = {};

   
    if (!firstName) errors.firstName = 'First name is required.';
    if (!lastName) errors.lastName = 'Last name is required.';
    if (!email) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';
    if (!type) errors.type = 'Type is required.';
    // Class level required for students
    const allowedLevels = ['JSS1','JSS2','JSS3','SS1','SS2','SS3'];
    if (type === 'student') {
      if (!classLevel) {
        errors.classLevel = 'Class level is required.';
      } else {
        classLevel = String(classLevel).trim().toUpperCase();
        if (!allowedLevels.includes(classLevel)) {
          errors.classLevel = 'Invalid class level.';
        }
      }
    }

    // Email format
    if (email) {
      const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRe.test(email)) errors.email = 'Email format is invalid.';
    }


    if (password) {
      if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
      const strongRe = /(?=.*[A-Za-z])(?=.*\d)/;
      if (!strongRe.test(password)) errors.password = (errors.password ? errors.password + ' ' : '') + 'Use at least one letter and one number.';
    }

    
    if (phone) {
      const phoneRe = /^[0-9()+\- ]{7,20}$/;
      if (!phoneRe.test(phone)) errors.phone = 'Phone format looks invalid.';
    }

    let uniqueId = providedUniqueId;
    if (uniqueId) {
      uniqueId = String(uniqueId).trim().toUpperCase();
      const uidRe = /^(STU-[A-F0-9]{6}|[A-Z0-9-]{4,20})$/;
      if (!uidRe.test(uniqueId)) errors.uniqueId = 'Matric format invalid. Use e.g. STU-1A2B3C.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

   
    const existing = await Student.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i') });
    if (existing) {
      return res.status(409).json({ message: 'Conflict', errors: { email: 'Email already exists.' } });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (type === 'student') {
      if (uniqueId) {
        const existingMatric = await Student.findOne({ uniqueId });
        if (existingMatric) return res.status(409).json({ message: 'Conflict', errors: { uniqueId: 'Matric/ID already exists.' } });
      } else {
        let isUnique = false;
        while (!isUnique) {
          const candidate = 'STU-' + crypto.randomBytes(3).toString('hex').toUpperCase();
          const exists = await Student.findOne({ uniqueId: candidate });
          if (!exists) {
            uniqueId = candidate;
            isUnique = true;
          }
        }
      }
    }

    const student = new Student({ firstName, lastName, email, password: hashedPassword, type, phone, uniqueId, classLevel });
    try {
      await student.save();
      const out = student.toObject();
      delete out.password;
      res.status(201).json({ message: 'Signup successful!', student: out });
    } catch (saveErr) {
      if (saveErr && saveErr.code === 11000) {
        const dupField = Object.keys(saveErr.keyPattern || {})[0] || Object.keys(saveErr.keyValue || {})[0] || 'field';
        return res.status(409).json({ message: 'Conflict', errors: { [dupField]: `${dupField} already exists.` } });
      }
      throw saveErr;
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


exports.inviteStaff = async (req, res) => {
  try {
    const { email, firstName = 'Teacher', lastName = 'User', type = 'teacher' } = req.body;
    

    const rawEmail = typeof email === 'string' ? email : '';
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const env = process.env.NODE_ENV || 'development';
    console.info(`[inviteStaff][${env}] Request received`, { email: normalizedEmail, type });
    
  
    if (!normalizedEmail) {
      console.error('[inviteStaff] Missing email in request body');
      return res.status(400).json({ error: 'Email is required.' })
    }
    
    const safeEmailPattern = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const emailExists = await Student.findOne({ email: safeEmailPattern });
    if (emailExists) {
      const meta = {
        matchedId: emailExists._id?.toString?.(),
        matchedType: emailExists.type,
        matchedIsActive: emailExists.isActive,
        storedEmail: emailExists.email,
        requestedEmail: normalizedEmail,
      };
      console.warn(`[inviteStaff][${env}] Duplicate email`, meta); 
      return res.status(409).json({
        error: 'Email already exists.',
      });
    }
    
    
  
    let uniqueId;
    let isUnique = false;
    while (!isUnique) {
      uniqueId = crypto.randomBytes(3).toString('hex').toUpperCase();
      const existingUser = await Student.findOne({ uniqueId });
      if (!existingUser) isUnique = true;
    }

    
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, 10);
    
    const user = new Student({ 
      firstName, 
      lastName, 
      email: normalizedEmail, 
      password: hashed, 
      uniqueId: uniqueId,
      type,
      isActive: true 
    });
    await user.save();
    console.info(`[inviteStaff][${env}] Staff user created`, { userId: user._id.toString(), email: normalizedEmail, uniqueId, type });

    try {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Staff';
      await sendStaffCredentialsEmail(normalizedEmail, fullName, tempPassword);
      console.info(`[inviteStaff][${env}] Invite email sent`, { to: normalizedEmail, uniqueId });
      return res.json({ 
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} account created successfully!`, 
        userId: user._id,
        uniqueId: uniqueId,
        email: normalizedEmail,
        emailSent: true,
      });
    } catch (mailErr) {
      console.error('[inviteStaff] sendMail failed:', mailErr?.message || mailErr);
      return res.status(201).json({
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} account created, but email could not be sent.`,
        userId: user._id,
        uniqueId: uniqueId,
        email: normalizedEmail,
        emailSent: false,
        warning: 'Email service failed. Provide credentials to the staff member manually or try again later.',
        ...(env === 'development' ? { tempPassword } : {}),
      });
    }
  } catch (err) {
    console.error('[inviteStaff] Staff creation error:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message,
      stack: process.env.PORT=== 'development' ? err.stack : undefined
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const user = await Student.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const resetLink = `https://ll-3.onrender.com/reset-password/${token}`;
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: 'Reset your password',
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetLink}">here</a> to set a new password. This link expires in 30 minutes.</p>`,
    });

    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required.' });
    const user = await Student.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token.' });
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Admin endpoints
exports.listStudents = async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const filter = includeArchived === 'true' ? {} : { isActive: true };
    const students = await Student.find(filter).select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    const updated = await Student.findByIdAndUpdate(
      id,
      { firstName, lastName, email, phone },
      { new: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.archiveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body; // false to archive, true to restore
    const updated = await Student.findByIdAndUpdate(id, { isActive: !!isActive }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Student.findOne({ _id: id, type: 'teacher' });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    await staff.deleteOne();
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Courses
exports.listCourses = async (_req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Course.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Materials
exports.createMaterial = async (req, res) => {
  try {
    const { title, description, subject, fileUrl, type, size, createdBy, courseId, classLevel } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const material = new Material({ title, description, subject, fileUrl, type, size, createdBy, courseId, classLevel });
    await material.save();
    const populated = await Material.findById(material._id).populate('createdBy', 'firstName lastName email').exec();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.listMaterials = async (_req, res) => {
  try {
    const { courseId, createdBy, classLevel } = _req.query || {};
    const filter = {};
    if (courseId) filter.courseId = courseId;
    if (createdBy) filter.createdBy = createdBy;
    if (classLevel) filter.classLevel = String(classLevel).toUpperCase();
    const materials = await Material.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName email')
      .exec();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Material.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.addMaterialReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, comment, rating } = req.body;
    if (!comment) return res.status(400).json({ error: 'Comment is required' });
    const material = await Material.findById(id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    material.reviews.push({ user, comment, rating });
    await material.save();
    const populated = await Material.findById(id).populate('reviews.user', 'firstName lastName').exec();
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// DEV-ONLY: Ensure superadmin exists and is active using .env credentials
exports.devEnsureSuperAdmin = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }
    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;
    if (!email || !password) {
      return res.status(400).json({ error: 'SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD must be set in .env' });
    }
    let admin = await Student.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    const hashed = await bcrypt.hash(password, 10);
    if (!admin) {
      admin = new Student({
        firstName: 'Super',
        lastName: 'Admin',
        email,
        password: hashed,
        type: 'superadmin',
        isActive: true,
      });
      await admin.save();
      return res.json({ message: 'Super admin created', adminId: admin._id });
    } else {
      admin.password = hashed;
      admin.type = 'superadmin';
      admin.isActive = true;
      await admin.save();
      return res.json({ message: 'Super admin updated/activated', adminId: admin._id });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
