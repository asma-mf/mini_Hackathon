const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  addMedicine,
  getMyMedicines,
  toggleStock,
  updateQuantity,
  updatePrice,
  deleteMedicine,
} = require('../controllers/medicineController');

const router = express.Router();

// All medicine routes require authentication + pharmacist role
router.use(authenticate, requireRole('pharmacist'));

router.post('/', addMedicine);
router.get('/mine', getMyMedicines);
router.patch('/:id/stock', toggleStock);
router.patch('/:id/quantity', updateQuantity);
router.patch('/:id/price', updatePrice);
router.delete('/:id', deleteMedicine);

module.exports = router;
