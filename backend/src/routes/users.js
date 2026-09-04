const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getMe, updateMe } = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMe);

module.exports = router;
