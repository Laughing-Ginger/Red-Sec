const express = require('express');
const router = express.Router();
const redactionController = require('../controllers/redactionController');

// POST /api/redact
router.post('/redact', redactionController.createRedaction);

// GET /api/history/:sessionId
router.get('/history/:sessionId', redactionController.getHistoryBySession);

// GET /api/redaction/:id
router.get('/redaction/:id', redactionController.getRedactionById);

module.exports = router;