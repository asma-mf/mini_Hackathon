const Medicine = require('../models/Medicine');

// ---------------------------------------------------------------------------
// POST /api/medicines — add a new medicine
// ---------------------------------------------------------------------------
const addMedicine = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    const medicine = await Medicine.create({
      pharmacistId: req.user.id,
      name: name.trim(),
    });

    return res.status(201).json({ medicine });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You already have a medicine with that name' });
    }
    console.error('[addMedicine]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/medicines/mine?status=in|out|all — pharmacist's own list
// ---------------------------------------------------------------------------
const getMyMedicines = async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    const filter = { pharmacistId: req.user.id };
    if (status === 'in') filter.inStock = true;
    else if (status === 'out') filter.inStock = false;

    const medicines = await Medicine.find(filter).sort({ name: 1 });
    return res.json({ medicines });
  } catch (err) {
    console.error('[getMyMedicines]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/medicines/:id/stock — toggle inStock
// ---------------------------------------------------------------------------
const toggleStock = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    if (medicine.pharmacistId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this medicine' });
    }

    medicine.inStock = !medicine.inStock;
    await medicine.save();

    return res.json({ medicine });
  } catch (err) {
    console.error('[toggleStock]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/medicines/:id — remove a medicine
// ---------------------------------------------------------------------------
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    if (medicine.pharmacistId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this medicine' });
    }

    await medicine.deleteOne();
    return res.json({ message: 'Medicine deleted' });
  } catch (err) {
    console.error('[deleteMedicine]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addMedicine, getMyMedicines, toggleStock, deleteMedicine };
