const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 20,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound index: one pharmacist should not have duplicate medicine names
medicineSchema.index({ pharmacistId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Medicine', medicineSchema);
