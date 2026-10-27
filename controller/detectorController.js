const Report = require('../models/Report');
const { analyzeContent } = require('../services/aiService');
const { getIsConnected } = require('../config/db');

let inMemoryReports = [];

const seedSampleData = () => {
  return [
    {
      headline: "Alert: 'Free Rs. 5000 Recharge from Govt' WhatsApp Viral Link",
      originalContent: "Important: PM Modi is giving 3 months free recharge of Rs 5000 for all Indian citizens. Click http://pm-free-5000.tk and forward to 10 friends!",
      imageUrl: null,
      trustScore: 8,
      riskLevel: "CRITICAL",
      verdict: "PHISHING_SCAM",
      manipulationFlags: ["Greed & Free Gifts", "Urgent Panic", "Manufactured Scarcity"],
      cognitiveFallacies: ["Appeal to Emotion", "False Authority"],
      debunkSummary: "Dear family, I checked this forwarded offer with PIB Fact Check and the Ministry of Telecom, and they confirmed the government has not announced any free recharge scheme. Please do not click the suspicious link or share your phone numbers, as it is a malicious phishing campaign designed to steal data.",
      citations: [
        {
          sourceName: "Press Information Bureau (PIB Fact Check)",
          url: "https://factcheck.pib.gov.in",
          note: "PIB officially debunked viral claims of free recharges under government schemes."
        },
        {
          sourceName: "National Cyber Crime Portal (CERT-In)",
          url: "https://cybercrime.gov.in",
          note: "Phishing advisory against unofficial top-level domains claiming to be Indian ministries."
        }
      ],
      forensicBreakdown: [
        {
          claim: "Government providing free Rs 5000 mobile recharge",
          analysis: "Department of Telecommunications does not operate promotional recharge schemes; link leads to an unverified third-party ad farm.",
          status: "FALSE"
        }
      ],
      societalImpact: {
        targetAudience: "Rural communities, students, and mobile messaging groups",
        harmPotential: "Phishing credential harvesting, unwanted SMS spam subscriptions, and malware downloads.",
        themeCategory: "Cyber Fraud"
      },
      authorName: "Civic Security Sentinel",
      upvotes: 42,
      verifiedByCommunity: true,
      createdAt: new Date(Date.now() - 7200000)
    }
  ];
};


if (inMemoryReports.length === 0) {
  inMemoryReports = seedSampleData().map((item, idx) => ({
    ...item,
    _id: 'mem_' + (Date.now() + idx)
  }));
}


 
 
 
const getDashboard = (req, res) => {
  const notice = req.query.notice || null;
  const verified = req.query.verified === 'true';

  res.render('index', {
    report: null,
    error: null,
    notice: verified ? 'Email successfully verified! Your account is active.' : notice,
    activeTab: 'home'
  });
};




const postVerify = async (req, res) => {
  try {
    const { headlineText, messageText } = req.body;
    const uploadedFile = req.file;

    let combinedText = '';
    if (headlineText && headlineText.trim()) combinedText += `HEADLINE: ${headlineText.trim()}\n\n`;
    if (messageText && messageText.trim()) combinedText += `CONTENT: ${messageText.trim()}`;
    combinedText = combinedText.trim();

    if (!combinedText && !uploadedFile) {
      const errMessage = 'Please provide message text or upload a screenshot to inspect.';
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, error: errMessage });
      }
      return res.render('index', { report: null, error: errMessage, notice: null, activeTab: 'home' });
    }

    const imagePath = uploadedFile ? uploadedFile.path : null;
    const imageMime = uploadedFile ? uploadedFile.mimetype : 'image/jpeg';


    const aiResult = await analyzeContent({
      text: combinedText || 'Analyze attached screenshot for deceptive claims and forensic markers.',
      imagePath,
      imageMime
    });

    const reportData = {
      headline: aiResult.headline || headlineText || 'Digital Claim Analysis',
      originalContent: combinedText || (uploadedFile ? `[Screenshot Uploaded: ${uploadedFile.originalname}]` : 'N/A'),
      imageUrl: uploadedFile ? `/uploads/${uploadedFile.filename}` : null,
      imageOriginalName: uploadedFile ? uploadedFile.originalname : null,
      trustScore: typeof aiResult.trustScore === 'number' ? aiResult.trustScore : 25,
      riskLevel: aiResult.riskLevel || 'HIGH',
      verdict: aiResult.verdict || 'MISLEADING',
      manipulationFlags: Array.isArray(aiResult.manipulationFlags) ? aiResult.manipulationFlags : ['Unverified Claim'],
      cognitiveFallacies: Array.isArray(aiResult.cognitiveFallacies) ? aiResult.cognitiveFallacies : ['Appeal to Emotion'],
      debunkSummary: aiResult.debunkSummary || 'Please verify this information before forwarding to family groups.',
      citations: Array.isArray(aiResult.citations) ? aiResult.citations : [
        { sourceName: 'Official Fact-Checkers Portal', url: 'https://factcheck.pib.gov.in', note: 'Public Verification Notice' }
      ],
      forensicBreakdown: Array.isArray(aiResult.forensicBreakdown) ? aiResult.forensicBreakdown : [],
      societalImpact: aiResult.societalImpact || {
        targetAudience: 'Family chat groups and mobile users',
        harmPotential: 'Misinformation spread and potential financial or social panic.',
        themeCategory: 'Cyber Fraud'
      },
      author: req.user ? req.user._id : null,
      authorName: req.user ? req.user.name : 'Anonymous Citizen',
      upvotes: 0,
      verifiedByCommunity: false,
      createdAt: new Date()
    };

    let savedReport;
    if (getIsConnected()) {
      savedReport = await Report.create(reportData);
    } else {
      savedReport = { ...reportData, _id: 'mem_' + Date.now() };
      inMemoryReports.unshift(savedReport);
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, report: savedReport });
    }

    return res.render('index', { report: savedReport, error: null, notice: null, activeTab: 'home' });
  } catch (error) {
    console.error('Error during verification route:', error);
    const errMessage = 'An error occurred during forensic verification. Please try again.';
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, error: errMessage });
    }
    return res.render('index', { report: null, error: errMessage, notice: null, activeTab: 'home' });
  }
};



 
const getReportById = async (req, res) => {
  const { id } = req.params;
  try {
    let report = (getIsConnected() && !id.startsWith('mem_'))
      ? await Report.findById(id)
      : inMemoryReports.find(r => r._id.toString() === id);

    if (!report) return res.redirect('/');
    res.render('index', { report, error: null, notice: null, activeTab: 'home' });
  } catch {
    res.redirect('/');
  }
};

module.exports = {
  getDashboard,
  postVerify,
  getReportById,
  inMemoryReports
};

