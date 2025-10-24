const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectDB } = require('../utils/connect');

const PUBLIC_ROLES = ['patient', 'doctor'];

async function signup(req, res) {
  try {
    await connectDB();
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      gender,
      dateOfBirth,
      specialization,
      bio,
      medicalHistory,
    } =
      req.body;

    if (!PUBLIC_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      phone,
      address,
      gender,
      dateOfBirth,
      specialization: role === 'doctor' ? specialization : undefined,
      bio: role === 'doctor' ? bio : undefined,
      medicalHistory: role === 'patient' ? medicalHistory : undefined,
    });

    const token = issueToken(user);
    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Signup failed' });
  }
}

async function login(req, res) {
  try {
    await connectDB();
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = issueToken(user);
    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
}

function issueToken(user) {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };

  const expiresIn = '12h';

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
}

function sanitizeUser(user) {
  return {
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    specialization: user.specialization,
    bio: user.bio,
    medicalHistory: user.medicalHistory,
  };
}

module.exports = { signup, login, sanitizeUser };
