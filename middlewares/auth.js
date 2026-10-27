const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET= process.env.JWT_SECRET || 'hacktoberfest-chandigarh-2026-secret-key';

// universal middleware to attach authenticated user to req res & res.locals (for ejs views)
const attachUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (!token) {
      req.user = null;
      res.locals.currentUser = null;
      return next();
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      req.user = null;
      res.locals.currentUser = null;
      return next();
    }
    req.user = user;
    res.locals.currentUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };
    next();
  } catch (err) {
    req.user = null;
    res.locals.currentUser = null;
    next();
  }
};

// guard : require user to logged in 
const requireAuth=(req,res,next)=>{
     if (!req.user) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }
    return res.redirect('/login?notice=' + encodeURIComponent('Please log in to continue.'));
  }
  next();
}
// guard: require user email to be verified via otp
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  if (!req.user.isVerified) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({ success: false, error: 'Please verify your email with OTP first.' });
    }
    return res.redirect('/verify-otp?email=' + encodeURIComponent(req.user.email) + '&notice=' + encodeURIComponent('Please verify your email with OTP before posting.'));
  }
  next();
};
// guard : role- based authorization (eg admin,moderator)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    if (!roles.includes(req.user.role)) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ success: false, error: 'Access denied: insufficient permissions.' });
      }
      return res.status(403).render('index', {
        report: null,
        error: 'Forbidden: You do not have the required permissions for this action.',
        activeTab: 'home'
      });
    }
    next();
  };
};

module.exports = {
  attachUser,
  requireAuth,
  requireVerified,
  requireRole,
  JWT_SECRET
};

