// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_URL = 'https://api-inference.huggingface.co/models/dslim/bert-base-NER';
const HF_API_KEY = process.env.HF_API_KEY;

app.post('/api/redact', async (req, res) => {
  const { text, customPatterns = [], entities = ['PER', 'ORG', 'LOC', 'MISC'] } = req.body;
  const startTime = Date.now();
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    // Initialize statistics
    const stats = {
      totalRedactions: 0,
      entityCounts: {
        PER: 0,
        ORG: 0,
        LOC: 0,
        MISC: 0
      }
    };
    
    let processedText = text;
    
    // Process custom patterns first
    if (customPatterns.length > 0) {
      customPatterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        processedText = processedText.replace(regex, match => {
          stats.totalRedactions++;
          return '[REDACTED]';
        });
      });
    }
    
    // Call Hugging Face API for NER
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: processedText }),
    });

    const nerResults = await response.json();
    
    // Check for valid response
    if (!Array.isArray(nerResults)) {
      console.error('Hugging Face API Error:', nerResults);
      return res.status(500).json({ error: 'Failed to process text with AI' });
    }
    
    // Process entities in reverse order to maintain correct indices
    const redactions = nerResults
      .filter(entity => entities.includes(entity.entity_group))
      .sort((a, b) => b.start - a.start);
    
    redactions.forEach(entity => {
      const entityType = entity.entity_group;
      stats.entityCounts[entityType]++;
      stats.totalRedactions++;
      
      processedText = 
        processedText.substring(0, entity.start) + 
        `[${entityType}]` + 
        processedText.substring(entity.end);
    });
    
    // Calculate processing time
    stats.timeTaken = Date.now() - startTime;
    
    res.json({ 
      redactedText: processedText,
      stats
    });
    
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'An error occurred on the server' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});