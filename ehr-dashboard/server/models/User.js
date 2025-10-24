const mongoose = require('mongoose');

const ROLES = ['patient', 'doctor', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true },
    phone: String,
    address: String,
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    dateOfBirth: Date,
    specialization: String,
    bio: String,
    medicalHistory: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;

