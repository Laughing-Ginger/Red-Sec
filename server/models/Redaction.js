const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RedactionSchema = new mongoose.Schema({
  redactionId: { type: String, default: uuidv4, index: true, unique: true },
  sessionId: { type: String, index: true, required: true },
  originalText: { type: String, required: true },
  redactedText: { type: String, required: true },
  customPatterns: [String],
  entities: [String],
  stats: {
    totalRedactions: { type: Number, default: 0 },
    entityCounts: {
      PER: { type: Number, default: 0 },
      ORG: { type: Number, default: 0 },
      LOC: { type: Number, default: 0 },
      MISC: { type: Number, default: 0 },
      CUSTOM: { type: Number, default: 0 }
    },
    timeTaken: { type: Number, default: 0 }
  },
}, { timestamps: true });

const Redaction = mongoose.model('Redaction', RedactionSchema);
module.exports = Redaction;