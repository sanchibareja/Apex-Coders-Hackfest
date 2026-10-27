const mongoose = require('mongoose');

const CitationSchema = new mongoose.Schema({
  sourceName: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    default: '#'
  },
  note: {
    type: String,
    trim: true
  }
}, { _id: false });

const ReportSchema = new mongoose.Schema({
  headline: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  originalContent: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  imageOriginalName: {
    type: String,
    default: null
  },
  trustScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'],
    default: 'MODERATE'
  },
  verdict: {
    type: String,
    enum: ['FABRICATED', 'MISLEADING', 'PHISHING_SCAM', 'UNVERIFIED', 'LEGITIMATE'],
    default: 'UNVERIFIED'
  },
  manipulationFlags: [{
    type: String,
    trim: true
  }],
  cognitiveFallacies: [{
    type: String,
    trim: true
  }],
  debunkSummary: {
    type: String,
    required: true,
    trim: true
  },
  citations: [CitationSchema],
  forensicBreakdown: [{
    claim: String,
    analysis: String,
    status: {
      type: String,
      enum: ['FALSE', 'MISLEADING', 'UNSUBSTANTIATED', 'TRUE'],
      default: 'FALSE'
    }
  }],
  societalImpact: {
    targetAudience: { type: String, default: 'General Public & Family Groups' },
    harmPotential: { type: String, default: 'High risk of social distress and financial loss' },
    themeCategory: {
      type: String,
      enum: ['Cyber Fraud', 'Health Misinformation', 'Religious/Communal Rumor', 'Political Disinformation', 'Phishing Scheme'],
      default: 'Cyber Fraud'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  authorName: {
    type: String,
    default: 'Community Citizen'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  verifiedByCommunity: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ headline: 'text', originalContent: 'text' });

module.exports = mongoose.model('Report', ReportSchema);
