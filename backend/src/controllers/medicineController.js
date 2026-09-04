const Medicine = require('../models/Medicine');

// ---------------------------------------------------------------------------
// POST /api/medicines — add a new medicine
// ---------------------------------------------------------------------------
const addMedicine = async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    const parsedQty = quantity !== undefined ? Math.max(0, parseInt(quantity, 10) || 0) : 20;
    const parsedPrice = price !== undefined ? Math.max(0, parseFloat(price) || 0) : 0;

    const medicine = await Medicine.create({
      pharmacistId: req.user.id,
      name: name.trim(),
      quantity: parsedQty,
      price: parsedPrice,
      inStock: parsedQty > 0,
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
// GET /api/medicines/mine?status=in|out|all&sort=name|price_asc|price_desc
// ---------------------------------------------------------------------------
const getMyMedicines = async (req, res) => {
  try {
    const { status = 'all', sort = 'name' } = req.query;

    const filter = { pharmacistId: req.user.id };
    if (status === 'in') filter.inStock = true;
    else if (status === 'out') filter.inStock = false;

    let sortObj = { name: 1 };
    if (sort === 'price_asc') sortObj = { price: 1, name: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1, name: 1 };
    else if (sort === 'qty_asc') sortObj = { quantity: 1, name: 1 };
    else if (sort === 'qty_desc') sortObj = { quantity: -1, name: 1 };

    const medicines = await Medicine.find(filter).sort(sortObj);
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
    if (medicine.inStock && (medicine.quantity == null || medicine.quantity === 0)) {
      medicine.quantity = 10;
    }
    await medicine.save();

    return res.json({ medicine });
  } catch (err) {
    console.error('[toggleStock]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/medicines/:id/quantity — update quantity
// ---------------------------------------------------------------------------
const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    if (medicine.pharmacistId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this medicine' });
    }

    const q = Math.max(0, parseInt(quantity, 10) || 0);
    medicine.quantity = q;
    medicine.inStock = q > 0;
    await medicine.save();

    return res.json({ medicine });
  } catch (err) {
    console.error('[updateQuantity]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/medicines/:id/price — update price
// ---------------------------------------------------------------------------
const updatePrice = async (req, res) => {
  try {
    const { price } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    if (medicine.pharmacistId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this medicine' });
    }

    const p = Math.max(0, parseFloat(price) || 0);
    medicine.price = p;
    await medicine.save();

    return res.json({ medicine });
  } catch (err) {
    console.error('[updatePrice]', err);
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

module.exports = { addMedicine, getMyMedicines, toggleStock, updateQuantity, updatePrice, deleteMedicine };
