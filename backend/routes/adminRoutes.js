
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { validateObjectId } = require('../middleware/validationMiddleware');

router.use(protect);
router.use(admin);

router.get('/stats', adminController.getStats);

router.get('/users', adminController.getUsers);

router.put('/users/:id/admin', validateObjectId, adminController.makeUserAdmin);

router.delete('/users/:id', validateObjectId, adminController.deleteUser);

module.exports = router;
