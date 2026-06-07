

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validateBooking, validateObjectId } = require('../middleware/validationMiddleware');

router.use(protect);


router.route('/')
  .get(bookingController.getBookings)
  .post(validateBooking, bookingController.createBooking);


router.route('/:id')
  .get(validateObjectId, bookingController.getBookingById)
  .put(validateObjectId, bookingController.updateBooking)
  .delete(validateObjectId, bookingController.deleteBooking);

module.exports = router;
