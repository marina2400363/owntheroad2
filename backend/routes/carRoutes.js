// =================================================================
// ROUTE: carRoutes.js
// Part of the MVC Route layer. Manages RESTful routes for Car inventory.
// Requires authorization and admin privilege verification for write actions.
// =================================================================

const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validateCar, validateObjectId } = require('../middleware/validationMiddleware');

// GET /api/cars - Get cars list (paginated, sorted, filtered)
// POST /api/cars - Admin create car
router.route('/')
  .get(carController.getCars)
  .post(protect, admin, validateCar, carController.createCar);

// GET /api/cars/:id - Fetch single car detail
// PUT /api/cars/:id - Admin update car details
// DELETE /api/cars/:id - Admin delete car
router.route('/:id')
  .get(validateObjectId, carController.getCarById)
  .put(protect, admin, validateObjectId, carController.updateCar)
  .delete(protect, admin, validateObjectId, carController.deleteCar);

module.exports = router;
