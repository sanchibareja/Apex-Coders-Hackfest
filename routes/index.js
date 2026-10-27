const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const authController = require('../controllers/authController');

// auth &otp verification routes
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

router.get('/verify-otp', authController.getVerifyOtp);
router.post('/verify-otp', authController.postVerifyOtp);
router.post('/resend-otp', authController.postResendOtp);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.getLogout);

module.exports = router;

