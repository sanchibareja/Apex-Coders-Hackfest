const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const upload = require('../middlewares/upload');
const detectorController = require('../controllers/detectorController');
const feedController = require('../controllers/feedController');
// auth &otp verification routes
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

router.get('/verify-otp', authController.getVerifyOtp);
router.post('/verify-otp', authController.postVerifyOtp);
router.post('/resend-otp', authController.postResendOtp);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.getLogout);


// MAIN DETECTOR & VERIFICATION ROUTES

router.get('/', detectorController.getDashboard);
router.post('/verify', upload.single('screenshot'), detectorController.postVerify);
router.get('/report/:id', detectorController.getReportById);


//  COMMUNITY SCAM FEED ROUTES

router.get('/feed', feedController.getFeed);
router.post('/api/report/:id/upvote', feedController.postUpvote);
router.delete('/api/report/:id', requireAuth, requireRole('admin', 'moderator'), feedController.deleteReport);

module.exports = router;


