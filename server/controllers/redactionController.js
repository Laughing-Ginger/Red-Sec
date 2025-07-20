const Redaction = require('../models/Redaction');
const { processTextWithAI } = require('../services/aiService');

// Logic for POST /api/redact
exports.createRedaction = async (req, res) => {
  const { text, customPatterns = [], entities = ['PER', 'ORG', 'LOC', 'MISC'], sessionId } = req.body;
  if (!text || !sessionId) {
    return res.status(400).json({ error: 'Missing required fields: text and sessionId.' });
  }
  try {
    const startTime = Date.now();
    const { processedText, stats } = await processTextWithAI(text, customPatterns, entities);
    stats.timeTaken = Date.now() - startTime;
    
    const redactionRecord = new Redaction({
      originalText: text, redactedText: processedText, customPatterns, entities, stats, sessionId
    });
    
    await redactionRecord.save();
    
    res.status(201).json({
      redactedText: processedText, stats, redactionId: redactionRecord.redactionId
    });
  } catch (error) {
    console.error('Redaction Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during processing.' });
  }
};

// Logic for GET /api/history/:sessionId
exports.getHistoryBySession = async (req, res) => {
  try {
    const history = await Redaction.find({ sessionId: req.params.sessionId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('redactionId stats createdAt'); // Only send necessary data
    
    res.json(history);
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ error: 'Failed to load history.' });
  }
};

// Logic for GET /api/redaction/:id
exports.getRedactionById = async (req, res) => {
  try {
    const redaction = await Redaction.findOne({ redactionId: req.params.id });
    if (!redaction) {
      return res.status(404).json({ error: 'Redaction not found.' });
    }
    res.json(redaction);
  } catch (error) {
    console.error('Redaction Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch redaction record.' });
  }
};