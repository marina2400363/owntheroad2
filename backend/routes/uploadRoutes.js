
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const authController = require('../controllers/authController');
const carController = require('../controllers/carController');

router.post('/license', protect, upload.single('license'), authController.uploadLicense);

router.post('/car-image', protect, admin, upload.single('image'), carController.uploadCarImage);

module.exports = router;
