// server/index.js
require('dotenv').config(); // Loads variables from .env file
const express = require('express');
const cors =require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_URL = 'https://api-inference.huggingface.co/models/dslim/bert-base-NER';
const HF_API_KEY = process.env.HF_API_KEY;

app.post('/api/redact', async (req, res) => {
  const { text } = req.body;

  try {
    // Call the Hugging Face API
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    });

    const entities = await response.json();
    
    // Check for errors from the API
    if (!Array.isArray(entities)) {
      console.error('Hugging Face API Error:', entities);
      return res.status(500).json({ error: 'Failed to process text with AI.' });
    }

    // Process the entities to redact the text
    let processedText = text;
    // Loop backwards to not mess up indices after replacement
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      const start = entity.start;
      const end = entity.end;
      // Replace the found entity with its type (e.g., [PER], [LOC])
      processedText = processedText.substring(0, start) + `[${entity.entity_group}]` + processedText.substring(end);
    }

    res.json({ redactedText: processedText });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'An error occurred on the server.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});