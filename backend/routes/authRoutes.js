// =================================================================
// ROUTE: authRoutes.js
// Part of the MVC Route layer. Directs auth payloads (register, login)
// through validation checkpoints and into authController handlers.
// =================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

// POST /api/auth/register
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login
router.post('/login', validateLogin, authController.login);

module.exports = router;
