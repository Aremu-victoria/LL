const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const URL = process.env.MONGODB_URI;

mongoose.connect(URL, {})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String }, 
    uniqueId: { type: String, unique: true, sparse: true, uppercase: true, trim: true }, // Unique ID for students/teachers
    type: { type: String, enum: ['student', 'teacher', 'superadmin'], required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isActive: { type: Boolean, default: true }, // For archiving users
});

mongoose.model('Student', studentSchema);