const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config();

// Load Mongoose models
require('./model/studentsModel');
require('./model/courseModel');
require('./model/materialModel');
require('./model/suggestionModel');
require('./model/discussionModel');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['https://learnl.vercel.app'], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, 
  })
);

app.use(bodyParser.json());

// Import routes
const studentsRoutes = require('./routes/studentsRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

// Register routes
app.use('/api', studentsRoutes);
app.use('/api/superadmin', superAdminRoutes);

const Student = mongoose.model('Student');

async function ensureSuperAdmin() {
  try {
    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;
    if (!email || !password) return; // skip if not configured

    let admin = await Student.findOne({ email });
    if (!admin) {
      const hashed = await bcrypt.hash(password, 10);
      admin = new Student({
        firstName: 'Super',
        lastName: 'Admin',
        email,
        password: hashed,
        type: 'superadmin',
      });
      await admin.save();
      console.log(' Super admin created.');
    }
  } catch (err) {
    console.error('❌ Failed to ensure super admin', err);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  ensureSuperAdmin();
});
