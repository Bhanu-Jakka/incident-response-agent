require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const path = require('path');
const { HindsightClient } = require('@vectorize-io/hindsight-client');

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const hindsight = new HindsightClient({
  baseUrl: 'https://api.hindsight.vectorize.io',
  apiKey: process.env.HINDSIGHT_API_KEY
});

const BANK_ID = process.env.HINDSIGHT_BANK_ID;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/incident', async (req, res) => {
  try {
    const { incident } = req.body;
    console.log('Received incident:', incident);

    // Search Hindsight for similar past incidents
    console.log('Searching Hindsight memory...');
    const results = await hindsight.recall(BANK_ID, incident);
    console.log('Memory results:', results);

    const context = results && results.length > 0
      ? `Past similar incidents and fixes:\n${results.map(r => r.content || r.text || JSON.stringify(r)).join('\n\n')}`
      : 'No similar incidents found in history.';

    // Get AI response
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an incident response agent. You help engineers fix technical problems fast. ${context}`
        },
        {
          role: 'user',
          content: `New incident: ${incident}`
        }
      ]
    });

    const resolution = response.choices[0].message.content;

    // Save to Hindsight memory
    console.log('Saving to Hindsight...');
    await hindsight.retain(BANK_ID, `Incident: ${incident}\nResolution: ${resolution}`);
    console.log('Saved to Hindsight!');

    res.json({ resolution, similarIncidents: results || [] });

  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});