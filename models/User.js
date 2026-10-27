const mongoose = require('mongoose');
const bcrypt= require('bcryptjs');
const UserSchema = new moongoose.Schema({
    name:{
        type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: 60 
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email address'
        ]
      },
      password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false 
      },
      role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
      },
      isVerified: {
        type: Boolean,
        default: false
      },
      otp: {
        type: String,
        default: null
      },
      otpExpires: {
        type: Date,
        default: null
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    });
    
    // Pre-save the hoook to hash password if modified
    UserSchema.pre('save', async function (next) {
      if (!this.isModified('password')) {
        return next();
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    });
    
    // Password comparison method
    UserSchema.methods.comparePassword = async function (candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    };
    
    // Generate 6-digit OTP
    UserSchema.methods.generateOTP = function () {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      this.otp = otp;
      // OTP valid for 10 minutes
      this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      return otp;
    };
    
    module.exports = mongoose.model('User', UserSchema);