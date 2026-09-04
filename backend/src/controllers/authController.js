const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
const register = async (req, res) => {
  try {
    const { email, password, role, name, lat, lng, phone, whatsapp } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'email, password, and role are required' });
    }
    if (!['user', 'pharmacist'].includes(role)) {
      return res.status(400).json({ message: 'role must be "user" or "pharmacist"' });
    }
    if (role === 'pharmacist' && (!phone || !whatsapp)) {
      return res.status(400).json({ message: 'phone and whatsapp are required for pharmacists' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      email,
      passwordHash,
      role,
      name: name || null,
      lat: lat ?? null,
      lng: lng ?? null,
    };
    if (role === 'pharmacist') {
      userData.phone = phone;
      userData.whatsapp = whatsapp;
    }

    const user = await new User(userData).save();

    // Re-fetch to include pharmacyId set by post-save hook
    const savedUser = await User.findById(user._id).select('-passwordHash');

    const token = signToken(savedUser._id, savedUser.role);
    return res.status(201).json({ token, user: savedUser });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id, user.role);
    const { passwordHash, ...userObj } = user.toObject();

    return res.json({ token, user: userObj });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };
