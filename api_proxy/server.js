// server.js (api_proxy)
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const { Configuration, OpenAIApi } = require("openai");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

// Middleware for parsing JSON request bodies
app.use(express.json());

// API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Base URL of the external API (OpenAI)
const externalApiBaseUrl = 'https://api.openai.com/v1';

// --- OpenAI Configuration ---
const configuration = new Configuration({
  apiKey,
});

const openai = new OpenAIApi(configuration);

// --- API Proxy Route (/api/generate) ---
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    const externalApiUrl = `${externalApiBaseUrl}/chat/completions`;

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    const messages = [
      { role: "system", content: `Sei un esperto di Computer Vision. Rispondi in italiano tecnico. Per le domande a scelta multipla rispondi con: 1) La lettera corretta preceduta da 'Risposta: ' 2) Una spiegazione dettagliata non superiore alle cinque righe e iniziante con 'Spiegazione: ' ` },
      { role: "user", content: `${prompt}\nOpzioni:\n${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n')}` }
    ];

    const data = {
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.3,
    };

    const response = await axios.post(externalApiUrl, data, { headers });
    res.json(response.data.choices[0]);
  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({ error: 'Error in request to external API' });
  }
});

// --- AI Evaluation Route (/api/evaluate) ---
async function evaluateAnswerWithOpenAI(userAnswer, aiAnswer, question) {
  try {
    const prompt = `
      Valuta la seguente risposta dell'utente alla domanda aperta. Sei un professore dell'esame sii scrupoloso nella tua valutazione.

      Domanda: ${question}

      Risposta utente: ${userAnswer}

      Risposta di riferimento (generata dall'AI): ${aiAnswer}

      Valuta la risposta dell'utente/studente in base ai seguenti criteri e assegna un punteggio da 0 a 3:

      - 0: La risposta è completamente irrilevante o errata rispetto alla domanda. Non mostra alcuna comprensione dell'argomento.
      - 1: La risposta è solo vagamente correlata alla domanda. Mostra una minima o superficiale comprensione dell'argomento e non menziona i concetti chiave.
      - 2: La risposta è parzialmente corretta e pertinente. Mostra una buona comprensione dell'argomento e menziona i concetti chiave, ma potrebbe mancare di dettagli o precisione.
      - 3: La risposta è completa, corretta, pertinente e dettagliata. Mostra un'ottima comprensione dell'argomento, menziona i concetti chiave e risponde esaurientemente alla domanda.

      Restituisci ESCLUSIVAMENTE il punteggio come numero intero (0, 1, 2 o 3). Non aggiungere altro testo.
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2, // Lower temperature for more consistent evaluation
    });

    const scoreText = completion.data.choices[0].message.content.trim();
    console.log("OpenAI score:", scoreText);
    const score = parseInt(scoreText, 10);

    if (isNaN(score) || score < 0 || score > 3) {
      console.warn(`Invalid score returned from OpenAI: ${scoreText}`);
      return 0;
    }
    return score;
  } catch (error) {
    console.error("Error in evaluateAnswerWithOpenAI:", error);
    return 0;
  }
}

app.post('/api/evaluate', async (req, res) => {
  console.log("Received /api/evaluate request");
  try {
    const { userAnswer, aiAnswer, question } = req.body;
    if (!userAnswer || !question) {
      return res.status(400).json({ error: "Missing userAnswer or question" });
    }
    const score = await evaluateAnswerWithOpenAI(userAnswer, aiAnswer, question);
    res.json({ score });
  } catch (error) {
    console.error("Error in /api/evaluate:", error);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server proxy listening on port ${port}`);
});
