const Report = require('../models/Report');
const { getIsConnected } = require('../config/db');
const { inMemoryReports } = require('./detectorController');

//  GET /feed
 
const getFeed = async (req, res) => {
  try {
    const { risk, q } = req.query;
    let query = {};
    if (risk && risk !== 'ALL') query.riskLevel = risk.toUpperCase();
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [{ headline: regex }, { originalContent: regex }, { debunkSummary: regex }];
    }
    let reports = [];
    if (getIsConnected()) {
      reports = await Report.find(query).sort({ createdAt: -1 }).limit(50);
    } else {
      reports = inMemoryReports.filter(r => {
        let match = true;
        if (risk && risk !== 'ALL') match = match && r.riskLevel === risk.toUpperCase();
        if (q && q.trim()) {
          const re = new RegExp(q.trim(), 'i');
          match = match && (re.test(r.headline) || re.test(r.originalContent) || re.test(r.debunkSummary));
        }
        return match;
      });
    }

    res.render('feed', {
      reports,
      activeRisk: risk || 'ALL',
      searchQuery: q || '',
      activeTab: 'feed'
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.render('feed', { reports: [], activeRisk: 'ALL', searchQuery: '', activeTab: 'feed' });
  }
};

//  POST /api/report/:id/upvote

const postUpvote = async (req, res) => {
  const { id } = req.params;
  try {
    if (getIsConnected() && !id.startsWith('mem_')) {
      const report = await Report.findByIdAndUpdate(
        id,
        { $inc: { upvotes: 1 }, $set: { verifiedByCommunity: true } },
        { new: true }
      );
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
      return res.json({ success: true, upvotes: report.upvotes });
    } else {
      const report = inMemoryReports.find(r => r._id.toString() === id);
      if (report) {
        report.upvotes = (report.upvotes || 0) + 1;
        report.verifiedByCommunity = true;
        return res.json({ success: true, upvotes: report.upvotes });
      }
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

//  DELETE /api/report/:id

const deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    if (getIsConnected() && !id.startsWith('mem_')) {
      await Report.findByIdAndDelete(id);
    } else {
      const idx = inMemoryReports.findIndex(r => r._id.toString() === id);
      if (idx !== -1) inMemoryReports.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Report deleted successfully by moderator.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getFeed,
  postUpvote,
  deleteReport
};

