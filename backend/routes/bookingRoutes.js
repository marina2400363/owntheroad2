// =================================================================
// ROUTE: bookingRoutes.js
// Part of the MVC Route layer. Manages booking operations. All endpoints
// require JWT authorization protection.
// =================================================================

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validateBooking, validateObjectId } = require('../middleware/validationMiddleware');

// Secure all booking routes
router.use(protect);

// GET /api/bookings - Get user bookings (all bookings if admin)
// POST /api/bookings - Book a new car rental
router.route('/')
  .get(bookingController.getBookings)
  .post(validateBooking, bookingController.createBooking);

// GET /api/bookings/:id - View specific booking details
// PUT /api/bookings/:id - Modify booking status (Owner cancel or Admin updates)
// DELETE /api/bookings/:id - Delete booking entry
router.route('/:id')
  .get(validateObjectId, bookingController.getBookingById)
  .put(validateObjectId, bookingController.updateBooking)
  .delete(validateObjectId, bookingController.deleteBooking);

module.exports = router;
