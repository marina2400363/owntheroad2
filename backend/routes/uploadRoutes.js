// =================================================================
// ROUTE: uploadRoutes.js
// Part of the MVC Route layer. Manages file uploading configurations.
// Leverages uploadMiddleware to check file extension and file sizes.
// =================================================================

const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const authController = require('../controllers/authController');
const carController = require('../controllers/carController');

// POST /api/upload/license - Authenticated users upload driving license
router.post('/license', protect, upload.single('license'), authController.uploadLicense);

// POST /api/upload/car-image - Admin uploads vehicle image
router.post('/car-image', protect, admin, upload.single('image'), carController.uploadCarImage);

module.exports = router;
