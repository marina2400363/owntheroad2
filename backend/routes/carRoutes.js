
const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validateCar, validateObjectId } = require('../middleware/validationMiddleware');

router.route('/')
  .get(carController.getCars)
  .post(protect, admin, validateCar, carController.createCar);

router.route('/:id')
  .get(validateObjectId, carController.getCarById)
  .put(protect, admin, validateObjectId, carController.updateCar)
  .delete(protect, admin, validateObjectId, carController.deleteCar);

module.exports = router;
