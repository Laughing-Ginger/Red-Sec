const axios = require('axios');

const HF_API_URL = 'https://api-inference.huggingface.co/models/dslim/bert-base-NER';
const HF_API_KEY = process.env.HF_API_KEY;

const aiApiClient = axios.create({
  baseURL: HF_API_URL,
  headers: {
    'Authorization': `Bearer ${HF_API_KEY}`,
    'Content-Type': 'application/json',
  }
});

const processTextWithAI = async (text, customPatterns = [], entitiesToRedact = []) => {
  console.log("\n--- [START] Redaction Process ---");
  console.log(`[INFO] Received ${customPatterns.length} custom pattern(s).`);

  const stats = {
    totalRedactions: 0,
    entityCounts: { PER: 0, ORG: 0, LOC: 0, MISC: 0, CUSTOM: 0 }
  };
  let allRedactions = [];

  // --- Step 1: Find all redactions from custom patterns ---
  if (customPatterns.length > 0) {
    customPatterns.forEach(pattern => {
      if (!pattern) return;
      try {
        console.log(`[DEBUG] Processing custom pattern: /${pattern}/gi`);
        const regex = new RegExp(pattern, 'gi');
        let match;
        let foundMatches = 0;
        while ((match = regex.exec(text)) !== null) {
          foundMatches++;
          const newRedaction = {
            start: match.index,
            end: match.index + match[0].length,
            type: 'CUSTOM',
            text: match[0]
          };
          allRedactions.push(newRedaction);
          console.log(`  └─ [SUCCESS] Found custom match: "${match[0]}"`);
        }
        if (foundMatches === 0) {
          console.log(`  └─ [INFO] No matches found for pattern.`);
        }
      } catch (e) {
        console.error(`[ERROR] Invalid custom regex pattern skipped: "${pattern}"`, e.message);
      }
    });
  }

  // --- Step 2: Find all redactions from the AI model ---
  try {
    console.log("[INFO] Calling Hugging Face AI for entity detection...");
    const response = await aiApiClient.post('', { inputs: text });
    const nerResults = response.data;

    if (Array.isArray(nerResults)) {
      const aiFoundRedactions = nerResults
        .filter(entity => entitiesToRedact.includes(entity.entity_group))
        .map(entity => ({
          start: entity.start,
          end: entity.end,
          type: entity.entity_group,
          text: entity.word
        }));
      allRedactions.push(...aiFoundRedactions);
      console.log(`[SUCCESS] AI found ${aiFoundRedactions.length} potential entities.`);
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('AI service authentication failed. Please check your HF_API_KEY.');
    }
    console.error("[ERROR] Hugging Face API call failed:", error.message);
  }

  // --- Step 3: Apply all found redactions ---
  if (allRedactions.length === 0) {
    console.log("[INFO] No redactions found. Returning original text.");
    console.log("--- [END] Redaction Process ---");
    return { processedText: text, stats };
  }
  
  console.log(`[DEBUG] Total redactions found (before filtering): ${allRedactions.length}`);
  
  allRedactions.sort((a, b) => a.start - b.start || b.end - a.end);

  const uniqueRedactions = [];
  if (allRedactions.length > 0) {
    uniqueRedactions.push(allRedactions[0]);
    for (let i = 1; i < allRedactions.length; i++) {
      const lastRedaction = uniqueRedactions[uniqueRedactions.length - 1];
      if (allRedactions[i].start >= lastRedaction.end) {
        uniqueRedactions.push(allRedactions[i]);
      }
    }
  }
  
  console.log(`[DEBUG] Unique redactions to apply (after filtering overlaps): ${uniqueRedactions.length}`);
  console.log(uniqueRedactions);

  uniqueRedactions.sort((a, b) => b.start - a.start);

  let processedText = text;
  uniqueRedactions.forEach(redaction => {
    if (stats.entityCounts[redaction.type] !== undefined) {
      stats.entityCounts[redaction.type]++;
    }
    processedText =
      processedText.substring(0, redaction.start) +
      `[${redaction.type}]` +
      processedText.substring(redaction.end);
  });

  stats.totalRedactions = Object.values(stats.entityCounts).reduce((sum, count) => sum + count, 0);
  console.log("[SUCCESS] Redaction complete.");
  console.log("--- [END] Redaction Process ---");
  return { processedText, stats };
};

module.exports = { processTextWithAI };