const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {sendVerificationOTP}= require('../services/emailService');
const {JWT_SECRET}=require('../middlewares/auth');

// generate Jwt token & set http-only Cookie
const sendTokenCookie= (user ,statusCode , res, redirectUrl ='/')=>{
const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.redirect(redirectUrl);
};

//  GET / signup
const getSignup = (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('auth/signup', {
    error: null,
    activeTab: 'signup'
  });
};
//  Post /Signup
const postSignup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.render('auth/signup', {
        error: 'Please fill in all required fields.',
        activeTab: 'signup'
      });
    }

    if (password.length < 6) {
      return res.render('auth/signup', {
        error: 'Password must be at least 6 characters long.',
        activeTab: 'signup'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isVerified) {
      return res.render('auth/signup', {
        error: 'An account with this email already exists and is verified. Please log in.',
        activeTab: 'signup'
      });
    }

    if (!user) {
      const userRole = (role === 'admin' || role === 'moderator') ? role : 'user';
      user = new User({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: userRole,
        isVerified: false
      });
    } else {
      user.name = name.trim();
      user.password = password;
    }

    const otp = user.generateOTP();
    await user.save();

    // Send OTP via Nodemailer
    const mailResult = await sendVerificationOTP(normalizedEmail, user.name, otp);

    let noticeMsg = `Verification code dispatched! Please check your email inbox at ${normalizedEmail}.`;
    if (!mailResult.success) {
      if (mailResult.simulated) {
        noticeMsg = `To receive emails in your real inbox, add EMAIL_USER & EMAIL_PASS to .env. For instant testing, your OTP is: ${otp}`;
      } else {
        noticeMsg = `Email dispatch encountered an issue (${mailResult.error || 'SMTP check'}). For instant testing, your OTP is: ${otp}`;
      }
    }

    res.redirect(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}&notice=${encodeURIComponent(noticeMsg)}`);
  } catch (err) {
    console.error('Signup error:', err);
    res.render('auth/signup', {
      error: 'An unexpected error occurred during signup: ' + err.message,
      activeTab: 'signup'
    });
  }
};


/**
 * GET /verify-otp
 */
const getVerifyOtp = (req, res) => {
  const email = req.query.email || '';
  const notice = req.query.notice || null;
  const error = req.query.error || null;
  res.render('auth/verify-otp', {
    email,
    notice,
    error,
    activeTab: 'verify-otp'
  });
};

//  POST /verify-otp

const postVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.render('auth/verify-otp', {
        email: email || '',
        notice: null,
        error: 'Please enter both your email address and the 6-digit OTP code.',
        activeTab: 'verify-otp'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.render('auth/verify-otp', {
        email,
        notice: null,
        error: 'No registration found for this email address. Please sign up first.',
        activeTab: 'verify-otp'
      });
    }

    if (user.isVerified) {
      return sendTokenCookie(user, 200, res, '/?notice=' + encodeURIComponent('Your account is already verified!'));
    }

    // Check OTP match
    if (user.otp !== otp.trim()) {
      return res.render('auth/verify-otp', {
        email,
        notice: null,
        error: 'Invalid OTP code. Please check your inbox or click Resend OTP.',
        activeTab: 'verify-otp'
      });
    }

    // Check expiration
    if (user.otpExpires && new Date() > user.otpExpires) {
      return res.render('auth/verify-otp', {
        email,
        notice: null,
        error: 'This OTP has expired (10-minute limit). Please click Resend OTP.',
        activeTab: 'verify-otp'
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    console.log(` User ${user.email} successfully verified email via OTP.`);
    return sendTokenCookie(user, 200, res, '/?verified=true');
  } catch (err) {
    console.error('OTP Verification Error:', err);
    res.render('auth/verify-otp', {
      email: req.body.email || '',
      notice: null,
      error: 'Error verifying OTP: ' + err.message,
      activeTab: 'verify-otp'
    });
  }
};


//   POST /resend-otp
 
const postResendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.redirect('/verify-otp?error=' + encodeURIComponent('Please supply your email address.'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.redirect(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}&error=${encodeURIComponent('No account found with this email.')}`);
    }

    const newOtp = user.generateOTP();
    await user.save();
    const mailResult = await sendVerificationOTP(normalizedEmail, user.name, newOtp);

    let noticeMsg = `A fresh 6-digit OTP has been sent to your email inbox!`;
    if (!mailResult.success) {
      noticeMsg = `Fresh OTP generated. For instant testing, your new OTP is: ${newOtp}`;
    }

    res.redirect(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}&notice=${encodeURIComponent(noticeMsg)}`);
  } catch (err) {
    res.redirect('/verify-otp?error=' + encodeURIComponent('Failed to resend OTP: ' + err.message));
  }
};


 // GET /login
 
const getLogin = (req, res) => {
  if (req.user) return res.redirect('/');
  const notice = req.query.notice || null;
  res.render('auth/login', {
    error: null,
    notice,
    activeTab: 'login'
  });
};


 // POST /login
 
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('auth/login', {
        error: 'Please enter both email and password.',
        notice: null,
        activeTab: 'login'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.render('auth/login', {
        error: 'Invalid email or password.',
        notice: null,
        activeTab: 'login'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        error: 'Invalid email or password.',
        notice: null,
        activeTab: 'login'
      });
    }

    // Require email verification via OTP
    if (!user.isVerified) {
      const otp = user.generateOTP();
      await user.save();
      const mailResult = await sendVerificationOTP(user.email, user.name, otp);

      let noticeMsg = 'Please verify your email address. A fresh OTP was sent to your inbox.';
      if (!mailResult.success) {
        noticeMsg = `Please verify your email address. For testing, your OTP is: ${otp}`;
      }

      return res.redirect(`/verify-otp?email=${encodeURIComponent(user.email)}&notice=${encodeURIComponent(noticeMsg)}`);
    }

    return sendTokenCookie(user, 200, res, '/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', {
      error: 'An unexpected error occurred during login.',
      notice: null,
      activeTab: 'login'
    });
  }
};


 // GET /logout

const getLogout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login?notice=' + encodeURIComponent('You have been logged out successfully.'));
};

module.exports = {
  getSignup,
  postSignup,
  getVerifyOtp,
  postVerifyOtp,
  postResendOtp,
  getLogin,
  postLogin,
  getLogout
};
