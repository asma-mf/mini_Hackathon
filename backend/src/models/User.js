const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'pharmacist'], required: true },
    name: { type: String, trim: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    // Pharmacist-only fields
    pharmacyId: { type: String, default: null },  // "PHM-" + last 6 chars of _id
    phone: { type: String, default: null },
    whatsapp: { type: String, default: null },
  },
  { timestamps: true }
);

// Generate pharmacyId after first save (pharmacists only)
userSchema.post('save', async function (doc, next) {
  if (doc.role === 'pharmacist' && !doc.pharmacyId) {
    const suffix = doc._id.toString().slice(-6).toUpperCase();
    doc.pharmacyId = `PHM-${suffix}`;
    // Use updateOne to avoid triggering post-save again
    await mongoose.model('User').updateOne({ _id: doc._id }, { pharmacyId: doc.pharmacyId });
  }
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = function (plainText) {
  return bcrypt.compare(plainText, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
