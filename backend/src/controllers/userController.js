const User = require('../models/User');

// ---------------------------------------------------------------------------
// GET /api/users/me
// ---------------------------------------------------------------------------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('[getMe]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/users/me
// ---------------------------------------------------------------------------
const updateMe = async (req, res) => {
  try {
    const allowedFields = ['lat', 'lng', 'name'];
    if (req.user.role === 'pharmacist') {
      allowedFields.push('phone', 'whatsapp');
    }

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('[updateMe]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMe, updateMe };
