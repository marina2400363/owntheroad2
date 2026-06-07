// =================================================================
// ROUTE: adminRoutes.js
// Part of the MVC Route layer. Manages endpoints for dashboard statistics
// and administrative user controls. Highly restricted.
// =================================================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');

// Secure all admin routes with JWT Auth and Admin assertions
router.use(protect);
router.use(admin);

// GET /api/admin/stats - Aggregate database metrics
router.get('/stats', adminController.getStats);

// GET /api/admin/users - List all user records
router.get('/users', adminController.getUsers);

// PUT /api/admin/users/:id/admin - Toggle administrative role
router.put('/users/:id/admin', validateObjectId, adminController.makeUserAdmin);

// DELETE /api/admin/users/:id - Delete a user profile and their bookings
router.delete('/users/:id', validateObjectId, adminController.deleteUser);

module.exports = router;
