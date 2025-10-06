const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
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

const studentsRoutes = require('./routes/studentsRoutes');
app.use('/api', studentsRoutes);

// Seed super admin on startup (if not exists)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
      console.log('Super admin created.');
    }
  } catch (err) {
    console.error('Failed to ensure super admin', err);
  }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    ensureSuperAdmin();
});